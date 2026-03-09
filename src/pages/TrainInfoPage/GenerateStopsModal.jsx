import { useState, useEffect } from 'react';
import { createPortal }        from 'react-dom';
import {
  Milestone, Plus, Trash2, X, AlertTriangle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { TrainStopService } from '../../services/TrainStopService.js';
import { useToast }         from '../../context/Toast/useToast.js';
import SearchableSelect     from '../../components/UI/SearchableSelect/SearchableSelect.jsx';
import { fetchStations }    from '../../utils/searchFetchers.js';
import '../AdminManagement/AddAdminModal.css';
import './GenerateStopsModal.css';

// ── Empty row factory ─────────────────────────────────────────────────────────
const emptyRow = (stopNumber) => ({
  _id:          Date.now() + stopNumber,   // local key only
  stationCode:  '',
  stationName:  '',
  kmFromSource: stopNumber === 1 ? '0' : '',
  arrivalTime:  '',
  departureTime:'',
  dayNumber:    '1',
  isLast:       false,
});

// ── Single stop row ───────────────────────────────────────────────────────────
const StopRow = ({ row, index, total, onUpdate, onRemove, errors, disabled }) => {
  const isFirst  = index === 0;
  const isLast   = row.isLast || index === total - 1;
  const canRemove = total > 2 && !isFirst;  // always keep at least 2, keep first

  const set = (k, v) => onUpdate(row._id, k, v);

  return (
    <div className={`gsm-row${isFirst ? ' first' : isLast ? ' last' : ''}`}>
      {/* Stop number badge */}
      <div className="gsm-row-num">{index + 1}</div>

      <div className="gsm-row-body">

        {/* Row 1 — station + km + day */}
        <div className="gsm-row-top">
          <div className="gsm-field gsm-station">
            <SearchableSelect
              value={row.stationCode}
              onChange={(val, opt) => {
                set('stationCode', val || '');
                set('stationName', opt?.raw?.stationName || '');
              }}
              fetchOptions={fetchStations}
              placeholder={isFirst ? 'Source station…' : isLast ? 'Destination station…' : 'Station…'}
              disabled={disabled}
              size="full"
            />
            {errors?.stationCode && <p className="aam-error">{errors.stationCode}</p>}
          </div>

          <div className="gsm-field gsm-km">
            <input
              className={`aam-input${errors?.kmFromSource ? ' aam-input--error' : ''}`}
              type="number" min={0}
              placeholder="KM"
              value={row.kmFromSource}
              onChange={e => set('kmFromSource', e.target.value)}
              disabled={disabled || isFirst}  // first stop always 0
            />
            {errors?.kmFromSource && <p className="aam-error">{errors.kmFromSource}</p>}
          </div>

          <div className="gsm-field gsm-day">
            <input
              className="aam-input"
              type="number" min={1} max={7}
              placeholder="Day"
              value={row.dayNumber}
              onChange={e => set('dayNumber', e.target.value)}
              disabled={disabled}
            />
          </div>

          {canRemove && (
            <button className="gsm-remove-btn" onClick={() => onRemove(row._id)}
                    disabled={disabled} type="button" title="Remove stop">
              <Trash2 size={13}/>
            </button>
          )}
        </div>

        {/* Row 2 — arrival / departure times */}
        <div className="gsm-row-times">
          <div className="gsm-field">
            <label className="gsm-time-label">
              Arrival
              {isFirst && <span className="gsm-na">N/A (source)</span>}
            </label>
            <input
              className={`aam-input${errors?.arrivalTime ? ' aam-input--error' : ''}`}
              type="time"
              value={row.arrivalTime}
              onChange={e => set('arrivalTime', e.target.value)}
              disabled={disabled || isFirst}
            />
            {errors?.arrivalTime && <p className="aam-error">{errors.arrivalTime}</p>}
          </div>

          <div className="gsm-field">
            <label className="gsm-time-label">
              Departure
              {isLast && <span className="gsm-na">N/A (destination)</span>}
            </label>
            <input
              className={`aam-input${errors?.departureTime ? ' aam-input--error' : ''}`}
              type="time"
              value={row.departureTime}
              onChange={e => set('departureTime', e.target.value)}
              disabled={disabled || isLast}
            />
            {errors?.departureTime && <p className="aam-error">{errors.departureTime}</p>}
          </div>
        </div>

        {/* Last stop checkbox — only on last row */}
        {index === total - 1 && total > 1 && (
          <label className="gsm-last-check">
            <input type="checkbox" checked={true} readOnly disabled/>
            <span>This is the destination (no departure time)</span>
          </label>
        )}
      </div>
    </div>
  );
};

// ── GenerateStopsModal ────────────────────────────────────────────────────────
const GenerateStopsModal = ({ open, onClose, trainNumber, onSuccess }) => {
  const { showError } = useToast();
  const [rows,    setRows]    = useState([emptyRow(1), emptyRow(2)]);
  const [errors,  setErrors]  = useState({});  // keyed by _id.field
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (!open) return;
    setRows([emptyRow(1), emptyRow(2)]);
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

  const addRow = () => {
    setRows(prev => {
      // Insert before last row (last row is always destination)
      const newRow = emptyRow(prev.length);
      return [...prev.slice(0, -1), newRow, prev[prev.length - 1]];
    });
  };

  const removeRow = (id) => {
    setRows(prev => prev.filter(r => r._id !== id));
    setErrors(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateRow = (id, key, val) => {
    setRows(prev => prev.map(r => r._id === id ? { ...r, [key]: val } : r));
    setErrors(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id][key];
      return next;
    });
  };

  const validate = () => {
    const e = {};
    let valid = true;

    rows.forEach((row, idx) => {
      const rowErr = {};
      const isFirst = idx === 0;
      const isLast  = idx === rows.length - 1;

      if (!row.stationCode) { rowErr.stationCode = 'Required.'; valid = false; }

      const km = Number(row.kmFromSource);
      if (row.kmFromSource === '') { rowErr.kmFromSource = 'Required.'; valid = false; }
      else if (isNaN(km) || km < 0) { rowErr.kmFromSource = 'Invalid.'; valid = false; }
      else if (isFirst && km !== 0) { rowErr.kmFromSource = 'Must be 0.'; valid = false; }

      // KM ordering
      if (idx > 0 && !isNaN(km)) {
        const prevKm = Number(rows[idx - 1].kmFromSource);
        if (!isNaN(prevKm) && km <= prevKm) {
          rowErr.kmFromSource = `Must be > ${prevKm} km.`;
          valid = false;
        }
      }

      if (!isFirst && !row.arrivalTime) { rowErr.arrivalTime = 'Required.'; valid = false; }
      if (!isLast  && !row.departureTime) { rowErr.departureTime = 'Required.'; valid = false; }

      const dn = Number(row.dayNumber);
      if (!row.dayNumber || dn < 1 || dn > 7) { rowErr.dayNumber = '1–7.'; valid = false; }

      if (Object.keys(rowErr).length) e[row._id] = rowErr;
    });

    // Duplicate stations
    const codes = rows.map(r => r.stationCode.trim().toUpperCase()).filter(Boolean);
    if (new Set(codes).size !== codes.length) {
      e._global = 'Duplicate stations found in the list.';
      valid = false;
    }

    setErrors(e);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const stops = rows.map((row, idx) => ({
        stationCode:  row.stationCode.trim().toUpperCase(),
        stopNumber:   idx + 1,
        kmFromSource: Number(row.kmFromSource),
        arrivalTime:  row.arrivalTime  || null,
        departureTime:row.departureTime || null,
        dayNumber:    Number(row.dayNumber),
      }));
      await TrainStopService.bulkAddStops(trainNumber, stops);
      onSuccess();
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to generate stops.');
    } finally { setSaving(false); }
  };

  if (!open) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal gsm-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true">

        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Milestone size={17}/>
            </div>
            <div>
              <h2 className="aam-title">Generate Stops</h2>
              <p className="aam-subtitle">Train · {trainNumber} · {rows.length} stops</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18}/></button>
        </div>

        <div className="aam-body gsm-body">
          {errors._global && (
            <div className="gsm-global-error"><AlertTriangle size={14}/>{errors._global}</div>
          )}

          <div className="gsm-rows">
            {rows.map((row, idx) => (
              <StopRow
                key={row._id}
                row={row}
                index={idx}
                total={rows.length}
                onUpdate={updateRow}
                onRemove={removeRow}
                errors={errors[row._id]}
                disabled={saving}
              />
            ))}
          </div>

          {/* Add intermediate stop */}
          <button className="gsm-add-row-btn" onClick={addRow} disabled={saving} type="button">
            <Plus size={14}/> Add Intermediate Stop
          </button>
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="gsm-submit-btn" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><span className="aam-spinner"/> Saving…</>
              : <><Milestone size={14}/> Generate {rows.length} Stops</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GenerateStopsModal;
