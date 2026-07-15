import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Clipboard, Sparkles, ArrowRight, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadArea({ onGenerate, isGenerating }) {
  const [mode, setMode]           = useState('pdf');    // 'pdf' | 'text'
  const [dragOver, setDragOver]   = useState(false);
  const [file, setFile]           = useState(null);
  const [text, setText]           = useState('');
  const fileRef                   = useRef(null);

  const onDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragOver(true);
    else setDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) {
      if (f.size > 4.5 * 1024 * 1024) {
        alert("File is too large! Size limit is 4.5 MB.");
        return;
      }
      setFile(f);
    }
  };

  const onFileInput = (e) => { 
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 4.5 * 1024 * 1024) {
        alert("File is too large! Size limit is 4.5 MB.");
        return;
      }
      setFile(f);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / k ** i).toFixed(1)} ${s[i]}`;
  };

  const canSubmit = !isGenerating && (mode === 'pdf' ? !!file : text.trim().length >= 20);

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (mode === 'pdf') onGenerate({ type: 'pdf', data: file });
    else                onGenerate({ type: 'text', data: text });
  };

  return (
    <div className="bg-background-elevated border border-border-strong rounded-3xl p-8 relative overflow-hidden shadow-layer-2">
      {/* Abstract Background Element */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary mb-1">Knowledge Source</h2>
          <p className="text-sm text-text-secondary">Upload a PDF or paste notes to generate your study workspace.</p>
        </div>

        <div className="flex bg-background-soft p-1 rounded-xl border border-border-strong w-full md:w-auto">
          <button
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'pdf' ? 'bg-background-elevated text-text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text-primary border border-transparent'
            }`}
            onClick={() => setMode('pdf')}
            disabled={isGenerating}
          >
            <UploadCloud className="w-4 h-4" /> PDF Upload
          </button>
          <button
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'text' ? 'bg-background-elevated text-text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text-primary border border-transparent'
            }`}
            onClick={() => setMode('text')}
            disabled={isGenerating}
          >
            <Clipboard className="w-4 h-4" /> Paste Text
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="relative z-10"
        >
          {mode === 'pdf' ? (
            <div
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                dragOver 
                  ? 'border-brand-primary bg-brand-primary/5 scale-[1.01]' 
                  : file 
                    ? 'border-brand-mint bg-brand-mint/5' 
                    : 'border-border-strong hover:border-brand-primary/50 hover:bg-background-soft'
              }`}
              onDragEnter={onDrag}
              onDragLeave={onDrag}
              onDragOver={onDrag}
              onDrop={onDrop}
              onClick={() => !file && fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={onFileInput}
                disabled={isGenerating}
              />
              
              {file ? (
                <div className="flex items-center gap-4 bg-background-elevated border border-border-strong p-4 rounded-xl shadow-sm w-full max-w-sm">
                  <div className="w-12 h-12 rounded-lg bg-brand-mint/10 border border-brand-mint/20 text-brand-mint flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                    <p className="text-xs text-text-muted">{formatSize(file.size)}</p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 rounded-lg text-text-muted hover:text-feedback-error hover:bg-feedback-error/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                    dragOver ? 'bg-brand-primary/20 text-brand-primary' : 'bg-background-soft text-text-muted'
                  }`}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">Drop your PDF here</h3>
                  <p className="text-sm text-text-secondary mb-6 max-w-sm">
                    Upload lecture slides, book chapters, or research papers. Maximum file size is 4.5 MB.
                  </p>
                  <div className="px-6 py-2.5 rounded-xl bg-background-elevated border border-border-strong text-text-primary text-sm font-medium hover:bg-background-soft transition-colors pointer-events-none">
                    Browse Files
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your lecture notes or raw text here..."
                disabled={isGenerating}
                className="w-full h-[280px] p-6 bg-background-soft border border-border-strong rounded-2xl text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 shadow-inner-highlight transition-all"
              />
              <div className="absolute bottom-4 right-4 text-xs font-medium px-3 py-1 bg-background-elevated border border-border-strong rounded-lg text-text-muted">
                {text.length} chars
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 border-t border-border-strong pt-8">
        <div className="flex items-center gap-2 text-sm text-text-muted bg-background-soft px-4 py-2 rounded-lg border border-border-strong">
          <AlertCircle className="w-4 h-4" /> Ensure your material contains actual text.
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold shadow-glow-cyan transition-all text-background-void ${
            canSubmit
              ? 'bg-brand-primary hover:bg-brand-mint hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-border opacity-50 cursor-not-allowed text-text-muted'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-background-void/30 border-t-background-void rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Synthesize Knowledge <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
