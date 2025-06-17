import functions_framework
import json
from google.cloud import storage, firestore, secretmanager, pubsub_v1
import requests, io, openai
import os
import logging
from utils import (
    generate_signed_url,
    get_secret,
    get_project_id,
    handle_processing_error,
    update_document_status
)
from google.cloud.firestore_v1 import FieldFilter

# Configure root logger (Cloud Functions picks stdout/stderr automatically)
logging.basicConfig(level=logging.INFO, force=True)

@functions_framework.cloud_event
def process_audio(cloud_event):
    """Triggered by Cloud Storage when audio file is uploaded"""
    
    # Parse event
    data = cloud_event.data
    bucket = data["bucket"]
    name = data["name"]
    
    logging.info("Processing audio file %s from bucket %s", name, bucket)
    
    # Initialize clients
    storage_client = storage.Client()
    db = firestore.Client()
    secret_client = secretmanager.SecretManagerServiceClient()
    
    # Extract client_id from the storage path.
    # Preferred path format: clients/{client_id}/audio/{timestamp}.{ext}
    # Falls back to "unknown" when format does not match exactly so that
    # the pipeline keeps running (useful for ad-hoc tests).
    path_parts = name.split('/')

    if 'clients' in path_parts and (path_parts.index('clients') + 1) < len(path_parts):
        client_id = path_parts[path_parts.index('clients') + 1]
    else:
        client_id = 'unknown'

    file_name = os.path.basename(name)
    
    try:
        # Get project ID and OpenAI key
        project_id = get_project_id()
        openai_key = get_secret(secret_client, project_id, 'openai-api-key')
        openai.api_key = openai_key
        logging.info("OpenAI key retrieved.")
        
        # Download audio file from GCS into memory
        blob = storage_client.bucket(bucket).blob(name)
        audio_bytes = blob.download_as_bytes()

        logging.info("Downloaded %d bytes from GCS", len(audio_bytes))
        
        # Find the corresponding upload document
        uploads = db.collection('uploads').where(filter=FieldFilter('storage_path', '==', name)).limit(1).get()
        upload_doc = uploads[0] if uploads else None
        
        if upload_doc:
            logging.info("Found existing upload document %s", upload_doc.id)
        
        if not upload_doc:
            # Create minimal upload document on-the-fly so that the rest of the
            # pipeline works even when the file was uploaded outside the UI.
            upload_ref = db.collection('uploads').document()
            upload_ref.set({
                'client_id': client_id,
                'storage_path': name,
                'original_filename': file_name,
                'status': 'uploaded',
                'created_at': firestore.SERVER_TIMESTAMP
            })
            upload_doc = upload_ref.get()
            logging.info("Created new upload document %s", upload_doc.id)
        
        # Create Firestore entry in transcriptions collection
        doc_ref = db.collection('transcriptions').document()
        original_filename = None
        if hasattr(upload_doc, 'to_dict'):
            original_filename = upload_doc.to_dict().get('original_filename')
        if not original_filename:
            original_filename = file_name

        doc_ref.set({
            'client_id': client_id,
            'upload_id': upload_doc.id,
            'audio_file': name,
            'original_filename': original_filename,
            'status': 'processing',
            'created_at': firestore.SERVER_TIMESTAMP
        })
        
        # Update upload document status
        update_document_status(db, 'uploads', upload_doc.id, 'processing', {
            'transcription_id': doc_ref.id
        })
        logging.info("Upload document %s set to processing.", upload_doc.id)
        
        # Transcribe with Whisper
        whisper_response = openai.audio.transcriptions.create(
            model="whisper-1",
            file=("audio.webm", io.BytesIO(audio_bytes)),
            language="de",
            response_format="json"
        )

        transcript_text = getattr(whisper_response, "text", "")
        logging.info("Whisper transcription length: %d characters", len(transcript_text))

        # Update Firestore with transcript text and status
        update_document_status(db, 'transcriptions', doc_ref.id, 'transcribed', {
            'text': transcript_text
        })

        # Publish Pub/Sub message to trigger NLP engine
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path(project_id, 'transcription-complete')
        publisher.publish(topic_path, json.dumps({
            'id': doc_ref.id,
            'text': transcript_text,
            'status': 'completed'
        }).encode('utf-8'))
        
        logging.info("Processing pipeline successfully launched for upload=%s transcription=%s", upload_doc.id, doc_ref.id)
        return {
            'status': 'processing started',
            'transcript_id': doc_ref.id,
            'client_id': client_id,
            'upload_id': upload_doc.id
        }
        
    except Exception as e:
        logging.exception("Error while processing audio file %s", name)
        return handle_processing_error(db, e, doc_ref.id if 'doc_ref' in locals() else None, 
                                    upload_doc.id if 'upload_doc' in locals() else None)
