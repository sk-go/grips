import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Upload, Loader2, CheckCircle, Brain, Sparkles } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import WaveSurfer from 'wavesurfer.js';

export default function GripsAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [pwActions, setPwActions] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const wavesurferRef = useRef(null);
  const waveformRef = useRef(null);

  useEffect(() => {
    if (waveformRef.current && audioBlob) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#8B5CF6',
        progressColor: '#7C3AED',
        cursorColor: '#DDD6FE',
        barWidth: 3,
        barRadius: 3,
        responsive: true,
        height: 60,
      });
      
      wavesurferRef.current.loadBlob(audioBlob);
    }
  }, [audioBlob]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        chunksRef.current = [];
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Aufnahme gestartet');
    } catch (err) {
      toast.error('Mikrofonzugriff verweigert');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.success('Aufnahme beendet');
    }
  };

  const uploadAndProcess = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    
    try {
      // 1. Get signed upload URL
      const urlResponse = await fetch('/api/get-upload-url');
      const { uploadUrl, fileName } = await urlResponse.json();
      
      // 2. Upload to Cloud Storage
      await fetch(uploadUrl, {
        method: 'PUT',
        body: audioBlob,
        headers: {
          'Content-Type': 'audio/webm'
        }
      });
      
      toast.success('Audio hochgeladen, wird verarbeitet...');
      
      // 3. Poll for results
      pollForResults(fileName);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Fehler beim Upload');
      setIsProcessing(false);
    }
  };

  const pollForResults = async (fileName) => {
    const maxAttempts = 30;
    let attempts = 0;
    
    const poll = setInterval(async () => {
      attempts++;
      
      try {
        const fileId = fileName.split('/')[1].replace('.webm', '');
        const response = await fetch(`/api/status/${fileId}`);
        const data = await response.json();
        
        if (data.status === 'analyzed') {
          clearInterval(poll);
          setTranscription(data.transcript);
          setAnalysis(data.analysis);
          setPwActions(data.pw_actions || []);
          setIsProcessing(false);
          toast.success('Analyse abgeschlossen!');
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          setIsProcessing(false);
          toast.error('Timeout bei der Verarbeitung');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Toaster position="top-right" />
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-purple-400" />
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              GRIPS
            </h1>
            <Sparkles className="w-12 h-12 text-pink-400" />
          </div>
          <p className="text-xl text-gray-300">
            Ihr intelligenter Versicherungsassistent
          </p>
        </motion.div>

        {/* Recording Interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            
            {/* Recording Button */}
            <div className="flex justify-center mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`relative p-8 rounded-full transition-all ${
                  isRecording 
                    ? 'bg-red-500 shadow-lg shadow-red-500/50' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRecording ? (
                  <Square className="w-12 h-12 text-white" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
                
                {isRecording && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-red-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>
            </div>

            {/* Waveform */}
            {audioBlob && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div ref={waveformRef} className="rounded-lg bg-white/5 p-2"></div>
              </motion.div>
            )}

            {/* Upload Button */}
            {audioBlob && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-6"
              >
                <button
                  onClick={uploadAndProcess}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Upload className="w-5 h-5" />
                  Analyse starten
                </button>
              </motion.div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-300">KI analysiert Ihre Aufnahme...</p>
              </motion.div>
            )}

            {/* Results */}
            <AnimatePresence>
              {transcription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Transcription */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">
                      Transkription
                    </h3>
                    <p className="text-gray-300">{transcription}</p>
                  </div>

                  {/* Analysis */}
                  {analysis && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-lg font-semibold text-purple-300 mb-2">
                        KI-Analyse
                      </h3>
                      <div className="space-y-2 text-gray-300">
                        {analysis.intents && (
                          <p><span className="text-purple-400">Intent:</span> {analysis.intents.join(', ')}</p>
                        )}
                        {analysis.entities && (
                          <div>
                            <span className="text-purple-400">Erkannte Daten:</span>
                            <ul className="mt-1 ml-4">
                              {Object.entries(analysis.entities).map(([key, value]) => (
                                <li key={key}>• {key}: {value}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PW Actions */}
                  {pwActions.length > 0 && (
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                      <h3 className="text-lg font-semibold text-green-300 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Professional Works Aktionen
                      </h3>
                      <ul className="space-y-1 text-gray-300">
                        {pwActions.map((action, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            {action.type}: {action.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-gray-400"
        >
          <p>Powered by AssemblyAI • GPT-4 • Professional Works</p>
        </motion.div>
      </div>
    </div>
  );
}