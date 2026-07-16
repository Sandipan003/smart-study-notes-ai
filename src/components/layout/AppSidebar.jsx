import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Home, BookOpen, Layers, Clock, 
  BrainCircuit, FileText, LogOut, ChevronLeft, ChevronRight, User, Settings
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'new-study', icon: Layers, label: 'New Study' },
  { id: 'library', icon: BookOpen, label: 'My Library' },
  { id: 'recent', icon: Clock, label: 'Recent' },
  { id: 'tutor', icon: BrainCircuit, label: 'AI Tutor' },
];

const TOOL_ITEMS = [
  { id: 'summaries', icon: FileText, label: 'Summaries' },
];

export default function AppSidebar({ user, supabase, onSignOut, currentView, setCurrentView, onOpenSettings }) {
  const [collapsed, setCollapsed] = useState(false);
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Student';
  const email = user?.email || '';

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      className="hidden md:flex flex-col h-screen bg-background-elevated border-r border-border sticky top-0 z-40 overflow-hidden"
    >
      {/* Logo */}
      <div className={`flex items-center h-[68px] border-b border-border/50 px-4 shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center overflow-hidden">
            <Sparkles className="w-4 h-4 text-brand-primary" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-primary border-2 border-background-elevated" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="font-display font-bold text-base whitespace-nowrap text-text-primary"
            >
              StudyGenius <span className="text-brand-primary">AI</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-[50px] w-7 h-7 rounded-full bg-background-soft border border-border-strong flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-background-surface hover:border-brand-primary/30 transition-all z-50 shadow-layer-2"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-5 px-2.5 flex flex-col gap-1 no-scrollbar">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Navigation</p>
        )}

        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              title={collapsed ? item.label : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-muted hover:text-text-primary hover:bg-background-soft'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-brand-primary/10 border border-brand-primary/20"
                  transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                />
              )}
              <item.icon className={`w-4.5 h-4.5 flex-shrink-0 relative z-10 transition-colors ${isActive ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-primary'}`} style={{ width: 18, height: 18 }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`text-sm font-medium relative z-10 whitespace-nowrap ${isActive ? 'text-brand-primary' : ''}`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}

        {!collapsed && (
          <p className="px-3 mt-5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Study Tools</p>
        )}
        {collapsed && <div className="my-3 mx-auto w-6 h-px bg-border" />}

        {TOOL_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-background-soft transition-all group ${collapsed ? 'justify-center' : ''}`}
          >
            <item.icon style={{ width: 18, height: 18 }} className="flex-shrink-0 text-text-muted group-hover:text-text-primary transition-colors" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 flex flex-col gap-1.5">
        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title={collapsed ? 'Settings' : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-background-soft transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings style={{ width: 16, height: 16 }} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">Settings</motion.span>}
          </AnimatePresence>
        </button>

        {/* User profile */}
        <button
          onClick={onOpenSettings}
          title={collapsed ? displayName : undefined}
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-background-soft transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary/30 to-brand-periwinkle/30 border border-brand-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-brand-primary">{displayName[0]?.toUpperCase()}</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-start overflow-hidden text-left">
                <span className="text-xs font-semibold text-text-primary truncate max-w-[140px]">{displayName}</span>
                <span className="text-[10px] text-brand-primary/70 truncate max-w-[140px]">StudyGenius AI</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Sign out */}
        <button
          onClick={onSignOut}
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-feedback-error/60 hover:text-feedback-error hover:bg-feedback-error/8 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut style={{ width: 16, height: 16 }} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">Sign Out</motion.span>}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
