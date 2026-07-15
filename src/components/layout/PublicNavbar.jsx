import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicNavbar({ onSignInClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'py-4 bg-background-elevated/80 backdrop-blur-md border-b border-border' : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-background-soft border border-border-strong group-hover:border-brand-primary transition-colors overflow-hidden">
              <div className="absolute inset-0 bg-grad-primary opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <Sparkles className="w-5 h-5 text-brand-primary relative z-10" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight text-text-primary">
              StudyGenius <span className="text-brand-primary">AI</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">How It Works</a>
            <a href="#ai-tutor" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">AI Tutor</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onSignInClick}
              className="text-sm font-medium text-text-primary hover:text-brand-primary transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onSignInClick}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-background rounded-full bg-brand-primary hover:bg-brand-primary/90 transition-all hover:scale-105 active:scale-95 shadow-glow-cyan"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-text-primary hover:bg-background-soft transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Sheet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background-elevated/95 backdrop-blur-xl flex flex-col pt-24 px-6 pb-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-lg font-display font-medium">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-3 border-b border-border">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-3 border-b border-border">How It Works</a>
              <a href="#ai-tutor" onClick={() => setMobileMenuOpen(false)} className="py-3 border-b border-border">AI Tutor</a>
            </div>
            
            <div className="mt-auto flex flex-col gap-4">
              <button 
                onClick={() => { setMobileMenuOpen(false); onSignInClick(); }}
                className="w-full py-4 rounded-xl border border-border-strong text-text-primary font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onSignInClick(); }}
                className="w-full py-4 rounded-xl bg-brand-primary text-background font-bold shadow-glow-cyan flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
