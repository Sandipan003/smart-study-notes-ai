import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Layers, HelpCircle, BrainCircuit, Maximize2, Minimize2, X } from 'lucide-react';
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
      <div className={`flex flex-col flex-1 min-w-0 bg-background-surface border border-border-strong rounded-3xl overflow-hidden shadow-layer-2 relative transition-all ${isTutorOpen ? 'lg:mr-4 lg:rounded-r-none lg:border-r-0' : ''}`}>

        {/* Workspace Toolbar */}
        <header className="flex items-center justify-between px-3 md:px-5 py-3 border-b border-border bg-background-elevated/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0 pr-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-background-void shadow-glow-cyan'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-soft'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 pl-3 border-l border-border shrink-0">
            {/* AI Tutor button — visible on all screen sizes */}
            <button
              onClick={() => setIsTutorOpen(!isTutorOpen)}
              className={`flex items-center gap-1.5 p-2 md:px-3 md:py-2 rounded-xl text-sm font-medium transition-all ${
                isTutorOpen
                  ? 'bg-[#62F6C5]/10 text-[#62F6C5] border border-[#62F6C5]/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-soft border border-transparent'
              }`}
              title="AI Tutor"
            >
              <BrainCircuit className="w-4 h-4 md:w-4 md:h-4" />
              <span className="hidden md:inline text-xs font-medium">AI Tutor</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-background-soft transition-colors"
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
                <div className="max-w-4xl mx-auto py-6 px-4 md:px-6">
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
                <div className="max-w-3xl mx-auto py-6 px-4 md:px-6">
                  <QuizView quiz={studyData.quiz} onResetApp={onReset} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* TUTOR SIDE PANEL (desktop) + FULL-SCREEN MOBILE SHEET */}
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
