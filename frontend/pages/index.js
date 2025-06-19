// pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  Brain, FileText, Users, Shield, Clock, Mic,
  Activity, ChevronRight, Sparkles, BarChart3,
  History, LogOut, Plus, Calendar, CheckCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import RecorderPopup from '../components/RecorderPopUp';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function GretaAssistant() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRecorder, setShowRecorder] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const [currentProcessing, setCurrentProcessing] = useState(null);
  
  const { user, logout } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Load user's transcription history
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transcriptions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trans = [];
      snapshot.forEach((doc) => {
        trans.push({ id: doc.id, ...doc.data() });
      });
      setTranscriptions(trans);
      
      // Extract recent actions
      const actions = trans
        .filter(t => t.pw_actions && t.pw_actions.length > 0)
        .flatMap(t => t.pw_actions.map(action => ({
          ...action,
          transcriptionId: t.id,
          createdAt: t.createdAt
        })))
        .slice(0, 10);
      setRecentActions(actions);
    });

    return () => unsubscribe();
  }, [user]);

  const handleUploadComplete = (fileName) => {
    setCurrentProcessing(fileName);
    setActiveTab('history');
    pollForResults(fileName);
  };

  const pollForResults = async (fileName) => {
    const maxAttempts = 30;
    let attempts = 0;
    
    const poll = setInterval(async () => {
      attempts++;
      
      try {
        const response = await fetch(`/api/status/${fileName}`);
        const data = await response.json();
        
        if (data.status === 'analyzed') {
          clearInterval(poll);
          setCurrentProcessing(null);
          toast.success('Analyse abgeschlossen!');
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          setCurrentProcessing(null);
          toast.error('Timeout bei der Verarbeitung');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      toast.error('Fehler beim Abmelden');
    }
  };

  const stats = [
    { icon: Users, label: 'Kunden verwaltet', value: transcriptions.filter(t => t.analysis?.intents?.includes('create_client')).length },
    { icon: FileText, label: 'Verträge erstellt', value: transcriptions.filter(t => t.analysis?.intents?.includes('create_contract')).length },
    { icon: Clock, label: 'Aufnahmen', value: transcriptions.length },
    { icon: Activity, label: 'Diese Woche', value: transcriptions.filter(t => {
      const date = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date > weekAgo;
    }).length },
  ];

  const openRecorderWindow = () => {
    if (typeof window !== 'undefined') {
      window.open('/recorder', 'Recorder', 'width=640,height=380,noopener,noreferrer');
    }
  };

  if (!user) {
    return null; // Show nothing while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <RecorderPopup 
        isOpen={showRecorder} 
        onClose={() => setShowRecorder(false)}
        onUploadComplete={handleUploadComplete}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GRETA Assistenz</h1>
                <p className="text-sm text-gray-600">Willkommen, {user.displayName || user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={openRecorderWindow}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Neue Aufnahme
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <nav className="p-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'dashboard' 
                      ? 'bg-yellow-50 text-yellow-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  Dashboard
                </button>
                
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'history' 
                      ? 'bg-yellow-50 text-yellow-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <History className="w-5 h-5" />
                  Verlauf
                </button>
                
                <button
                  onClick={() => setActiveTab('actions')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'actions' 
                      ? 'bg-yellow-50 text-yellow-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  PW Aktionen
                </button>
              </nav>
            </div>

            {/* Quick Record */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Schnellaufnahme
              </h3>
              <p className="text-sm text-yellow-100 mb-4">
                Starten Sie eine neue Sprachaufnahme für Ihre Verwaltungsaufgaben
              </p>
              <button
                onClick={openRecorderWindow}
                className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Aufnahme starten
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className="w-8 h-8 text-yellow-600" />
                        <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                      </div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Letzte Aktivitäten</h2>
                  {recentActions.length > 0 ? (
                    <div className="space-y-3">
                      {recentActions.slice(0, 5).map((action, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{action.type}</p>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                          <Calendar className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Noch keine Aktivitäten</p>
                  )}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Aufnahme-Verlauf</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {transcriptions.map((transcription) => (
                    <motion.div
                      key={transcription.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-yellow-600" />
                            <span className="font-medium text-gray-900">
                              {transcription.audio_file?.split('/').pop() || 'Aufnahme'}
                            </span>
                            {transcription.id === currentProcessing && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                Verarbeitung läuft...
                              </span>
                            )}
                          </div>
                          
                          {transcription.transcript && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {transcription.transcript}
                            </p>
                          )}
                          
                          {transcription.analysis && (
                            <div className="flex flex-wrap gap-2">
                              {transcription.analysis.intents?.map((intent, idx) => (
                                <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                  {intent}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {transcription.createdAt?.toDate ? 
                              new Date(transcription.createdAt.toDate()).toLocaleDateString('de-DE') : 
                              'Datum unbekannt'
                            }
                          </p>
                          <p className="text-xs text-gray-400">
                            {transcription.status || 'processing'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {transcriptions.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Noch keine Aufnahmen vorhanden</p>
                      <button
                        onClick={openRecorderWindow}
                        className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium"
                      >
                        Erste Aufnahme starten
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions Tab */}
            {activeTab === 'actions' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Professional Works Aktionen</h2>
                  <p className="text-sm text-gray-600 mt-1">Alle automatisch ausgeführten Aktionen</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentActions.map((action, idx) => (
                    <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{action.type}</p>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {action.createdAt?.toDate ? 
                              new Date(action.createdAt.toDate()).toLocaleDateString('de-DE') : 
                              'Datum unbekannt'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {recentActions.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Noch keine PW-Aktionen ausgeführt</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}