from flask import Flask, request, jsonify
from google.cloud import firestore, storage
import os
from ..utils import generate_storage_path, update_document_status, get_project_id

app = Flask(__name__)

# Initialize clients
db = firestore.Client()
storage_client = storage.Client()

# Hardcoded client ID for initial development
DEFAULT_CLIENT_ID = "client_001"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'grips-api'})

@app.route('/upload', methods=['POST'])
def upload_audio():
    """Upload audio file to Cloud Storage"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Generate storage path using utility function
    storage_path = generate_storage_path(DEFAULT_CLIENT_ID, file.filename)
    
    # Upload to bucket
    bucket_name = f"{get_project_id()}-audio"
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(storage_path)
    blob.upload_from_file(file)
    
    # Create a Firestore document to track the upload
    doc_ref = db.collection('uploads').document()
    doc_ref.set({
        'client_id': DEFAULT_CLIENT_ID,
        'original_filename': file.filename,
        'storage_path': storage_path,
        'uploaded_at': firestore.SERVER_TIMESTAMP,
        'status': 'uploaded'
    })
    
    return jsonify({
        'message': 'File uploaded successfully',
        'filename': file.filename,
        'storage_path': storage_path,
        'upload_id': doc_ref.id
    })

@app.route('/transcriptions', methods=['GET'])
def get_transcriptions():
    """Get all transcriptions"""
    docs = db.collection('transcriptions').stream()
    transcriptions = []
    
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        transcriptions.append(data)
    
    return jsonify(transcriptions)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080))) 