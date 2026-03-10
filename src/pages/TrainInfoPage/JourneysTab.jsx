import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Train, Plus, X, AlertTriangle,
  Radio, Clock, Ban, CheckCircle2,
  CalendarDays, Zap, RefreshCw, ChevronDown,
} from 'lucide-react';
import { JourneyService } from '../../services/JourneyService.js';
import { useToast }        from '../../context/Toast/useToast.js';
import '../AdminManagement/AddAdminModal.css';
import './JourneysTab.css';

// ── Helpers ───────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = String(d).split('-');
  return `${day}/${m}/${y}`;
};
const fmtDay = (d) => {
  if (!d) return '';
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const [y, m, day] = String(d).split('-').map(Number);
  return days[new Date(y, m - 1, day).getDay()];
};
const todayStr = () => new Date().toISOString().split('T')[0];
const addDaysStr = (n) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

// ── Status config ─────────────────────────────────────────
const STATUS_CFG = {
  SCHEDULED: { cls: 'scheduled', icon: <Radio size={11} />,        label: 'Scheduled' },
  DEPARTED:  { cls: 'departed',  icon: <Train size={11} />,        label: 'Departed'  },
  COMPLETED: { cls: 'completed', icon: <CheckCircle2 size={11} />, label: 'Completed' },
  CANCELLED: { cls: 'cancelled', icon: <Ban size={11} />,          label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { cls: '', icon: null, label: status };
  return (
    <span className={`jt-status-badge ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ── Collapsible Section (matches SchedulesTab) ────────────
const Section = ({ label, icon, count, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="jt-section">
      <button className="jt-section-header" onClick={() => setOpen(v => !v)}>
        <span className="jt-section-label">{icon} {label}</span>
        {count > 0 && <span className="jt-section-count">{count}</span>}
        <ChevronDown size={13} className={`jt-chevron${open ? ' open' : ''}`} />
      </button>
      {open && <div className="jt-section-body">{children}</div>}
    </div>
  );
};

// ── Journey Card ──────────────────────────────────────────
const JourneyCard = ({ journey, onCancel }) => {
  const canCancel = !journey.cancelled &&
    !journey.chartPrepared &&
    journey.status !== 'COMPLETED' &&
    journey.status !== 'DEPARTED';

  return (
    <div className={`jt-card ${STATUS_CFG[journey.status]?.cls || ''}${journey.cancelled ? ' jt-card-cancelled' : ''}`}>
      <div className="jt-card-top">
        <div className="jt-card-date-block">
          <span className="jt-card-day">{fmtDay(journey.journeyDate)}</span>
          <span className="jt-card-date">{fmtDate(journey.journeyDate)}</span>
        </div>
        <div className="jt-card-right">
          <StatusBadge status={journey.status} />
          {canCancel && (
            <button className="jt-cancel-card-btn" onClick={() => onCancel(journey)}>
              <Ban size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="jt-card-meta">
        <span className="jt-schedule-pill">{journey.scheduleRunDays}</span>
        <span className={`jt-chart-badge ${journey.chartPrepared ? 'prepared' : 'pending'}`}>
          {journey.chartPrepared ? 'Chart ✓' : 'Chart pending'}
        </span>
        <span className="jt-created-at">{journey.createdAt}</span>
      </div>

      {journey.cancelled && journey.cancelReason && (
        <div className="jt-cancel-reason">
          <AlertTriangle size={11} /> {journey.cancelReason}
        </div>
      )}
    </div>
  );
};

// ── Add Journey Modal ─────────────────────────────────────
const AddJourneyModal = ({ open, onClose, trainNumber, onSuccess }) => {
  const { showError } = useToast();
  const [date,   setDate]   = useState('');
  const [error,  setError]  = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(''); setError('');
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, saving, onClose]);

  const handleSubmit = async () => {
    if (!date) { setError('Please select a date.'); return; }
    setSaving(true);
    try {
      const res = await JourneyService.addJourneysOfTrain(trainNumber, date);
      onSuccess(res.data.data || res.data);
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to add journey.');
    } finally { setSaving(false); }
  };

  if (!open) return null;
  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal jt-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true">

        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon jt-header-icon"><CalendarDays size={17} /></div>
            <div>
              <h2 className="aam-title">Add Journey</h2>
              <p className="aam-subtitle">Train · {trainNumber}</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18} /></button>
        </div>

        <div className="aam-body">
          <div className="jt-admin-note">
            <AlertTriangle size={13} />
            Admin override — journey will be created regardless of scheduled run days.
          </div>
          <div className="aam-field">
            <label className="aam-label">Journey Date <span className="aam-required">*</span></label>
            <input
              className={`aam-input${error ? ' aam-input--error' : ''}`}
              type="date"
              min={addDaysStr(1)}
              value={date}
              disabled={saving}
              onChange={e => { setDate(e.target.value); setError(''); }}
            />
            {error
              ? <p className="aam-error">{error}</p>
              : <p className="aam-hint">Must be a future date.</p>}
          </div>
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="jt-submit-btn" onClick={handleSubmit} disabled={saving || !date}>
            {saving
              ? <><span className="aam-spinner" /> Adding…</>
              : <><Plus size={14} /> Add Journey</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Cancel Modal ──────────────────────────────────────────
const CancelModal = ({ journey, onClose, trainNumber, onSuccess }) => {
  const { showError } = useToast();
  const [reason,     setReason]     = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && !cancelling) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [cancelling, onClose]);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setCancelling(true);
    try {
      await JourneyService.cancelJourney(trainNumber, journey.journeyId, reason);
      onSuccess();
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to cancel journey.');
    } finally { setCancelling(false); }
  };

  return createPortal(
    <div className="aam-backdrop" onClick={cancelling ? undefined : onClose}>
      <div className="aam-modal jt-cancel-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true">

        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon jt-cancel-icon"><Ban size={17} /></div>
            <div>
              <h2 className="aam-title">Cancel Journey</h2>
              <p className="aam-subtitle">{fmtDay(journey.journeyDate)}, {fmtDate(journey.journeyDate)}</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={cancelling}><X size={18} /></button>
        </div>

        <div className="aam-body">
          <div className="jt-cancel-warning">
            <AlertTriangle size={14} />
            All bookings on this journey will need to be refunded manually.
          </div>
          <div className="aam-field">
            <label className="aam-label">Reason <span className="aam-required">*</span></label>
            <textarea
              className={`aam-input jt-textarea${!reason.trim() ? ' aam-input--error' : ''}`}
              rows={3}
              value={reason}
              disabled={cancelling}
              placeholder="e.g. Flood — track blocked between NDLS and MTJ"
              onChange={e => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={cancelling}>Keep Journey</button>
          <button
            className="jt-cancel-confirm-btn"
            onClick={handleConfirm}
            disabled={cancelling || !reason.trim()}>
            {cancelling
              ? <><span className="aam-spinner" /> Cancelling…</>
              : <><Ban size={14} /> Confirm Cancel</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Bulk Result Banner ────────────────────────────────────
const BulkResultBanner = ({ result, onDismiss }) => (
  <div className="jt-bulk-result">
    <CheckCircle2 size={15} />
    <div className="jt-bulk-result-text">
      {result.created === 0
        ? <><strong>No new journeys</strong> — all dates already exist or not scheduled.</>
        : <><strong>{result.created} journeys created</strong> from {fmtDate(result.from)} to {fmtDate(result.to)}.</>}
      {result.skipped > 0 && <> {result.skipped} skipped.</>}
    </div>
    <button className="jt-bulk-dismiss" onClick={onDismiss}><X size={14} /></button>
  </div>
);

// ── JourneysTab ───────────────────────────────────────────
const JourneysTab = ({ trainNumber }) => {
  const { showSuccess, showError } = useToast();

  const [journeys,      setJourneys]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [addOpen,       setAddOpen]       = useState(false);
  const [cancelJourney, setCancelJourney] = useState(null);
  const [bulkResult,    setBulkResult]    = useState(null);
  const [bulkLoading,   setBulkLoading]   = useState(false);
  const [singleLoading, setSingleLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await JourneyService.getAllJourneysOfTrain(trainNumber);
      setJourneys(res.data.data || res.data || []);
    } catch {
      // silently ignore
    } finally { setLoading(false); }
  }, [trainNumber]);

  useEffect(() => { load(); }, [load]);

  const handleBulkGenerate = async () => {
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const res = await JourneyService.bulkGenerateJourneyOfTrain(trainNumber);
      const result = res.data.data || res.data;
      setBulkResult(result);
      if (result.created > 0) showSuccess(`${result.created} journeys generated.`);
      load();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to generate journeys.');
    } finally { setBulkLoading(false); }
  };

  const handleSingleGenerate = async () => {
    setSingleLoading(true);
    try {
      const res = await JourneyService.generateJourneyOfTrain(trainNumber);
      const j = res.data.data || res.data;
      showSuccess(`Journey created for ${fmtDate(j.journeyDate)}.`);
      load();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to generate journey.');
    } finally { setSingleLoading(false); }
  };

  const handleAddSuccess = () => {
    showSuccess('Journey added successfully.');
    load();
  };

  const handleCancelSuccess = () => {
    showSuccess('Journey cancelled.');
    load();
  };

  // Group journeys
  const scheduled = journeys.filter(j => j.status === 'SCHEDULED' && !j.cancelled);
  const departed  = journeys.filter(j => j.status === 'DEPARTED'  && !j.cancelled);
  const completed = journeys.filter(j => j.status === 'COMPLETED' && !j.cancelled);
  const cancelled = journeys.filter(j => j.cancelled);

  const anyLoading = bulkLoading || singleLoading;

  return (
    <div className="jt-root">

      {/* ── Header ── */}
      <div className="jt-tab-header">
        <p className="jt-tab-desc">
          Manage scheduled runs. Showing last 7 days + next 120 days.
        </p>
        <div className="jt-header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setAddOpen(true)}
            disabled={anyLoading}>
            <Plus size={14} /> Add Journey
          </button>
          <button
            className="jt-btn-single"
            onClick={handleSingleGenerate}
            disabled={anyLoading}>
            {singleLoading
              ? <><span className="aam-spinner" /> Generating…</>
              : <><RefreshCw size={13} /> Generate (120d)</>}
          </button>
          <button
            className="jt-btn-bulk"
            onClick={handleBulkGenerate}
            disabled={anyLoading}>
            {bulkLoading
              ? <><span className="aam-spinner" /> Generating…</>
              : <><Zap size={13} /> Generate All Missing</>}
          </button>
        </div>
      </div>

      {/* ── Bulk result banner ── */}
      {bulkResult && (
        <BulkResultBanner result={bulkResult} onDismiss={() => setBulkResult(null)} />
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="jt-skeletons">
          {[1, 2, 3].map(i => (
            <div key={i} className="sm-skeleton jt-skeleton-card" />
          ))}
        </div>
      ) : journeys.length === 0 ? (
        <div className="sm-empty">
          <div className="sm-empty-icon"><Train size={24} /></div>
          <div className="sm-empty-title">No journeys found</div>
          <div className="sm-empty-desc">
            Click <strong>Generate All Missing</strong> to create journeys from the schedule,
            or <strong>Add Journey</strong> to add a specific date.
          </div>
        </div>
      ) : (
        <div className="jt-sections">

          {/* Scheduled — always open */}
          {scheduled.length > 0 && (
            <div className="jt-section">
              <div className="jt-section-label-static">
                <Radio size={12} /> Scheduled
                <span className="jt-section-count">{scheduled.length}</span>
              </div>
              <div className="jt-cards-grid">
                {scheduled.map(j => (
                  <JourneyCard key={j.journeyId} journey={j} onCancel={setCancelJourney} />
                ))}
              </div>
            </div>
          )}

          {/* Departed */}
          {departed.length > 0 && (
            <Section
              label="Departed"
              icon={<Train size={12} />}
              count={departed.length}
              defaultOpen={false}>
              <div className="jt-cards-grid">
                {departed.map(j => (
                  <JourneyCard key={j.journeyId} journey={j} onCancel={setCancelJourney} />
                ))}
              </div>
            </Section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <Section
              label="Completed"
              icon={<CheckCircle2 size={12} />}
              count={completed.length}
              defaultOpen={false}>
              <div className="jt-cards-grid">
                {completed.map(j => (
                  <JourneyCard key={j.journeyId} journey={j} onCancel={setCancelJourney} />
                ))}
              </div>
            </Section>
          )}

          {/* Cancelled */}
          {cancelled.length > 0 && (
            <Section
              label="Cancelled"
              icon={<Ban size={12} />}
              count={cancelled.length}
              defaultOpen={false}>
              <div className="jt-cards-grid">
                {cancelled.map(j => (
                  <JourneyCard key={j.journeyId} journey={j} onCancel={setCancelJourney} />
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <AddJourneyModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        trainNumber={trainNumber}
        onSuccess={handleAddSuccess}
      />

      {cancelJourney && (
        <CancelModal
          journey={cancelJourney}
          trainNumber={trainNumber}
          onClose={() => setCancelJourney(null)}
          onSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
};

export default JourneysTab;
