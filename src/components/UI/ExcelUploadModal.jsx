import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import './ExcelUploadModal.css';

// ── Result view ───────────────────────────────────────────
const UploadResult = ({ result, onClose, onUploadAnother }) => {
  const [errorsExpanded, setErrorsExpanded] = useState(false);

  const hasErrors   = result.errors?.length > 0;
  const allSuccess  = result.failureCount === 0;
  const allFailed   = result.successCount === 0;
  const partial     = result.successCount > 0 && result.failureCount > 0;

  return (
    <div className="eum-result">

      {/* Summary icon */}
      <div className={`eum-result-icon ${allSuccess ? 'success' : allFailed ? 'error' : 'warning'}`}>
        {allSuccess
          ? <CheckCircle size={28} />
          : allFailed
            ? <XCircle size={28} />
            : <AlertCircle size={28} />
        }
      </div>

      {/* Message */}
      <p className="eum-result-message">{result.message}</p>

      {/* Stats row */}
      <div className="eum-stats">
        <div className="eum-stat">
          <span className="eum-stat-value success">{result.successCount}</span>
          <span className="eum-stat-label">Uploaded</span>
        </div>
        <div className="eum-stat-divider" />
        <div className="eum-stat">
          <span className="eum-stat-value error">{result.failureCount}</span>
          <span className="eum-stat-label">Failed</span>
        </div>
        <div className="eum-stat-divider" />
        <div className="eum-stat">
          <span className="eum-stat-value neutral">{result.totalRows}</span>
          <span className="eum-stat-label">Total Rows</span>
        </div>
      </div>

      {/* Errors accordion */}
      {hasErrors && (
        <div className="eum-errors-wrap">
          <button
            className="eum-errors-toggle"
            onClick={() => setErrorsExpanded(p => !p)}
          >
            <span>{result.failureCount} error{result.failureCount !== 1 ? 's' : ''}</span>
            {errorsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {errorsExpanded && (
            <div className="eum-errors-list">
              <table className="eum-errors-table">
                <thead>
                <tr>
                  <th>Row</th>
                  <th>Field</th>
                  <th>Value</th>
                  <th>Error</th>
                </tr>
                </thead>
                <tbody>
                {result.errors.map((err, i) => (
                  <tr key={i}>
                    <td>{err.rowNumber}</td>
                    <td><code>{err.field}</code></td>
                    <td><code>{err.value}</code></td>
                    <td>{err.errorMessage}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="eum-result-actions">
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={onUploadAnother}>
          <Upload size={14} /> Upload Another
        </button>
      </div>
    </div>
  );
};

// ── Main modal ────────────────────────────────────────────
const ExcelUploadModal = ({
                            open,
                            onClose,
                            onUpload,          // async (file) => { data } — caller provides the API call
                            title = 'Upload Excel',
                            subtitle = 'Upload an .xlsx or .xls file',
                            accept = '.xlsx,.xls',
                            onSuccess,         // called after successful upload so parent can refresh
                          }) => {
  const [file,      setFile]      = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result,    setResult]    = useState(null); // holds API response data
  const [dragOver,  setDragOver]  = useState(false);
  const fileInputRef = useRef(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setFile(null);
      setResult(null);
      setUploading(false);
    }
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && !uploading) handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, uploading]);

  const handleClose = useCallback(() => {
    if (uploading) return;
    onClose();
  }, [uploading, onClose]);

  const handleFile = useCallback((f) => {
    if (!f) return;
    const isExcel = f.name.match(/\.(xlsx|xls)$/i);
    if (!isExcel) { alert('Please select an .xlsx or .xls file.'); return; }
    setFile(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    try {
      const res = await onUpload(file);
      const data = res?.data?.data;
      setResult(data);
      if (data?.successCount > 0) onSuccess?.();
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Upload failed. Please try again.';
      setResult({ message: msg, totalRows: 0, successCount: 0, failureCount: 0, errors: [] });
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={uploading ? undefined : handleClose}>
      <div
        className="aam-modal eum-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h2 className="aam-title">{title}</h2>
              <p className="aam-subtitle">{subtitle}</p>
            </div>
          </div>
          <button className="aam-close" onClick={handleClose} disabled={uploading}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="aam-body">
          {result ? (
            <UploadResult
              result={result}
              onClose={handleClose}
              onUploadAnother={() => { setFile(null); setResult(null); }}
            />
          ) : (
            <>
              {/* Drop zone */}
              <div
                className={`eum-dropzone${dragOver ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0])}
                />

                {file ? (
                  <div className="eum-file-selected">
                    <FileSpreadsheet size={32} className="eum-file-icon" />
                    <div>
                      <div className="eum-file-name">{file.name}</div>
                      <div className="eum-file-size">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <button
                      className="eum-file-remove"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="eum-dropzone-content">
                    <div className="eum-dropzone-icon">
                      <Upload size={24} />
                    </div>
                    <div className="eum-dropzone-text">
                      <span className="eum-dropzone-primary">Click to browse</span>
                      <span className="eum-dropzone-secondary"> or drag & drop your file here</span>
                    </div>
                    <div className="eum-dropzone-hint">.xlsx or .xls files only</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer — only show when not in result view */}
        {!result && (
          <div className="aam-footer">
            <button className="btn btn-secondary" onClick={handleClose} disabled={uploading}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!file || uploading}
              style={{ background: '#2563eb' }}
            >
              {uploading
                ? <><span className="aam-spinner" /> Uploading…</>
                : <><Upload size={14} /> Upload</>
              }
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ExcelUploadModal;
