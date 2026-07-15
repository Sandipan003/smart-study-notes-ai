import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Clipboard, Sparkles, ArrowRight, X, Zap } from 'lucide-react';

export default function UploadArea({ onGenerate, isGenerating }) {
  const [mode, setMode]           = useState('pdf');    // 'pdf' | 'text'
  const [dragOver, setDragOver]   = useState(false);
  const [file, setFile]           = useState(null);
  const [text, setText]           = useState('');
  const fileRef                   = useRef(null);

  /* ── Drag handlers ── */
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
        alert("File is too large! Vercel limits uploads to 4.5 MB.");
        return;
      }
      setFile(f);
    }
  };

  const onFileInput = (e) => { 
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 4.5 * 1024 * 1024) {
        alert("File is too large! Vercel limits uploads to 4.5 MB.");
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
    <div className="glass glass-glow upload-section">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="upload-header">
          <h2 style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Input Study Source
          </h2>
          <p>Upload a PDF or paste your lecture notes to generate a complete study kit.</p>
        </div>

        {/* Mode Toggle */}
        <div className="toggle-group" style={{ alignSelf: 'flex-start', minWidth: '220px' }}>
          <button
            className={`toggle-option ${mode === 'pdf' ? 'active' : ''}`}
            onClick={() => setMode('pdf')}
            disabled={isGenerating}
          >
            <UploadCloud size={14} style={{ marginRight: '0.35rem' }} />
            PDF Upload
          </button>
          <button
            className={`toggle-option ${mode === 'text' ? 'active' : ''}`}
            onClick={() => setMode('text')}
            disabled={isGenerating}
          >
            <Clipboard size={14} style={{ marginRight: '0.35rem' }} />
            Paste Notes
          </button>
        </div>
      </div>

      {/* ── PDF Drop Zone ── */}
      {mode === 'pdf' ? (
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragEnter={onDrag}
          onDragOver={onDrag}
          onDragLeave={onDrag}
          onDrop={onDrop}
          onClick={() => !file && fileRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="PDF upload zone"
          onKeyDown={(e) => e.key === 'Enter' && !file && fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            onChange={onFileInput}
            style={{ display: 'none' }}
            disabled={isGenerating}
          />

          <div className="upload-icon-ring">
            <UploadCloud size={32} />
          </div>

          {file ? (
            <div
              className="file-preview-card"
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'default' }}
            >
              <div className="file-preview-info">
                <div className="file-icon-box">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="file-name" title={file.name}>{file.name}</div>
                  <div className="file-size">{formatSize(file.size)}</div>
                </div>
              </div>
              <button
                className="file-remove-btn"
                onClick={removeFile}
                disabled={isGenerating}
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p className="upload-zone-title">
                {dragOver ? 'Drop your PDF here!' : 'Drag & drop your PDF'}
              </p>
              <p className="upload-zone-sub">or click to browse — PDF only, max 4.5 MB</p>
            </div>
          )}
        </div>
      ) : (
        /* ── Text Paste Area ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Clipboard size={14} />
            <span>Paste your lecture notes, textbook chapters, or articles (min 20 characters):</span>
          </div>
          <textarea
            className="input-field"
            placeholder="Type or paste your study material here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isGenerating}
            rows={9}
          />
          {text.length > 0 && (
            <div style={{ fontSize: '0.75rem', color: text.length >= 20 ? 'var(--neon-cyan)' : 'var(--text-muted)', textAlign: 'right' }}>
              {text.length} characters {text.length < 20 ? `(${20 - text.length} more needed)` : '✓'}
            </div>
          )}
        </div>
      )}

      {/* Submit Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button
          id="generate-btn"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{ minWidth: '200px', fontSize: '1rem' }}
        >
          {isGenerating ? (
            <>
              <div className="loading-ring" style={{ width: '20px', height: '20px' }} />
              Synthesizing...
            </>
          ) : (
            <>
              <Zap size={18} />
              Generate Study Kit
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
