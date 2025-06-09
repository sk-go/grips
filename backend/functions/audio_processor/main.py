import functions_framework
import json
from google.cloud import storage, firestore, secretmanager
import requests
import os

@functions_framework.cloud_event
def process_audio(cloud_event):
    """Triggered by Cloud Storage when audio file is uploaded"""
    
    # Parse event
    data = cloud_event.data
    bucket = data["bucket"]
    name = data["name"]
    
    print(f"Processing audio file: {name} from bucket: {bucket}")
    
    # Initialize clients
    storage_client = storage.Client()
    db = firestore.Client()
    secret_client = secretmanager.SecretManagerServiceClient()
    
    # Get AssemblyAI API key from Secret Manager
    project_id = os.environ.get('GCP_PROJECT')
    secret_name = f"projects/{project_id}/secrets/assemblyai-api-key/versions/latest"
    response = secret_client.access_secret_version(request={"name": secret_name})
    assemblyai_key = response.payload.data.decode("UTF-8")
    
    # Get file URL
    blob = storage_client.bucket(bucket).blob(name)
    audio_url = blob.generate_signed_url(expiration=3600)
    
    # Create Firestore entry
    doc_ref = db.collection('transcriptions').add({
        'audio_file': name,
        'status': 'processing',
        'created_at': firestore.SERVER_TIMESTAMP
    })
    
    # Start AssemblyAI transcription
    headers = {'authorization': assemblyai_key}
    response = requests.post(
        'https://api.assemblyai.com/v2/transcript',
        headers=headers,
        json={
            'audio_url': audio_url,
            'language_code': 'de',
            'speaker_labels': True,
            'webhook_url': f'https://europe-west3-{project_id}.cloudfunctions.net/transcription-complete'
        }
    )
    
    # Update Firestore with transcript ID
    doc_ref[1].update({
        'assemblyai_id': response.json()['id'],
        'status': 'transcribing'
    })
    
    return {'status': 'processing started', 'transcript_id': response.json()['id']} 