import functions_framework
import openai
from google.cloud import firestore, secretmanager, pubsub_v1
import os
import json
import base64
import logging
import requests
from utils import (
    get_secret,
    get_project_id,
    handle_processing_error,
    update_document_status
)
import time

t0 = time.time()

logging.basicConfig(level=logging.INFO, force=True)

@functions_framework.cloud_event
def process_transcription(cloud_event):
    """Triggered when transcription is complete"""
    
    # Initialize clients
    db = firestore.Client()
    secret_client = secretmanager.SecretManagerServiceClient()
    publisher = pubsub_v1.PublisherClient()
    
    logging.info("NLP Engine triggered")
    
    try:
        # Get OpenAI API key from Secret Manager
        project_id = get_project_id()
        openai_key = get_secret(secret_client, project_id, 'openai-api-key')
        if not openai_key:
            logging.error("OpenAI API key not found or empty.")
            return handle_processing_error(db, 'OpenAI API key missing')
        logging.info("OpenAI key loaded (len=%d)", len(openai_key))

        openai.api_key = openai_key
        
        # Parse the incoming message
        attributes = cloud_event.data["message"].get("attributes", {})
        logging.info("Received Pub/Sub attributes: %s", attributes)
        raw = base64.b64decode(cloud_event.data["message"]["data"]).decode()
        logging.info("Received Pub/Sub data: %s", raw[:500])
        transcript_data = json.loads(raw or '{}')
        
        # Get transcript text and ID
        transcript_text = transcript_data.get('text', '')
        transcript_id = transcript_data.get('id') or transcript_data.get('transcript_id')
        
        # Fallback: some AssemblyAI webhooks deliver id in headers only
        if not transcript_id:
            transcript_id = attributes.get('transcriptid') or attributes.get('transcript-id')
        
        # If no text yet, fetch it from AssemblyAI API (status completed assumed)
        if transcript_id and not transcript_text:
            assemblyai_key = get_secret(secret_client, project_id, 'assemblyai-api-key')
            headers = {'authorization': assemblyai_key}
            resp = requests.get(f'https://api.assemblyai.com/v2/transcript/{transcript_id}', headers=headers)
            if resp.status_code == 200:
                transcript_text = resp.json().get('text', '')
                logging.info("Fetched transcript text from AssemblyAI for %s (%d chars)", transcript_id, len(transcript_text))
            else:
                logging.error("Failed to fetch transcript %s from AssemblyAI: %s - %s", transcript_id, resp.status_code, resp.text)
        
        if not transcript_text:
            logging.warning("Transcript text still empty for id=%s, status=%s", transcript_id, transcript_data.get('status'))
            return handle_processing_error(db, 'No transcript text found')
        
        logging.info("Analyzing transcript %s (%d chars)", transcript_id, len(transcript_text))
        
        # ---------- Firestore lookup ----------
        logging.info("Looking up transcription document for AssemblyAI id %s", transcript_id)
        try:
            transcript_doc = db.collection('transcriptions').document(transcript_id).get()
        except Exception as e:
            logging.exception("Firestore direct lookup failed")
            return handle_processing_error(db, e)

        if not transcript_doc.exists:
            logging.info("Direct lookup by document id failed, searching by assemblyai_id field ...")
            try:
                matches = db.collection('transcriptions').where('assemblyai_id', '==', transcript_id).limit(1).get()
                transcript_doc = matches[0] if matches else None
            except Exception as e:
                logging.exception("Firestore query lookup failed")
                return handle_processing_error(db, e)

        if not transcript_doc or not getattr(transcript_doc, 'exists', True):
            logging.error("Transcription document not found for AssemblyAI id %s", transcript_id)
            return handle_processing_error(db, f'Transcription document not found: {transcript_id}')

        logging.info("Transcription document found with id %s", transcript_doc.id)
        
        transcript_info = transcript_doc.to_dict()
        client_id = transcript_info.get('client_id')
        upload_id = transcript_info.get('upload_id')
        
        logging.info("Transcript info: %s", transcript_info)
        logging.info("Transcript text: %s", transcript_text)

        # Analyze with OpenAI
        try:
            logging.info("Sending request to OpenAI model gpt-4o-mini ...")
            t_openai = time.time()

            system_prompt = (
                "Du bist ein KI-Assistent für Versicherungsmakler. Antworte ausschließlich mit einem JSON-Objekt "
                "der Form {action_required, endpoint, payload, explanation}. Keine zusätzlichen Kommentare."
            )

            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Analysiere diese Transkription, extrahiere wichtige Informationen und finde mögliche API calls:\n\n{transcript_text}"},
                ],
                temperature=0.4,
                max_tokens=600
            )

            logging.info("OpenAI response received in %.1fs", time.time() - t_openai)
            logging.debug("Full OpenAI response: %s", response)

            raw_content = response.choices[0].message.content if hasattr(response, "choices") else str(response)
            try:
                analysis_json = json.loads(raw_content)
                analysis = analysis_json
            except Exception:
                analysis_json = None
                analysis = raw_content
            
            logging.info("OpenAI response in %.1fs", time.time() - t0)
            logging.info("OpenAI response: %s", analysis)

            # Update Firestore with analysis
            update_document_status(db, 'transcriptions', transcript_doc.id, 'analyzed', {
                'analysis': analysis
            })
            
            # Update the upload document status
            if upload_id:
                update_document_status(db, 'uploads', upload_id, 'analyzed')
            
            # Check for actionable items and publish to PW topic if needed
            should_publish = False
            if isinstance(analysis_json, dict):
                should_publish = analysis_json.get("action_required", False)
            elif isinstance(analysis, str):
                should_publish = "aufgabe" in analysis.lower() or "termin" in analysis.lower()

            if should_publish:
                topic_path = publisher.topic_path(project_id, 'pw-actions')
                publisher.publish(
                    topic_path,
                    json.dumps({
                        'transcript_id': transcript_doc.id,
                        'client_id': client_id,
                        'analysis': analysis,
                        'action_required': True,
                        'upload_id': upload_id
                    }).encode('utf-8')
                )
            
            return {
                'status': 'analysis complete',
                'client_id': client_id,
                'transcript_id': transcript_doc.id
            }
            
        except Exception as e:
            logging.exception("OpenAI call failed")
            return handle_processing_error(db, e, transcript_id if 'transcript_id' in locals() else None,
                                    upload_id if 'upload_id' in locals() else None) 
    except Exception as e:
        logging.exception("Unexpected error in NLP engine")
        return handle_processing_error(db, e, transcript_id if 'transcript_id' in locals() else None,
                                    upload_id if 'upload_id' in locals() else None) 