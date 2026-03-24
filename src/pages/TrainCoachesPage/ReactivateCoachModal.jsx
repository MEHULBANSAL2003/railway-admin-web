import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2 } from 'lucide-react';
import { TrainCoachService } from '../../services/TrainCoachService.js';
import { useToast }          from '../../context/Toast/useToast.js';
import '../AdminManagement/AddAdminModal.css';

const tomorrow = () => {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const ReactivateCoachModal = ({ open, onClose, coach, trainNumber, onSuccess }) => {
  const { showError } = useToast();

  const [effectiveFrom, setEffectiveFrom] = useState(tomorrow());
  const [reason,        setReason]        = useState('');
  const [errors,        setErrors]        = useState({});
  const [saving,        setSaving]        = useState(false);

  useEffect(() => {
    if (!open) return;
    setEffectiveFrom(tomorrow());
    setReason('');
    setErrors({});
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
    if (!reason.trim()) e.reason = 'Required.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const res = await TrainCoachService.reactivateCoach(trainNumber, coach.coachId, {
        effectiveFrom,
        reason: reason.trim(),
      });
      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to reactivate coach.');
    } finally { setSaving(false); }
  };

  if (!open || !coach) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true" style={{ maxWidth: 440 }}>

        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <CheckCircle2 size={17}/>
            </div>
            <div>
              <h2 className="aam-title">Reactivate Coach</h2>
              <p className="aam-subtitle">
                {coach.coachTypeCode} · {coach.coachTypeName} · Train {trainNumber}
              </p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}>
            <X size={18}/>
          </button>
        </div>

        <div className="aam-body">
          <div className="aam-field">
            <label className="aam-label">
              Reactivate From <span className="aam-required">*</span>
            </label>
            <input
              className={`aam-input${errors.effectiveFrom ? ' aam-input--error' : ''}`}
              type="date" value={effectiveFrom} min={tomorrow()} disabled={saving}
              onChange={e => {
                setEffectiveFrom(e.target.value);
                setErrors(p => ({ ...p, effectiveFrom: '' }));
              }}
            />
            {errors.effectiveFrom && <p className="aam-error">{errors.effectiveFrom}</p>}
            <p className="aam-hint">Coach becomes active again from this date (effectiveTo is cleared)</p>
          </div>

          <div className="aam-field">
            <label className="aam-label">
              Reason <span className="aam-required">*</span>
            </label>
            <textarea
              className={`aam-input${errors.reason ? ' aam-input--error' : ''}`}
              rows={2} value={reason} disabled={saving}
              placeholder="e.g. Maintenance complete, resuming service"
              onChange={e => {
                setReason(e.target.value);
                setErrors(p => ({ ...p, reason: '' }));
              }}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
            {errors.reason && <p className="aam-error">{errors.reason}</p>}
          </div>
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 36, padding: '0 18px',
              background: saving ? '#86efac' : '#16a34a', color: '#fff',
              border: 'none', borderRadius: 6,
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
            onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><span className="aam-spinner"/> Reactivating…</>
              : <><CheckCircle2 size={14}/> Reactivate</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReactivateCoachModal;
