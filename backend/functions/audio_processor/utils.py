from google.cloud import firestore, storage
from google.auth import impersonated_credentials, default
import datetime
import os
import google.auth

def update_document_status(db, collection, doc_id, status, additional_data=None):
    """Update document status and add timestamp
    
    Args:
        db: Firestore client
        collection: Collection name
        doc_id: Document ID
        status: New status
        additional_data: Optional dict of additional fields to update
    """
    update_data = {
        'status': status,
        f'{status}_at': firestore.SERVER_TIMESTAMP
    }
    if additional_data:
        update_data.update(additional_data)
    
    db.collection(collection).document(doc_id).update(update_data)

def generate_storage_path(client_id, filename, file_type='audio'):
    """Generate consistent storage paths
    
    Args:
        client_id: Client identifier
        filename: Original filename
        file_type: Type of file (default: 'audio')
    
    Returns:
        str: Generated storage path
    """
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    file_extension = os.path.splitext(filename)[1]
    return f"clients/{client_id}/{file_type}/{timestamp}{file_extension}"

def handle_processing_error(db, error, transcript_id=None, upload_id=None):
    """Centralized error handling and status updates
    
    Args:
        db: Firestore client
        error: Exception or error message
        transcript_id: Optional transcript document ID
        upload_id: Optional upload document ID
    
    Returns:
        dict: Error data
    """
    error_data = {
        'status': 'error',
        'error': str(error),
        'error_at': firestore.SERVER_TIMESTAMP
    }
    
    if transcript_id:
        try:
            ref = db.collection('transcriptions').document(transcript_id)
            if ref.get().exists:
                ref.update(error_data)
        except Exception as e:
            print(f"Could not update transcription doc {transcript_id}: {e}")
    if upload_id:
        try:
            ref = db.collection('uploads').document(upload_id)
            if ref.get().exists:
                ref.update(error_data)
        except Exception as e:
            print(f"Could not update upload doc {upload_id}: {e}")
    
    return error_data

def get_client_context(db, upload_id):
    """Get client context from upload document
    
    Args:
        db: Firestore client
        upload_id: Upload document ID
    
    Returns:
        dict: Client context or None if not found
    """
    upload_doc = db.collection('uploads').document(upload_id).get()
    if not upload_doc.exists:
        return None
    
    upload_data = upload_doc.to_dict()
    return {
        'client_id': upload_data.get('client_id'),
        'original_filename': upload_data.get('original_filename'),
        'storage_path': upload_data.get('storage_path')
    }

def generate_signed_url(storage_client, bucket_name, blob_name, hours=1):
    """Generate a V4 signed **GET** URL for AssemblyAI.

    We impersonate the service-account `grips-backend-sa@…` so that the
    Storage client library can call the IAMCredentials SignBlob endpoint –
    thus no private key needs to live inside the Cloud Function runtime.
    """

    try:
        # 1. Default credentials = runtime service account (Compute SA)
        src_creds, project_id = default()

        # 2. Impersonate backend-SA that is allowed to sign blobs
        target_sa = f"grips-backend-sa@{project_id}.iam.gserviceaccount.com"
        creds = impersonated_credentials.Credentials(
            source_credentials=src_creds,
            target_principal=target_sa,
            target_scopes=["https://www.googleapis.com/auth/cloud-platform"],
            lifetime=3600,
        )
        blob = storage_client.bucket(bucket_name).blob(blob_name)
        signed_url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(hours=hours),
            method="GET",  # AssemblyAI performs a GET request
            credentials=creds,
            service_account_email=target_sa,
        )

        print(f"[audio_processor] Signed URL generated: {signed_url[:80]}…")
        return signed_url

    except Exception as e:
        # Print full error so it shows up in Cloud Logging.
        print(f"[audio_processor] Signed URL generation failed for '{blob_name}': {e}")
        return None

def get_secret(secret_client, project_id, secret_id):
    """Get secret from Secret Manager
    
    Args:
        secret_client: Secret Manager client
        project_id: Project ID
        secret_id: Secret ID
    
    Returns:
        str: Secret value
    """
    name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
    response = secret_client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8").strip()

def get_project_id():
    """Get current project ID from environment or credentials
    
    Returns:
        str: Project ID
    """
    project_id = (
        os.environ.get("GCP_PROJECT")
        or os.environ.get("GOOGLE_CLOUD_PROJECT")
        or os.environ.get("GCLOUD_PROJECT")
        or google.auth.default()[1]
    )
    
    if not project_id:
        raise RuntimeError("Unable to determine GCP project ID")
    
    return project_id 