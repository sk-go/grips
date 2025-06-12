import { Firestore } from '@google-cloud/firestore';
import path from 'path';

const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'service-account-key.json')
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test Firestore connection
    const testDoc = await firestore.collection('test').add({
      message: 'Test from API',
      timestamp: new Date()
    });

    // List recent transcriptions
    const snapshot = await firestore
      .collection('transcriptions')
      .orderBy('created_at', 'desc')
      .limit(5)
      .get();

    const transcriptions = [];
    snapshot.forEach(doc => {
      transcriptions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      message: 'Firestore connection working',
      testDocId: testDoc.id,
      recentTranscriptions: transcriptions,
      projectId: process.env.GCP_PROJECT,
      bucketName: process.env.BUCKET_NAME
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      error: 'Test failed',
      details: error.message,
      projectId: process.env.GCP_PROJECT
    });
  }
} 