import React, { useState } from 'react';
import { Mail, Lock, UserPlus, LogIn, CheckCircle, Sparkles } from 'lucide-react';

export default function AuthView({ supabase, onAuthSuccess, toast }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail]       = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [verifySent, setVerifySent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Please enter both email and password.", "error");
      return;
    }
    if (password.length < 6) {
      toast("Password must be at least 6 characters.", "error");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // Supabase sign-up returns session if email confirmation is off,
        // or empty session with verification mail sent if confirmation is on.
        if (data?.session) {
          onAuthSuccess(data.session);
          toast("Account created and logged in!", "success");
        } else {
          setVerifySent(true);
          toast("Verification email sent! Please check your inbox.", "success");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuthSuccess(data.session);
        toast("Welcome back!", "success");
      }
    } catch (err) {
      toast(err.message || "Authentication failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (verifySent) {
    return (
      <div className="auth-container">
        <div className="glass-elevated auth-card text-center" style={{ transform: 'perspective(1000px) rotateX(2deg)' }}>
          <div className="auth-success-icon">
            <CheckCircle size={48} color="var(--neon-pink)" />
          </div>
          <h2 className="auth-title">Verify Your Email</h2>
          <p className="auth-subtitle">
            We have sent a verification link to <strong style={{ color: 'var(--neon-cyan)' }}>{email}</strong>.
            Please check your email and click the link to activate your account.
          </p>
          <button className="btn btn-secondary mt-6 w-full" onClick={() => setVerifySent(false)}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="glass-elevated auth-card" style={{ transform: 'perspective(1000px) rotateX(2deg)' }}>
        <div className="auth-header">
          <div className="auth-logo-icon">
            <Sparkles size={24} color="var(--neon-cyan)" />
          </div>
          <h2 className="auth-title">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="auth-subtitle">
            {isSignUp 
              ? 'Join StudyGenius AI to generate and save your study guides.' 
              : 'Sign in to access your saved notes, flashcards, and quizzes.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label" htmlFor="auth-email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="auth-password">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="auth-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? (
              <span className="loading-ring-small" />
            ) : isSignUp ? (
              <>
                <UserPlus size={18} />
                <span>Sign Up</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span className="auth-footer-text">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button 
            className="auth-toggle-btn"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
