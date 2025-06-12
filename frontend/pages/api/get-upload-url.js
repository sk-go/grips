import { Storage } from '@google-cloud/storage';

// Initialize storage without explicit credentials.
// It will automatically use the attached service account in Cloud Run,
// or the GOOGLE_APPLICATION_CREDENTIALS environment variable locally.
const storage = new Storage();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bucketName = process.env.BUCKET_NAME;
    const fileName = `audio/${Date.now()}.webm`;
    
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: 'audio/webm',
    });
    
    res.status(200).json({ uploadUrl: url, fileName });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL', details: error.message });
  }
}