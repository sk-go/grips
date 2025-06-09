import functions_framework
import openai
from google.cloud import firestore, secretmanager, pubsub_v1
import os
import json

@functions_framework.cloud_event
def process_transcription(cloud_event):
    """Triggered when transcription is complete"""
    
    # Initialize clients
    db = firestore.Client()
    secret_client = secretmanager.SecretManagerServiceClient()
    publisher = pubsub_v1.PublisherClient()
    
    # Get OpenAI API key from Secret Manager
    project_id = os.environ.get('GCP_PROJECT')
    openai_key_name = f"projects/{project_id}/secrets/openai-api-key/versions/latest"
    openai_response = secret_client.access_secret_version(request={"name": openai_key_name})
    openai.api_key = openai_response.payload.data.decode("UTF-8")
    
    # Parse the incoming message
    message_data = cloud_event.data
    transcript_data = json.loads(message_data)
    
    # Get transcript text
    transcript_text = transcript_data.get('text', '')
    transcript_id = transcript_data.get('id')
    
    if not transcript_text:
        print("No transcript text found")
        return
    
    # Analyze with OpenAI
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "Du bist ein KI-Assistent, der Audio-Transkriptionen analysiert und wichtige Informationen extrahiert. Identifiziere Aufgaben, Termine, wichtige Themen und Personen."
                },
                {
                    "role": "user",
                    "content": f"Analysiere diese Transkription und extrahiere wichtige Informationen:\n\n{transcript_text}"
                }
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        analysis = response.choices[0].message.content
        
        # Update Firestore with analysis
        doc_ref = db.collection('transcriptions').document(transcript_id)
        doc_ref.update({
            'analysis': analysis,
            'status': 'analyzed'
        })
        
        # Check for actionable items and publish to PW topic if needed
        if "aufgabe" in analysis.lower() or "termin" in analysis.lower():
            topic_path = publisher.topic_path(project_id, 'pw-actions')
            publisher.publish(
                topic_path,
                json.dumps({
                    'transcript_id': transcript_id,
                    'analysis': analysis,
                    'action_required': True
                }).encode('utf-8')
            )
        
        return {'status': 'analysis complete'}
        
    except Exception as e:
        print(f"Error processing transcription: {e}")
        doc_ref = db.collection('transcriptions').document(transcript_id)
        doc_ref.update({
            'status': 'error',
            'error': str(e)
        })
        return {'status': 'error', 'message': str(e)} 