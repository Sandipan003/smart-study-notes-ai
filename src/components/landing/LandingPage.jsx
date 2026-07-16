import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BrainCircuit, ScanText, Lightbulb, Library, Combine, Cpu, UploadCloud, FileText, Zap, Shield, Star } from 'lucide-react';
import PublicNavbar from '../layout/PublicNavbar';

const KnowledgeCore3D = React.lazy(() => import('../three/KnowledgeCore3D'));

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function LandingPage({ onSignInClick }) {
  return (
    <div className="min-h-screen bg-background-void text-text-primary overflow-hidden font-sans">
      <PublicNavbar onSignInClick={onSignInClick} />

      {/* ─── SECTION 1: HERO ─── */}
      <section className="relative min-h-screen flex items-center px-6 md:px-10 max-w-[1440px] mx-auto">
        {/* Background grid decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(94,245,192,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(94,245,192,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black,transparent)] pointer-events-none" />
        
        {/* Glow orbs */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-brand-periwinkle/8 blur-[80px] pointer-events-none" />

        <div className="w-full pt-28 pb-16 md:pt-32 md:pb-24 flex flex-col lg:flex-row items-center gap-10 lg:gap-6">

          {/* Left content */}
          <motion.div
            className="w-full lg:w-[52%] flex flex-col items-center lg:items-start text-center lg:text-left z-10"
            initial="hidden" animate="visible" variants={stagger}
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/8 border border-brand-primary/20 text-brand-primary text-xs font-semibold mb-7 tracking-wide uppercase">
              <Zap className="w-3 h-3 fill-brand-primary" />
              Powered by Groq · Llama 3.3 70B
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl xl:text-[4.2rem] font-display font-extrabold leading-[1.08] tracking-tight mb-5 text-text-primary">
              Turn Anything<br className="hidden sm:block" /> You Study Into{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-grad-primary">Knowledge</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 9C60 3 180 3 298 9" stroke="url(#ul)" strokeWidth="3" strokeLinecap="round"/>
                  <defs><linearGradient id="ul" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#9FAEFF"/><stop offset="1" stopColor="#5EF5C0"/></linearGradient></defs>
                </svg>
              </span>{' '}
              You Can{' '}
              <span className="text-transparent bg-clip-text bg-grad-primary">Master.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base md:text-lg text-text-secondary max-w-[580px] mb-9 leading-relaxed">
              Upload PDFs, slides, or handwritten notes. StudyGenius AI instantly generates structured summaries, 3D flashcards, adaptive quizzes, and a context-aware tutor.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onSignInClick}
                className="w-full sm:w-auto relative group px-8 py-4 rounded-2xl bg-brand-primary text-background-void font-bold text-base overflow-hidden transition-all hover:-translate-y-1 active:translate-y-0 shadow-glow-cyan flex items-center justify-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Studying Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card text-text-primary font-semibold text-base hover:border-brand-primary/30 transition-all flex items-center justify-center gap-2"
              >
                See How It Works
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-center gap-6 md:gap-10">
              {[
                { val: '<2s', label: 'Generation speed' },
                { val: '5+', label: 'Output formats' },
                { val: '100%', label: 'Context-aware' },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl font-display font-bold text-brand-primary">{s.val}</span>
                  <span className="text-xs text-text-muted mt-0.5">{s.label}</span>
                </div>
              ))}
  
            </motion.div>

            {/* Supported formats */}
            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold tracking-wider uppercase text-text-muted">Supports</span>
              {['.PDF', '.DOCX', '.PPTX', 'Images', 'Text'].map(f => (
                <span key={f} className="px-2.5 py-1 rounded-lg bg-background-soft border border-border-strong text-xs font-mono text-text-secondary">{f}</span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Neural Network */}
          <motion.div
            className="w-full lg:w-[48%] h-[380px] md:h-[520px] lg:h-[580px] relative z-0"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.1 }}
          >
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
              </div>
            }>
              <KnowledgeCore3D />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 2: HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-28 bg-background-deep border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(94,245,192,0.06),transparent)] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-3">The Process</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              One Upload. An Entire <span className="text-brand-amber">Study System.</span>
            </h2>
          </div>

          {/* Mobile: horizontal scroll strip */}
          <div className="flex md:hidden overflow-x-auto no-scrollbar gap-3 pb-2 -mx-6 px-6 snap-x snap-mandatory">
            {[
              { icon: UploadCloud, title: 'Upload', desc: 'Any document', color: '#5EF5C0', num: '01' },
              { icon: BrainCircuit, title: 'AI Analysis', desc: 'Deep understanding', color: '#9FAEFF', num: '02' },
              { icon: FileText, title: 'Smart Notes', desc: 'Structured summaries', color: '#5EF5C0', num: '03' },
              { icon: Combine, title: 'Active Recall', desc: 'Flashcards & Quizzes', color: '#F5C76B', num: '04' },
              { icon: Lightbulb, title: 'Mastery', desc: 'Ace every exam', color: '#9FAEFF', num: '05' },
            ].map((step, i) => (
              <div key={i} className="snap-center flex-shrink-0 w-40 flex flex-col items-center gap-3 p-4 rounded-2xl bg-background-surface border border-border-strong">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: step.color + '15', boxShadow: `0 0 20px ${step.color}20` }}>
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-text-muted">{step.num}</span>
                  <p className="font-semibold text-sm text-text-primary">{step.title}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: horizontal justified row */}
          <div className="hidden md:flex items-center justify-between gap-4 relative">
            <div className="absolute top-10 left-0 w-full h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
            {[
              { icon: UploadCloud, title: 'Upload', desc: 'Any document type', color: '#5EF5C0' },
              { icon: BrainCircuit, title: 'AI Analysis', desc: 'Deep contextual understanding', color: '#9FAEFF' },
              { icon: FileText, title: 'Smart Notes', desc: 'Structured summaries', color: '#5EF5C0' },
              { icon: Combine, title: 'Active Recall', desc: '3D Flashcards & Quizzes', color: '#F5C76B' },
              { icon: Lightbulb, title: 'Mastery', desc: 'Ace every exam', color: '#9FAEFF' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="relative z-10 flex flex-col items-center gap-3 px-4 bg-background-deep"
              >
                <div className="w-20 h-20 rounded-2xl bg-background-surface border border-border-strong flex items-center justify-center shadow-layer-2 hover:scale-105 transition-transform" style={{ boxShadow: `0 0 30px ${step.color}15` }}>
                  <step.icon className="w-8 h-8" style={{ color: step.color }} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-text-primary">{step.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{step.desc}</p>
                </div>
                {i < 4 && <div className="absolute -right-5 top-9 text-text-muted text-2xl font-thin">›</div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: BENTO FEATURES ─── */}
      <section id="features" className="py-32 px-6 max-w-[1440px] mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-3">Features</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-5">Built for deep focus.</h2>
          <p className="text-text-secondary text-lg">A unified AI learning workspace replacing dozens of fragmented tools.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-[280px]">
          {/* Smart Summaries — Wide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="md:col-span-2 glass-card-strong rounded-3xl p-8 relative overflow-hidden group hover:border-brand-primary/20 transition-colors shadow-layer-2"
          >
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-primary/5 to-transparent pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-brand-primary/5 blur-3xl pointer-events-none group-hover:bg-brand-primary/10 transition-colors" />
            <ScanText className="w-10 h-10 text-brand-primary mb-5" />
            <h3 className="text-2xl font-display font-bold mb-2">Smart Summaries</h3>
            <p className="text-text-secondary max-w-md text-sm leading-relaxed">We don't just extract text. StudyGenius AI reconstructs your material into a beautifully formatted document with hierarchy, key concepts, and definitions — optimized for comprehension.</p>
            <div className="absolute bottom-6 right-8 flex items-center gap-1.5 text-xs text-brand-primary/60 font-medium">
              <Star className="w-3 h-3 fill-current" /> Markdown formatted
            </div>
          </motion.div>

          {/* 3D Flashcards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="glass-card-strong rounded-3xl p-8 relative overflow-hidden group hover:border-brand-amber/20 transition-colors shadow-layer-2"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-brand-amber/10 blur-2xl group-hover:bg-brand-amber/20 transition-colors" />
            <Combine className="w-10 h-10 text-brand-amber mb-5" />
            <h3 className="text-2xl font-display font-bold mb-2">3D Flashcards</h3>
            <p className="text-text-secondary text-sm leading-relaxed">Spatial spaced repetition with Framer Motion 3D flip animations for active recall.</p>
          </motion.div>

          {/* AI Tutor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            id="ai-tutor"
            className="glass-card-strong rounded-3xl p-8 relative overflow-hidden group hover:border-brand-periwinkle/20 transition-colors shadow-layer-2"
          >
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-brand-periwinkle/10 blur-2xl group-hover:bg-brand-periwinkle/20 transition-colors" />
            <Cpu className="w-10 h-10 text-brand-periwinkle mb-5" />
            <h3 className="text-2xl font-display font-bold mb-2">AI Concept Tutor</h3>
            <p className="text-text-secondary text-sm leading-relaxed">A tutor that truly understands your specific textbook, chapter, and context — no hallucination.</p>
          </motion.div>

          {/* Library — Wide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="md:col-span-2 glass-card-strong rounded-3xl p-8 relative overflow-hidden group hover:border-brand-primary/20 transition-colors shadow-layer-2"
          >
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-periwinkle/5 to-transparent pointer-events-none" />
            <Library className="w-10 h-10 text-brand-primary mb-5" />
            <h3 className="text-2xl font-display font-bold mb-2">Your Knowledge Library</h3>
            <p className="text-text-secondary max-w-sm text-sm leading-relaxed">Every document becomes a permanent, searchable Study Kit. Build an organized personal knowledge base over time with Supabase-powered sync.</p>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
            className="glass-card-strong rounded-3xl p-8 relative overflow-hidden group hover:border-feedback-success/20 transition-colors shadow-layer-2"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-feedback-success/10 blur-2xl group-hover:bg-feedback-success/20 transition-colors" />
            <Shield className="w-10 h-10 text-feedback-success mb-5" />
            <h3 className="text-2xl font-display font-bold mb-2">Secure & Private</h3>
            <p className="text-text-secondary text-sm leading-relaxed">Row-Level Security ensures only you see your notes. Auth powered by Supabase.</p>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 4: CTA ─── */}
      <section className="py-32 px-6 border-t border-border bg-background-deep relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-primary/8 blur-[140px] pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-5">Get Started</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold mb-6 leading-tight">
              Your notes already have<br />
              <span className="text-transparent bg-clip-text bg-grad-primary">all the answers.</span>
            </h2>
            <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">Let StudyGenius AI unlock them for you — instantly.</p>
            <button
              onClick={onSignInClick}
              className="px-10 py-5 rounded-2xl bg-brand-primary text-background-void font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-glow-cyan inline-flex items-center gap-3 group"
            >
              Build My Study Kit
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border bg-background-void px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-5 text-sm text-text-muted">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            </div>
            <span className="font-semibold text-text-primary">StudyGenius AI</span>
            <span className="text-text-muted">© 2026 · Made by <span className="text-brand-primary font-semibold">Sandipan Sarkar</span> &amp; <span className="text-brand-periwinkle font-semibold">Sayani Das</span></span>
          </div>
          <div className="flex gap-6 font-medium">
            {['Privacy', 'Terms', 'Support'].map(l => (
              <a key={l} href="#" className="hover:text-text-primary transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
