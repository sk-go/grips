from flask import Flask, request, jsonify
from google.cloud import firestore, storage
import os

app = Flask(__name__)

# Initialize clients
db = firestore.Client()
storage_client = storage.Client()

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
    
    # Upload to bucket
    bucket_name = f"{os.environ.get('GCP_PROJECT')}-audio"
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file.filename)
    blob.upload_from_file(file)
    
    return jsonify({
        'message': 'File uploaded successfully',
        'filename': file.filename
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