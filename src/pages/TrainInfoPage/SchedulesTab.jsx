import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarClock, Plus, X, AlertTriangle,
  CheckCircle2, Clock, ChevronDown,
  Calendar, Radio, Hourglass, Ban, RotateCcw,
} from 'lucide-react';
import { TrainScheduleService } from '../../services/TrainScheduleService.js';
import { useToast }             from '../../context/Toast/useToast.js';
import '../AdminManagement/AddAdminModal.css';
import './SchedulesTab.css';

// ─────────────────────────────────────────────────
const ALL_DAYS   = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
const DAY_LABELS = { MON:'Mon', TUE:'Tue', WED:'Wed', THU:'Thu', FRI:'Fri', SAT:'Sat', SUN:'Sun' };
const REMOVAL_BUFFER  = 120;
const ADDITION_BUFFER = 10;

const fmtDate = (d) => {
  if (!d) return 'ongoing';
  const [y, m, day] = String(d).split('-');
  return `${day}/${m}/${y}`;
};
const todayStr  = () => new Date().toISOString().split('T')[0];
const addDaysStr = (n) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

// ─────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────
const STATUS_CFG = {
  RUNNING:     { cls: 'running',     icon: <Radio size={11}/>,     label: 'Running'     },
  UPCOMING:    { cls: 'upcoming',    icon: <Hourglass size={11}/>, label: 'Upcoming'    },
  PAST:        { cls: 'past',        icon: <Clock size={11}/>,     label: 'Past'        },
  DEACTIVATED: { cls: 'deactivated', icon: <Ban size={11}/>,       label: 'Deactivated' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { cls: '', icon: null, label: status };
  return (
    <span className={`sct-status-badge ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────────
// Schedule Card
// ─────────────────────────────────────────────────
const ScheduleCard = ({ schedule, onToggle, toggling }) => {
  const canToggle = schedule.status !== 'RUNNING';
  const isDeactivated = schedule.status === 'DEACTIVATED';

  return (
    <div className={`sct-card ${STATUS_CFG[schedule.status]?.cls || ''}`}>
      <div className="sct-card-top">
        {/* Day circles */}
        <div className="sct-card-days">
          {ALL_DAYS.map(d => (
            <div key={d}
                 className={`sct-day-circle${schedule.runDays.includes(d) ? ' active' : ''}`}>
              {DAY_LABELS[d]}
            </div>
          ))}
        </div>

        {/* Right — badge + toggle */}
        <div className="sct-card-right">
          <StatusBadge status={schedule.status}/>
          {canToggle && (
            <button
              className={`sct-toggle-btn ${isDeactivated ? 'reactivate' : 'deactivate'}`}
              onClick={() => onToggle(schedule)}
              disabled={toggling === schedule.scheduleId}
              title={isDeactivated ? 'Reactivate' : 'Deactivate'}>
              {toggling === schedule.scheduleId
                ? <span className="aam-spinner"/>
                : isDeactivated ? <RotateCcw size={13}/> : <Ban size={13}/>
              }
            </button>
          )}
        </div>
      </div>

      {/* Date range */}
      <div className="sct-card-dates">
        <Calendar size={11}/>
        {fmtDate(schedule.startDate)}
        <span className="sct-date-arrow">→</span>
        {fmtDate(schedule.endDate)}
        <span className="sct-days-count">
          · {schedule.runDays.length} day{schedule.runDays.length !== 1 ? 's' : ''}/wk
          {schedule.runDays.length === 7 && <span className="sct-daily-tag">Daily</span>}
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────
// Add Schedule Modal
// ─────────────────────────────────────────────────
const AddScheduleModal = ({ open, onClose, trainNumber, running, onSuccess }) => {
  const { showError } = useToast();
  const [selectedDays, setSelectedDays] = useState([]);
  const [startDate,    setStartDate]    = useState('');
  const [errors,       setErrors]       = useState({});
  const [saving,       setSaving]       = useState(false);

  const currentDays = running?.runDays || [];
  const addedDays   = selectedDays.filter(d => !currentDays.includes(d));
  const removedDays = currentDays.filter(d => !selectedDays.includes(d));
  const hasRemovals = removedDays.length > 0;
  const minDate     = running
    ? (hasRemovals ? addDaysStr(REMOVAL_BUFFER) : addDaysStr(ADDITION_BUFFER))
    : addDaysStr(1);

  useEffect(() => {
    if (!open) return;
    setSelectedDays(currentDays.length > 0 ? [...currentDays] : []);
    setStartDate('');
    setErrors({});
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, saving, onClose]);

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
    setErrors(p => ({ ...p, days: '' }));
  };

  const validate = () => {
    const e = {};
    if (selectedDays.length === 0)
      e.days = 'Select at least one day.';
    else if (currentDays.length > 0) {
      const same = selectedDays.length === currentDays.length &&
        selectedDays.every(d => currentDays.includes(d));
      if (same) e.days = 'No change — same days as running schedule.';
    }
    if (!startDate)
      e.startDate = 'Start date is required.';
    else if (startDate <= todayStr())
      e.startDate = 'Start date must be in the future.';
    else if (startDate < minDate)
      e.startDate = hasRemovals
        ? `Removing days requires start on or after ${fmtDate(minDate)} (${REMOVAL_BUFFER} days from today).`
        : `Adding days requires start on or after ${fmtDate(minDate)} (${ADDITION_BUFFER} days from today).`;
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const sortedDays = ALL_DAYS.filter(d => selectedDays.includes(d));
      const res = await TrainScheduleService.createSchedule(trainNumber, {
        runDays: sortedDays, startDate,
      });
      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to create schedule.');
    } finally { setSaving(false); }
  };

  if (!open) return null;
  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal sct-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true">
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon sct-header-icon"><CalendarClock size={17}/></div>
            <div>
              <h2 className="aam-title">{running ? 'New Schedule' : 'Create Schedule'}</h2>
              <p className="aam-subtitle">Train · {trainNumber}</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18}/></button>
        </div>

        <div className="aam-body">
          {/* Running schedule reference */}
          {running && (
            <div className="sct-current-info">
              <span className="sct-current-label">Running:</span>
              <div className="sct-current-days">
                {running.runDays.map(d => (
                  <span key={d} className="sct-mini-pill running">{DAY_LABELS[d]}</span>
                ))}
              </div>
              <span className="sct-current-since">since {fmtDate(running.startDate)}</span>
            </div>
          )}

          {/* Day picker */}
          <div className="aam-field">
            <label className="aam-label">Run Days <span className="aam-required">*</span></label>
            <div className="sct-day-grid">
              {ALL_DAYS.map(day => {
                const sel     = selectedDays.includes(day);
                const isAdded = sel && !currentDays.includes(day);
                const isRem   = !sel && currentDays.includes(day);
                return (
                  <button key={day} type="button" disabled={saving}
                          className={`sct-day-pill${sel ? ' active' : ''}${isAdded ? ' added' : ''}${isRem ? ' removed' : ''}`}
                          onClick={() => toggleDay(day)}>
                    {DAY_LABELS[day]}
                  </button>
                );
              })}
            </div>
            {errors.days && <p className="aam-error">{errors.days}</p>}

            {running && (addedDays.length > 0 || removedDays.length > 0) && (
              <div className="sct-change-summary">
                {addedDays.length > 0 && (
                  <span className="sct-change added"><Plus size={11}/>
                    Adding: {addedDays.map(d => DAY_LABELS[d]).join(', ')}
                  </span>
                )}
                {removedDays.length > 0 && (
                  <span className="sct-change removed"><X size={11}/>
                    Removing: {removedDays.map(d => DAY_LABELS[d]).join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Start date */}
          <div className="aam-field">
            <label className="aam-label">Effective From <span className="aam-required">*</span></label>
            <input className={`aam-input${errors.startDate ? ' aam-input--error' : ''}`}
                   type="date" value={startDate} min={minDate} disabled={saving}
                   onChange={e => { setStartDate(e.target.value); setErrors(p => ({ ...p, startDate: '' })); }}
            />
            {errors.startDate
              ? <p className="aam-error">{errors.startDate}</p>
              : <p className="aam-hint">
                {hasRemovals
                  ? `⚠ Removing days — earliest ${fmtDate(minDate)} (${REMOVAL_BUFFER} days from today)`
                  : running
                    ? `Earliest: ${fmtDate(minDate)} (${ADDITION_BUFFER} days from today)`
                    : `Earliest: tomorrow`}
              </p>
            }
          </div>

          {hasRemovals && (
            <div className="sct-removal-warning">
              <AlertTriangle size={14}/>
              <span>
                Removing <strong>{removedDays.map(d => DAY_LABELS[d]).join(', ')}</strong> —
                existing bookings on these days will be honoured until the new schedule starts.
              </span>
            </div>
          )}
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="sct-submit-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? <><span className="aam-spinner"/> Saving…</> : 'Create Schedule'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─────────────────────────────────────────────────
// Collapsible section
// ─────────────────────────────────────────────────
const Section = ({ label, icon, count, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="sct-section">
      <button className="sct-section-header" onClick={() => setOpen(v => !v)}>
        <span className="sct-section-label">{icon} {label}</span>
        {count > 0 && <span className="sct-section-count">{count}</span>}
        <ChevronDown size={13} className={`sct-chevron${open ? ' open' : ''}`}/>
      </button>
      {open && <div className="sct-section-body">{children}</div>}
    </div>
  );
};

// ─────────────────────────────────────────────────
// SchedulesTab — default export
// ─────────────────────────────────────────────────
const SchedulesTab = ({ trainNumber }) => {
  const { showSuccess, showError } = useToast();

  const [summary,     setSummary]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [toggling,    setToggling]    = useState(null); // scheduleId being toggled

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await TrainScheduleService.getSummary(trainNumber);
      setSummary(res.data.data);
    } catch {
      setSummary(null);
    } finally { setLoading(false); }
  }, [trainNumber]);

  useEffect(() => { load(); }, [trainNumber]);

  const handleToggle = async (schedule) => {
    setToggling(schedule.scheduleId);
    try {
      const res = await TrainScheduleService.toggleSchedule(trainNumber, schedule.scheduleId);
      const updated = res.data.data;
      showSuccess(updated?.message || 'Schedule updated.');
      load();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to update schedule.');
    } finally { setToggling(null); }
  };

  const handleCreateSuccess = (saved) => {
    showSuccess(saved?.message || 'Schedule created.');
    load();
  };

  // Block "Add" button if an active upcoming already exists
  const hasActiveUpcoming = summary?.upcoming?.some(s => s.isActive) ?? false;

  return (
    <div className="sct-root">

      {/* Header */}
      <div className="sct-tab-header">
        <p className="sct-tab-desc">
          Define which days this train runs. Bookings open 120 days in advance.
        </p>
        <button
          className="sct-add-btn"
          onClick={() => setModalOpen(true)}
          disabled={loading || hasActiveUpcoming}
          title={hasActiveUpcoming ? 'Deactivate the upcoming schedule before adding a new one' : ''}>
          <Plus size={14}/> Add Schedule
        </button>
      </div>

      {loading ? (
        <div className="sct-loading">
          <div className="sm-skeleton" style={{ height: 90, borderRadius: 10 }}/>
          <div className="sm-skeleton" style={{ height: 60, borderRadius: 10, marginTop: 12 }}/>
        </div>
      ) : (
        <>
          {/* ── Running ── */}
          <div className="sct-section">
            <div className="sct-section-label-static">
              <Radio size={12}/> Currently Running
            </div>
            {summary?.running ? (
              <ScheduleCard
                schedule={summary.running}
                onToggle={handleToggle}
                toggling={toggling}
              />
            ) : (
              <div className="sct-empty-running">
                <AlertTriangle size={16}/>
                <div>
                  <div className="sct-empty-title">Not running</div>
                  <div className="sct-empty-desc">No active schedule today. Create one to make this train bookable.</div>
                </div>
              </div>
            )}
          </div>

          {/* ── Upcoming ── */}
          {summary?.upcoming?.length > 0 && (
            <Section
              label="Upcoming"
              icon={<Hourglass size={12}/>}
              count={summary.upcoming.length}
              defaultOpen={true}>
              {summary.upcoming.map(s => (
                <ScheduleCard key={s.scheduleId} schedule={s}
                              onToggle={handleToggle} toggling={toggling}/>
              ))}
            </Section>
          )}

          {/* ── Past ── */}
          {summary?.past?.length > 0 && (
            <Section
              label="Past"
              icon={<Clock size={12}/>}
              count={summary.past.length}
              defaultOpen={false}>
              {summary.past.map(s => (
                <ScheduleCard key={s.scheduleId} schedule={s}
                              onToggle={handleToggle} toggling={toggling}/>
              ))}
            </Section>
          )}

          {/* ── Deactivated ── */}
          {summary?.deactivated?.length > 0 && (
            <Section
              label="Deactivated"
              icon={<Ban size={12}/>}
              count={summary.deactivated.length}
              defaultOpen={false}>
              {summary.deactivated.map(s => (
                <ScheduleCard key={s.scheduleId} schedule={s}
                              onToggle={handleToggle} toggling={toggling}/>
              ))}
            </Section>
          )}
        </>
      )}

      <AddScheduleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        trainNumber={trainNumber}
        running={summary?.running || null}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default SchedulesTab;
