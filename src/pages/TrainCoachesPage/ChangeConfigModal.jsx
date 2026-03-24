import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Settings, AlertTriangle,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { TrainCoachService } from '../../services/TrainCoachService.js';
import { useToast }          from '../../context/Toast/useToast.js';
import '../AdminManagement/AddAdminModal.css';

const Field = ({ label, required, error, hint, children }) => (
  <div className="aam-field">
    <label className="aam-label">{label}{required && <span className="aam-required"> *</span>}</label>
    {children}
    {hint  && <p className="aam-hint">{hint}</p>}
    {error && <p className="aam-error">{error}</p>}
  </div>
);

const NumInput = ({ value, onChange, disabled, error, placeholder, min = 0 }) => (
  <input className={`aam-input${error ? ' aam-input--error' : ''}`}
         type="number" min={min} placeholder={placeholder}
         value={value} onChange={e => onChange(e.target.value)} disabled={disabled} />
);

const tomorrow = () => {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const FIELD_LABELS = {
  confirmedSeats: 'Confirmed seats',
  tatkalSeats:    'Tatkal seats',
  racSeats:       'RAC seats',
  waitlistLimit:  'Waitlist limit',
};

const ChangeConfigModal = ({ open, onClose, coach, trainNumber, onSuccess }) => {
  const { showError, showSuccess } = useToast();

  const [form,      setForm]      = useState({});
  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);
  const [result,    setResult]    = useState(null);  // stores full API result
  const [showAll,   setShowAll]   = useState(false);

  useEffect(() => {
    if (!open || !coach) return;
    setForm({
      coachCount:    String(coach.coachCount),
      tatkalSeats:   String(coach.tatkalSeats),
      racSeats:      String(coach.racSeats),
      waitlistLimit: String(coach.waitlistLimit),
      effectiveFrom: tomorrow(),
      effectiveTo:   '',
      changeReason:  '',
    });
    setErrors({});
    setResult(null);
    setShowAll(false);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open, coach?.coachId]);

  useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, saving, onClose]);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
    setResult(null); // clear previous result when form changes
  };

  const validate = () => {
    const e = {};
    const count = Number(form.coachCount);
    if (!form.coachCount || isNaN(count) || count < 1 || count > 30)
      e.coachCount = 'Must be 1–30.';

    const total  = coach?.totalSeats ?? 0;
    const tatkal = Number(form.tatkalSeats);
    const rac    = Number(form.racSeats);
    const wl     = Number(form.waitlistLimit);

    if (form.tatkalSeats === '' || isNaN(tatkal) || tatkal < 0)
      e.tatkalSeats = 'Required, min 0.';
    else if (total && tatkal > total) e.tatkalSeats = `Max ${total}.`;

    if (form.racSeats === '' || isNaN(rac) || rac < 0)
      e.racSeats = 'Required, min 0.';
    else if (total && rac > total) e.racSeats = `Max ${total}.`;

    if (!e.tatkalSeats && !e.racSeats && total && (tatkal + rac) > total)
      e.racSeats = `Tatkal (${tatkal}) + RAC (${rac}) exceeds ${total}.`;

    if (form.waitlistLimit === '' || isNaN(wl) || wl < 0 || wl > 1000)
      e.waitlistLimit = 'Must be 0–1000.';

    if (!form.effectiveFrom) e.effectiveFrom = 'Required.';
    if (form.effectiveTo && form.effectiveTo <= form.effectiveFrom)
      e.effectiveTo = 'Must be after effective-from.';
    if (!form.changeReason?.trim()) e.changeReason = 'Required.';

    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    setResult(null);

    try {
      const res     = await TrainCoachService.changeConfig(trainNumber, coach.coachId, {
        coachCount:    Number(form.coachCount),
        tatkalSeats:   Number(form.tatkalSeats),
        racSeats:      Number(form.racSeats),
        waitlistLimit: Number(form.waitlistLimit),
        effectiveFrom: form.effectiveFrom,
        effectiveTill: form.effectiveTo || null,
        reason:        form.changeReason.trim(),
      });

      // Temporarily add this right after the API call in handleSubmit:

      const apiResult = res.data.data;


      if (apiResult.success) {
        showSuccess(apiResult.message);
        onSuccess(apiResult);
        onClose();
      } else {
        // Blocked — show conflicts inside modal, do NOT close
        setResult(apiResult);

        // scroll body to top to show conflicts
        setTimeout(() => {
          document.querySelector('.aam-body')?.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
      }
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to change config.');
    } finally {
      setSaving(false);
    }
  };

  if (!open || !coach) return null;

  const seatsPerCoach = coach.totalSeats ?? 0;
  const count   = Number(form.coachCount)    || 0;
  const tatkal  = Number(form.tatkalSeats)   || 0;
  const rac     = Number(form.racSeats)      || 0;
  const wl      = Number(form.waitlistLimit) || 0;
  const showPreview = count > 0 && seatsPerCoach > 0 && !result;

  const conflicts      = result?.conflicts ?? [];
  const visibleConflicts = showAll ? conflicts : conflicts.slice(0, 3);

  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true" style={{ maxWidth: 520 }}>

        {/* Header */}
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Settings size={17}/>
            </div>
            <div>
              <h2 className="aam-title">Change Coach Config</h2>
              <p className="aam-subtitle">
                {coach.coachTypeCode} · {coach.coachTypeName} · Train {trainNumber}
              </p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18}/></button>
        </div>

        {/* Body */}
        <div className="aam-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>

          {/* ── Conflict panel — shown when API returns success:false ── */}
          {result !== null && result.success === false && conflicts.length > 0  && (
            <div className="tc-conflict-panel">
              <div className="tc-conflict-header">
                <AlertTriangle size={14}/>
                <strong>Config change blocked</strong>
                <span>{conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="tc-conflict-list">
                {visibleConflicts.map((c, i) => (
                  <div key={i} className="tc-conflict-item">
                    <span className="tc-conflict-date">{c.journeyDate}</span>
                    <span className="tc-conflict-field">
                      {FIELD_LABELS[c.conflictField] || c.conflictField}
                    </span>
                    <span className="tc-conflict-numbers">
                      <strong>{c.currentBooked}</strong> booked · new limit&nbsp;
                      <strong>{c.newLimit}</strong>
                    </span>
                  </div>
                ))}
              </div>
              {conflicts.length > 3 && (
                <button className="tc-conflict-toggle" onClick={() => setShowAll(s => !s)}>
                  {showAll
                    ? <><ChevronUp size={12}/> Show less</>
                    : <><ChevronDown size={12}/> +{conflicts.length - 3} more</>}
                </button>
              )}
              <div style={{
                padding: '10px 14px',
                background: '#fffbeb',
                borderTop: '1px solid #fde68a',
                fontSize: 12, color: '#92400e',
              }}>
                {result.message}
              </div>
            </div>
          )}

          {/* Current config strip */}
          <div className="tc-current-config">
            <span className="tc-current-label">Current</span>
            <span>Coaches: <strong>{coach.coachCount}</strong></span>
            <span>Tatkal: <strong>{coach.tatkalSeats}</strong>/coach</span>
            <span>RAC: <strong>{coach.racSeats}</strong>/coach</span>
            <span>WL: <strong>{coach.waitlistLimit}</strong></span>
          </div>

          {/* Form fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <Field label="Coach Count" required error={errors.coachCount} hint="1–30">
              <NumInput value={form.coachCount} min={1} onChange={v => set('coachCount', v)}
                        disabled={saving} error={errors.coachCount} placeholder="e.g. 6"/>
            </Field>
            <Field label="Waitlist Limit" required error={errors.waitlistLimit} hint="0–1000">
              <NumInput value={form.waitlistLimit} onChange={v => set('waitlistLimit', v)}
                        disabled={saving} error={errors.waitlistLimit} placeholder="e.g. 200"/>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <Field label="Tatkal / Coach" required error={errors.tatkalSeats}
                   hint={seatsPerCoach ? `Max ${seatsPerCoach}` : ''}>
              <NumInput value={form.tatkalSeats} onChange={v => set('tatkalSeats', v)}
                        disabled={saving} error={errors.tatkalSeats} placeholder="e.g. 8"/>
            </Field>
            <Field label="RAC / Coach" required error={errors.racSeats}
                   hint={seatsPerCoach ? `Max ${seatsPerCoach}` : ''}>
              <NumInput value={form.racSeats} onChange={v => set('racSeats', v)}
                        disabled={saving} error={errors.racSeats} placeholder="e.g. 4"/>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <Field label="Effective From" required error={errors.effectiveFrom}
                   hint="Config applies from this date">
              <input className={`aam-input${errors.effectiveFrom ? ' aam-input--error' : ''}`}
                     type="date" value={form.effectiveFrom} min={tomorrow()}
                     onChange={e => set('effectiveFrom', e.target.value)} disabled={saving}/>
            </Field>
            <Field label="Effective To" error={errors.effectiveTo} hint="Leave blank for no end date">
              <input className={`aam-input${errors.effectiveTo ? ' aam-input--error' : ''}`}
                     type="date" value={form.effectiveTo}
                     min={form.effectiveFrom || tomorrow()}
                     onChange={e => set('effectiveTo', e.target.value)} disabled={saving}/>
            </Field>
          </div>

          <Field label="Reason for Change" required error={errors.changeReason}>
            <textarea className={`aam-input${errors.changeReason ? ' aam-input--error' : ''}`}
                      rows={2} value={form.changeReason} disabled={saving}
                      placeholder="e.g. Adding coaches for festive season demand"
                      onChange={e => set('changeReason', e.target.value)}
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}/>
          </Field>

          {/* Live preview — hidden when conflicts shown */}
          {showPreview && (
            <div className="tc-preview">
              <div className="tc-preview-title">New totals from {form.effectiveFrom}</div>
              <div className="tc-preview-grid">
                <div className="tc-preview-item">
                  <span className="tc-preview-label">Total seats</span>
                  <span className="tc-preview-value" style={{ color: '#16a34a' }}>
                    {count * seatsPerCoach}
                  </span>
                </div>
                <div className="tc-preview-item">
                  <span className="tc-preview-label">Total tatkal</span>
                  <span className="tc-preview-value" style={{ color: '#d97706' }}>
                    {count * tatkal}
                  </span>
                </div>
                <div className="tc-preview-item">
                  <span className="tc-preview-label">Total RAC</span>
                  <span className="tc-preview-value" style={{ color: '#7c3aed' }}>
                    {count * rac}
                  </span>
                </div>
                <div className="tc-preview-item">
                  <span className="tc-preview-label">Waitlist cap</span>
                  <span className="tc-preview-value" style={{ color: '#0369a1' }}>{wl}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="tc-submit-btn" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><span className="aam-spinner"/> Checking…</>
              : <><Settings size={14}/> Apply Change</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChangeConfigModal;
