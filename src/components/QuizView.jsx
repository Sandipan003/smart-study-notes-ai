import React, { useState, useEffect, useCallback } from 'react';
import { HelpCircle, Trophy, RotateCcw, AlertCircle, Sparkles, Check, X, ArrowRight, Award, Star } from 'lucide-react';

/* ── Confetti burst ── */
function spawnConfetti() {
  const COLORS = ['#6366f1','#00f5d4','#ec4899','#f59e0b','#10b981','#a78bfa'];
  const container = document.body;
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-particle';
    const size  = Math.random() * 10 + 5;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const left  = Math.random() * 100;
    const delay = Math.random() * 0.8;
    const dur   = Math.random() * 1.5 + 2;
    el.style.cssText = `
      width:${size}px; height:${size}px;
      background:${color};
      left:${left}%;
      top:0;
      animation-duration:${dur}s;
      animation-delay:${delay}s;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + delay + 0.2) * 1000);
  }
}

/* ── Animated Score Ring ── */
function ScoreRing({ pct, score, total }) {
  const R          = 66;
  const C          = 2 * Math.PI * R;
  const offset     = C - (pct / 100) * C;
  const strokeColor = pct >= 80 ? '#00f5d4' : pct >= 50 ? '#6366f1' : '#ec4899';

  return (
    <div className="score-ring-container">
      <svg className="score-ring-svg" viewBox="0 0 160 160">
        <circle className="score-ring-bg" cx="80" cy="80" r={R} />
        <circle
          className="score-ring-fill"
          cx="80" cy="80" r={R}
          stroke={strokeColor}
          style={{
            strokeDasharray: C,
            strokeDashoffset: offset,
            filter: `drop-shadow(0 0 12px ${strokeColor}80)`,
          }}
        />
      </svg>
      <div className="score-ring-inner">
        <span className="score-pct">{pct}%</span>
        <span className="score-fraction">{score} / {total} correct</span>
      </div>
    </div>
  );
}

export default function QuizView({ quiz, onResetApp }) {
  const [qIdx, setQIdx]                 = useState(0);
  const [selected, setSelected]         = useState(null);
  const [answered, setAnswered]         = useState(false);
  const [score, setScore]               = useState(0);
  const [showResults, setShowResults]   = useState(false);
  const [confettiDone, setConfettiDone] = useState(false);

  useEffect(() => {
    setQIdx(0); setSelected(null); setAnswered(false);
    setScore(0); setShowResults(false); setConfettiDone(false);
  }, [quiz]);

  const currentQ = quiz?.[qIdx];

  const pick = useCallback((opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === currentQ?.answer) setScore(p => p + 1);
  }, [answered, currentQ]);

  const next = () => {
    setSelected(null); setAnswered(false);
    if (qIdx + 1 < quiz.length) setQIdx(p => p + 1);
    else setShowResults(true);
  };

  // Trigger confetti on results
  useEffect(() => {
    if (showResults && !confettiDone) {
      const pct = Math.round((score / quiz.length) * 100);
      if (pct >= 80) spawnConfetti();
      setConfettiDone(true);
    }
  }, [showResults, confettiDone, score, quiz?.length]);

  const retry = () => {
    setQIdx(0); setSelected(null); setAnswered(false);
    setScore(0); setShowResults(false); setConfettiDone(false);
  };

  const getGrade = (pct) => {
    if (pct === 100) return { title: '🏆 Perfect Score!',  desc: 'Absolutely flawless — you have mastered this material!' };
    if (pct >= 80)  return { title: '🌟 Excellent Work!',  desc: 'Outstanding! You clearly understand the core concepts.' };
    if (pct >= 50)  return { title: '💪 Good Attempt!',    desc: 'Nice effort! Review the summary and flashcards, then try again.' };
    return              { title: '📚 Keep Learning!',      desc: 'No worries — study the flashcards and give it another shot!' };
  };

  const optionClass = (opt) => {
    if (!answered) return '';
    if (opt === currentQ.answer) return 'correct';
    if (opt === selected)         return 'incorrect';
    return '';
  };

  if (!quiz?.length) {
    return (
      <div className="glass empty-state">
        <div className="empty-icon"><AlertCircle size={28} /></div>
        <h3 style={{ fontFamily: 'Space Grotesk' }}>No quiz questions available</h3>
        <p style={{ fontSize: '0.88rem' }}>Upload study materials to generate a quiz.</p>
      </div>
    );
  }

  const pct   = Math.round((score / quiz.length) * 100);
  const grade = getGrade(pct);
  const prog  = ((qIdx + (answered ? 1 : 0)) / quiz.length) * 100;

  return (
    <div className="quiz-wrapper">
      {!showResults ? (
        <>
          {/* Top bar */}
          <div className="quiz-top-bar">
            <div className="quiz-label">
              <HelpCircle size={20} style={{ color: 'var(--neon-cyan)' }} />
              Multiple-Choice Quiz
            </div>
            <div className="quiz-score-badge">
              <Trophy size={16} />
              {score} / {quiz.length}
            </div>
          </div>

          {/* Progress */}
          <div className="quiz-progress-track">
            <div className="quiz-progress-fill" style={{ width: `${prog}%` }} />
          </div>

          {/* Question Card */}
          <div className="glass question-card">
            <div className="question-number">
              Question {qIdx + 1} of {quiz.length}
            </div>
            <div className="question-text">{currentQ.question}</div>

            <div className="options-grid">
              {currentQ.options.map((opt, i) => {
                const cls = optionClass(opt);
                return (
                  <button
                    key={i}
                    id={`option-${i}`}
                    className={`option-btn ${cls}`}
                    onClick={() => pick(opt)}
                    disabled={answered}
                  >
                    <span className="option-letter">
                      {cls === 'correct'   ? <Check size={14} /> :
                       cls === 'incorrect' ? <X size={14} />     :
                       String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {answered && (
              <div className="explanation-box">
                <div className="explanation-label">
                  <Sparkles size={14} />
                  Explanation
                </div>
                <p className="explanation-text">{currentQ.explanation}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="quiz-footer">
            {answered && (
              <button id="next-question-btn" className="btn btn-primary" onClick={next}>
                {qIdx + 1 === quiz.length ? 'Finish Quiz' : 'Next Question'}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </>
      ) : (
        /* ── Results Screen ── */
        <div className="glass results-card">
          <ScoreRing pct={pct} score={score} total={quiz.length} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <h2 className="results-grade-title">{grade.title}</h2>
            <p className="results-desc">{grade.desc}</p>
          </div>

          <div className="results-stats-row">
            <div className="result-stat-box">
              <div className="result-stat-label">Questions</div>
              <div className="result-stat-value">{quiz.length}</div>
            </div>
            <div className="result-stat-box">
              <div className="result-stat-label">Correct</div>
              <div className="result-stat-value" style={{ color: 'var(--neon-green)' }}>{score}</div>
            </div>
            <div className="result-stat-box">
              <div className="result-stat-label">Wrong</div>
              <div className="result-stat-value" style={{ color: 'var(--neon-pink)' }}>{quiz.length - score}</div>
            </div>
            <div className="result-stat-box">
              <div className="result-stat-label">Accuracy</div>
              <div className="result-stat-value" style={{ color: pct >= 80 ? 'var(--neon-cyan)' : 'var(--text-primary)' }}>
                {pct}%
              </div>
            </div>
          </div>

          <div className="results-actions">
            <button id="retry-quiz-btn" className="btn btn-secondary" onClick={retry}>
              <RotateCcw size={16} />
              Retry Quiz
            </button>
            <button id="new-study-btn" className="btn btn-primary" onClick={onResetApp}>
              <Star size={16} style={{ color: '#05081a' }} />
              Study New Topic
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
