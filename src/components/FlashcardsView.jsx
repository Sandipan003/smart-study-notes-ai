import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Check, Bookmark, AlertCircle } from 'lucide-react';

export default function FlashcardsView({ flashcards }) {
  const [idx, setIdx]           = useState(0);
  const [flipped, setFlipped]   = useState(false);
  const [filter, setFilter]     = useState('all');
  const [status, setStatus]     = useState({});
  const [animated, setAnimated] = useState(false);

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
    setAnimated(true);
    setTimeout(() => {
      setIdx((newIdx + filtered.length) % filtered.length);
      setAnimated(false);
    }, 150);
  }, [filtered.length]);

  const next = useCallback(() => goTo(idx + 1), [goTo, idx]);
  const prev = useCallback(() => goTo(idx - 1), [goTo, idx]);

  // Keyboard navigation
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

  const tag = (cardIdx, tagType, e) => {
    e.stopPropagation();
    setStatus(p => ({ ...p, [cardIdx]: p[cardIdx] === tagType ? null : tagType }));
  };

  const masteredCount = annotated.filter(c => c.status === 'mastered').length;
  const reviewCount   = annotated.filter(c => c.status === 'review').length;
  const masteryPct    = flashcards?.length ? Math.round((masteredCount / flashcards.length) * 100) : 0;

  if (!flashcards?.length) {
    return (
      <div className="glass empty-state">
        <div className="empty-icon"><AlertCircle size={28} /></div>
        <h3 style={{ fontFamily: 'Space Grotesk' }}>No flashcards available</h3>
        <p style={{ fontSize: '0.88rem' }}>Upload study materials to generate flashcards.</p>
      </div>
    );
  }

  return (
    <div className="flashcards-section">
      {/* Controls Row */}
      <div className="flashcards-controls">
        <div className="deck-stats">
          <div className="deck-title">Flashcards Deck</div>
          <div className="deck-hint">
            Press <code style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--neon-pink)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>Space</code>
            {' '}to flip · arrows to navigate
          </div>
        </div>

        <div className="filter-pills">
          {[
            { id: 'all',      label: `All (${flashcards.length})` },
            { id: 'review',   label: `Review (${reviewCount})` },
            { id: 'mastered', label: `Mastered (${masteredCount})` },
          ].map(f => (
            <button
              key={f.id}
              className={`filter-pill ${filter === f.id ? 'active' : ''}`}
              onClick={() => { setFilter(f.id); setIdx(0); setFlipped(false); }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mastery Progress Bar ── */}
      <div className="mastery-bar-container">
        <div className="mastery-bar-labels">
          <span>Mastery Progress</span>
          <span style={{ color: masteryPct >= 80 ? 'var(--neon-green)' : 'var(--text-muted)' }}>{masteryPct}%</span>
        </div>
        <div className="mastery-bar-track">
          <div className="mastery-bar-fill" style={{ width: `${masteryPct}%` }} />
        </div>
      </div>

      {/* ── 3D Card ── */}
      {filtered.length > 0 ? (
        <>
          <div
            className="card-scene"
            style={{ opacity: animated ? 0 : 1, transition: 'opacity 0.15s ease' }}
          >
            <div
              className={`card-3d ${flipped ? 'flipped' : ''}`}
              onClick={() => setFlipped(p => !p)}
              role="button"
              tabIndex={0}
              aria-label={flipped ? 'Card back — click to flip' : 'Card front — click to flip'}
              onKeyDown={(e) => e.code === 'Enter' && setFlipped(p => !p)}
            >
              {/* ── Front Face ── */}
              <div className="card-face card-front">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-badge badge-concept">Concept</span>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: card?.status === 'mastered' ? 'var(--neon-green)' :
                                card?.status === 'review'   ? 'var(--neon-pink)' : 'var(--border-glass)',
                    boxShadow: card?.status === 'mastered' ? '0 0 10px var(--neon-green)' : 'none',
                    display: 'block',
                    transition: 'all 0.3s'
                  }} />
                </div>

                <div className="card-body-center">
                  <p className="card-front-text">{card?.front}</p>
                </div>

                <div className="card-foot">
                  <span>Click to reveal explanation</span>
                  <RotateCw size={14} style={{ opacity: 0.5 }} />
                </div>
              </div>

              {/* ── Back Face ── */}
              <div className="card-face card-back">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-badge badge-explain">Explanation</span>
                  <div className="card-action-row">
                    <button
                      className={`tag-btn ${card?.status === 'review' ? 'review' : ''}`}
                      onClick={(e) => tag(card?.i, 'review', e)}
                    >
                      <Bookmark size={12} />
                      Review
                    </button>
                    <button
                      className={`tag-btn ${card?.status === 'mastered' ? 'mastered' : ''}`}
                      onClick={(e) => tag(card?.i, 'mastered', e)}
                    >
                      <Check size={12} />
                      Mastered
                    </button>
                  </div>
                </div>

                <div className="card-body-center">
                  <p className="card-back-text">{card?.back}</p>
                </div>

                <div className="card-foot">
                  <span>Click to return to front</span>
                  <RotateCw size={14} style={{ opacity: 0.5 }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Navigation ── */}
          <div className="card-nav">
            <button
              className="nav-circle-btn"
              onClick={prev}
              disabled={filtered.length <= 1}
              aria-label="Previous card"
            >
              <ChevronLeft size={22} />
            </button>

            <span className="nav-counter">{idx + 1} / {filtered.length}</span>

            <button
              className="nav-circle-btn"
              onClick={next}
              disabled={filtered.length <= 1}
              aria-label="Next card"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* ── Progress Dots ── */}
          <div className="progress-dots">
            {filtered.map((c, di) => (
              <button
                key={di}
                className={`progress-dot ${di === idx ? 'active' : ''} ${c.status === 'mastered' ? 'mastered' : ''} ${c.status === 'review' ? 'review' : ''}`}
                onClick={() => goTo(di)}
                aria-label={`Go to card ${di + 1}`}
                style={{ cursor: 'pointer', border: 'none' }}
              />
            ))}
          </div>
        </>
      ) : (
        /* Empty filtered state */
        <div className="glass empty-state" style={{ maxWidth: '580px', width: '100%', minHeight: '340px' }}>
          <div className="empty-icon"><AlertCircle size={28} /></div>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem' }}>No cards match this filter</h3>
          <p style={{ fontSize: '0.82rem' }}>
            {filter === 'mastered' && "No cards marked as mastered yet."}
            {filter === 'review'   && "No cards marked for review yet."}
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => setFilter('all')}
            style={{ marginTop: '0.5rem', fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
}
