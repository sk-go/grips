// pages/api/get-upload-url.js
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth }       from 'firebase-admin/auth';
import { Storage }       from '@google-cloud/storage';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decoded = await getAuth().verifyIdToken(token);

    const bucket   = new Storage().bucket(process.env.BUCKET_NAME);
    const fileName = `audio/${decoded.uid}/${Date.now()}.webm`;

    const [url] = await bucket.file(fileName).getSignedUrl({
      version: 'v4', action: 'write', expires: Date.now() + 15 * 60 * 1000,
      contentType: 'audio/webm'
    });

    await getFirestore().collection('transcriptions').add({
      audio_file: fileName, userId: decoded.uid,
      status: 'uploading', createdAt: new Date()
    });

    res.status(200).json({ uploadUrl: url, fileName });
  } catch (e) {
    console.error(e);
    res.status(401).json({ error: 'Invalid auth token' });
  }
}