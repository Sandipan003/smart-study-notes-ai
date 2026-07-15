import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Send, Sparkles } from 'lucide-react';

export default function TutorPanel({ summary, guideId, session, backendUrl = '' }) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!guideId || !session) { setMessages([]); return; }
    fetch(`${backendUrl}/api/chat/history/${guideId}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
      .then(r => r.ok ? r.json() : [])
      .then(d => setMessages(d.map(m => ({ role: m.role, content: m.content }))))
      .catch(() => {});
  }, [guideId, session, backendUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isReplying]);

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || isReplying) return;

    const text = inputMsg.trim();
    setInputMsg('');
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setIsReplying(true);

    if (guideId && session) {
      fetch(`${backendUrl}/api/chat/save`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ guide_id: guideId, role: 'user', content: text }),
      }).catch(() => {});
    }

    try {
      const res = await fetch(`${backendUrl}/api/chat/ask`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: text,
          history: messages,
          summary,
          engine: 'groq',
          apiKey: '', // Passed via Vercel env
          model: 'llama-3.3-70b-versatile',
          useFallback: false,
        }),
      });

      const data = await res.json();
      const reply = res.ok ? data.response : `Error: ${data.error || 'Failed to get response.'}`;
      setMessages(p => [...p, { role: 'assistant', content: reply }]);

      if (guideId && session) {
        fetch(`${backendUrl}/api/chat/save`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ guide_id: guideId, role: 'assistant', content: reply }),
        }).catch(() => {});
      }
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: 'Error: ' + e.message }]);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0, x: 20 }}
      animate={{ width: 380, opacity: 1, x: 0 }}
      exit={{ width: 0, opacity: 0, x: 20 }}
      className="hidden lg:flex flex-col h-full bg-background-surface border border-border-strong border-l-0 rounded-r-3xl overflow-hidden shadow-layer-3 z-10"
    >
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-background-elevated shrink-0">
        <div className="w-8 h-8 rounded-lg bg-brand-periwinkle/20 border border-brand-periwinkle/30 flex items-center justify-center">
          <BrainCircuit className="w-4 h-4 text-brand-periwinkle" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Concept Tutor</h3>
          <p className="text-xs text-brand-periwinkle/80">Context-aware assistant</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-text-muted px-4">
            <Sparkles className="w-10 h-10 mb-3 opacity-20" />
            <h4 className="text-text-primary font-medium mb-1">Ask your AI Study Tutor</h4>
            <p className="text-xs mb-6">Ask questions about these notes, request explanations, or explore related concepts.</p>
            
            <div className="flex flex-col gap-2 w-full">
              {['Summarize the key concepts', 'Explain the hardest part', 'Give me a memory trick'].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => setInputMsg(prompt)}
                  className="px-4 py-2 rounded-xl border border-border-strong bg-background-elevated text-xs font-medium text-text-secondary hover:text-brand-periwinkle hover:border-brand-periwinkle/30 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 shrink-0 rounded-full bg-brand-periwinkle/20 border border-brand-periwinkle/30 flex items-center justify-center mt-1">
                  <BrainCircuit className="w-4 h-4 text-brand-periwinkle" />
                </div>
              )}
              <div className={`rounded-2xl p-4 text-sm shadow-sm ${
                m.role === 'user' 
                  ? 'bg-brand-primary text-background-void rounded-tr-sm' 
                  : 'bg-background-elevated border border-border-strong text-text-primary rounded-tl-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))
        )}

        {isReplying && (
          <div className="flex gap-3">
            <div className="w-8 h-8 shrink-0 rounded-full bg-brand-periwinkle/20 border border-brand-periwinkle/30 flex items-center justify-center mt-1">
              <BrainCircuit className="w-4 h-4 text-brand-periwinkle" />
            </div>
            <div className="bg-background-elevated border border-border-strong rounded-2xl rounded-tl-sm p-4 text-sm text-text-primary shadow-sm flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-brand-periwinkle rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-brand-periwinkle rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-1.5 h-1.5 bg-brand-periwinkle rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-background-elevated shrink-0">
        <form onSubmit={sendMessage} className="relative">
          <textarea 
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={2}
            className="w-full bg-background-soft border border-border-strong rounded-xl py-3 pl-4 pr-12 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-periwinkle/50 focus:ring-1 focus:ring-brand-periwinkle/50 resize-none no-scrollbar shadow-inner-highlight"
            placeholder="Ask a question..."
            disabled={isReplying}
          />
          <button 
            type="submit"
            disabled={isReplying || !inputMsg.trim()}
            className="absolute right-3 top-3 p-1.5 rounded-lg bg-brand-periwinkle text-background-void hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.aside>
  );
}
