import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, FileText, Send, Sparkles, HelpCircle, Bot } from 'lucide-react';

export default function SummaryView({ summary, guideId, settings, supabaseConfigured, backendUrl = '' }) {
  const [copied, setCopied]             = useState(false);
  const [messages, setMessages]         = useState([]);
  const [inputMsg, setInputMsg]         = useState('');
  const [isReplying, setIsReplying]     = useState(false);
  const messagesEndRef                  = useRef(null);

  // Load chat history from Supabase if linked
  useEffect(() => {
    if (!guideId || !supabaseConfigured) { setMessages([]); return; }
    fetch(`${backendUrl}/api/chat/history/${guideId}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setMessages(d.map(m => ({ role: m.role, content: m.content }))))
      .catch(() => {});
  }, [guideId, supabaseConfigured, backendUrl]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isReplying]);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || isReplying) return;

    const text = inputMsg.trim();
    setInputMsg('');
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setIsReplying(true);

    // Save user msg to DB
    if (guideId && supabaseConfigured) {
      fetch(`${backendUrl}/api/chat/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guide_id: guideId, role: 'user', content: text }),
      }).catch(() => {});
    }

    try {
      const res = await fetch(`${backendUrl}/api/chat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          summary,
          engine: settings.engine,
          apiKey: settings.apiKey,
          model: settings.model,
          useFallback: settings.useFallback,
        }),
      });

      const data = await res.json();
      const reply = res.ok ? data.response : `Error: ${data.error || 'Failed to get response.'}`;
      setMessages(p => [...p, { role: 'assistant', content: reply }]);

      if (guideId && supabaseConfigured) {
        fetch(`${backendUrl}/api/chat/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guide_id: guideId, role: 'assistant', content: reply }),
        }).catch(() => {});
      }
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: 'Error: ' + e.message }]);
    } finally {
      setIsReplying(false);
    }
  };

  /* ── Markdown Parser ── */
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const out   = [];
    let listBuf = [];
    let listType = null;

    const flushList = (key) => {
      if (!listBuf.length) return;
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      out.push(<Tag key={`list-${key}`} className="md-body">{listBuf}</Tag>);
      listBuf = []; listType = null;
    };

    const inlineFormat = (str) => {
      let s = str
        .replace(/\$\$(.*?)\$\$/g, '<code>$1</code>')
        .replace(/`([^`]*)`/g,     '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g,   '<em>$1</em>');
      return <span dangerouslySetInnerHTML={{ __html: s }} />;
    };

    lines.forEach((line, i) => {
      const t = line.trim();
      if (t.startsWith('#### ')) { flushList(i); out.push(<h4 key={i} className="md-body">{inlineFormat(t.slice(5))}</h4>); }
      else if (t.startsWith('### ')) { flushList(i); out.push(<h3 key={i} className="md-body">{inlineFormat(t.slice(4))}</h3>); }
      else if (t.startsWith('## '))  { flushList(i); out.push(<h2 key={i} className="md-body">{inlineFormat(t.slice(3))}</h2>); }
      else if (t.startsWith('# '))   { flushList(i); out.push(<h1 key={i} className="md-body">{inlineFormat(t.slice(2))}</h1>); }
      else if (t === '---')           { flushList(i); out.push(<hr key={i} className="md-body" />); }
      else if (t.startsWith('> '))    { flushList(i); out.push(<blockquote key={i} className="md-body">{inlineFormat(t.slice(2))}</blockquote>); }
      else if (t.startsWith('* ') || t.startsWith('- ')) {
        if (listType !== 'ul') { flushList(i); listType = 'ul'; }
        listBuf.push(<li key={`li-${i}`}>{inlineFormat(t.slice(2))}</li>);
      }
      else if (/^\d+\.\s+/.test(t)) {
        if (listType !== 'ol') { flushList(i); listType = 'ol'; }
        const s = t.slice(t.indexOf('.') + 1).trim();
        listBuf.push(<li key={`li-${i}`}>{inlineFormat(s)}</li>);
      }
      else if (t.length) { flushList(i); out.push(<p key={i} className="md-body">{inlineFormat(line)}</p>); }
      else { flushList(i); }
    });

    flushList(lines.length);
    return out;
  };

  return (
    <div className="summary-split">
      {/* ── Left: Summary Notes ── */}
      <div className="glass summary-panel">
        <div className="summary-panel-header">
          <div className="summary-panel-title">
            <FileText size={20} style={{ color: 'var(--neon-cyan)' }} />
            Summary Notes
          </div>
          <button
            id="copy-summary-btn"
            className="btn btn-secondary"
            onClick={handleCopy}
            style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
          >
            {copied ? (
              <><Check size={14} style={{ color: 'var(--neon-green)' }} /> Copied!</>
            ) : (
              <><Copy size={14} /> Copy Text</>
            )}
          </button>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: '65vh' }}>
          {renderMarkdown(summary)}
        </div>
      </div>

      {/* ── Right: AI Tutor Chat ── */}
      <div className="glass chat-panel">
        {/* Header */}
        <div className="chat-panel-header">
          <div className="chat-avatar">
            <Bot size={18} color="white" />
          </div>
          <div>
            <div className="chat-panel-title">AI Concept Tutor</div>
            <div className="chat-panel-sub">
              {guideId && supabaseConfigured ? 'Conversations synced to Supabase' : 'Ask anything about your notes'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">
                <Sparkles size={26} />
              </div>
              <h4 style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                Ask your AI Study Tutor
              </h4>
              <p style={{ fontSize: '0.78rem', lineHeight: '1.5' }}>
                Ask questions about these notes, request explanations, or explore related concepts.
              </p>
              {/* Suggested prompts */}
              {[
                'Summarize the key concepts',
                'Explain the hardest part',
                'Give me a memory trick',
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => { setInputMsg(prompt); }}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '50px',
                    border: '1px solid var(--border-glass)',
                    background: 'rgba(99,102,241,0.06)',
                    color: 'var(--text-accent)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    marginTop: '0.25rem',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                {m.content}
              </div>
            ))
          )}

          {isReplying && (
            <div className="bubble assistant bubble-typing">
              <div className="loading-dot" style={{ width: '6px', height: '6px' }} />
              <div className="loading-dot" style={{ width: '6px', height: '6px', animationDelay: '0.16s' }} />
              <div className="loading-dot" style={{ width: '6px', height: '6px', animationDelay: '0.32s' }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Row */}
        <form className="chat-input-row" onSubmit={sendMessage}>
          <input
            id="chat-input"
            className="chat-input"
            type="text"
            placeholder="Ask a question about your notes..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            disabled={isReplying}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={isReplying || !inputMsg.trim()}
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
