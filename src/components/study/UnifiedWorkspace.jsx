import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Layers, HelpCircle, BrainCircuit, Maximize2, Minimize2 } from 'lucide-react';
import SummaryView from '../SummaryView';
import FlashcardsView from '../FlashcardsView';
import QuizView from '../QuizView';
import TutorPanel from './TutorPanel';

export default function UnifiedWorkspace({ studyData, activeGuideId, session, onReset }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const tabs = [
    { id: 'summary', icon: FileText, label: 'Notes' },
    { id: 'flashcards', icon: Layers, label: 'Flashcards' },
    { id: 'quiz', icon: HelpCircle, label: 'Quiz' },
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`flex h-full w-full bg-background-void ${isFullscreen ? 'fixed inset-0 z-50 p-4 md:p-8' : 'animate-in fade-in zoom-in-95 duration-500'}`}>
      
      {/* MAIN WORKSPACE AREA */}
      <div className={`flex flex-col flex-1 bg-background-surface border border-border-strong rounded-3xl overflow-hidden shadow-layer-2 relative transition-all ${isTutorOpen ? 'lg:mr-4 lg:rounded-r-none lg:border-r-0' : ''}`}>
        
        {/* Workspace Toolbar */}
        <header className="flex items-center justify-between px-3 md:px-5 py-2.5 md:py-3 border-b border-border bg-background-elevated/60 backdrop-blur-md sticky top-0 z-20 gap-2">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-background-void shadow-glow-cyan'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-soft'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 pl-2 border-l border-border shrink-0">
            <button
              onClick={() => setIsTutorOpen(!isTutorOpen)}
              title="AI Tutor"
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                isTutorOpen
                  ? 'bg-brand-periwinkle/20 text-brand-periwinkle border border-brand-periwinkle/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-soft border border-transparent'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span className="hidden sm:inline">AI Tutor</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-background-soft transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {activeTab === 'summary' && (
                <div className="max-w-4xl mx-auto py-6 md:py-8 px-4 md:px-6">
                  <SummaryView
                    summary={studyData.summary}
                    guideId={activeGuideId}
                    settings={{}}
                    supabaseConfigured={true}
                    backendUrl=""
                    accessToken={session?.access_token}
                  />
                </div>
              )}
              {activeTab === 'flashcards' && (
                <div className="h-full flex items-center justify-center p-4 md:p-6">
                  <FlashcardsView flashcards={studyData.flashcards} />
                </div>
              )}
              {activeTab === 'quiz' && (
                <div className="max-w-3xl mx-auto py-6 md:py-8 px-4 md:px-6">
                  <QuizView quiz={studyData.quiz} onResetApp={onReset} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* TUTOR SIDE PANEL — desktop + mobile modal handled inside TutorPanel */}
      <AnimatePresence>
        {isTutorOpen && (
          <TutorPanel
            summary={studyData.summary}
            guideId={activeGuideId}
            session={session}
            backendUrl=""
            onClose={() => setIsTutorOpen(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
