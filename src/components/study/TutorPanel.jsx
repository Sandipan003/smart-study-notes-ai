import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Send, Sparkles, X, Bot, User } from 'lucide-react';

const PROMPTS = ['Summarize the key concepts', 'Explain the hardest part', 'Give me a memory trick'];

export default function TutorPanel({ summary, guideId, session, backendUrl = '', onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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

  const sendMessage = async (text = inputMsg.trim()) => {
    if (!text || isReplying) return;
    setInputMsg('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setIsReplying(true);

    if (guideId && session) {
      fetch(`${backendUrl}/api/chat/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ guide_id: guideId, role: 'user', content: text }),
      }).catch(() => {});
    }

    try {
      const res = await fetch(`${backendUrl}/api/chat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ message: text, history: messages, summary, engine: 'groq', apiKey: '', model: 'llama-3.3-70b-versatile', useFallback: false }),
      });
      const data = await res.json();
      const reply = res.ok ? data.response : `Error: ${data.error || 'Failed to get response.'}`;
      setMessages(p => [...p, { role: 'assistant', content: reply }]);
      if (guideId && session) {
        fetch(`${backendUrl}/api/chat/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ guide_id: guideId, role: 'assistant', content: reply }),
        }).catch(() => {});
      }
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: 'Error: ' + e.message }]);
    } finally {
      setIsReplying(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const autoResize = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    setInputMsg(el.value);
  };

  const chatContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0" style={{ background: 'linear-gradient(135deg, rgba(155,143,255,0.15) 0%, rgba(98,246,197,0.08) 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B6FFF, #62F6C5)' }}>
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-background-surface rounded-full" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white leading-tight">AI Study Tutor</h3>
            <p className="text-xs text-brand-primary/80 leading-tight">Powered by Llama 3</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar" style={{ background: 'linear-gradient(180deg, #0D0F14 0%, #11131A 100%)' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2" style={{ background: 'linear-gradient(135deg, rgba(123,111,255,0.2), rgba(98,246,197,0.1))', border: '1px solid rgba(98,246,197,0.2)' }}>
              <Sparkles className="w-7 h-7 text-brand-primary" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-text-primary mb-1">Ask your study tutor</h4>
              <p className="text-xs text-text-muted leading-relaxed">Questions grounded in your uploaded notes — no hallucinations.</p>
            </div>
            <div className="flex flex-col gap-2 w-full mt-2">
              {PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-left transition-all hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#A0A8B8' }}
                >
                  💡 {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className="shrink-0 mt-0.5">
                {m.role === 'assistant' ? (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B6FFF, #62F6C5)' }}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(98,246,197,0.15)', border: '1px solid rgba(98,246,197,0.3)' }}>
                    <User className="w-3.5 h-3.5 text-brand-primary" />
                  </div>
                )}
              </div>
              {/* Bubble */}
              <div
                className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={m.role === 'user'
                  ? { background: 'linear-gradient(135deg, #62F6C5, #4EDBB0)', color: '#0D1117', borderBottomRightRadius: '4px' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#D4D8E8', borderBottomLeftRadius: '4px' }
                }
              >
                {m.content}
              </div>
            </div>
          ))
        )}

        {isReplying && (
          <div className="flex gap-2.5 flex-row">
            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'linear-gradient(135deg, #7B6FFF, #62F6C5)' }}>
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="rounded-2xl rounded-bl-[4px] px-4 py-3 flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/10 shrink-0" style={{ background: '#11131A' }}>
        <div className="flex items-end gap-2 rounded-2xl p-1.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <textarea
            ref={textareaRef}
            value={inputMsg}
            onChange={autoResize}
            onKeyDown={handleKey}
            rows={1}
            className="flex-1 bg-transparent py-2 px-3 text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none no-scrollbar"
            placeholder="Ask a question about these notes…"
            disabled={isReplying}
            style={{ minHeight: '38px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isReplying || !inputMsg.trim()}
            className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #7B6FFF, #62F6C5)' }}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-center text-xs text-text-muted mt-2 opacity-50">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop slide-in panel */}
      <motion.aside
        initial={{ width: 0, opacity: 0, x: 20 }}
        animate={{ width: 370, opacity: 1, x: 0 }}
        exit={{ width: 0, opacity: 0, x: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 250 }}
        className="hidden lg:flex flex-col h-full border border-border-strong border-l-0 rounded-r-3xl overflow-hidden shadow-layer-3 z-10 flex-shrink-0"
        style={{ background: '#0D0F14' }}
      >
        {chatContent}
      </motion.aside>

      {/* Mobile fullscreen modal */}
      <AnimatePresence>
        <motion.div
          key="mobile-tutor"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="lg:hidden fixed inset-0 z-50 flex flex-col"
          style={{ background: '#0D0F14' }}
        >
          {chatContent}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
