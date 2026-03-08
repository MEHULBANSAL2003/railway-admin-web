import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Zap, UtensilsCrossed, Train, Armchair,
  MapPin, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  X, AlertTriangle, Snowflake, Wind, Clock, Milestone,
  CalendarClock,
} from 'lucide-react';
import { TrainService }      from '../../services/TrainService.js';
import { TrainCoachService } from '../../services/TrainCoachService.js';
import { TrainStopService }  from '../../services/TrainStopService.js';
import { useToast }          from '../../context/Toast/useToast.js';
import SearchableSelect      from '../../components/UI/SearchableSelect/SearchableSelect.jsx';
import { StationService }    from '../../services/StationService.js';
import '../AdminManagement/AddAdminModal.css';
import '../StationManagement/StationManagementPage.css';
import '../TrainPage/TrainsPage.css';
import '../TrainCoachesPage/TrainCoachesPage.css';
import './TrainInfoPage.css';

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

const fetchStations = async (search) => {
  const res = await StationService.getAllForDropdown(search || '');
  return (res.data.data || []).map(s => ({
    value: s.stationCode,
    label: `${s.stationCode} — ${s.stationName}`,
    raw: s,
  }));
};

// ── Add / Edit Stop Modal ─────────────────────────────────
const StopModal = ({ open, onClose, editItem, trainNumber, stops, onSuccess }) => {
  const { showError } = useToast();
  const isEdit = !!editItem;

  const EMPTY = {
    stationCode: '', stopNumber: '',
    kmFromSource: '', arrivalTime: '', departureTime: '', dayNumber: '1',
  };
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setForm({
        stationCode:   editItem.stationCode,
        stopNumber:    String(editItem.stopNumber),
        kmFromSource:  String(editItem.kmFromSource),
        arrivalTime:   editItem.arrivalTime   || '',
        departureTime: editItem.departureTime || '',
        dayNumber:     String(editItem.dayNumber),
      });
    } else {
      const next = stops.length > 0
        ? Math.max(...stops.map(s => s.stopNumber)) + 1 : 1;
      setForm({ ...EMPTY, stopNumber: String(next) });
    }
    setErrors({});
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open, editItem]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, saving, onClose]);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const isFirst = Number(form.stopNumber) === 1;
  const isLast  = stops.length > 0 &&
    Number(form.stopNumber) === Math.max(...stops.map(s => s.stopNumber)) + (isEdit ? 0 : 1);

  const validate = () => {
    const e = {};
    if (!isEdit && !form.stationCode) e.stationCode = 'Required.';
    const sn = Number(form.stopNumber);
    if (!form.stopNumber) e.stopNumber = 'Required.';
    else if (!Number.isInteger(sn) || sn < 1) e.stopNumber = 'Must be ≥ 1.';

    const km = Number(form.kmFromSource);
    if (form.kmFromSource === '') e.kmFromSource = 'Required.';
    else if (isNaN(km) || km < 0) e.kmFromSource = 'Cannot be negative.';
    else if (sn === 1 && km !== 0) e.kmFromSource = 'First stop must be 0 km.';

    // First stop: no arrival. Last stop: no departure.
    if (!isFirst && !form.arrivalTime) e.arrivalTime = 'Required for intermediate/last stop.';
    if (!isLast  && !form.departureTime) e.departureTime = 'Required for source/intermediate stop.';

    const dn = Number(form.dayNumber);
    if (!form.dayNumber) e.dayNumber = 'Required.';
    else if (!Number.isInteger(dn) || dn < 1 || dn > 7) e.dayNumber = '1–7.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = {
        kmFromSource:  Number(form.kmFromSource),
        arrivalTime:   form.arrivalTime   || null,
        departureTime: form.departureTime || null,
        dayNumber:     Number(form.dayNumber),
      };
      let res;
      if (isEdit) {
        res = await TrainStopService.updateStop(trainNumber, editItem.stopId, payload);
      } else {
        res = await TrainStopService.addStop(trainNumber, {
          stationCode: form.stationCode,
          stopNumber:  Number(form.stopNumber),
          ...payload,
        });
      }
      onSuccess(res.data.data, isEdit);
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to save stop.');
    } finally { setSaving(false); }
  };

  if (!open) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true" style={{ maxWidth: 500 }}>
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Milestone size={17} />
            </div>
            <div>
              <h2 className="aam-title">{isEdit ? 'Edit Stop' : 'Add Stop'}</h2>
              <p className="aam-subtitle">Train {trainNumber}</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18} /></button>
        </div>

        <div className="aam-body">
          {/* Station */}
          <Field label="Station" required error={errors.stationCode}>
            {isEdit ? (
              <>
                <input className="aam-input" value={`${editItem.stationCode} — ${editItem.stationName}`} disabled />
                <p className="aam-hint">Station is immutable. Delete and re-add to change.</p>
              </>
            ) : (
              <SearchableSelect
                value={form.stationCode}
                onChange={val => set('stationCode', val || '')}
                fetchOptions={fetchStations}
                placeholder="Search station…"
                disabled={saving}
                size="full"
              />
            )}
            {errors.stationCode && <p className="aam-error">{errors.stationCode}</p>}
          </Field>

          {/* Stop# + KM + Day */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-3)' }}>
            <Field label="Stop #" required error={errors.stopNumber} hint="Position in journey">
              <input
                className={`aam-input${errors.stopNumber ? ' aam-input--error' : ''}`}
                type="number" min={1}
                value={form.stopNumber}
                onChange={e => set('stopNumber', e.target.value)}
                disabled={saving || isEdit}
              />
            </Field>
            <Field label="KM from source" required error={errors.kmFromSource} hint="0 for first stop">
              <input
                className={`aam-input${errors.kmFromSource ? ' aam-input--error' : ''}`}
                type="number" min={0}
                placeholder="e.g. 302"
                value={form.kmFromSource}
                onChange={e => set('kmFromSource', e.target.value)}
                disabled={saving}
              />
            </Field>
            <Field label="Day #" required error={errors.dayNumber} hint="1 = same day">
              <input
                className={`aam-input${errors.dayNumber ? ' aam-input--error' : ''}`}
                type="number" min={1} max={7}
                value={form.dayNumber}
                onChange={e => set('dayNumber', e.target.value)}
                disabled={saving}
              />
            </Field>
          </div>

          {/* Arrival + Departure */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
            <Field label="Arrival Time" required={!isFirst} error={errors.arrivalTime}
                   hint={isFirst ? 'Not needed for first stop' : 'HH:MM (24hr)'}>
              <input
                className={`aam-input${errors.arrivalTime ? ' aam-input--error' : ''}`}
                type="time"
                value={form.arrivalTime}
                onChange={e => set('arrivalTime', e.target.value)}
                disabled={saving || isFirst}
              />
            </Field>
            <Field label="Departure Time" required={!isLast} error={errors.departureTime}
                   hint={isLast ? 'Not needed for last stop' : 'HH:MM (24hr)'}>
              <input
                className={`aam-input${errors.departureTime ? ' aam-input--error' : ''}`}
                type="time"
                value={form.departureTime}
                onChange={e => set('departureTime', e.target.value)}
                disabled={saving || isLast}
              />
            </Field>
          </div>
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="tip-submit-btn">
            {saving
              ? <><span className="aam-spinner" /> Saving…</>
              : isEdit ? 'Update Stop' : 'Add Stop'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Delete Confirm ────────────────────────────────────────
const DeleteConfirm = ({ open, onClose, onConfirm, stop, deleting }) => {
  if (!open || !stop) return null;
  return createPortal(
    <div className="aam-backdrop" onClick={deleting ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()}
           style={{ maxWidth: 400 }}>
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <AlertTriangle size={17} />
            </div>
            <div>
              <h2 className="aam-title">Remove Stop</h2>
              <p className="aam-subtitle">This cannot be undone.</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={deleting}><X size={18} /></button>
        </div>
        <div className="aam-body">
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
            Remove <strong>{stop.stationName} ({stop.stationCode})</strong> from stop #{stop.stopNumber}?
            All subsequent stop numbers will be re-sequenced automatically.
          </p>
        </div>
        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={deleting}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="tip-delete-btn">
            {deleting ? <><span className="aam-spinner" /> Removing…</> : 'Remove Stop'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Stops Tab ─────────────────────────────────────────────
const StopsTab = ({ trainNumber, stops, loading, onReload }) => {
  const { showSuccess, showError } = useToast();
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editItem,    setEditItem]    = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting,    setDeleting]    = useState(false);

  const handleStopSuccess = (saved, isEdit) => {
    showSuccess(saved.message || (isEdit ? 'Stop updated.' : 'Stop added.'));
    onReload();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await TrainStopService.deleteStop(trainNumber, deleteModal.stopId);
      showSuccess(`Stop ${deleteModal.stationCode} removed.`);
      setDeleteModal(null);
      onReload();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to remove stop.');
    } finally { setDeleting(false); }
  };

  return (
    <div className="tip-tab-content">
      <div className="tip-tab-header">
        <div>
          <p className="tip-tab-desc">
            Define the stations this train passes through, their order, distances and timings.
          </p>
        </div>
        <button className="btn btn-primary btn-sm"
                onClick={() => { setEditItem(null); setModalOpen(true); }}>
          <Plus size={14} /> Add Stop
        </button>
      </div>

      {loading ? (
        <div className="tip-timeline">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="tip-stop-row">
              <div className="tip-connector-col">
                {i > 0 && <div className="tip-line top" />}
                <div className="tip-dot" style={{ background: '#f1f5f9' }} />
                {i < 3 && <div className="tip-line bottom" />}
              </div>
              <div className="tip-stop-info" style={{ paddingBottom: 20 }}>
                <div className="sm-skeleton" style={{ width: '35%', marginBottom: 6 }} />
                <div className="sm-skeleton" style={{ width: '55%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : stops.length === 0 ? (
        <div className="sm-empty">
          <div className="sm-empty-icon"><Milestone size={24} /></div>
          <div className="sm-empty-title">No stops configured</div>
          <div className="sm-empty-desc">Add stations to define this train's journey path.</div>
        </div>
      ) : (
        <div className="tip-timeline">
          {stops.map((stop, idx) => {
            const isFirst = idx === 0;
            const isLast  = idx === stops.length - 1;
            return (
              <div key={stop.stopId} className="tip-stop-row">
                <div className="tip-connector-col">
                  {!isFirst && <div className="tip-line top" />}
                  <div className={`tip-dot${isFirst ? ' source' : isLast ? ' dest' : ''}`}>
                    {stop.stopNumber}
                  </div>
                  {!isLast && <div className="tip-line bottom" />}
                </div>

                <div className="tip-stop-body">
                  <div className="tip-stop-main">
                    <div className="tip-stop-header">
                      <span className="tip-station-code">{stop.stationCode}</span>
                      <span className="tip-station-name">{stop.stationName}</span>
                      {isFirst && <span className="tip-badge source">Source</span>}
                      {isLast  && <span className="tip-badge dest">Destination</span>}
                      {stop.dayNumber > 1 && (
                        <span className="tip-badge day">Day {stop.dayNumber}</span>
                      )}
                    </div>

                    <div className="tip-stop-timings">
                      {stop.arrivalTime && (
                        <span className="tip-timing arrival">
                          <Clock size={11} /> Arr {stop.arrivalTime}
                        </span>
                      )}
                      {stop.departureTime && (
                        <span className="tip-timing departure">
                          <Clock size={11} /> Dep {stop.departureTime}
                        </span>
                      )}
                      <span className="tip-timing km">
                        <Milestone size={11} /> {stop.kmFromSource} km
                      </span>
                      {stop.kmFromPrevious != null && (
                        <span className="tip-timing km-prev">
                          +{stop.kmFromPrevious} km
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sm-row-actions" style={{ alignSelf: 'center' }}>
                    <button className="sm-action-btn" title="Edit"
                            onClick={() => { setEditItem(stop); setModalOpen(true); }}>
                      <Pencil size={13} />
                    </button>
                    <button className="sm-action-btn danger" title="Remove"
                            onClick={() => setDeleteModal(stop)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <StopModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        editItem={editItem}
        trainNumber={trainNumber}
        stops={stops}
        onSuccess={handleStopSuccess}
      />
      <DeleteConfirm
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        stop={deleteModal}
        deleting={deleting}
      />
    </div>
  );
};

// ── Coaches Tab ───────────────────────────────────────────
const CoachesTab = ({ coaches, loading, onManage }) => (
  <div className="tip-tab-content">
    <div className="tip-tab-header">
      <p className="tip-tab-desc">
        Coach composition for this train. Manage seats, tatkal, RAC and waitlist limits.
      </p>
      <button className="btn btn-secondary btn-sm" onClick={onManage}>
        <Armchair size={14} /> Manage Coaches
      </button>
    </div>

    {loading ? (
      <div className="tc-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="tc-card tc-card-skeleton">
            <div className="sm-skeleton" style={{ width: '40%', height: 20, marginBottom: 8 }} />
            <div className="sm-skeleton" style={{ width: '65%', marginBottom: 16 }} />
            <div className="sm-skeleton" style={{ width: '80%' }} />
          </div>
        ))}
      </div>
    ) : coaches.length === 0 ? (
      <div className="sm-empty">
        <div className="sm-empty-icon"><Armchair size={24} /></div>
        <div className="sm-empty-title">No coaches configured</div>
        <div className="sm-empty-desc">
          Click "Manage Coaches" to add coach types to this train.
        </div>
      </div>
    ) : (
      <div className="tc-grid">
        {coaches.map(coach => (
          <div key={coach.coachId}
               className={`tc-card${!coach.isActive ? ' tc-card-inactive' : ''}`}>
            <div className="tc-card-header">
              <div className="tc-card-type">
                <span className="tc-code-badge">{coach.coachTypeCode}</span>
                {coach.isAc
                  ? <span className="tc-ac-tag"><Snowflake size={10} /> AC</span>
                  : <span className="tc-non-ac-tag"><Wind size={10} /> Non-AC</span>}
              </div>
              {!coach.isActive && <div className="tc-inactive-banner">Inactive</div>}
            </div>
            <div className="tc-card-name">{coach.coachTypeName}</div>
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
            <div className="tc-card-stats">
              <div className="tc-stat">
                <span className="tc-stat-label">Total seats</span>
                <span className="tc-stat-value" style={{ color: '#16a34a' }}>{coach.totalCoachSeats}</span>
              </div>
              <div className="tc-stat">
                <span className="tc-stat-label">Tatkal</span>
                <span className="tc-stat-value" style={{ color: '#d97706' }}>{coach.totalTatkalSeats}</span>
              </div>
              <div className="tc-stat">
                <span className="tc-stat-label">RAC</span>
                <span className="tc-stat-value" style={{ color: '#7c3aed' }}>{coach.totalRacSeats}</span>
              </div>
              <div className="tc-stat">
                <span className="tc-stat-label">WL limit</span>
                <span className="tc-stat-value" style={{ color: '#0369a1' }}>{coach.waitlistLimit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ── Schedules Tab ─────────────────────────────────────────
const SchedulesTab = () => (
  <div className="tip-tab-content">
    <div className="sm-empty">
      <div className="sm-empty-icon"><CalendarClock size={24} /></div>
      <div className="sm-empty-title">Schedules coming soon</div>
      <div className="sm-empty-desc">
        Once stops and coaches are configured, you can create schedules here.
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────
const TrainInfoPage = () => {
  const { trainNumber } = useParams();
  const navigate        = useNavigate();
  const { showError }   = useToast();

  const [train,        setTrain]        = useState(null);
  const [stops,        setStops]        = useState([]);
  const [coaches,      setCoaches]      = useState([]);
  const [loadingTrain, setLoadingTrain] = useState(true);
  const [loadingStops, setLoadingStops] = useState(true);
  const [loadingCoach, setLoadingCoach] = useState(true);
  const [activeTab,    setActiveTab]    = useState('stops');

  const loadTrain = useCallback(async () => {
    setLoadingTrain(true);
    try {
      const res = await TrainService.getTrainByNumber(trainNumber);
      setTrain(res.data.data);
    } catch {
      showError('Failed to load train details.');
    } finally { setLoadingTrain(false); }
  }, [trainNumber]);

  const loadStops = useCallback(async () => {
    setLoadingStops(true);
    try {
      const res = await TrainStopService.getAllByTrain(trainNumber);
      setStops(res.data.data || []);
    } catch {
      //showError('Failed to load stops.');
    } finally { setLoadingStops(false); }
  }, [trainNumber]);

  const loadCoaches = useCallback(async () => {
    setLoadingCoach(true);
    try {
      const res = await TrainCoachService.getAllByTrain(trainNumber);
      setCoaches(res.data.data || []);
    } catch {
      showError('Failed to load coaches.');
    } finally { setLoadingCoach(false); }
  }, [trainNumber]);

  useEffect(() => {
    loadTrain();
    loadStops();
    loadCoaches();
  }, [trainNumber]);

  // Derived stats
  const activeCoaches   = coaches.filter(c => c.isActive);
  const totalSeats      = activeCoaches.reduce((s, c) => s + c.totalCoachSeats, 0);
  const totalKm         = stops.length > 0
    ? stops[stops.length - 1]?.kmFromSource : null;
  const sourceStation   = stops[0];
  const destStation     = stops[stops.length - 1];

  const TABS = [
    { key: 'stops',     label: 'Stops',     icon: <Milestone size={14} />,     count: stops.length },
    { key: 'coaches',   label: 'Coaches',   icon: <Armchair size={14} />,      count: coaches.length },
    { key: 'schedules', label: 'Schedules', icon: <CalendarClock size={14} />, count: null },
  ];

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="tip-header">
        <div className="tip-header-left">
          <button className="tc-back-btn" onClick={() => navigate('/trains')}>
            <ArrowLeft size={16} />
          </button>
          <div className="tip-train-identity">
            {loadingTrain ? (
              <>
                <div className="sm-skeleton" style={{ width: 120, height: 28, marginBottom: 6 }} />
                <div className="sm-skeleton" style={{ width: 200, height: 16 }} />
              </>
            ) : (
              <>
                <div className="tip-train-title-row">
                  <code className="tip-train-number">{trainNumber}</code>
                  <h1 className="tip-train-name">{train?.trainName || '—'}</h1>
                </div>
                <div className="tip-train-tags">
                  <span className="tip-tag zone">
                    {train?.zoneCode} Zone
                  </span>
                  <span className="tip-tag type">
                    {train?.trainTypeName || train?.trainTypeCode}
                  </span>
                  {train?.isSuperfast && (
                    <span className="tip-tag superfast">
                      <Zap size={10} /> Superfast
                    </span>
                  )}
                  {train?.pantrycar && (
                    <span className="tip-tag pantry">
                      <UtensilsCrossed size={10} /> Pantry
                    </span>
                  )}
                  <span className={`sm-status-badge ${train?.isActive ? 'active' : 'inactive'}`}>
                    <span className="sm-status-dot" />
                    {train?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Journey summary strip ── */}
      {!loadingStops && stops.length > 0 && (
        <div className="tip-journey-strip">
          <div className="tip-journey-endpoint">
            <span className="tip-journey-code">{sourceStation?.stationCode}</span>
            <span className="tip-journey-station">{sourceStation?.stationName}</span>
            <span className="tip-journey-time">{sourceStation?.departureTime || '—'}</span>
          </div>
          <div className="tip-journey-middle">
            <div className="tip-journey-line">
              <div className="tip-journey-dot" />
              <div className="tip-journey-track" />
              {stops.slice(1, -1).map((s, i) => (
                <div key={i} className="tip-journey-intermediate" title={s.stationName} />
              ))}
              <div className="tip-journey-track" />
              <div className="tip-journey-dot dest" />
            </div>
            <div className="tip-journey-meta">
              <span>{stops.length} stops</span>
              {totalKm && <span>{totalKm} km</span>}
              {totalSeats > 0 && <span>{totalSeats} seats</span>}
            </div>
          </div>
          <div className="tip-journey-endpoint dest">
            <span className="tip-journey-code">{destStation?.stationCode}</span>
            <span className="tip-journey-station">{destStation?.stationName}</span>
            <span className="tip-journey-time">{destStation?.arrivalTime || '—'}</span>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="tip-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tip-tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}>
            {tab.icon}
            {tab.label}
            {tab.count != null && (
              <span className="tip-tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="card tip-card">
        {activeTab === 'stops' && (
          <StopsTab
            trainNumber={trainNumber}
            stops={stops}
            loading={loadingStops}
            onReload={loadStops}
          />
        )}
        {activeTab === 'coaches' && (
          <CoachesTab
            coaches={coaches}
            loading={loadingCoach}
            onManage={() => navigate(`/trains/${trainNumber}/coaches`)}
          />
        )}
        {activeTab === 'schedules' && <SchedulesTab />}
      </div>
    </div>
  );
};

export default TrainInfoPage;
