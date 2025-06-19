// components/RecorderPopup.js
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Square, Upload, Loader2, Pause, Play } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import toast from 'react-hot-toast';

export default function RecorderPopup({ isOpen, onClose, onUploadComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const wavesurferRef = useRef(null);
  const waveformRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (waveformRef.current && audioBlob) {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
      
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#6366F1',
        progressColor: '#4F46E5',
        cursorColor: '#C7D2FE',
        barWidth: 2,
        barRadius: 2,
        responsive: true,
        height: 60,
        normalize: true,
      });
      
      wavesurferRef.current.loadBlob(audioBlob);
    }
  }, [audioBlob]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      setRecordingTime(0);
    } catch (err) {
      toast.error('Mikrofonzugriff verweigert');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const uploadAndProcess = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    
    try {
      const urlResponse = await fetch('/api/get-upload-url');
      const { uploadUrl, fileName } = await urlResponse.json();
      
      await fetch(uploadUrl, {
        method: 'PUT',
        body: audioBlob,
        headers: {
          'Content-Type': 'audio/webm'
        }
      });
      
      toast.success('Audio wird verarbeitet...');
      
      // Pass fileName to parent for tracking
      if (onUploadComplete) {
        onUploadComplete(fileName);
      }
      
      // Reset and close
      setAudioBlob(null);
      setRecordingTime(0);
      setIsProcessing(false);
      onClose();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Fehler beim Upload');
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Sprachaufnahme</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-indigo-100 text-sm mt-2">
                Sprechen Sie natürlich über Ihren Kunden oder Ihre Aufgabe
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Recording State */}
              <div className="text-center mb-6">
                {isRecording && (
                  <div className="mb-4">
                    <div className="text-4xl font-mono font-bold text-gray-900">
                      {formatTime(recordingTime)}
                    </div>
                    {!isPaused && (
                      <div className="flex justify-center mt-2">
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1 h-8 bg-red-500 rounded-full"
                              animate={{ height: [8, 32, 8] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Waveform */}
                {audioBlob && !isRecording && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <div ref={waveformRef} className="rounded-lg bg-gray-50 p-2"></div>
                    <button
                      onClick={() => wavesurferRef.current?.playPause()}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Anhören
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                {!isRecording && !audioBlob && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecording}
                    className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    <Mic className="w-8 h-8" />
                  </motion.button>
                )}

                {isRecording && (
                  <>
                    {!isPaused ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={pauseRecording}
                        className="p-4 bg-yellow-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                      >
                        <Pause className="w-8 h-8" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resumeRecording}
                        className="p-4 bg-green-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                      >
                        <Play className="w-8 h-8" />
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopRecording}
                      className="p-4 bg-red-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                      <Square className="w-8 h-8" />
                    </motion.button>
                  </>
                )}

                {audioBlob && !isRecording && (
                  <>
                    <button
                      onClick={reset}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Neu aufnehmen
                    </button>
                    
                    <button
                      onClick={uploadAndProcess}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verarbeitung...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Analyse starten
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Tips */}
              {!isRecording && !audioBlob && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-700 font-medium mb-2">Tipps:</p>
                  <ul className="text-sm text-indigo-600 space-y-1">
                    <li>• Sprechen Sie deutlich und natürlich</li>
                    <li>• Nennen Sie alle relevanten Informationen</li>
                    <li>• Pausieren Sie bei Bedarf die Aufnahme</li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}