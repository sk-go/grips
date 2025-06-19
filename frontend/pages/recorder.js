// components/RecorderPopup.js
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Upload, Loader2, Pause, Play } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import toast from 'react-hot-toast';

export default function RecorderPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [statusMessages, setStatusMessages] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const wavesurferRef = useRef(null);
  const waveformRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
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
        waveColor: '#facc15',
        progressColor: '#eab308',
        cursorColor: '#fde047',
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
      
      // Parent window notification (optional)
      if (typeof window !== 'undefined' && window.opener) {
        window.opener.postMessage({ type: 'upload-complete', fileName }, '*');
      }
      
      // Start polling for backend status updates
      pollProcessing(fileName);
      
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

  // Poll backend for processing status messages
  const pollProcessing = (fileName) => {
    let attempts = 0;
    const maxAttempts = 120; // ~4 min

    const poll = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/status/${fileName}`);
        const data = await res.json();

        if (data.messages) {
          setStatusMessages(data.messages);
        } else if (data.message) {
          setStatusMessages((prev) => {
            if (prev[prev.length - 1] === data.message) return prev;
            return [...prev, data.message];
          });
        }

        if (data.status === 'analyzed') {
          clearInterval(poll);
          setIsProcessing(false);
          toast.success('Analyse abgeschlossen!');
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          setIsProcessing(false);
          toast.error('Timeout bei der Verarbeitung');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className={`relative bg-white rounded-xl shadow-lg p-6 w-full transition-all ${isProcessing || audioBlob ? 'max-w-xl' : 'max-w-md'}`}>
        {/* Controls + Timer row */}
        <div className="flex items-center justify-between mb-4 gap-6">
          {/* Controls */}
          <div className="flex gap-3">
            {!isRecording && !audioBlob && (
              <button
                onClick={startRecording}
                className="p-5 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md hover:shadow-lg transition"
              >
                <Mic className="w-8 h-8" />
              </button>
            )}

            {isRecording && (
              <>
                {!isPaused ? (
                  <button
                    onClick={pauseRecording}
                    className="p-5 rounded-full bg-yellow-500 text-white shadow-md hover:shadow-lg transition"
                  >
                    <Pause className="w-8 h-8" />
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="p-5 rounded-full bg-green-500 text-white shadow-md hover:shadow-lg transition"
                  >
                    <Play className="w-8 h-8" />
                  </button>
                )}

                <button
                  onClick={stopRecording}
                  className="p-5 rounded-full bg-red-500 text-white shadow-md hover:shadow-lg transition"
                >
                  <Square className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          {/* Timer & Recording indicator */}
          <div className="text-right min-w-[120px]">
            <div className="flex items-center justify-end gap-2">
              {isRecording && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
              <span className="text-3xl font-mono font-bold text-gray-800">{formatTime(recordingTime)}</span>
            </div>
          </div>
        </div>

        {/* Waveform & Action buttons */}
        {audioBlob && !isRecording && (
          <div className="mt-4">
            <div ref={waveformRef} className="rounded-lg bg-gray-100 p-2"></div>
            <div className="flex justify-end gap-3 mt-3">
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition"
              >
                Neu
              </button>

              <button
                onClick={uploadAndProcess}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyse...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Analyse
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Status messages during processing */}
        {isProcessing && statusMessages.length > 0 && (
          <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm text-gray-700 space-y-1 max-h-40 overflow-y-auto">
            {statusMessages.map((msg, idx) => (
              <div key={idx}>{msg}</div>
            ))}
          </div>
        )}

        {/* Hidden play button inside waveform container */}
        {audioBlob && !isRecording && (
          <button
            onClick={() => wavesurferRef.current?.playPause()}
            className="mt-2 text-sm text-yellow-600 hover:text-yellow-700"
          >
            Anhören
          </button>
        )}
      </div>
    </div>
  );
}