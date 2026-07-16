import React from 'react';
import { Home, Layers, BookOpen, BrainCircuit, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'dashboard',  icon: Home,        label: 'Home'      },
  { id: 'library',   icon: BookOpen,    label: 'Library'   },
  { id: 'new-study', icon: Layers,      label: 'New Study', primary: true },
  { id: 'tutor',     icon: BrainCircuit, label: 'Tutor'    },
  { id: 'profile',   icon: User,        label: 'Profile'   },
];

export default function MobileBottomNav({ currentView, setCurrentView }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-inset-bottom">
      {/* Glass strip */}
      <div className="mx-3 mb-3 rounded-2xl glass-card-strong border border-border-strong shadow-[0_-8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;

            if (item.primary) {
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-layer-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-primary scale-105 shadow-glow-cyan'
                      : 'bg-brand-primary/15 border border-brand-primary/30'
                  }`}>
                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-background-void' : 'text-brand-primary'}`} />
                    {!isActive && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-[#0C1018]" />
                    )}
                  </div>
                  <span className={`text-[9px] font-semibold tracking-wide transition-colors ${isActive ? 'text-brand-primary' : 'text-text-muted'}`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className="relative flex flex-col items-center gap-1 w-14 py-1 group"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-bg"
                    className="absolute inset-0 rounded-xl bg-brand-primary/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-secondary'
                }`} />
                <span className={`text-[9px] font-semibold tracking-wide relative z-10 transition-colors ${
                  isActive ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-secondary'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
