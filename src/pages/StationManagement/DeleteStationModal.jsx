import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { StationService } from '../../services/StationService.js';
import { useToast } from '../../context/Toast/useToast.js';
import '../AdminManagement/AddAdminModal.css';

const DeleteStationModal = ({ open, onClose, station, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && !deleting) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, deleting]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await StationService.deleteStation(station.stationCode);
      showSuccess(`Station "${station.stationName}" deleted successfully.`);
      onClose();
      onSuccess?.(station.stationCode);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to delete station.');
    } finally {
      setDeleting(false);
    }
  };

  if (!open || !station) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={deleting ? undefined : onClose}>
      <div
        className="aam-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: 420 }}
      >
        {/* Header */}
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <Trash2 size={17} />
            </div>
            <div>
              <h2 className="aam-title">Delete Station</h2>
              <p className="aam-subtitle">This action cannot be undone</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={deleting}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="aam-body" style={{ gap: 'var(--spacing-4)' }}>

          {/* Warning box */}
          <div style={{
            display: 'flex', gap: 'var(--spacing-3)', padding: 'var(--spacing-4)',
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 'var(--radius-lg)', alignItems: 'flex-start'
          }}>
            <AlertTriangle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: '#991b1b', margin: '0 0 4px' }}>
                Are you sure you want to delete this station?
              </p>
              <p style={{ fontSize: 'var(--font-size-xs)', color: '#b91c1c', margin: 0 }}>
                All data associated with <strong>{station.stationName}</strong> will be permanently removed.
              </p>
            </div>
          </div>

          {/* Station detail card */}
          <div style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', flexDirection: 'column', gap: 4
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{
                fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                background: '#fef3c7', color: '#d97706',
                padding: '2px 8px', borderRadius: 4
              }}>
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

        </div>

        {/* Footer */}
        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 36, padding: '0 var(--spacing-4)',
              background: deleting ? '#fca5a5' : '#dc2626',
              color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
              fontFamily: 'inherit', fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)', cursor: deleting ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s'
            }}
          >
            {deleting
              ? <><span className="aam-spinner" /> Deleting…</>
              : <><Trash2 size={14} /> Delete Station</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteStationModal;
