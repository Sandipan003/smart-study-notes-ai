import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Save, Loader2 } from 'lucide-react';

export default function UserSettingsModal({ isOpen, onClose, user, supabase }) {
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.user_metadata?.display_name) {
      setDisplayName(user.user_metadata.display_name);
    }
  }, [user]);



  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      
      if (error) throw error;
      
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        onClose();
        setMessage('');
      }, 1500);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background-void/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background-elevated border border-border-strong rounded-2xl shadow-layer-3 z-[101] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <User className="w-5 h-5 text-brand-primary" />
                Profile Settings
              </h2>
              <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary rounded-lg hover:bg-background-soft transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="w-full bg-background-soft border border-border rounded-xl px-4 py-2.5 text-text-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-text-muted mt-1.5">Email cannot be changed.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Display Name</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-background-surface border border-border-strong rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50 transition-all"
                  />
                </div>
              </div>
              
              {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-feedback-error/10 text-feedback-error' : 'bg-brand-primary/10 text-brand-primary'}`}>
                  {message}
                </div>
              )}
              
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-background-soft transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-brand-primary text-background-void font-bold rounded-xl hover:bg-brand-mint transition-colors disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
