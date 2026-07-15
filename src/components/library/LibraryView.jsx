import React from 'react';
import { BookOpen, Clock, ChevronRight, FileText, Bookmark, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LibraryView({ pastGuides, activeGuideId, onLoadGuide }) {
  if (!pastGuides || pastGuides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted">
        <BookOpen className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-2xl font-display font-bold text-text-primary mb-2">Your library is empty</h3>
        <p>Generate study notes to automatically save them here.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">My Library</h1>
          <p className="text-text-secondary">All your saved study kits in one place.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search guides..." 
            className="w-full bg-background-elevated border border-border-strong rounded-xl py-2.5 pl-10 pr-4 text-sm text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-inner-highlight"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pastGuides.map((guide, idx) => {
          const isActive = activeGuideId === guide.id;
          
          return (
            <motion.button
              key={guide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onLoadGuide(guide.id)}
              className={`flex flex-col text-left p-6 rounded-3xl border transition-all duration-300 relative group overflow-hidden ${
                isActive 
                  ? 'bg-brand-primary/10 border-brand-primary/50 shadow-[0_0_20px_rgba(98,246,197,0.15)]' 
                  : 'bg-background-surface border-border-strong hover:border-brand-periwinkle/50 hover:shadow-layer-2 hover:-translate-y-1'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full pointer-events-none group-hover:bg-brand-primary/10 transition-colors"></div>
              
              <div className="w-12 h-12 rounded-xl bg-background-elevated border border-border flex items-center justify-center mb-6 relative z-10 group-hover:border-brand-periwinkle/50 transition-colors">
                <FileText className={`w-6 h-6 ${isActive ? 'text-brand-primary' : 'text-text-secondary group-hover:text-brand-periwinkle'}`} />
              </div>

              <h3 className="font-display font-bold text-lg text-text-primary mb-2 line-clamp-2 relative z-10">
                {guide.title || 'Untitled Notes'}
              </h3>
              
              <div className="flex items-center gap-2 text-xs text-text-muted mt-auto pt-4 relative z-10">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(guide.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              {isActive && (
                <div className="absolute top-6 right-6 flex items-center gap-1.5 text-xs font-bold text-brand-primary bg-brand-primary/20 px-2.5 py-1 rounded-md">
                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></div> Active
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
