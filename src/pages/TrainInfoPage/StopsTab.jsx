import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Pencil, Trash2, X, AlertTriangle,
  Milestone, Clock, Train, MapPin, ChevronRight,Copy, Wand2
} from 'lucide-react';
import { TrainStopService } from '../../services/TrainStopService.js';
import { StationService }   from '../../services/StationService.js';
import { useToast }         from '../../context/Toast/useToast.js';
import SearchableSelect     from '../../components/UI/SearchableSelect/SearchableSelect.jsx';
import '../AdminManagement/AddAdminModal.css';
import './StopsTab.css';
import {fetchStations} from "../../utils/searchFetchers.js";
import GenerateStopsModal from './GenerateStopsModal.jsx';
import CopyStopsModal     from './CopyStopsModal.jsx';

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────
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



const fmtTime = (t) => {
  if (!t) return null;
  return t.length > 5 ? t.substring(0, 5) : t;
};

// ─────────────────────────────────────────────────
// Stop Modal — Add / Edit
// ─────────────────────────────────────────────────
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
        arrivalTime:   fmtTime(editItem.arrivalTime)   || '',
        departureTime: fmtTime(editItem.departureTime) || '',
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

  const first = Number(form.stopNumber) === 1;
  const last  = (() => {
    if (stops.length === 0) return false;
    const max = Math.max(...stops.map(s => s.stopNumber));
    return Number(form.stopNumber) === (isEdit ? max : max + 1);
  })();

  const validate = () => {
    const e = {};
    if (!isEdit && !form.stationCode) e.stationCode = 'Please select a station.';

    const sn = Number(form.stopNumber);
    if (!form.stopNumber || !Number.isInteger(sn) || sn < 1)
      e.stopNumber = 'Must be a whole number ≥ 1.';

    const km = Number(form.kmFromSource);
    if (form.kmFromSource === '')      e.kmFromSource = 'Required.';
    else if (isNaN(km) || km < 0)     e.kmFromSource = 'Cannot be negative.';
    else if (sn === 1 && km !== 0)    e.kmFromSource = 'Must be 0 for the first stop.';

    // Client-side KM ordering
    if (!isNaN(km) && km >= 0 && stops.length > 0) {
      const sorted = [...stops].sort((a, b) => a.stopNumber - b.stopNumber);
      const prevStop = sorted.filter(s =>
        isEdit ? s.stopNumber < sn && s.stopId !== editItem.stopId
          : s.stopNumber < sn
      ).pop();
      const nextStop = sorted.find(s =>
        isEdit ? s.stopNumber > sn && s.stopId !== editItem.stopId
          : s.stopNumber >= sn
      );
      if (prevStop && km <= prevStop.kmFromSource)
        e.kmFromSource = `Must be > ${prevStop.kmFromSource} km (${prevStop.stationCode}).`;
      if (nextStop && km >= nextStop.kmFromSource)
        e.kmFromSource = `Must be < ${nextStop.kmFromSource} km (${nextStop.stationCode}).`;
    }

    if (!first && !form.arrivalTime)   e.arrivalTime   = 'Required for non-source stops.';
    if (!last  && !form.departureTime) e.departureTime = 'Required for non-destination stops.';
    if (first  && form.arrivalTime)    e.arrivalTime   = 'Source stop has no arrival.';
    if (last   && form.departureTime)  e.departureTime = 'Destination stop has no departure.';

    const dn = Number(form.dayNumber);
    if (!form.dayNumber || !Number.isInteger(dn) || dn < 1 || dn > 7)
      e.dayNumber = 'Must be between 1 and 7.';

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
      const res = isEdit
        ? await TrainStopService.updateStop(trainNumber, editItem.stopId, payload)
        : await TrainStopService.addStop(trainNumber, {
          stationCode: form.stationCode,
          stopNumber:  Number(form.stopNumber),
          ...payload,
        });
      onSuccess(res.data.data, isEdit);
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to save stop.');
    } finally { setSaving(false); }
  };

  if (!open) return null;
  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal tst-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true">
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon tst-header-icon">
              <Milestone size={17} />
            </div>
            <div>
              <h2 className="aam-title">{isEdit ? 'Edit Stop' : 'Add Stop'}</h2>
              <p className="aam-subtitle">Train · {trainNumber}</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18}/></button>
        </div>

        <div className="aam-body">
          {/* Station */}
          <Field label="Station" required error={errors.stationCode}>
            {isEdit ? (
              <div className="tst-immutable-station">
                <MapPin size={14} />
                <span>{editItem.stationCode} — {editItem.stationName}</span>
                <span className="tst-immutable-note">Cannot change — delete &amp; re-add</span>
              </div>
            ) : (
              <SearchableSelect
                value={form.stationCode}
                onChange={val => set('stationCode', val || '')}
                fetchOptions={fetchStations}
                placeholder="Search by code or name…"
                disabled={saving}
                size="full"
              />
            )}
          </Field>

          {/* Stop# / KM / Day */}
          <div className="tst-row-3">
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

          {/* Arrival / Departure */}
          <div className="tst-row-2">
            <Field
              label="Arrival Time" required={!first} error={errors.arrivalTime}
              hint={first ? 'Not applicable for source stop' : 'HH:MM (24-hour)'}>
              <input
                className={`aam-input${errors.arrivalTime ? ' aam-input--error' : ''}`}
                type="time"
                value={form.arrivalTime}
                onChange={e => set('arrivalTime', e.target.value)}
                disabled={saving || first}
              />
            </Field>
            <Field
              label="Departure Time" required={!last} error={errors.departureTime}
              hint={last ? 'Not applicable for destination stop' : 'HH:MM (24-hour)'}>
              <input
                className={`aam-input${errors.departureTime ? ' aam-input--error' : ''}`}
                type="time"
                value={form.departureTime}
                onChange={e => set('departureTime', e.target.value)}
                disabled={saving || last}
              />
            </Field>
          </div>

          {/* Info pills */}
          <div className="tst-info-pills">
            {first && <span className="tst-pill green">Source — no arrival needed</span>}
            {last  && <span className="tst-pill red">Destination — no departure needed</span>}
            {!first && !last && stops.length > 0 && (
              <span className="tst-pill blue">Intermediate stop</span>
            )}
            {Number(form.dayNumber) > 1 && (
              <span className="tst-pill amber">Overnight · Day {form.dayNumber}</span>
            )}
          </div>
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="tst-submit-btn" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><span className="aam-spinner"/> Saving…</>
              : isEdit ? 'Update Stop' : 'Add Stop'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─────────────────────────────────────────────────
// Delete Confirm
// ─────────────────────────────────────────────────
const DeleteConfirm = ({ open, onClose, onConfirm, stop, deleting }) => {
  if (!open || !stop) return null;
  return createPortal(
    <div className="aam-backdrop" onClick={deleting ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <AlertTriangle size={17}/>
            </div>
            <div>
              <h2 className="aam-title">Remove Stop</h2>
              <p className="aam-subtitle">This action cannot be undone</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={deleting}><X size={18}/></button>
        </div>
        <div className="aam-body">
          <p className="tst-delete-msg">
            Remove <strong>{stop.stationName}</strong>
            <span className="tst-code-chip">{stop.stationCode}</span>
            from stop <strong>#{stop.stopNumber}</strong>?
          </p>
          <div className="tst-delete-notice">
            <AlertTriangle size={13}/>
            All subsequent stop numbers will be re-sequenced automatically.
          </div>
        </div>
        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="tst-delete-btn" onClick={onConfirm} disabled={deleting}>
            {deleting ? <><span className="aam-spinner"/> Removing…</> : 'Remove Stop'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─────────────────────────────────────────────────
// StopsTab — default export
// ─────────────────────────────────────────────────
const StopsTab = ({ trainNumber, stops, loading, onReload, hasSchedule }) => {
  const { showSuccess, showError } = useToast();
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editItem,    setEditItem]    = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting,    setDeleting]    = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [copyOpen,     setCopyOpen]     = useState(false);

  const hasStops   = stops.length > 0;
  const isRouteSet = hasStops &&
    stops[0].arrivalTime === null &&                      // first stop has no arrival
    stops[stops.length - 1].departureTime === null;

  const showBulkButtons = !hasStops && !hasSchedule;

  const openAdd   = ()  => { setEditItem(null); setModalOpen(true); };
  const openEdit  = (s) => { setEditItem(s);    setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleSuccess = (saved, isEdit) => {
    showSuccess(saved?.message || (isEdit ? 'Stop updated.' : 'Stop added.'));
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

  const totalKm = stops.length > 1 ? stops[stops.length - 1]?.kmFromSource : null;
  const maxDay  = stops.length > 0 ? Math.max(...stops.map(s => s.dayNumber)) : 1;

  return (
    <div className="tst-root">

      {/* Tab header */}
      <div className="tst-tab-header">
        <div className="tst-tab-meta">
          <p className="tst-tab-desc">
            Define stations, distances and scheduled timings for this train's route.
          </p>
          {!loading && stops.length > 0 && (
            <div className="tst-summary-pills">
              <span className="tst-sum-pill">
                <Train size={12}/> {stops.length} stops
              </span>
              {totalKm != null && (
                <span className="tst-sum-pill">
                  <Milestone size={12}/> {totalKm} km total
                </span>
              )}
              {maxDay > 1 && (
                <span className="tst-sum-pill amber">
                  <Clock size={12}/> {maxDay}-day journey
                </span>
              )}
            </div>
          )}
        </div>
          <div className="tst-header-buttons">
          {showBulkButtons && (
          <>
          <button className="tst-generate-btn" onClick={() => setGenerateOpen(true)}>
          <Wand2 size={14}/> Generate Stops
          </button>
          <button className="tst-copy-btn" onClick={() => setCopyOpen(true)}>
          <Copy size={14}/> Copy from Train
          </button>
          </>
          )}
          <button className="tst-add-btn" onClick={openAdd}>
          <Plus size={14}/> Add Stop
          </button>
          </div>

          </div>

      {/* Timeline */}
      {loading ? (
        <div className="tst-timeline">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="tst-row">
              <div className="tst-spine">
                {i > 0 && <div className="tst-line top"/>}
                <div className="tst-dot skeleton"/>
                {i < 3 && <div className="tst-line bottom"/>}
              </div>
              <div className="tst-card skeleton-card">
                <div className="sm-skeleton" style={{ width: '30%', height: 16, marginBottom: 8 }}/>
                <div className="sm-skeleton" style={{ width: '55%', height: 13 }}/>
              </div>
            </div>
          ))}
        </div>
      ) : stops.length === 0 ? (
        <div className="tst-empty">
          <div className="tst-empty-icon"><Milestone size={28}/></div>
          <div className="tst-empty-title">No stops yet</div>
          <div className="tst-empty-desc">Add stations to map out this train's journey.</div>
          <button className="tst-add-btn" onClick={openAdd} style={{ marginTop: 16 }}>
            <Plus size={14}/> Add First Stop
          </button>
        </div>
      ) : (
        <div className="tst-timeline">
          {stops.map((stop, idx) => {
            const isFirst = idx === 0;
            const isLast  = idx === stops.length - 1;
            return (
              <div key={stop.stopId} className="tst-row">
                <div className="tst-spine">
                  {!isFirst && <div className="tst-line top"/>}
                  <div className={`tst-dot${isFirst ? ' source' : isLast ? ' dest' : ''}`}>
                    <span className="tst-dot-num">{stop.stopNumber}</span>
                  </div>
                  {!isLast && <div className="tst-line bottom"/>}
                </div>

                <div className={`tst-card${isFirst ? ' source' : isLast ? ' dest' : ''}`}>
                  <div className="tst-card-top">
                    <div className="tst-card-left">
                      <div className="tst-station-row">
                        <span className="tst-station-code">{stop.stationCode}</span>
                        <span className="tst-station-name">{stop.stationName}</span>
                        {isFirst && <span className="tst-badge source">Source</span>}
                        {isLast  && <span className="tst-badge dest">Destination</span>}
                        {stop.dayNumber > 1 && (
                          <span className="tst-badge day">Day {stop.dayNumber}</span>
                        )}
                        {stop.stationType && (
                          <span className="tst-badge type">{stop.stationType}</span>
                        )}
                      </div>

                      <div className="tst-timings-row">
                        {stop.arrivalTime && (
                          <span className="tst-timing arr">
                            <Clock size={11}/> Arr&nbsp;{fmtTime(stop.arrivalTime)}
                          </span>
                        )}
                        {stop.arrivalTime && stop.departureTime && (
                          <ChevronRight size={11} className="tst-timing-sep"/>
                        )}
                        {stop.departureTime && (
                          <span className="tst-timing dep">
                            <Clock size={11}/> Dep&nbsp;{fmtTime(stop.departureTime)}
                          </span>
                        )}
                        <span className="tst-timing km">
                          <Milestone size={11}/> {stop.kmFromSource} km
                        </span>
                        {stop.kmFromPrevious != null && (
                          <span className="tst-timing km-prev">
                            +{stop.kmFromPrevious} km
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="tst-actions">
                      <button className="tst-action-btn" title="Edit stop"
                              onClick={() => openEdit(stop)}>
                        <Pencil size={13}/>
                      </button>
                      <button className="tst-action-btn danger" title="Remove stop"
                              onClick={() => setDeleteModal(stop)}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <StopModal
        open={modalOpen}
        onClose={closeModal}
        editItem={editItem}
        trainNumber={trainNumber}
        stops={stops}
        onSuccess={handleSuccess}
      />
      <DeleteConfirm
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        stop={deleteModal}
        deleting={deleting}
      />
      <GenerateStopsModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        trainNumber={trainNumber}
        onSuccess={() => { setGenerateOpen(false); onReload(); }}
      />
      <CopyStopsModal
        open={copyOpen}
        onClose={() => setCopyOpen(false)}
        sourceTrainNumber={trainNumber}
        onSuccess={() => { setCopyOpen(false); onReload(); }}
      />
    </div>
  );
};

export default StopsTab;
