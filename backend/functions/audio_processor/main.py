import functions_framework
import json
from google.cloud import storage, firestore, secretmanager
import requests
import os
import google.auth
import datetime
from google.auth.transport.requests import Request
from google.auth import compute_engine

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
    
    # Determine the active GCP project ID – the key may differ between environments.
    # Cloud Functions / Cloud Run commonly expose either GCP_PROJECT or GOOGLE_CLOUD_PROJECT.
    # As a fallback, read it from the default application credentials.
    project_id = (
        os.environ.get("GCP_PROJECT")
        or os.environ.get("GOOGLE_CLOUD_PROJECT")
        or os.environ.get("GCLOUD_PROJECT")
        or google.auth.default()[1]
    )

    if not project_id:
        raise RuntimeError("Unable to determine GCP project ID from environment or credentials.")

    secret_name = f"projects/{project_id}/secrets/assemblyai-api-key/versions/latest"
    response = secret_client.access_secret_version(request={"name": secret_name})
    assemblyai_key = response.payload.data.decode("UTF-8").strip()
    
    # Get default credentials (will be the runtime service-account for Cloud Functions/Run)
    credentials, _ = google.auth.default()

    # Determine service-account email – differs by credential type.
    sa_email = getattr(credentials, "service_account_email", None)
    if not sa_email:
        # Fallback to known runtime service-account we deploy with
        sa_email = f"grips-backend-sa@{project_id}.iam.gserviceaccount.com"

    # Build ID token credentials which support the signBlob API via IAM.
    signer_credentials = compute_engine.IDTokenCredentials(
        Request(),
        target_audience="",
        service_account_email=sa_email,
    )

    # Generate a short-lived (1-hour) V4 signed URL using the token-signing creds.
    blob = storage_client.bucket(bucket).blob(name)

    try:
        # Preferred: generate a short-lived (1-hour) signed URL.
        audio_url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(hours=1),
            credentials=signer_credentials,
        )
    except Exception as e:
        # If signing fails (e.g. IAM signBlob issues), fall back to making the
        # object publicly readable. This keeps the pipeline moving while you
        # sort out IAM nuances. You can remove this branch once signing works.
        print(f"Signed-URL generation failed ({e}). Falling back to public URL.")
        blob.make_public()
        audio_url = blob.public_url
    
    # Create Firestore entry
    ref, _ = db.collection('transcriptions').add({
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
    ref.update({
        'assemblyai_id': response.json()['id'],
        'status': 'transcribing'
    })
    
    return {'status': 'processing started', 'transcript_id': response.json()['id']}
