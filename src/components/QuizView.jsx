import React, { useState, useEffect, useCallback } from 'react';
import { HelpCircle, Trophy, RotateCcw, AlertCircle, Check, X, ArrowRight, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizView({ quiz, onResetApp }) {
  const [qIdx, setQIdx]                 = useState(0);
  const [selected, setSelected]         = useState(null);
  const [answered, setAnswered]         = useState(false);
  const [score, setScore]               = useState(0);
  const [showResults, setShowResults]   = useState(false);

  useEffect(() => {
    setQIdx(0); setSelected(null); setAnswered(false);
    setScore(0); setShowResults(false);
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

  const retry = () => {
    setQIdx(0); setSelected(null); setAnswered(false);
    setScore(0); setShowResults(false);
  };

  if (!quiz?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted">
        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
        <h3 className="text-xl font-display font-medium text-text-primary mb-2">No quiz available</h3>
        <p className="text-sm">Upload study materials to generate a quiz.</p>
      </div>
    );
  }

  if (showResults) {
    const pct = Math.round((score / quiz.length) * 100);
    const success = pct >= 80;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-12 px-6"
      >
        <div className="w-32 h-32 relative mb-8 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle className="text-background-elevated stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
            <motion.circle 
              className={`${success ? 'text-brand-mint' : (pct >= 50 ? 'text-brand-periwinkle' : 'text-brand-amber')} stroke-current`}
              strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent"
              initial={{ strokeDasharray: "251 251", strokeDashoffset: 251 }}
              animate={{ strokeDashoffset: 251 - (251 * pct) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="text-center absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-display font-bold text-text-primary">{pct}%</span>
          </div>
        </div>

        <h2 className="text-3xl font-display font-bold text-text-primary mb-3">
          {success ? 'Outstanding!' : pct >= 50 ? 'Good Effort!' : 'Keep Practicing'}
        </h2>
        
        <p className="text-text-secondary text-lg mb-10 text-center">
          You scored <strong className="text-text-primary">{score}</strong> out of <strong className="text-text-primary">{quiz.length}</strong> correct.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <button 
            onClick={retry}
            className="flex-1 w-full py-4 rounded-xl bg-background-elevated border border-border-strong text-text-primary font-bold hover:bg-background-soft transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> Retake Quiz
          </button>
          <button 
            onClick={onResetApp}
            className="flex-1 w-full py-4 rounded-xl bg-brand-primary text-background-void font-bold shadow-glow-cyan hover:bg-brand-mint transition-colors flex items-center justify-center gap-2"
          >
            Study Something Else <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-brand-periwinkle" /> Knowledge Check
          </h2>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-background-elevated border border-border-strong text-sm font-medium">
          <span className="text-text-primary">Question {qIdx + 1}</span>
          <span className="text-text-muted">/ {quiz.length}</span>
        </div>
      </div>

      <div className="h-1.5 w-full bg-background-elevated rounded-full mb-10 overflow-hidden">
        <motion.div 
          className="h-full bg-brand-periwinkle"
          initial={{ width: `${(qIdx / quiz.length) * 100}%` }}
          animate={{ width: `${((qIdx + 1) / quiz.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-xl md:text-2xl font-medium text-text-primary leading-snug mb-8">
            {currentQ.question}
          </h3>

          <div className="flex flex-col gap-3">
            {currentQ.options.map((opt, i) => {
              const isSelected = selected === opt;
              const isCorrect  = opt === currentQ.answer;
              
              let stateClass = 'bg-background-elevated border-border-strong hover:border-brand-periwinkle/50 hover:bg-background-soft text-text-secondary hover:text-text-primary';
              
              if (answered) {
                if (isCorrect) {
                  stateClass = 'bg-brand-mint/10 border-brand-mint/50 text-brand-mint shadow-[0_0_15px_rgba(99,230,167,0.1)]';
                } else if (isSelected) {
                  stateClass = 'bg-feedback-error/10 border-feedback-error/50 text-feedback-error';
                } else {
                  stateClass = 'bg-background-void border-border opacity-50 text-text-muted cursor-not-allowed';
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => pick(opt)}
                  disabled={answered}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${stateClass}`}
                >
                  <div className={`w-6 h-6 shrink-0 rounded-full border flex items-center justify-center mt-0.5 ${
                    answered && isCorrect ? 'bg-brand-mint border-brand-mint text-background-void' : 
                    answered && isSelected && !isCorrect ? 'bg-feedback-error border-feedback-error text-background-void' : 
                    'border-border-strong text-transparent'
                  }`}>
                    {answered && isCorrect && <Check className="w-4 h-4" />}
                    {answered && isSelected && !isCorrect && <X className="w-4 h-4" />}
                  </div>
                  <span className="text-lg">{opt}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                className="mt-8 overflow-hidden"
              >
                <div className={`p-6 rounded-2xl border ${selected === currentQ.answer ? 'bg-brand-mint/5 border-brand-mint/20' : 'bg-background-soft border-border-strong'}`}>
                  <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 ${selected === currentQ.answer ? 'text-brand-mint' : 'text-text-primary'}`}>
                    {selected === currentQ.answer ? 'Correct!' : 'Explanation'}
                  </h4>
                  <p className="text-text-secondary leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={next}
                    className="px-8 py-3 rounded-xl bg-brand-primary text-background-void font-bold shadow-glow-cyan hover:bg-brand-mint transition-colors flex items-center justify-center gap-2"
                  >
                    {qIdx + 1 < quiz.length ? 'Next Question' : 'View Results'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
