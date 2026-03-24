import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Ban, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { TrainCoachService } from '../../services/TrainCoachService.js';
import { useToast }          from '../../context/Toast/useToast.js';
import '../AdminManagement/AddAdminModal.css';

const tomorrow = () => {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const DeactivateCoachModal = ({ open, onClose, coach, trainNumber, onSuccess }) => {
  const { showError } = useToast();

  const [effectiveFrom, setEffectiveFrom] = useState(tomorrow());
  const [effectiveTo,   setEffectiveTo]   = useState('');
  const [reason,        setReason]        = useState('');
  const [errors,        setErrors]        = useState({});
  const [saving,        setSaving]        = useState(false);
  const [conflicts,     setConflicts]     = useState(null);
  const [showAll,       setShowAll]       = useState(false);

  useEffect(() => {
    if (!open) return;
    setEffectiveFrom(tomorrow());
    setEffectiveTo('');
    setReason('');
    setErrors({});
    setConflicts(null);
    setShowAll(false);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, saving, onClose]);

  const validate = () => {
    const e = {};
    if (!effectiveFrom) e.effectiveFrom = 'Required.';
    if (effectiveTo && effectiveTo <= effectiveFrom)
      e.effectiveTo = 'Must be after effective-from.';
    if (!reason.trim()) e.reason = 'Required.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    setConflicts(null);
    try {
      const res    = await TrainCoachService.deactivateCoach(trainNumber, coach.coachId, {
        effectiveFrom,
        effectiveTill: effectiveTo || null,
        reason: reason.trim(),
      });
      const result = res.data.data;
      if (!result.success) {
        setConflicts(result.conflicts || []);
      } else {
        onSuccess(result);
        onClose();
      }
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to deactivate coach.');
    } finally { setSaving(false); }
  };

  if (!open || !coach) return null;

  const visibleConflicts = showAll ? conflicts : conflicts?.slice(0, 3);

  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true" style={{ maxWidth: 460 }}>

        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <Ban size={17}/>
            </div>
            <div>
              <h2 className="aam-title">Deactivate Coach</h2>
              <p className="aam-subtitle">{coach.coachTypeCode} · {coach.coachTypeName} · Train {trainNumber}</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18}/></button>
        </div>

        <div className="aam-body">

          {/* Warning */}
          <div style={{
            display: 'flex', gap: 8, padding: '10px 14px',
            background: '#fef9c3', border: '1px solid #fde68a',
            borderRadius: 8, fontSize: 12, color: '#92400e', marginBottom: 4,
          }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              Future journey inventory for this coach class will be removed.
              Journeys with existing bookings cannot be affected.
            </span>
          </div>

          {/* Conflict panel */}
          {conflicts && conflicts.length > 0 && (
            <div className="tc-conflict-panel">
              <div className="tc-conflict-header">
                <AlertTriangle size={14}/>
                <strong>Cannot deactivate</strong>
                <span>{conflicts.length} journey(s) have existing bookings</span>
              </div>
              <div className="tc-conflict-list">
                {visibleConflicts.map((c, i) => (
                  <div key={i} className="tc-conflict-item">
                    <span className="tc-conflict-date">{c.journeyDate}</span>
                    <span className="tc-conflict-numbers">
                      <strong>{c.currentBooked}</strong> passengers booked
                    </span>
                  </div>
                ))}
              </div>
              {conflicts.length > 3 && (
                <button className="tc-conflict-toggle" onClick={() => setShowAll(s => !s)}>
                  {showAll
                    ? <><ChevronUp size={12}/> Show less</>
                    : <><ChevronDown size={12}/> Show {conflicts.length - 3} more</>}
                </button>
              )}
            </div>
          )}

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <div className="aam-field">
              <label className="aam-label">Effective From <span className="aam-required">*</span></label>
              <input className={`aam-input${errors.effectiveFrom ? ' aam-input--error' : ''}`}
                     type="date" value={effectiveFrom} min={tomorrow()} disabled={saving}
                     onChange={e => { setEffectiveFrom(e.target.value); setErrors(p => ({...p, effectiveFrom: ''})); setConflicts(null); }} />
              {errors.effectiveFrom && <p className="aam-error">{errors.effectiveFrom}</p>}
              <p className="aam-hint">Deactivation starts from this date</p>
            </div>
            <div className="aam-field">
              <label className="aam-label">Effective To</label>
              <input className={`aam-input${errors.effectiveTo ? ' aam-input--error' : ''}`}
                     type="date" value={effectiveTo} min={effectiveFrom || tomorrow()} disabled={saving}
                     onChange={e => { setEffectiveTo(e.target.value); setErrors(p => ({...p, effectiveTo: ''})); }} />
              {errors.effectiveTo && <p className="aam-error">{errors.effectiveTo}</p>}
              <p className="aam-hint">Leave blank for permanent</p>
            </div>
          </div>

          <div className="aam-field">
            <label className="aam-label">Reason <span className="aam-required">*</span></label>
            <textarea className={`aam-input${errors.reason ? ' aam-input--error' : ''}`}
                      rows={2} value={reason} disabled={saving}
                      placeholder="e.g. Coach under maintenance from next month"
                      onChange={e => { setReason(e.target.value); setErrors(p => ({...p, reason: ''})); }}
                      style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            {errors.reason && <p className="aam-error">{errors.reason}</p>}
          </div>
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 36, padding: '0 18px',
            background: saving ? '#fca5a5' : '#dc2626', color: '#fff',
            border: 'none', borderRadius: 6,
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
          }} onClick={handleSubmit} disabled={saving}>
            {saving ? <><span className="aam-spinner"/> Checking…</> : <><Ban size={14}/> Deactivate</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeactivateCoachModal;
