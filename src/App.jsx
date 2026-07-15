import React, { useState, useEffect } from 'react';
import {
  Sparkles, BookOpen, Layers, HelpCircle, FileText,
  AlertTriangle, History, X, Zap, Brain, Target
} from 'lucide-react';
import UploadArea from './components/UploadArea';
import SummaryView from './components/SummaryView';
import FlashcardsView from './components/FlashcardsView';
import QuizView from './components/QuizView';

// Relative URL works for both Vercel deployment and local dev proxy
const BACKEND_URL = '';

// Empty string forces the backend to use the GEMINI_API_KEY environment variable from Vercel
const GEMINI_API_KEY = '';
const GEMINI_MODEL   = 'gemini-flash-latest';

const LOADING_STAGES = [
  'Reading uploaded document...',
  'Extracting text from pages...',
  'Formatting notes structure...',
  'Running GenAI synthesis model...',
  'Formulating conceptual flashcards...',
  'Curating multiple-choice questions...',
  'Assembling your custom study guide...',
];

export default function App() {
  const [activeTab, setActiveTab]         = useState('upload');
  const [studyData, setStudyData]         = useState(null);
  const [isGenerating, setIsGenerating]   = useState(false);
  const [loadingStage, setLoadingStage]   = useState('');
  const [toasts, setToasts]               = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pastGuides, setPastGuides]       = useState([]);
  const [activeGuideId, setActiveGuideId] = useState(null);
  const [serverOnline, setServerOnline]   = useState(false);
  const [supabaseOk, setSupabaseOk]       = useState(false);

  // ── Server health polling ──
  useEffect(() => {
    checkHealth();
    const t = setInterval(checkHealth, 15000);
    return () => clearInterval(t);
  }, []);

  // ── Fetch guide history when Supabase is ready ──
  useEffect(() => {
    if (supabaseOk) fetchGuides();
  }, [supabaseOk]);

  // ── Loading stage cycling ──
  useEffect(() => {
    let iv;
    if (isGenerating) {
      let i = 0;
      setLoadingStage(LOADING_STAGES[0]);
      iv = setInterval(() => {
        i = (i + 1) % LOADING_STAGES.length;
        setLoadingStage(LOADING_STAGES[i]);
      }, 3200);
    }
    return () => clearInterval(iv);
  }, [isGenerating]);

  const checkHealth = async () => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/health`);
      if (r.ok) {
        const d = await r.json();
        setServerOnline(true);
        setSupabaseOk(!!d.supabase_configured);
      } else {
        setServerOnline(false);
      }
    } catch {
      setServerOnline(false);
    }
  };

  const fetchGuides = async () => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/list-guides`);
      if (r.ok) setPastGuides(await r.json());
    } catch {}
  };

  const loadGuide = async (id) => {
    setIsHistoryOpen(false);
    setIsGenerating(true);
    setLoadingStage('Retrieving study notes from database...');
    try {
      const r = await fetch(`${BACKEND_URL}/api/get-guide/${id}`);
      if (r.ok) {
        const d = await r.json();
        setActiveGuideId(id);
        setStudyData({ summary: d.summary, flashcards: d.flashcards || [], quiz: d.quiz || [] });
        setActiveTab('summary');
        toast('Study companion loaded from database!', 'success');
      } else {
        toast('Failed to retrieve study guide.', 'error');
      }
    } catch (e) {
      toast('Error: ' + e.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGuide = async (data, title = 'Untitled Notes') => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/save-guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, summary: data.summary, flashcards: data.flashcards || [], quiz: data.quiz || [] }),
      });
      if (r.ok) {
        const saved = await r.json();
        setActiveGuideId(saved.id);
        fetchGuides();
        toast('Auto-saved to Supabase!', 'success');
      }
    } catch {}
  };

  const toast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  };

  const handleGenerate = async (inputSource) => {
    setIsGenerating(true);
    setStudyData(null);

    try {
      let res;
      if (inputSource.type === 'pdf') {
        const fd = new FormData();
        fd.append('file', inputSource.data);
        fd.append('engine', 'gemini');
        fd.append('apiKey', GEMINI_API_KEY);
        fd.append('model', GEMINI_MODEL);
        fd.append('useFallback', 'false');
        res = await fetch(`${BACKEND_URL}/api/generate`, { method: 'POST', body: fd });
      } else {
        res = await fetch(`${BACKEND_URL}/api/text-generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: inputSource.data,
            engine: 'gemini',
            apiKey: GEMINI_API_KEY,
            model: GEMINI_MODEL,
            useFallback: false,
          }),
        });
      }

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        const errorText = await res.text().catch(() => '');
        if (res.status === 413) throw new Error("File is too large! Vercel's free tier limits uploads to 4.5 MB.");
        throw new Error(`Server returned ${res.status}: ${res.statusText}. ${errorText.substring(0, 50)}`);
      }
      if (!res.ok) throw new Error(data.error || 'Generation failed.');

      setStudyData(data);
      setActiveTab('summary');
      toast('Study companion created successfully! ✨', 'success');

      if (supabaseOk) {
        const title = inputSource.type === 'pdf'
          ? inputSource.data.name
          : `Notes — ${new Date().toLocaleDateString()}`;
        saveGuide(data, title);
      }
    } catch (e) {
      console.error(e);
      toast(e.message || 'Failed to generate study guide.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setStudyData(null);
    setActiveGuideId(null);
    setActiveTab('upload');
  };

  const SETTINGS = { engine: 'gemini', apiKey: GEMINI_API_KEY, model: GEMINI_MODEL, useFallback: false };

  return (
    <div className="app-shell">
      {/* === Animated Background Orbs === */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* === Top Navigation === */}
      <nav className="app-nav" role="navigation">
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <BookOpen size={20} color="#05081a" />
          </div>
          <div>
            <span className="nav-logo-text">StudyGenius AI</span>
            <span className="nav-logo-sub">Smart Study Notes Generator</span>
          </div>
        </div>

        <div className="nav-actions">
          {supabaseOk && (
            <button
              className="btn btn-ghost"
              onClick={() => { fetchGuides(); setIsHistoryOpen(true); }}
              style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', gap: '0.4rem' }}
            >
              <History size={15} />
              <span>Saved Guides</span>
            </button>
          )}
          {studyData && (
            <button className="btn btn-secondary" onClick={handleReset} style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}>
              New Study
            </button>
          )}
        </div>
      </nav>

      {/* === Hero (only on upload tab, no study data) === */}
      {activeTab === 'upload' && !studyData && !isGenerating && (
        <section className="hero-section">
          <div className="hero-badge">
            <span className="badge-dot" />
            Powered by Google Gemini AI
          </div>

          <h1 className="hero-title">
            <span className="title-line-1">Smart Study Notes</span>
            <span className="title-line-2">AI-Powered Learning Engine</span>
          </h1>

          <p className="hero-subtitle">
            Upload your PDF or paste lecture notes — get an instant AI-generated
            summary, interactive flashcards, and a multiple-choice quiz.
          </p>

          <div className="hero-features">
            <div className="feature-pill"><Zap size={14} /> Gemini 2.0 Flash</div>
            <div className="feature-pill"><Brain size={14} /> Smart Summaries</div>
            <div className="feature-pill"><Layers size={14} /> 3D Flashcards</div>
            <div className="feature-pill"><Target size={14} /> Quiz Generation</div>
            {supabaseOk && <div className="feature-pill"><Sparkles size={14} /> Supabase Sync</div>}
          </div>

          <div className="feature-cards-row">
            <div className="feature-card">
              <div className="feature-card-icon cyan">
                <FileText size={22} />
              </div>
              <h3>Smart Summary</h3>
              <p>AI extracts and structures key concepts, equations, and definitions from your notes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon purple">
                <Layers size={22} />
              </div>
              <h3>3D Flashcards</h3>
              <p>Flip through interactive cards. Tag as mastered or review later to track progress.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon pink">
                <HelpCircle size={22} />
              </div>
              <h3>MCQ Quiz</h3>
              <p>Test your understanding with AI-generated multiple-choice questions and explanations.</p>
            </div>
          </div>
        </section>
      )}

      {/* === Main Content Area === */}
      <main className="main-content">
        {/* Tab navigation (only when study data exists) */}
        {studyData && !isGenerating && (
          <nav className="tabs-nav" role="tablist">
            {[
              { id: 'summary',    icon: <FileText size={16} />,    label: 'Summary' },
              { id: 'flashcards', icon: <Layers size={16} />,      label: 'Flashcards' },
              { id: 'quiz',       icon: <HelpCircle size={16} />,  label: 'Quiz' },
            ].map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {/* === Loading State === */}
        {isGenerating && (
          <div className="glass loading-overlay">
            <div className="loading-ring" />
            <div>
              <div className="loading-title">Synthesizing Notes</div>
              <div className="loading-stage">{loadingStage}</div>
            </div>
            <div className="loading-dots">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
          </div>
        )}

        {/* === Content Panels === */}
        {!isGenerating && (
          <>
            {activeTab === 'upload' && (
              <UploadArea onGenerate={handleGenerate} isGenerating={isGenerating} />
            )}
            {activeTab === 'summary' && studyData && (
              <SummaryView
                summary={studyData.summary}
                guideId={activeGuideId}
                settings={SETTINGS}
                supabaseConfigured={supabaseOk}
                backendUrl={BACKEND_URL}
              />
            )}
            {activeTab === 'flashcards' && studyData && (
              <FlashcardsView flashcards={studyData.flashcards} />
            )}
            {activeTab === 'quiz' && studyData && (
              <QuizView quiz={studyData.quiz} onResetApp={handleReset} />
            )}
          </>
        )}
      </main>

      {/* === History Drawer === */}
      <div
        className={`drawer-overlay ${isHistoryOpen ? 'open' : ''}`}
        onClick={() => setIsHistoryOpen(false)}
        aria-hidden="true"
      />
      <aside className={`drawer-panel glass-elevated ${isHistoryOpen ? 'open' : ''}`} role="complementary">
        <div className="drawer-header">
          <div className="drawer-title">
            <History size={18} style={{ color: 'var(--neon-cyan)' }} />
            Saved Guides
          </div>
          <button
            className="btn btn-icon"
            onClick={() => setIsHistoryOpen(false)}
            aria-label="Close history panel"
          >
            <X size={16} />
          </button>
        </div>

        <div className="history-items">
          {pastGuides.length === 0 ? (
            <div className="history-empty">
              No saved guides yet. Generate study notes to auto-save them here!
            </div>
          ) : (
            pastGuides.map(g => (
              <button
                key={g.id}
                className={`history-item-btn ${activeGuideId === g.id ? 'active' : ''}`}
                onClick={() => loadGuide(g.id)}
              >
                <span className="history-item-title">{g.title}</span>
                <span className="history-item-date">
                  {new Date(g.created_at).toLocaleString()}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* === Toast Notifications === */}
      <div className="toast-stack" role="alert" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'error'
              ? <AlertTriangle size={16} />
              : <Sparkles size={16} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
