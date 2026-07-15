import React from 'react';
import { Home, Layers, BookOpen, BrainCircuit, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileBottomNav({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'library', icon: BookOpen, label: 'Library' },
    { id: 'new-study', icon: Layers, label: 'New Study', primary: true },
    { id: 'tutor', icon: BrainCircuit, label: 'Tutor' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-background-elevated/90 backdrop-blur-lg border-t border-border-strong pb-safe pt-2 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          
          if (item.primary) {
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className="relative flex flex-col items-center justify-center -mt-6 group"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-background shadow-layer-2 transition-transform duration-300 ${
                  isActive ? 'bg-brand-primary text-background scale-110' : 'bg-background-soft text-brand-primary'
                }`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] mt-1 font-medium transition-colors ${
                  isActive ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-secondary'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className="relative flex flex-col items-center justify-center w-16 h-12 group"
            >
              <item.icon className={`w-5 h-5 mb-1 transition-colors ${
                isActive ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-secondary'
              }`} />
              <span className={`text-[10px] font-medium transition-colors ${
                isActive ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-secondary'
              }`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-2 w-8 h-1 rounded-full bg-brand-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
