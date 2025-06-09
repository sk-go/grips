import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const fetchTranscriptions = async () => {
    try {
      const response = await axios.get('/api/transcriptions');
      setTranscriptions(response.data);
    } catch (error) {
      console.error('Error fetching transcriptions:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Bitte wählen Sie eine Datei aus');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Datei erfolgreich hochgeladen!');
      setFile(null);
      fetchTranscriptions();
    } catch (error) {
      setMessage('Fehler beim Hochladen der Datei');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            GRIPS Assistant
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Audio-Dateien hochladen und analysieren lassen
          </p>
        </div>

        {/* Upload Section */}
        <div className="mt-10 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Audio-Datei hochladen
          </h3>
          <div className="mt-5">
            <input
              type="file"
              accept=".wav,.mp3,.m4a"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {uploading ? 'Wird hochgeladen...' : 'Hochladen'}
            </button>
          </div>
          {message && (
            <p className={`mt-2 text-sm ${message.includes('erfolgreich') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>

        {/* Transcriptions List */}
        <div className="mt-10">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Transkriptionen
          </h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {transcriptions.map((transcription) => (
                <li key={transcription.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transcription.audio_file}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: {transcription.status}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transcription.status === 'analyzed' 
                          ? 'bg-green-100 text-green-800' 
                          : transcription.status === 'processing' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transcription.status}
                      </span>
                    </div>
                  </div>
                  {transcription.analysis && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">
                        {transcription.analysis}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 