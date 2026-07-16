import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BrainCircuit, ScanText, Lightbulb, Library, Combine, Cpu, UploadCloud, ChevronRight, FileText } from 'lucide-react';
import PublicNavbar from '../layout/PublicNavbar';

const KnowledgeCore3D = React.lazy(() => import('../three/KnowledgeCore3D'));

export default function LandingPage({ onSignInClick }) {
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-background-void text-text-primary overflow-hidden font-sans">
      <PublicNavbar onSignInClick={onSignInClick} />

      {/* 
        ========================================
        SECTION 1: HERO
        ========================================
      */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 md:px-10 max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* Hero Left Content */}
        <motion.div 
          className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-medium mb-8 shadow-layer-1">
            <Sparkles className="w-4 h-4" />
            <span>Your AI Learning Workspace</span>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl xl:text-[4rem] font-display font-bold leading-[1.1] tracking-tight mb-6 text-text-primary">
            Turn Anything You Study <br className="hidden md:block" />
            Into Knowledge You Can <span className="text-transparent bg-clip-text bg-grad-primary">Master.</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-text-secondary max-w-[620px] mb-10 leading-relaxed">
            Upload documents, lecture slides, handwritten notes, or study material. StudyGenius AI transforms them into structured summaries, interactive flashcards, adaptive quizzes, and an AI tutor that understands your material.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={onSignInClick}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-primary text-background-void font-bold shadow-glow-cyan hover:bg-brand-mint transition-all hover:-translate-y-1 active:translate-y-0 text-lg flex items-center justify-center gap-2"
            >
              Start Studying Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-background-soft border border-border-strong text-text-primary font-semibold hover:bg-background-elevated transition-colors text-lg flex items-center justify-center gap-2"
            >
              See How It Works
            </button>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-12 flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-sm font-semibold tracking-wider uppercase text-text-muted">Supported formats</span>
            <div className="flex gap-4 font-mono text-sm">
              <span className="px-2 py-1 rounded bg-background-soft border border-white/10">.PDF</span>
              <span className="px-2 py-1 rounded bg-background-soft border border-white/10">.DOCX</span>
              <span className="px-2 py-1 rounded bg-background-soft border border-white/10">.PPTX</span>
              <span className="px-2 py-1 rounded bg-background-soft border border-white/10">Images</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Right 3D Visual */}
        <motion.div 
          className="w-full lg:w-[45%] h-[400px] md:h-[550px] relative z-0 mt-10 lg:mt-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
            </div>
          }>
            <KnowledgeCore3D />
          </Suspense>
        </motion.div>
      </section>

      {/* 
        ========================================
        SECTION 2: TRANSFORMATION PIPELINE
        ========================================
      */}
      <section id="how-it-works" className="py-24 bg-background-deep border-y border-border relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent"></div>
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          
          <motion.h2 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-3xl md:text-4xl font-display font-bold mb-16"
          >
            One Upload. An Entire <span className="text-brand-amber">Study System.</span>
          </motion.h2>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 relative">
            {/* Connecting Line Desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-border-strong -translate-y-1/2 z-0"></div>
            
            {[
              { icon: UploadCloud, title: "Upload", desc: "Drop any material" },
              { icon: BrainCircuit, title: "AI Understanding", desc: "Contextual processing" },
              { icon: FileText, title: "Structured Notes", desc: "Beautiful summaries" },
              { icon: Combine, title: "Active Recall", desc: "3D Flashcards & Quizzes" },
              { icon: Lightbulb, title: "Mastery", desc: "Ace your exams" }
            ].map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative z-10 flex flex-col items-center gap-4 bg-background-deep p-4 w-full md:w-auto"
              >
                <div className="w-16 h-16 rounded-2xl bg-background-surface border border-border-strong flex items-center justify-center shadow-layer-2 group hover:border-brand-primary transition-colors">
                  <step.icon className="w-8 h-8 text-brand-primary group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary">{step.title}</h4>
                  <p className="text-sm text-text-muted hidden md:block mt-1">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ========================================
        SECTION 3: BENTO FEATURES
        ========================================
      */}
      <section id="features" className="py-32 px-6 max-w-[1440px] mx-auto">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Built for deep focus.</h2>
          <p className="text-lg text-text-secondary">A unified learning workspace replacing dozens of fragmented tools with one intelligent spatial environment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[320px]">
          
          {/* Smart Summaries (Large span) */}
          <div className="md:col-span-2 lg:col-span-2 bg-background-surface border border-border-strong rounded-3xl p-8 relative overflow-hidden group hover:border-border-active transition-colors shadow-layer-2">
            <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-brand-primary/5 to-transparent pointer-events-none z-0"></div>
            
            <div className="relative z-10 pointer-events-none">
              <ScanText className="w-10 h-10 text-brand-primary mb-6" />
              <h3 className="text-2xl font-display font-bold mb-3">Smart Summaries</h3>
              <p className="text-text-secondary max-w-sm md:max-w-md">We don't just extract text. StudyGenius AI reconstructs your material into a readable, beautifully formatted document optimized for comprehension.</p>
            </div>
            
            {/* Abstract visual mockup */}
            <div className="absolute -bottom-10 -right-10 w-3/4 md:w-1/2 h-[220px] bg-background-elevated rounded-tl-xl border border-border-strong shadow-layer-4 p-6 transform group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500 opacity-30 md:opacity-100 pointer-events-none">
              <div className="w-1/2 h-4 bg-border rounded-full mb-6"></div>
              <div className="space-y-3">
                <div className="w-full h-2 bg-border-strong rounded-full"></div>
                <div className="w-[90%] h-2 bg-border-strong rounded-full"></div>
                <div className="w-[95%] h-2 bg-border-strong rounded-full"></div>
              </div>
            </div>
          </div>

          {/* 3D Flashcards */}
          <div className="bg-background-surface border border-border-strong rounded-3xl p-8 relative overflow-hidden group hover:border-border-active transition-colors shadow-layer-2">
            <Combine className="w-10 h-10 text-brand-amber mb-6" />
            <h3 className="text-2xl font-display font-bold mb-3">3D Flashcards</h3>
            <p className="text-text-secondary">Spatial spaced repetition for active recall.</p>
          </div>

          {/* AI Concept Tutor */}
          <div className="bg-background-surface border border-border-strong rounded-3xl p-8 relative overflow-hidden group hover:border-border-active transition-colors shadow-layer-2">
            <Cpu className="w-10 h-10 text-brand-periwinkle mb-6" />
            <h3 className="text-2xl font-display font-bold mb-3">AI Concept Tutor</h3>
            <p className="text-text-secondary">A tutor that actually understands the context of your specific textbook chapter.</p>
          </div>

          {/* Saved Study Library (Large span) */}
          <div className="md:col-span-2 bg-background-surface border border-border-strong rounded-3xl p-8 relative overflow-hidden group hover:border-border-active transition-colors shadow-layer-2">
            <Library className="w-10 h-10 text-brand-primary mb-6" />
            <h3 className="text-2xl font-display font-bold mb-3">Your Knowledge Library</h3>
            <p className="text-text-secondary max-w-sm">Every document you upload becomes a permanent, searchable Study Kit. Build an organized brain over time.</p>
          </div>

        </div>
      </section>

      {/* 
        ========================================
        SECTION 4: FINAL CTA
        ========================================
      */}
      <section className="py-32 px-6 border-t border-border bg-background-deep relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8">
            Your Study Material Already Has the Answers.<br />
            <span className="text-brand-primary">StudyGenius AI Helps You Understand Them.</span>
          </h2>
          <button 
            onClick={onSignInClick}
            className="px-10 py-5 rounded-2xl bg-text-primary text-background-void font-bold hover:bg-brand-primary hover:scale-105 active:scale-95 transition-all shadow-layer-3 text-xl inline-flex items-center gap-3"
          >
            Build My Study Kit
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border-strong bg-background-void px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span className="font-semibold text-text-primary">StudyGenius AI</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6 font-medium">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
