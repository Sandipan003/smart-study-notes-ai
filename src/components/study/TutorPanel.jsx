import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Send, Sparkles, X, ChevronDown } from 'lucide-react';

export default function TutorPanel({ summary, guideId, session, backendUrl = '', onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  const sendMessage = async (text) => {
    const msg = text || inputMsg.trim();
    if (!msg || isReplying) return;

    setInputMsg('');
    const next = [...messages, { role: 'user', content: msg }];
    setMessages(next);
    setIsReplying(true);

    if (guideId && session) {
      fetch(`${backendUrl}/api/chat/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ guide_id: guideId, role: 'user', content: msg }),
      }).catch(() => {});
    }

    try {
      const res = await fetch(`${backendUrl}/api/chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          message: msg,
          history: messages,
          summary,
          engine: 'groq',
          apiKey: '',
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
      setMessages(p => [...p, { role: 'assistant', content: 'Connection error: ' + e.message }]);
    } finally {
      setIsReplying(false);
    }
  };

  const PROMPTS = ['Summarize the key concepts', 'Explain the hardest part', 'Give me a memory trick', 'Create a quick quiz'];

  const ChatBody = () => (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0e1117]/80 backdrop-blur-md shrink-0">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#62F6C5]/20 to-[#9FAEFF]/20 border border-[#62F6C5]/30 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-[#62F6C5]" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#62F6C5] rounded-full border-2 border-[#0e1117] animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm">AI Study Tutor</h3>
          <p className="text-[10px] text-[#62F6C5]/80 truncate">Powered by Llama 3 · Groq</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar bg-[#0a0c10]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#62F6C5]/20 to-[#9FAEFF]/20 border border-[#62F6C5]/30 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-[#62F6C5]" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-[#62F6C5]/10 blur-xl animate-pulse" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Ask me anything</h4>
              <p className="text-xs text-white/40 leading-relaxed">I understand your uploaded material and can explain any concept from it.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full mt-2">
              {PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-white/60 hover:text-[#62F6C5] hover:border-[#62F6C5]/30 hover:bg-[#62F6C5]/5 transition-all text-left leading-snug"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-[#62F6C5]/20 to-[#9FAEFF]/20 border border-[#62F6C5]/30 flex items-center justify-center mt-1">
                  <BrainCircuit className="w-3.5 h-3.5 text-[#62F6C5]" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-[#62F6C5] to-[#9FAEFF] text-[#0a0c10] font-medium rounded-tr-sm'
                  : 'bg-[#1a1d26] border border-white/10 text-white/90 rounded-tl-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))
        )}

        {isReplying && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-[#62F6C5]/20 to-[#9FAEFF]/20 border border-[#62F6C5]/30 flex items-center justify-center mt-1">
              <BrainCircuit className="w-3.5 h-3.5 text-[#62F6C5]" />
            </div>
            <div className="bg-[#1a1d26] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              {[0, 0.15, 0.3].map((delay, i) => (
                <div key={i} className="w-2 h-2 bg-[#62F6C5] rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 bg-[#0e1117]/80 backdrop-blur-md shrink-0">
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(); }}
          className="flex items-end gap-2 bg-[#1a1d26] border border-white/10 rounded-2xl p-2 focus-within:border-[#62F6C5]/40 transition-colors"
        >
          <textarea
            ref={inputRef}
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none resize-none no-scrollbar py-1 px-1 max-h-28"
            placeholder="Ask about your study material..."
            disabled={isReplying}
            style={{ lineHeight: '1.5' }}
          />
          <button
            type="submit"
            disabled={isReplying || !inputMsg.trim()}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#62F6C5] to-[#9FAEFF] text-[#0a0c10] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-white/20 mt-1.5">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </>
  );

  return (
    <>
      {/* DESKTOP: Fixed side panel */}
      <motion.aside
        initial={{ width: 0, opacity: 0, x: 20 }}
        animate={{ width: 380, opacity: 1, x: 0 }}
        exit={{ width: 0, opacity: 0, x: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col h-full bg-[#0e1117] border border-white/10 border-l-0 rounded-r-3xl overflow-hidden shadow-[0_0_60px_rgba(98,246,197,0.06)] z-10"
      >
        <ChatBody />
      </motion.aside>

      {/* MOBILE: Full-screen bottom sheet overlay */}
      <AnimatePresence>
        <motion.div
          key="mobile-tutor"
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="lg:hidden fixed inset-0 z-50 flex flex-col bg-[#0a0c10]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          <ChatBody />
        </motion.div>
      </AnimatePresence>
    </>
  );
}
