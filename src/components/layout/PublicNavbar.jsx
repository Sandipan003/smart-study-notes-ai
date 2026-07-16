import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicNavbar({ onSignInClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#ai-tutor', label: 'AI Tutor' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'py-3' : 'py-5'
        }`}
      >
        {/* Navbar background — only shows when scrolled */}
        <div className={`absolute inset-0 transition-all duration-300 ${
          scrolled ? 'bg-background-elevated/80 backdrop-blur-xl border-b border-border shadow-layer-2' : ''
        }`} />

        <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex items-center justify-between relative z-10">

          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center overflow-hidden group-hover:border-brand-primary/50 transition-colors">
              <div className="absolute inset-0 bg-grad-primary opacity-10 group-hover:opacity-20 transition-opacity" />
              <Sparkles className="w-4 h-4 text-brand-primary relative z-10" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              StudyGenius <span className="text-brand-primary">AI</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Groq badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background-soft border border-border-strong text-xs font-semibold text-text-muted">
              <Zap className="w-3 h-3 text-brand-primary fill-brand-primary" />
              Groq powered
            </div>
            <button
              onClick={onSignInClick}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-2"
            >
              Sign In
            </button>
            <button
              onClick={onSignInClick}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-background-void rounded-xl bg-brand-primary hover:bg-brand-mint transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-glow-cyan"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-text-primary hover:bg-background-soft transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Full-screen Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background-deep/95 backdrop-blur-2xl flex flex-col pt-24 px-6 pb-8 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center justify-between py-4 px-2 border-b border-border font-display font-semibold text-xl text-text-primary hover:text-brand-primary transition-colors"
                >
                  {link.label}
                  <ArrowRight className="w-4 h-4 text-text-muted" />
                </motion.a>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <button
                onClick={() => { setMobileMenuOpen(false); onSignInClick(); }}
                className="w-full py-4 rounded-xl border border-border-strong text-text-primary font-semibold text-base hover:bg-background-soft transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onSignInClick(); }}
                className="w-full py-4 rounded-xl bg-brand-primary text-background-void font-bold text-base shadow-glow-cyan hover:bg-brand-mint transition-colors flex items-center justify-center gap-2"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
