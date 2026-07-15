import React, { useState, Suspense } from 'react';
import { Sparkles, Mail, Lock, ArrowRight, Github, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load 3D core to avoid blocking initial render
const KnowledgeCore3D = React.lazy(() => import('./three/KnowledgeCore3D'));

export default function AuthView({ supabaseClient, setSession }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabaseClient) {
      setError("System is still connecting to the database. Please wait a moment.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setVerificationSent(false);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.session) setSession(data.session);
      } else {
        const { data, error: signUpError } = await supabaseClient.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError("An account with this email already exists.");
        } else if (!data.session) {
          setVerificationSent(true);
        } else {
          setSession(data.session);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background-void text-text-primary overflow-hidden">
      
      {/* LEFT: Authentication Form (Mobile Full, Desktop Half) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px] mx-auto"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 select-none">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-background-soft border border-border-strong">
              <Sparkles className="w-6 h-6 text-brand-primary" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight">
              StudyGenius <span className="text-brand-primary">AI</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">
              {verificationSent ? "Check your email" : (isLogin ? "Welcome back" : "Create your account")}
            </h1>
            <p className="text-text-secondary text-sm">
              {verificationSent 
                ? "We sent a verification link to your email address. Please verify to continue." 
                : (isLogin ? "Enter your details to access your study workspace." : "Join to transform your study materials into interactive knowledge.")
              }
            </p>
          </div>

          {!verificationSent ? (
            <form onSubmit={handleAuth} className="space-y-4">
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-feedback-error/10 border border-feedback-error/20 text-feedback-error mb-4">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary pl-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-text-muted" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-background-soft border border-border-strong rounded-xl text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-inner-highlight placeholder-text-muted"
                    placeholder="you@university.edu"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center pl-1 pr-1">
                  <label className="text-sm font-medium text-text-secondary">Password</label>
                  {isLogin && (
                    <a href="#" className="text-xs font-medium text-brand-primary hover:text-brand-mint transition-colors">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-text-muted" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-background-soft border border-border-strong rounded-xl text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-inner-highlight placeholder-text-muted"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 py-3.5 flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-background-void font-bold shadow-glow-cyan hover:bg-brand-mint transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-background-void/30 border-t-background-void rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <button 
              onClick={() => {
                setVerificationSent(false);
                setIsLogin(true);
              }}
              className="w-full py-3.5 flex items-center justify-center gap-2 rounded-xl bg-background-soft border border-border-strong text-text-primary font-medium hover:bg-background-elevated transition-colors"
            >
              Return to Sign In
            </button>
          )}

          {!verificationSent && (
            <div className="mt-8 text-center text-sm text-text-secondary">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }} 
                className="font-semibold text-brand-primary hover:text-brand-mint hover:underline transition-all"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* RIGHT: Visual Abstract 3D (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-background-deep border-l border-border flex-col items-center justify-center p-12 overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 bg-grad-hero opacity-30"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        
        <div className="relative z-10 w-full max-w-[600px] h-[500px]">
          <Suspense fallback={
            <div className="w-full h-full flex flex-col items-center justify-center text-brand-primary/50 animate-pulse">
              <Sparkles className="w-12 h-12 mb-4" />
              <p className="text-sm font-medium tracking-widest uppercase">Initializing Knowledge Core</p>
            </div>
          }>
            <KnowledgeCore3D className="w-full h-full" />
          </Suspense>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10 mt-8 text-center max-w-[400px]"
        >
          <h2 className="text-xl font-display font-medium text-text-primary mb-2">The Knowledge Dimension</h2>
          <p className="text-text-secondary text-sm">Experience an intelligent spatial environment where raw information transforms into structured, actionable knowledge.</p>
        </motion.div>
      </div>
      
    </div>
  );
}
