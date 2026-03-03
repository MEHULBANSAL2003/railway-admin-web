import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw } from 'lucide-react';
import { StationService } from '../../services/StationService.js';
import { useToast } from '../../context/Toast/useToast.js';
import '../AdminManagement/AddAdminModal.css';

const RestoreStationModal = ({ open, onClose, station, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [restoring, setRestoring] = useState(false);
  const [reason,    setReason]    = useState('');
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (open) { setReason(''); setError(''); }
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && !restoring) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, restoring]);

  const handleRestore = async () => {
    if (reason.trim().length < 5) {
      setError('Please provide a reason (min 5 characters).');
      return;
    }
    setRestoring(true);
    try {
      await StationService.restoreDeletedStation(station.stationCode, { reason: reason.trim() });
      showSuccess(`Station "${station.stationName}" restored successfully.`);
      onClose();
      onSuccess?.(station.stationCode);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to restore station.');
    } finally {
      setRestoring(false);
    }
  };

  if (!open || !station) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={restoring ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true" style={{ maxWidth: 420 }}>

        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <RotateCcw size={17} />
            </div>
            <div>
              <h2 className="aam-title">Restore Station</h2>
              <p className="aam-subtitle">Station will be reactivated</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={restoring}><X size={18} /></button>
        </div>

        <div className="aam-body" style={{ gap: 'var(--spacing-4)' }}>

          {/* Station card */}
          <div style={{
            padding: 'var(--spacing-3) var(--spacing-4)', background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 4 }}>
                {station.stationCode}
              </code>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                {station.stationName}
              </span>
            </div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
              {station.cityName}, {station.stateName} · {station.zoneName}
            </span>
          </div>

          {/* Reason */}
          <div className="aam-field" style={{ marginBottom: 0 }}>
            <label className="aam-label">
              Reason for restoration <span className="aam-required">*</span>
            </label>
            <textarea
              className={`aam-input${error ? ' aam-input--error' : ''}`}
              rows={3}
              placeholder="e.g. Route reinstated after infrastructure upgrade…"
              value={reason}
              onChange={e => { setReason(e.target.value); setError(''); }}
              disabled={restoring}
              style={{ resize: 'vertical', minHeight: 72, paddingTop: 8, paddingBottom: 8 }}
              autoFocus
            />
            {error && <p className="aam-error">{error}</p>}
          </div>
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={restoring}>Cancel</button>
          <button onClick={handleRestore}
                  disabled={restoring || reason.trim().length < 5}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, height: 36,
                    padding: '0 var(--spacing-4)',
                    background: restoring || reason.trim().length < 5 ? '#86efac' : '#16a34a',
                    color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
                    fontFamily: 'inherit', fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    cursor: restoring || reason.trim().length < 5 ? 'not-allowed' : 'pointer',
                  }}
          >
            {restoring
              ? <><span className="aam-spinner" /> Restoring…</>
              : <><RotateCcw size={14} /> Restore Station</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RestoreStationModal;
