import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Settings, Ban, Zap, X,
  Wind, Snowflake, Copy, CalendarRange, History,
  ChevronDown, ChevronUp, Clock, CheckCircle2,
  Circle, Armchair,
} from 'lucide-react';
import { TrainCoachService } from '../../services/TrainCoachService.js';
import { TrainService }      from '../../services/TrainService.js';
import { useToast }          from '../../context/Toast/useToast.js';
import SearchableSelect      from '../../components/UI/SearchableSelect/SearchableSelect.jsx';
import ChangeConfigModal     from './ChangeConfigModal.jsx';
import DeactivateCoachModal  from './DeactivateCoachModal.jsx';
import CopyCoachesModal      from './CopyCoachesModal.jsx';
import '../AdminManagement/AddAdminModal.css';
import '../StationManagement/StationManagementPage.css';
import '../TrainPage/TrainsPage.css';
import './TrainCoachesPage.css';
import ReactivateCoachModal from './ReactivateCoachModal.jsx';

// ── Helpers ───────────────────────────────────────────────
const Field = ({ label, required, error, hint, children }) => (
  <div className="aam-field">
    <label className="aam-label">
      {label}{required && <span className="aam-required"> *</span>}
    </label>
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

const todayStr = () => new Date().toISOString().split('T')[0];

const fmtDate = (d) => {
  if (!d) return null;
  const [y, m, day] = String(d).split('-');
  return `${day}/${m}/${y}`;
};

// Classify a history row relative to today
const rowEra = (row) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  const from = new Date(row.effectiveFrom);
  from.setHours(0,0,0,0);

  const to = row.effectiveTo ? new Date(row.effectiveTo) : null;
  if (to) to.setHours(0,0,0,0);

  if (from > today) return 'future';
  if (!to || to >= today) return 'current';
  return 'past';
};

const ERA_CONFIG = {
  current: { label: 'Current',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '#16a34a' },
  future:  { label: 'Upcoming', color: '#0369a1', bg: '#eff6ff', border: '#bfdbfe', dot: '#3b82f6' },
  past:    { label: 'Past',     color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', dot: '#9ca3af' },
};

// ── History Panel (inline expandable) ────────────────────
const HistoryPanel = ({ trainNumber, coach }) => {
  const [open,    setOpen]    = useState(false);
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded,  setLoaded]  = useState(false);
  const { showError } = useToast();

  const load = async () => {
    if (loaded) { setOpen(o => !o); return; }
    setLoading(true);
    setOpen(true);
    try {
      const res = await TrainCoachService.getCoachHistory(trainNumber, coach.coachTypeCode);
      setRows(res.data.data || []);
      setLoaded(true);
    } catch {
      showError('Failed to load history.');
      setOpen(false);
    } finally { setLoading(false); }
  };

  return (
    <div className="tc-history-wrap">
      <button className="tc-history-toggle" onClick={load}>
        <History size={11}/>
        Config history
        {open ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
      </button>

      {open && (
        <div className="tc-history-panel">
          {loading ? (
            <div className="tc-history-loading">
              <span className="aam-spinner" style={{ borderTopColor: '#6b7280' }}/>
              Loading history…
            </div>
          ) : rows.length === 0 ? (
            <div className="tc-history-empty">No history found.</div>
          ) : (
            <div className="tc-history-timeline">
              {rows.map((row, i) => {
                const era = rowEra(row);
                const cfg = ERA_CONFIG[era];
                return (
                  <div key={row.coachId} className="tc-history-row"
                       style={{ '--era-color': cfg.color, '--era-bg': cfg.bg,
                         '--era-border': cfg.border, '--era-dot': cfg.dot }}>

                    {/* Timeline line + dot */}
                    <div className="tc-timeline-track">
                      <div className="tc-timeline-dot"/>
                      {i < rows.length - 1 && <div className="tc-timeline-line"/>}
                    </div>

                    {/* Content */}
                    <div className="tc-history-content">
                      <div className="tc-history-header-row">
                        <span className="tc-era-badge">{cfg.label}</span>
                        <span className="tc-history-dates">
                          <CalendarRange size={10}/>
                          {fmtDate(row.effectiveFrom)}
                          {row.effectiveTo
                            ? ` → ${fmtDate(row.effectiveTo)}`
                            : ' → ongoing'}
                        </span>
                      </div>

                      <div className="tc-history-stats">
                        <span><strong>{row.coachCount}</strong> coaches</span>
                        <span><strong>{row.coachCount * row.totalSeats}</strong> seats</span>
                        <span style={{ color: '#d97706' }}>
                          <strong>{row.tatkalSeats}</strong>/coach tatkal
                        </span>
                        <span style={{ color: '#7c3aed' }}>
                          <strong>{row.racSeats}</strong>/coach RAC
                        </span>
                        <span style={{ color: '#0369a1' }}>
                          WL <strong>{row.waitlistLimit}</strong>
                        </span>
                      </div>

                      {row.changeReason && (
                        <div className="tc-history-reason">"{row.changeReason}"</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Add Coach Modal ───────────────────────────────────────
const AddCoachModal = ({ open, onClose, trainNumber, onSuccess }) => {
  const { showError } = useToast();
  const EMPTY = {
    coachTypeCode: '', coachCount: '', tatkalSeats: '',
    racSeats: '', waitlistLimit: '',
    effectiveFrom: todayStr(), effectiveTo: '', changeReason: '',
  };
  const [form,        setForm]        = useState(EMPTY);
  const [errors,      setErrors]      = useState({});
  const [saving,      setSaving]      = useState(false);
  const [selectedRaw, setSelectedRaw] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY); setErrors({}); setSelectedRaw(null);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, saving, onClose]);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const fetchCoachTypes = async (search) => {
    const res = await TrainCoachService.getAvailableTypes(trainNumber);
    const filtered = res.data.data || [];
    return filtered
      .filter(ct => !search ||
        ct.typeCode.toLowerCase().includes(search.toLowerCase()) ||
        ct.typeName.toLowerCase().includes(search.toLowerCase()))
      .map(ct => ({
        value: ct.typeCode,
        label: `${ct.typeCode} — ${ct.typeName} (${ct.totalSeats} seats)`,
        raw: ct,
      }));
  };

  const validate = () => {
    const e = {};
    if (!form.coachTypeCode) e.coachTypeCode = 'Required.';
    const count = Number(form.coachCount);
    if (form.coachCount === '') e.coachCount = 'Required.';
    else if (!Number.isInteger(count) || count < 1 || count > 30) e.coachCount = '1–30.';
    const total  = selectedRaw?.totalSeats || 0;
    const tatkal = Number(form.tatkalSeats);
    const rac    = Number(form.racSeats);
    const wl     = Number(form.waitlistLimit);
    if (form.tatkalSeats === '') e.tatkalSeats = 'Required. Enter 0 if none.';
    else if (tatkal < 0) e.tatkalSeats = 'Cannot be negative.';
    else if (total && tatkal > total) e.tatkalSeats = `Max ${total}.`;
    if (form.racSeats === '') e.racSeats = 'Required. Enter 0 if none.';
    else if (rac < 0) e.racSeats = 'Cannot be negative.';
    else if (total && rac > total) e.racSeats = `Max ${total}.`;
    if (total && !e.tatkalSeats && !e.racSeats && (tatkal + rac) > total)
      e.racSeats = `Tatkal (${tatkal}) + RAC (${rac}) exceeds ${total}.`;
    if (form.waitlistLimit === '') e.waitlistLimit = 'Required. Enter 0 if none.';
    else if (wl < 0 || wl > 1000) e.waitlistLimit = '0–1000.';
    if (!form.effectiveFrom) e.effectiveFrom = 'Required.';
    if (form.effectiveTo && form.effectiveTo <= form.effectiveFrom)
      e.effectiveTo = 'Must be after effective-from.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const res = await TrainCoachService.addCoach(trainNumber, {
        coachTypeCode: form.coachTypeCode,
        coachCount:    Number(form.coachCount),
        tatkalSeats:   Number(form.tatkalSeats),
        racSeats:      Number(form.racSeats),
        waitlistLimit: Number(form.waitlistLimit),
        effectiveFrom: form.effectiveFrom,
        effectiveTo:   form.effectiveTo || null,
        changeReason:  form.changeReason || null,
      });
      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to add coach.');
    } finally { setSaving(false); }
  };

  if (!open) return null;
  const count  = Number(form.coachCount)    || 0;
  const total  = selectedRaw?.totalSeats    || 0;
  const tatkal = Number(form.tatkalSeats)   || 0;
  const rac    = Number(form.racSeats)      || 0;
  const wl     = Number(form.waitlistLimit) || 0;
  const showPreview = count > 0 && total > 0;

  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()}
           role="dialog" style={{ maxWidth: 520 }}>

        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              <Armchair size={17}/>
            </div>
            <div>
              <h2 className="aam-title">Add Coach Type</h2>
              <p className="aam-subtitle">Configure a coach type for train {trainNumber}</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18}/></button>
        </div>

        <div className="aam-body">
          <Field label="Coach Type" required error={errors.coachTypeCode}>
            <SearchableSelect value={form.coachTypeCode}
                              onChange={(val, raw) => {
                                set('coachTypeCode', val || '');
                                setSelectedRaw(raw?.raw || null);
                              }}
                              fetchOptions={fetchCoachTypes} placeholder="Select coach type…"
                              disabled={saving} size="full" />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <Field label="Number of Coaches" required error={errors.coachCount} hint="e.g. 6 → S1 to S6">
              <NumInput value={form.coachCount} min={1} onChange={v => set('coachCount', v)}
                        disabled={saving} error={errors.coachCount} placeholder="e.g. 6" />
            </Field>
            <Field label="Waitlist Limit" required error={errors.waitlistLimit} hint="Total WL pool (0–1000)">
              <NumInput value={form.waitlistLimit} onChange={v => set('waitlistLimit', v)}
                        disabled={saving} error={errors.waitlistLimit} placeholder="e.g. 200" />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <Field label="Tatkal Seats / Coach" required error={errors.tatkalSeats}
                   hint={total ? `Per coach · max ${total}` : 'Per coach'}>
              <NumInput value={form.tatkalSeats} onChange={v => set('tatkalSeats', v)}
                        disabled={saving || !form.coachTypeCode} error={errors.tatkalSeats} placeholder="e.g. 8" />
            </Field>
            <Field label="RAC Seats / Coach" required error={errors.racSeats}
                   hint={total ? `Per coach · max ${total}` : 'Per coach'}>
              <NumInput value={form.racSeats} onChange={v => set('racSeats', v)}
                        disabled={saving || !form.coachTypeCode} error={errors.racSeats} placeholder="e.g. 4" />
            </Field>
          </div>

          {/* Effective dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <Field label="Effective From" required error={errors.effectiveFrom}
                   hint="Config starts from this date">
              <input className={`aam-input${errors.effectiveFrom ? ' aam-input--error' : ''}`}
                     type="date" value={form.effectiveFrom}
                     onChange={e => set('effectiveFrom', e.target.value)} disabled={saving} />
            </Field>
            <Field label="Effective To" error={errors.effectiveTo} hint="Leave blank for no end date">
              <input className={`aam-input${errors.effectiveTo ? ' aam-input--error' : ''}`}
                     type="date" value={form.effectiveTo}
                     min={form.effectiveFrom || todayStr()}
                     onChange={e => set('effectiveTo', e.target.value)} disabled={saving} />
            </Field>
          </div>

          <Field label="Reason" error={errors.changeReason} hint="Optional — why is this coach being added?">
            <textarea className="aam-input" rows={2} value={form.changeReason}
                      disabled={saving}
                      placeholder="e.g. Added for festive season demand"
                      onChange={e => set('changeReason', e.target.value)}
                      style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </Field>

          {showPreview && (
            <div className="tc-preview">
              <div className="tc-preview-title">Totals for this train</div>
              <div className="tc-preview-grid">
                <div className="tc-preview-item">
                  <span className="tc-preview-label">Total seats</span>
                  <span className="tc-preview-value" style={{ color: '#16a34a' }}>{count * total}</span>
                </div>
                <div className="tc-preview-item">
                  <span className="tc-preview-label">Total tatkal</span>
                  <span className="tc-preview-value" style={{ color: '#d97706' }}>{count * tatkal}</span>
                </div>
                <div className="tc-preview-item">
                  <span className="tc-preview-label">Total RAC</span>
                  <span className="tc-preview-value" style={{ color: '#7c3aed' }}>{count * rac}</span>
                </div>
                <div className="tc-preview-item">
                  <span className="tc-preview-label">Waitlist cap</span>
                  <span className="tc-preview-value" style={{ color: '#0369a1' }}>{wl}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="tc-submit-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? <><span className="aam-spinner"/> Adding…</> : 'Add Coach'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main Page ─────────────────────────────────────────────
const TrainCoachesPage = () => {
  const { trainNumber } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [train,          setTrain]          = useState(null);
  const [coaches,        setCoaches]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [addOpen,        setAddOpen]        = useState(false);
  const [changeTarget,   setChangeTarget]   = useState(null);
  const [deactivTarget,  setDeactivTarget]  = useState(null);
  const [copyModalOpen,  setCopyModalOpen]  = useState(false);
  const [reactivTarget, setReactivTarget] = useState(null);
  const [showInactive, setShowInactive] = useState(false);


  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [trainRes, coachRes] = await Promise.all([
        TrainService.getAllForDropdown(trainNumber),
        showInactive
          ? TrainCoachService.getAllByTrainIncludingInactive(trainNumber)
          : TrainCoachService.getAllByTrain(trainNumber),
      ]);
      const trainData = (trainRes.data.data || []).find(t => t.trainNumber === trainNumber);
      setTrain(trainData || null);
      setCoaches(coachRes.data.data || []);
    } catch {
      showError('Failed to load train coaches.');
    } finally { setLoading(false); }
  }, [trainNumber, showInactive]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const active          = coaches.filter(c => c.isActive);
  const totalCoachCount = active.reduce((s, c) => s + c.coachCount, 0);
  const totalSeats      = active.reduce((s, c) => s + c.totalCoachSeats, 0);
  const totalTatkal     = active.reduce((s, c) => s + c.totalTatkalSeats, 0);
  const totalRac        = active.reduce((s, c) => s + c.totalRacSeats, 0);
  const totalWaitlist   = active.reduce((s, c) => s + c.waitlistLimit, 0);

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <button className="tc-back-btn" onClick={() => navigate('/trains')}>
            <ArrowLeft size={16}/>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="page-title" style={{ margin: 0 }}>Train {trainNumber}</h1>
              {train?.isSuperfast && (
                <span className="trains-superfast-tag"><Zap size={10}/> Superfast</span>
              )}
            </div>
            <p className="page-subtitle">{train?.trainName || '—'} · Coach Configuration</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          {coaches.length > 0 && (
            <button className="btn btn-secondary" onClick={() => setCopyModalOpen(true)}>
              <Copy size={16}/> Copy to Train
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
            <Plus size={16}/> Add Coach Type
          </button>
        </div>
      </div>

      {/* Stat boxes */}
      <div className="trains-stat-row">
        {[
          { label: 'Coach Types',   value: coaches.length,    color: undefined },
          { label: 'Total Coaches', value: totalCoachCount,   color: '#1d4ed8' },
          { label: 'Total Seats',   value: totalSeats,        color: '#16a34a' },
          { label: 'Tatkal Seats',  value: totalTatkal,       color: '#d97706' },
          { label: 'RAC Seats',     value: totalRac,          color: '#7c3aed' },
          { label: 'WL Capacity',   value: totalWaitlist,     color: '#0369a1' },
        ].map(s => (
          <div key={s.label} className="trains-stat-box">
            <div className="trains-stat-label">{s.label}</div>
            <div className="trains-stat-value" style={s.color ? { color: s.color } : {}}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Coach cards */}
      {loading ? (
        <div className="tc-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="tc-card tc-card-skeleton">
              <div className="sm-skeleton" style={{ width: '40%', height: 20, marginBottom: 8 }}/>
              <div className="sm-skeleton" style={{ width: '65%', marginBottom: 16 }}/>
              <div className="sm-skeleton" style={{ width: '80%', marginBottom: 8 }}/>
              <div className="sm-skeleton" style={{ width: '55%' }}/>
            </div>
          ))}
        </div>
      ) : coaches.length === 0 ? (
        <div className="card">
          <div className="sm-empty">
            <div className="sm-empty-icon"><Armchair size={24}/></div>
            <div className="sm-empty-title">No coaches configured</div>
            <div className="sm-empty-desc">Add coach types to define this train's composition.</div>
          </div>
        </div>
      ) : (
        <div className="tc-grid">
          {coaches.map(coach => (
            <div key={coach.coachId}
                 className={`tc-card${!coach.isActive ? ' tc-card-inactive' : ''}`}>

              {/* Card header */}
              <div className="tc-card-header">
                <div className="tc-card-type">
                  <span className="tc-code-badge">{coach.coachTypeCode}</span>
                  {coach.isAc
                    ? <span className="tc-ac-tag"><Snowflake size={10}/> AC</span>
                    : <span className="tc-non-ac-tag"><Wind size={10}/> Non-AC</span>}
                </div>
                <div className="tc-card-actions">
                  {coach.isActive && (
                    <button className="sm-action-btn" title="Change config"
                            onClick={() => setChangeTarget(coach)}>
                      <Settings size={13}/>
                    </button>
                  )}
                  {coach.isActive && (
                    <button className="sm-action-btn danger" title="Deactivate"
                            onClick={() => setDeactivTarget(coach)}>
                      <Ban size={13}/>
                    </button>
                  )}
                  {!coach.isActive && (
                    <button className="sm-action-btn" title="Reactivate"
                            style={{ color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                            onClick={() => setReactivTarget(coach)}>
                      <CheckCircle2 size={13}/>
                    </button>
                  )}
                </div>
              </div>

              <div className="tc-card-name">{coach.coachTypeName}</div>

              {/* Effective date badge */}
              {coach.effectiveFrom && (
                <div className="tc-effective-badge">
                  <CalendarRange size={10}/>
                  {fmtDate(coach.effectiveFrom)}
                  {coach.effectiveTo ? ` → ${fmtDate(coach.effectiveTo)}` : ' onwards'}
                </div>
              )}

              {/* Coach pills */}
              <div className="tc-coach-pills">
                {Array.from({ length: Math.min(coach.coachCount, 12) }).map((_, i) => (
                  <span key={i} className="tc-coach-pill">
                    {coach.coachTypeCode}{i + 1}
                  </span>
                ))}
                {coach.coachCount > 12 && (
                  <span className="tc-coach-pill more">+{coach.coachCount - 12}</span>
                )}
              </div>

              {/* Stats grid */}
              <div className="tc-card-stats">
                <div className="tc-stat">
                  <span className="tc-stat-label">Coaches</span>
                  <span className="tc-stat-value">{coach.coachCount}</span>
                </div>
                <div className="tc-stat">
                  <span className="tc-stat-label">Seats / coach</span>
                  <span className="tc-stat-value">{coach.totalSeats}</span>
                </div>
                <div className="tc-stat">
                  <span className="tc-stat-label">Total seats</span>
                  <span className="tc-stat-value" style={{ color: '#16a34a' }}>{coach.totalCoachSeats}</span>
                </div>
                <div className="tc-stat">
                  <span className="tc-stat-label">Tatkal / coach</span>
                  <span className="tc-stat-value" style={{ color: '#d97706' }}>{coach.tatkalSeats}</span>
                </div>
                <div className="tc-stat">
                  <span className="tc-stat-label">RAC / coach</span>
                  <span className="tc-stat-value" style={{ color: '#7c3aed' }}>{coach.racSeats}</span>
                </div>
                <div className="tc-stat">
                  <span className="tc-stat-label">WL limit</span>
                  <span className="tc-stat-value" style={{ color: '#0369a1' }}>{coach.waitlistLimit}</span>
                </div>
              </div>

              {/* History panel */}
              <HistoryPanel trainNumber={trainNumber} coach={coach} />

              {!coach.isActive && <div className="tc-inactive-banner">Inactive</div>}
            </div>
          ))}
        </div>
      )}

      <AddCoachModal open={addOpen} onClose={() => setAddOpen(false)}
                     trainNumber={trainNumber}
                     onSuccess={(saved) => { loadAll(); showSuccess('Coach added successfully.'); }} />

      <ChangeConfigModal
        open={!!changeTarget} coach={changeTarget}
        trainNumber={trainNumber}
        onClose={() => setChangeTarget(null)}
        onSuccess={(result) => { showSuccess(result.message); loadAll(); }} />

      <DeactivateCoachModal
        open={!!deactivTarget} coach={deactivTarget}
        trainNumber={trainNumber}
        onClose={() => setDeactivTarget(null)}
        onSuccess={(result) => { showSuccess(result.message); loadAll(); }} />

      <CopyCoachesModal
        open={copyModalOpen} onClose={() => setCopyModalOpen(false)}
        sourceTrainNumber={trainNumber} coachCount={coaches.length}
        onSuccess={() => showSuccess('Coaches copied successfully.')} />

      <ReactivateCoachModal
        open={!!reactivTarget} coach={reactivTarget}
        trainNumber={trainNumber}
        onClose={() => setReactivTarget(null)}
        onSuccess={(result) => { showSuccess(result.message); loadAll(); }} />
    </div>
  );
};

export default TrainCoachesPage;
