import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Check, Bookmark, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlashcardsView({ flashcards }) {
  const [idx, setIdx]           = useState(0);
  const [flipped, setFlipped]   = useState(false);
  const [filter, setFilter]     = useState('all');
  const [status, setStatus]     = useState({});

  useEffect(() => {
    setIdx(0); setFlipped(false); setStatus({});
  }, [flashcards]);

  const annotated = flashcards?.map((c, i) => ({ ...c, i, status: status[i] || null })) || [];

  const filtered = annotated.filter(c => {
    if (filter === 'mastered') return c.status === 'mastered';
    if (filter === 'review')   return c.status === 'review';
    return true;
  });

  const card = filtered[idx];

  const goTo = useCallback((newIdx) => {
    if (filtered.length <= 1) return;
    setFlipped(false);
    setTimeout(() => {
      setIdx((newIdx + filtered.length) % filtered.length);
    }, 150);
  }, [filtered.length]);

  const next = useCallback(() => goTo(idx + 1), [goTo, idx]);
  const prev = useCallback(() => goTo(idx - 1), [goTo, idx]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space')      { e.preventDefault(); setFlipped(p => !p); }
      if (e.code === 'ArrowRight') next();
      if (e.code === 'ArrowLeft')  prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const toggleTag = (cardIdx, tagType, e) => {
    e.stopPropagation();
    setStatus(p => ({ ...p, [cardIdx]: p[cardIdx] === tagType ? null : tagType }));
  };

  const masteredCount = annotated.filter(c => c.status === 'mastered').length;
  const reviewCount   = annotated.filter(c => c.status === 'review').length;
  const masteryPct    = flashcards?.length ? Math.round((masteredCount / flashcards.length) * 100) : 0;

  if (!flashcards?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted">
        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
        <h3 className="text-xl font-display font-medium text-text-primary mb-2">No flashcards available</h3>
        <p className="text-sm">Upload study materials to generate 3D flashcards.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full py-8 px-4">
      {/* Controls & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary mb-1">Spatial Flashcards</h2>
          <p className="text-sm text-text-muted">
            Press <code className="bg-background-soft border border-border px-1.5 py-0.5 rounded text-brand-primary mx-1">Space</code> to flip
          </p>
        </div>

        <div className="flex bg-background-elevated p-1 rounded-xl border border-border-strong">
          {[
            { id: 'all', label: `All (${flashcards.length})` },
            { id: 'review', label: `Review (${reviewCount})` },
            { id: 'mastered', label: `Mastered (${masteredCount})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setIdx(0); setFlipped(false); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.id 
                  ? 'bg-background-soft text-text-primary shadow-sm border border-border' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-void/50 border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-semibold mb-2">
          <span className="text-brand-mint">Mastery Level</span>
          <span className="text-text-secondary">{masteryPct}% Complete</span>
        </div>
        <div className="h-2 w-full bg-background-elevated rounded-full overflow-hidden border border-border">
          <motion.div 
            className="h-full bg-grad-primary"
            initial={{ width: 0 }}
            animate={{ width: `${masteryPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* 3D Card Area */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-text-muted bg-background-elevated/30 border border-border border-dashed rounded-3xl">
          <Bookmark className="w-10 h-10 mb-3 opacity-20" />
          <p>No cards in this filter category.</p>
        </div>
      ) : (
        <div className="flex-1 relative perspective-1000 flex items-center justify-center min-h-[400px]">
          
          <button 
            onClick={prev}
            className="absolute left-0 z-20 p-3 rounded-full bg-background-elevated border border-border-strong text-text-primary hover:bg-background-soft hover:text-brand-primary hover:border-brand-primary transition-all shadow-layer-2 hidden sm:block"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -40 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[600px] h-[360px] cursor-pointer group"
              onClick={() => setFlipped(!flipped)}
            >
              <div 
                className={`relative w-full h-full transition-transform duration-700 preserve-3d shadow-layer-3 rounded-3xl ${flipped ? 'rotate-y-180' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                
                {/* FRONT */}
                <div 
                  className="absolute inset-0 backface-hidden bg-background-elevated border border-border-strong rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="absolute inset-0 bg-grad-card opacity-50"></div>
                  <div className="absolute top-4 left-4 text-xs font-bold text-text-muted tracking-widest uppercase">
                    Question {idx + 1} of {filtered.length}
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-display font-medium text-text-primary leading-tight relative z-10 px-4">
                    {card.front}
                  </h3>
                  
                  <div className="absolute bottom-6 flex items-center gap-2 text-text-muted text-sm font-medium group-hover:text-brand-primary transition-colors">
                    <RotateCw className="w-4 h-4" />
                    <span>Click to reveal</span>
                  </div>
                </div>

                {/* BACK */}
                <div 
                  className="absolute inset-0 backface-hidden bg-background-soft border border-brand-primary/30 rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden rotate-y-180"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-primary/5 via-background-void to-background-void"></div>
                  <div className="absolute top-4 left-4 text-xs font-bold text-brand-primary tracking-widest uppercase">
                    Answer
                  </div>
                  
                  <div className="relative z-10 w-full overflow-y-auto no-scrollbar max-h-full py-4">
                    <p className="text-lg md:text-xl text-text-primary leading-relaxed px-4">
                      {card.back}
                    </p>
                  </div>
                  
                  <div className="absolute bottom-6 w-full px-8 flex justify-between items-center z-20">
                    <button 
                      onClick={(e) => toggleTag(card.i, 'review', e)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        card.status === 'review' 
                          ? 'bg-brand-amber/20 text-brand-amber border border-brand-amber/30' 
                          : 'bg-background-elevated text-text-secondary border border-border hover:bg-background border-border-strong hover:text-text-primary'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" /> Needs Review
                    </button>
                    
                    <button 
                      onClick={(e) => toggleTag(card.i, 'mastered', e)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        card.status === 'mastered' 
                          ? 'bg-brand-mint/20 text-brand-mint border border-brand-mint/30' 
                          : 'bg-background-elevated text-text-secondary border border-border hover:bg-background border-border-strong hover:text-text-primary'
                      }`}
                    >
                      <Check className="w-4 h-4" /> Mastered
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>

          <button 
            onClick={next}
            className="absolute right-0 z-20 p-3 rounded-full bg-background-elevated border border-border-strong text-text-primary hover:bg-background-soft hover:text-brand-primary hover:border-brand-primary transition-all shadow-layer-2 hidden sm:block"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
        </div>
      )}
      
      {/* Mobile controls */}
      <div className="flex justify-between items-center mt-6 sm:hidden">
        <button onClick={prev} className="p-3 rounded-full bg-background-elevated border border-border text-text-primary">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-sm font-medium text-text-muted">{idx + 1} / {filtered.length}</span>
        <button onClick={next} className="p-3 rounded-full bg-background-elevated border border-border text-text-primary">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
}
