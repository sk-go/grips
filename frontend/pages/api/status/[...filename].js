import { Firestore } from '@google-cloud/firestore';

// Initialize Firestore without explicit credentials.
// It will automatically use the attached service account in Cloud Run,
// or the GOOGLE_APPLICATION_CREDENTIALS environment variable locally.
const firestore = new Firestore();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract filename from URL - handle nested paths like "audio/123456.webm"
    const { filename } = req.query;
    let fileName = filename;
    
    // If filename is an array (nested path), join it
    if (Array.isArray(filename)) {
      fileName = filename.join('/');
    }
    
    console.log('Looking for file:', fileName);
    
    // Query Firestore for transcription status
    const snapshot = await firestore
      .collection('transcriptions')
      .where('audio_file', '==', fileName)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return res.status(404).json({ 
        status: 'not_found',
        message: `No transcription found for ${fileName}`,
        fileName: fileName
      });
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    res.status(200).json({
      status: data.status || 'processing',
      transcript: data.transcript || null,
      analysis: data.analysis || null,
      pw_actions: data.pw_actions || [],
      fileName: fileName
    });
  } catch (error) {
    console.error('Status API error:', error);
    res.status(500).json({ 
      error: 'Failed to check status',
      details: error.message,
      fileName: req.query.filename
    });
  }
}