import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Home, BookOpen, Layers, Clock, 
  BrainCircuit, FileText, Settings, User, LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';

export default function AppSidebar({ userEmail, onSignOut, currentView, setCurrentView }) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'new-study', icon: Layers, label: 'New Study' },
    { id: 'library', icon: BookOpen, label: 'My Library' },
    { id: 'recent', icon: Clock, label: 'Recent' },
    { id: 'tutor', icon: BrainCircuit, label: 'AI Tutor' },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="hidden md:flex flex-col h-screen bg-background-elevated border-r border-border sticky top-0 z-40 transition-all duration-300 ease-in-out"
    >
      {/* Header & Logo */}
      <div className="flex items-center justify-between p-4 h-20 border-b border-border/50">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="flex-shrink-0 relative flex items-center justify-center w-10 h-10 rounded-xl bg-background-soft border border-border-strong overflow-hidden">
            <div className="absolute inset-0 bg-grad-primary opacity-20"></div>
            <Sparkles className="w-5 h-5 text-brand-primary relative z-10" />
          </div>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="font-display font-bold text-lg whitespace-nowrap"
            >
              StudyGenius <span className="text-brand-primary">AI</span>
            </motion.span>
          )}
        </div>
      </div>

      {/* Collapse Toggle (Floating Button) */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 bg-background-soft border border-border-strong rounded-full p-1 text-text-muted hover:text-text-primary z-50 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2 no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-brand-primary/10 text-brand-primary font-medium border border-brand-primary/20' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-soft border border-transparent'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-primary'}`} />
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}

        {!collapsed && (
          <div className="mt-6 mb-2 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
            Study Tools
          </div>
        )}
        
        <button
          onClick={() => setCurrentView('summaries')}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-background-soft transition-colors border border-transparent group ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Summaries' : undefined}
        >
          <FileText className="w-5 h-5 flex-shrink-0 text-text-muted group-hover:text-text-primary" />
          {!collapsed && <span>Summaries</span>}
        </button>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-border/50 flex flex-col gap-2">
        <button
          className={`flex items-center gap-3 px-2 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-soft transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Profile' : undefined}
        >
          <div className="w-8 h-8 rounded-full bg-background-soft border border-border-strong flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col items-start overflow-hidden text-left">
              <span className="text-sm font-medium truncate w-full">{userEmail ? userEmail.split('@')[0] : 'Student'}</span>
              <span className="text-xs text-text-muted truncate w-full">Free Plan</span>
            </div>
          )}
        </button>
        
        <button
          onClick={onSignOut}
          className={`flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-feedback-error/80 hover:text-feedback-error hover:bg-feedback-error/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
