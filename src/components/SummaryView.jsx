import React, { useState } from 'react';
import { Copy, Check, FileText, Download } from 'lucide-react';

export default function SummaryView({ summary }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  /* ── Markdown Parser (Simplified for reading) ── */
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const out = [];
    let listBuf = [];

    const flushList = () => {
      if (listBuf.length > 0) {
        out.push(
          <ul key={`ul-${out.length}`} className="list-disc pl-5 my-4 space-y-2 text-text-secondary marker:text-brand-primary">
            {listBuf.map((li, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: li }} />
            ))}
          </ul>
        );
        listBuf = [];
      }
    };

    const parseInline = (str) => {
      let s = str.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>');
      s = s.replace(/\*(.*?)\*/g, '<em class="text-text-accent">$1</em>');
      s = s.replace(/`([^`]+)`/g, '<code class="bg-background-soft border border-border px-1.5 py-0.5 rounded text-brand-amber font-mono text-sm">$1</code>');
      return s;
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) { flushList(); continue; }

      if (line.startsWith('### ')) {
        flushList();
        out.push(<h3 key={`h3-${i}`} className="text-xl font-display font-bold text-text-primary mt-8 mb-3" dangerouslySetInnerHTML={{ __html: parseInline(line.substring(4)) }} />);
      } else if (line.startsWith('## ')) {
        flushList();
        out.push(<h2 key={`h2-${i}`} className="text-2xl font-display font-bold text-brand-primary mt-10 mb-4" dangerouslySetInnerHTML={{ __html: parseInline(line.substring(3)) }} />);
      } else if (line.startsWith('# ')) {
        flushList();
        out.push(<h1 key={`h1-${i}`} className="text-3xl font-display font-bold text-transparent bg-clip-text bg-grad-primary mt-4 mb-6" dangerouslySetInnerHTML={{ __html: parseInline(line.substring(2)) }} />);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        listBuf.push(parseInline(line.substring(2)));
      } else if (line.match(/^\d+\.\s/)) {
        flushList();
        out.push(
          <div key={`p-${i}`} className="my-2 pl-4 border-l-2 border-brand-periwinkle/30 text-text-secondary">
            <span className="font-semibold text-text-primary">{line.split('.')[0]}.</span>
            <span dangerouslySetInnerHTML={{ __html: parseInline(line.substring(line.indexOf('.') + 1)) }} />
          </div>
        );
      } else {
        flushList();
        out.push(<p key={`p-${i}`} className="my-3 text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: parseInline(line) }} />);
      }
    }
    flushList();
    return out;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <FileText className="w-5 h-5" />
            </div>
            Document Notes
          </h2>
          <p className="text-sm text-text-muted mt-1 ml-13">AI-structured summary of your uploaded material</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background-soft border border-border-strong text-text-primary text-sm font-medium hover:bg-background-elevated hover:border-brand-primary/50 transition-colors shadow-layer-1"
          >
            {copied ? (
              <><Check className="w-4 h-4 text-brand-mint" /> Copied</>
            ) : (
              <><Copy className="w-4 h-4" /> Copy Notes</>
            )}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-sm font-medium hover:bg-brand-primary hover:text-background-void transition-colors shadow-layer-1">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="bg-background-elevated border border-border-strong rounded-2xl p-8 md:p-12 shadow-inner-highlight max-w-none prose prose-invert prose-headings:font-display prose-a:text-brand-primary prose-code:text-brand-amber">
        {summary ? renderMarkdown(summary) : (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p>No summary available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
