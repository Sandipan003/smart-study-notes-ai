import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from './utils/auth';

// Public Views
import LandingPage from './components/landing/LandingPage';
import AuthView from './components/AuthView';

// Authenticated Layout
import AppSidebar from './components/layout/AppSidebar';
import MobileBottomNav from './components/layout/MobileBottomNav';

// Workspaces
import UploadArea from './components/UploadArea'; // To be replaced by NewStudyComposer later
import SummaryView from './components/SummaryView';
import FlashcardsView from './components/FlashcardsView';
import QuizView from './components/QuizView';
import LibraryView from './components/library/LibraryView';

import UnifiedWorkspace from './components/study/UnifiedWorkspace';
import UserSettingsModal from './components/UserSettingsModal';

const BACKEND_URL = '';
const GROQ_API_KEY = '';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

const LOADING_STAGES = [
  'Connecting ideas across your material...',
  'Extracting key concepts...',
  'Structuring knowledge hierarchy...',
  'Building active recall flashcards...',
  'Curating multiple-choice assessments...',
  'Preparing your Study Workspace...',
];

export default function App() {
  const [activeTab, setActiveTab]         = useState('upload'); // 'upload', 'summary', 'flashcards', 'quiz', 'tutor'
  const [currentView, setCurrentView]     = useState('dashboard'); // 'dashboard', 'new-study', 'library', 'recent', 'tutor'
  
  const [studyData, setStudyData]         = useState(null);
  const [isGenerating, setIsGenerating]   = useState(false);
  const [loadingStage, setLoadingStage]   = useState('');
  const [toasts, setToasts]               = useState([]);
  
  const [pastGuides, setPastGuides]       = useState([]);
  const [activeGuideId, setActiveGuideId] = useState(null);
  const [supabaseOk, setSupabaseOk]       = useState(false);
  
  // Auth state variables
  const [supabase, setSupabase]           = useState(null);
  const [session, setSession]             = useState(null);
  const [authLoaded, setAuthLoaded]       = useState(false);
  const [showAuth, setShowAuth]           = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize Supabase
  useEffect(() => {
    getSupabaseClient()
      .then(client => {
        setSupabase(client);
        client.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setAuthLoaded(true);
        });
        const { data: { subscription } } = client.auth.onAuthStateChange((_event, currentSession) => {
          setSession(currentSession);
          setAuthLoaded(true);
        });
        return () => subscription.unsubscribe();
      })
      .catch(err => {
        console.error("Supabase init error:", err);
        setAuthLoaded(true);
      });
  }, []);

  // Server Health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const r = await fetch(`${BACKEND_URL}/api/health`);
        if (r.ok) {
          const d = await r.json();
          setSupabaseOk(!!d.supabase_configured);
        }
      } catch {}
    };
    checkHealth();
  }, []);

  const fetchGuides = async () => {
    if (!session) return;
    try {
      const r = await fetch(`${BACKEND_URL}/api/list-guides`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (r.ok) setPastGuides(await r.json());
    } catch {}
  };

  useEffect(() => {
    if (session && currentView === 'library') {
      fetchGuides();
    }
  }, [session, currentView]);

  const loadGuide = async (id) => {
    if (!session) return;
    setIsGenerating(true);
    setCurrentView('workspace');
    try {
      const r = await fetch(`${BACKEND_URL}/api/get-guide/${id}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (r.ok) {
        const d = await r.json();
        setActiveGuideId(id);
        setStudyData({ summary: d.summary, flashcards: d.flashcards || [], quiz: d.quiz || [] });
        toast('Study companion loaded!', 'success');
      }
    } catch (e) {
      toast('Error: ' + e.message, 'error');
      setCurrentView('library');
    } finally {
      setIsGenerating(false);
    }
  };

  // Sync Views based on state
  useEffect(() => {
    if (studyData) {
      setCurrentView('workspace');
    }
  }, [studyData]);

  const handleSignOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setStudyData(null);
      setCurrentView('dashboard');
      setPastGuides([]);
      setShowAuth(false);
    } catch (e) {
      console.error(e);
    }
  };

  const toast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  };

  const saveGuide = async (data, title = 'Untitled Notes') => {
    if (!session) return;
    try {
      const r = await fetch(`${BACKEND_URL}/api/save-guide`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ title, summary: data.summary, flashcards: data.flashcards || [], quiz: data.quiz || [] }),
      });
      if (r.ok) {
        const saved = await r.json();
        setActiveGuideId(saved.id);
        fetchGuides();
        toast('Auto-saved to Library!', 'success');
      }
    } catch {}
  };

  const handleGenerate = async (inputSource) => {
    setIsGenerating(true);
    setStudyData(null);
    const headers = session ? { 'Authorization': `Bearer ${session.access_token}` } : {};

    try {
      let res;
      if (inputSource.type === 'pdf') {
        const fd = new FormData();
        fd.append('file', inputSource.data);
        fd.append('engine', 'groq');
        fd.append('apiKey', GROQ_API_KEY);
        fd.append('model', GROQ_MODEL);
        fd.append('useFallback', 'false');
        res = await fetch(`${BACKEND_URL}/api/generate`, { method: 'POST', headers, body: fd });
      } else {
        res = await fetch(`${BACKEND_URL}/api/text-generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({
            text: inputSource.data,
            engine: 'groq',
            apiKey: GROQ_API_KEY,
            model: GROQ_MODEL,
            useFallback: false,
          }),
        });
      }

      let data;
      try { data = await res.json(); } 
      catch (e) { throw new Error(`Server error: ${res.status}`); }
      
      if (!res.ok) throw new Error(data.error || 'Generation failed.');

      setStudyData(data);
      toast('Study companion created successfully! ✨', 'success');

      if (session) {
        const title = inputSource.type === 'pdf' ? inputSource.data.name : `Notes — ${new Date().toLocaleDateString()}`;
        saveGuide(data, title);
      }
    } catch (e) {
      toast(e.message || 'Failed to generate study guide.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!authLoaded) {
    return (
      <div className="min-h-screen bg-background-void flex items-center justify-center text-brand-primary">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // PUBLIC FLOW (Unauthenticated)
  if (!session) {
    if (showAuth) {
      return <AuthView supabaseClient={supabase} setSession={setSession} />;
    }
    return <LandingPage onSignInClick={() => setShowAuth(true)} />;
  }

  // AUTHENTICATED FLOW
  return (
    <div className="flex h-screen w-full bg-background-void overflow-hidden text-text-primary font-sans">
      <AppSidebar 
        user={session.user}
        supabase={supabase}
        onSignOut={handleSignOut} 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 overflow-y-auto relative bg-background-void">
        <div className="max-w-[1440px] mx-auto p-4 md:p-8 pb-32 md:pb-8">
          
          {currentView === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-display font-bold mb-8">Ready to continue learning?</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <button onClick={() => setCurrentView('new-study')} className="bg-background-surface p-6 rounded-2xl border border-border-strong hover:border-brand-primary transition-colors text-left flex flex-col items-start gap-4 shadow-layer-1 hover:shadow-layer-2 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Upload Material</h3>
                    <p className="text-text-secondary text-sm mt-1">PDFs, Docs, Images</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {currentView === 'new-study' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
              <h1 className="text-3xl font-display font-bold mb-2">What are we studying today?</h1>
              <p className="text-text-secondary mb-8">Add your material and StudyGenius AI will build your personalized study workspace.</p>
              
              <UploadArea 
                onGenerate={handleGenerate}
                isGenerating={isGenerating} 
              />
            </div>
          )}

          {['library', 'recent', 'summaries'].includes(currentView) && (
            <LibraryView 
              pastGuides={pastGuides} 
              activeGuideId={activeGuideId} 
              onLoadGuide={loadGuide} 
            />
          )}

          {currentView === 'tutor' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto text-center mt-20">
              <div className="w-20 h-20 mx-auto bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-brand-primary/20">
                <svg className="w-10 h-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h1 className="text-3xl font-display font-bold mb-4">AI Tutor Requires Context</h1>
              <p className="text-text-secondary mb-8 text-lg">Please open a study guide from your library or create a new one to start chatting with your AI Tutor.</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setCurrentView('new-study')} className="px-6 py-3 bg-brand-primary text-background-void font-bold rounded-xl hover:bg-brand-mint transition-colors">Create New Study</button>
                <button onClick={() => setCurrentView('library')} className="px-6 py-3 bg-background-soft border border-border-strong rounded-xl hover:bg-background-elevated transition-colors">Go to Library</button>
              </div>
            </div>
          )}

          {currentView === 'workspace' && studyData && (
            <UnifiedWorkspace 
               studyData={studyData}
               activeGuideId={activeGuideId}
               session={session}
               onReset={() => {
                 setStudyData(null);
                 setCurrentView('dashboard');
               }}
            />
          )}

        </div>
      </main>

      <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} onProfileClick={() => setIsSettingsOpen(true)} />

      {/* Toast Notifications */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto px-4 py-3 rounded-xl border shadow-layer-3 flex items-center gap-3 backdrop-blur-md ${t.type === 'error' ? 'bg-feedback-error/10 border-feedback-error/20 text-feedback-error' : 'bg-background-elevated/90 border-border-strong text-text-primary'}`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <UserSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        user={session.user} 
        supabase={supabase} 
      />
    </div>
  );
}
