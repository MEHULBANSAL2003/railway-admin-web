import { useState, useEffect } from 'react';
import { createPortal }        from 'react-dom';
import { Copy, X, AlertTriangle, Milestone } from 'lucide-react';
import { TrainStopService } from '../../services/TrainStopService.js';
import { useToast }         from '../../context/Toast/useToast.js';
import SearchableSelect     from '../../components/UI/SearchableSelect/SearchableSelect.jsx';
import { fetchTrains }      from '../../utils/searchFetchers.js';
import '../AdminManagement/AddAdminModal.css';
import './CopyStopsModal.css';

// currentTrainNumber = the train we're ON (no stops, will receive the copy)
// selectedTrain      = the train user picks (has stops, will be the source)
const CopyStopsModal = ({ open, onClose, sourceTrainNumber: currentTrainNumber, onSuccess }) => {
  const { showError } = useToast();

  const [step,         setStep]         = useState(1);
  const [selectedTrain,setSelectedTrain]= useState('');
  const [preview,      setPreview]      = useState(null);
  const [rows,         setRows]         = useState([]);
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setSelectedTrain('');
    setPreview(null);
    setRows([]);
    setErrors({});
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape' && !loading && !saving) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, loading, saving, onClose]);

  const handleFetchPreview = async () => {
    if (!selectedTrain) { setErrors({ _global: 'Please select a train to copy from.' }); return; }
    setLoading(true);
    setErrors({});
    try {
      // source = selectedTrain (has stops), target = currentTrainNumber (no stops)
      const res = await TrainStopService.getCopyPreview(selectedTrain, currentTrainNumber);
      const data = res.data.data;
      setPreview(data);
      setRows(data.stops.map(s => ({
        stopNumber:    s.stopNumber,
        stationCode:   s.stationCode,
        stationName:   s.stationName,
        kmFromSource:  s.kmFromSource,
        dayNumber:     String(s.dayNumber),
        isFirst:       s.stopNumber === 1,                    // derive from stopNumber — safe
        isLast:        s.stopNumber === data.stopCount,       // derive from stopCount  — safe
        arrivalTime:   '',
        departureTime: '',
      })));
      setStep(2);
    } catch (err) {
      setErrors({ _global: err?.response?.data?.error?.message || 'Failed to load preview.' });
    } finally { setLoading(false); }
  };

  const updateRow = (stopNumber, field, value) => {
    setRows(prev => prev.map(r =>
      r.stopNumber === stopNumber ? { ...r, [field]: value } : r
    ));
    setErrors(prev => {
      const next = { ...prev };
      if (next[stopNumber]) delete next[stopNumber][field];
      return next;
    });
  };

  const validate = () => {
    const e = {};
    let valid = true;
    rows.forEach(row => {
      const rowErr = {};
      if (!row.isFirst && !row.arrivalTime)   { rowErr.arrivalTime   = 'Required.'; valid = false; }
      if (!row.isLast  && !row.departureTime) { rowErr.departureTime = 'Required.'; valid = false; }
      const dn = Number(row.dayNumber);
      if (!row.dayNumber || dn < 1 || dn > 7) { rowErr.dayNumber = '1–7.'; valid = false; }
      if (Object.keys(rowErr).length) e[row.stopNumber] = rowErr;
    });
    setErrors(e);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const stops = rows.map(row => ({
        stationCode:   row.stationCode,
        stopNumber:    row.stopNumber,
        kmFromSource:  row.kmFromSource,
        arrivalTime:   row.arrivalTime   || null,
        departureTime: row.departureTime || null,
        dayNumber:     Number(row.dayNumber),
      }));
      // Save to currentTrainNumber (the train that has no stops)
      await TrainStopService.bulkAddStops(currentTrainNumber, stops);
      onSuccess();
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to copy stops.');
    } finally { setSaving(false); }
  };

  if (!open) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={(loading || saving) ? undefined : onClose}>
      <div className="aam-modal csm-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true">

        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Copy size={17}/>
            </div>
            <div>
              <h2 className="aam-title">Copy Stops</h2>
              <p className="aam-subtitle">
                {step === 1
                  ? `Into Train ${currentTrainNumber} · select source`
                  : `${selectedTrain} → ${currentTrainNumber} · fill timings`}
              </p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={loading || saving}>
            <X size={18}/>
          </button>
        </div>

        <div className="aam-body csm-body">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <div className="aam-field">
                <label className="aam-label">
                  Copy Stops From <span className="aam-required">*</span>
                </label>
                <SearchableSelect
                  value={selectedTrain}
                  onChange={(val) => { setSelectedTrain(val || ''); setErrors({}); }}
                  fetchOptions={async (search) => {
                    const all = await fetchTrains(search);
                    return all.filter(t => t.value !== currentTrainNumber);
                  }}
                  placeholder="Search train number or name…"
                  disabled={loading}
                  size="full"
                />
              </div>

              <div className="csm-info">
                <Milestone size={13}/>
                <span>
                  Stops from the selected train will be copied in{' '}
                  <strong>reverse order</strong> with recalculated km into train{' '}
                  <strong>{currentTrainNumber}</strong>. You fill the timings next.
                </span>
              </div>

              <div className="csm-warning">
                <AlertTriangle size={13}/>
                <span>Train <strong>{currentTrainNumber}</strong> must have no existing stops.</span>
              </div>

              {errors._global && (
                <div className="csm-error"><AlertTriangle size={13}/>{errors._global}</div>
              )}
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && preview && (
            <>
              <div className="csm-preview-header">
                <span>{preview.stopCount} stops · fill arrival &amp; departure times</span>
              </div>

              <div className="csm-table-head">
                <span className="csm-col-num">#</span>
                <span className="csm-col-station">Station</span>
                <span className="csm-col-km">KM</span>
                <span className="csm-col-time">Arrival</span>
                <span className="csm-col-time">Departure</span>
                <span className="csm-col-day">Day</span>
              </div>

              <div className="csm-table-body">
                {rows.map((row) => {
                  const rowErr = errors[row.stopNumber] || {};
                  return (
                    <div key={row.stopNumber}
                         className={`csm-table-row${row.isFirst ? ' first' : row.isLast ? ' last' : ''}`}>

                      <span className="csm-col-num">{row.stopNumber}</span>

                      <div className="csm-col-station">
                        <span className="csm-station-code">{row.stationCode}</span>
                        <span className="csm-station-name">{row.stationName}</span>
                        {row.isFirst && <span className="csm-badge src">Source</span>}
                        {row.isLast  && <span className="csm-badge dst">Dest</span>}
                      </div>

                      <span className="csm-col-km">{row.kmFromSource}</span>

                      {/* Arrival — blocked for first stop */}
                      <div className="csm-col-time">
                        {row.isFirst ? (
                          <span className="csm-na">—</span>
                        ) : (
                          <>
                            <input
                              className={`csm-time-input${rowErr.arrivalTime ? ' error' : ''}`}
                              type="time"
                              value={row.arrivalTime}
                              onChange={e => updateRow(row.stopNumber, 'arrivalTime', e.target.value)}
                              disabled={saving}
                            />
                            {rowErr.arrivalTime && <span className="csm-cell-err">{rowErr.arrivalTime}</span>}
                          </>
                        )}
                      </div>

                      {/* Departure — blocked for last stop */}
                      <div className="csm-col-time">
                        {row.isLast ? (
                          <span className="csm-na">—</span>
                        ) : (
                          <>
                            <input
                              className={`csm-time-input${rowErr.departureTime ? ' error' : ''}`}
                              type="time"
                              value={row.departureTime}
                              onChange={e => updateRow(row.stopNumber, 'departureTime', e.target.value)}
                              disabled={saving}
                            />
                            {rowErr.departureTime && <span className="csm-cell-err">{rowErr.departureTime}</span>}
                          </>
                        )}
                      </div>

                      {/* Day */}
                      <div className="csm-col-day">
                        <input
                          className={`csm-day-input${rowErr.dayNumber ? ' error' : ''}`}
                          type="number" min={1} max={7}
                          value={row.dayNumber}
                          onChange={e => updateRow(row.stopNumber, 'dayNumber', e.target.value)}
                          disabled={saving}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="aam-footer">
          {step === 2 && (
            <button className="btn btn-secondary"
                    onClick={() => { setStep(1); setErrors({}); }}
                    disabled={saving}>
              ← Back
            </button>
          )}
          {step === 1 && (
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          )}
          {step === 1 && (
            <button className="csm-next-btn"
                    onClick={handleFetchPreview}
                    disabled={loading || !selectedTrain}>
              {loading ? <><span className="aam-spinner"/> Loading…</> : 'Preview Stops →'}
            </button>
          )}
          {step === 2 && (
            <button className="csm-submit-btn" onClick={handleSubmit} disabled={saving}>
              {saving
                ? <><span className="aam-spinner"/> Copying…</>
                : <><Copy size={14}/> Copy {rows.length} Stops</>}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CopyStopsModal;
