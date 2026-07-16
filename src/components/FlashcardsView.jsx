import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Check, Bookmark, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlashcardsView({ flashcards }) {
  const [idx, setIdx]         = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter]   = useState('all');
  const [status, setStatus]   = useState({});
  const touchStartX = useRef(null);

  useEffect(() => { setIdx(0); setFlipped(false); setStatus({}); }, [flashcards]);

  const annotated = flashcards?.map((c, i) => ({ ...c, i, status: status[i] || null })) || [];
  const filtered  = annotated.filter(c => {
    if (filter === 'mastered') return c.status === 'mastered';
    if (filter === 'review')   return c.status === 'review';
    return true;
  });
  const card = filtered[idx];

  const goTo = useCallback((newIdx) => {
    if (filtered.length <= 1) return;
    setFlipped(false);
    setTimeout(() => setIdx((newIdx + filtered.length) % filtered.length), 150);
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

  // Touch swipe support
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
    touchStartX.current = null;
  };

  const toggleTag = (cardIdx, tagType, e) => {
    e.stopPropagation();
    setStatus(p => ({ ...p, [cardIdx]: p[cardIdx] === tagType ? null : tagType }));
  };

  const masteredCount = annotated.filter(c => c.status === 'mastered').length;
  const reviewCount   = annotated.filter(c => c.status === 'review').length;
  const masteryPct    = flashcards?.length ? Math.round((masteredCount / flashcards.length) * 100) : 0;

  if (!flashcards?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted py-20">
        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
        <h3 className="text-xl font-display font-medium text-text-primary mb-2">No flashcards available</h3>
        <p className="text-sm">Upload study materials to generate flashcards.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col py-4 px-4 gap-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-text-primary">Spatial Flashcards</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Tap card to flip · swipe or use arrows to navigate
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex bg-background-elevated p-1 rounded-xl border border-border-strong self-start sm:self-auto">
          {[
            { id: 'all',      label: `All (${flashcards.length})` },
            { id: 'review',   label: `Review (${reviewCount})` },
            { id: 'mastered', label: `Mastered (${masteredCount})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setIdx(0); setFlipped(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === f.id
                  ? 'bg-background-soft text-text-primary border border-border shadow-sm'
                  : 'text-text-muted hover:text-text-primary border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div>
        <div className="flex justify-between text-xs font-semibold mb-1.5">
          <span className="text-brand-primary">Mastery Level</span>
          <span className="text-text-secondary">{masteryPct}% Complete</span>
        </div>
        <div className="h-1.5 w-full bg-background-elevated rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-grad-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${masteryPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ── Card area ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted border border-dashed border-border rounded-3xl">
          <Bookmark className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-sm">No cards in this category.</p>
        </div>
      ) : (
        <>
          {/* Counter */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {flipped ? 'Answer' : 'Question'} {idx + 1} of {filtered.length}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              flipped ? 'bg-brand-primary/10 text-brand-primary' : 'bg-background-soft text-text-muted'
            }`}>
              {flipped ? 'Flip ▸ Back' : 'Tap to Flip'}
            </span>
          </div>

          {/* 3-D flip card — FIXED HEIGHT, self-contained */}
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.18 }}
              className="perspective-1000 w-full"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div
                className={`relative w-full transition-transform duration-700 preserve-3d cursor-pointer rounded-3xl shadow-layer-3`}
                style={{
                  height: 'clamp(220px, 40vw, 320px)',
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
                onClick={() => setFlipped(p => !p)}
              >
                {/* FRONT */}
                <div
                  className="absolute inset-0 backface-hidden bg-background-elevated border border-border-strong rounded-3xl flex flex-col"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Subtle top gradient */}
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-brand-periwinkle/5 to-transparent rounded-t-3xl pointer-events-none" />
                  <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
                    <p className="text-lg sm:text-2xl font-display font-semibold text-text-primary text-center leading-snug">
                      {card.front}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center gap-2 pb-4 text-xs text-text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted/40 animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted/40 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted/40 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>

                {/* BACK */}
                <div
                  className="absolute inset-0 backface-hidden bg-background-soft border border-brand-primary/30 rounded-3xl flex flex-col overflow-hidden"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(94,245,192,0.06),transparent_60%)] pointer-events-none" />
                  {/* Answer label */}
                  <div className="shrink-0 px-5 pt-4 pb-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-brand-primary">Answer</span>
                  </div>
                  {/* Answer text — scrollable if needed */}
                  <div className="flex-1 overflow-y-auto no-scrollbar px-5 flex items-center justify-center">
                    <p className="text-base sm:text-lg text-text-primary text-center leading-relaxed py-2">
                      {card.back}
                    </p>
                  </div>
                  {/* Rate buttons */}
                  <div className="shrink-0 flex gap-2 px-5 py-4 border-t border-border">
                    <button
                      onClick={(e) => toggleTag(card.i, 'review', e)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        card.status === 'review'
                          ? 'bg-brand-amber/20 text-brand-amber border border-brand-amber/40'
                          : 'bg-background-elevated text-text-secondary border border-border hover:border-brand-amber/30 hover:text-brand-amber'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Needs Review
                    </button>
                    <button
                      onClick={(e) => toggleTag(card.i, 'mastered', e)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        card.status === 'mastered'
                          ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/40'
                          : 'bg-background-elevated text-text-secondary border border-border hover:border-brand-primary/30 hover:text-brand-primary'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> Mastered
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={prev}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-background-elevated border border-border-strong text-text-secondary hover:text-text-primary hover:bg-background-soft hover:border-brand-primary/30 transition-all font-medium text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm font-bold text-text-muted tabular-nums min-w-[48px] text-center">
              {idx + 1} / {filtered.length}
            </span>
            <button
              onClick={next}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-background-elevated border border-border-strong text-text-secondary hover:text-text-primary hover:bg-background-soft hover:border-brand-primary/30 transition-all font-medium text-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
