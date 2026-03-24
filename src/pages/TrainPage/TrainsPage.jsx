import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  Plus, RotateCcw, Pencil, ToggleLeft, ToggleRight,
  Train, Zap, UtensilsCrossed, Hash, ArrowLeftRight,
  Upload, Download, FileSpreadsheet, AlertCircle,
  CheckCircle2, X, Inbox,Armchair
} from 'lucide-react';
import { useTrainList }     from './useTrainList.js';
import { TrainService }     from '../../services/TrainService.js';
import { TrainTypeService } from '../../services/TrainTypeService.js';
import { ZoneService }      from '../../services/ZoneService.js';
import { useToast }         from '../../context/Toast/useToast.js';
import CascadeToggleModal   from '../../components/UI/CascadeToggleModal/CascadeToggleModal.jsx';
import SearchableSelect     from '../../components/UI/SearchableSelect/SearchableSelect.jsx';
import '../AdminManagement/AddAdminModal.css';
import '../TrainTypesPage/TrainTypesPage.css';
import '../StationManagement/StationManagementPage.css';
import './TrainsPage.css';
import {useNavigate} from "react-router-dom";

// ── Constants ─────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: '',      label: 'All Status' },
  { value: 'true',  label: 'Active'     },
  { value: 'false', label: 'Inactive'   },
];

const COLS = [
  { key: 'trainNumber',   label: 'Number'  },
  { key: 'trainName',     label: 'Name'    },
  { key: 'trainTypeCode', label: 'Type'    },
  { key: 'zoneCode',      label: 'Zone'    },
  { key: 'pantrycar',     label: 'Pantry'  },
  { key: 'isActive',      label: 'Status'  },
];

// ── Fetchers for SearchableSelect ─────────────────────────
const fetchTrainTypes = async (search) => {
  const res = await TrainTypeService.getAllForDropdown(search);
  return (res.data.data || []).map(t => ({
    value: t.typeCode, label: t.typeName, raw: t,
  }));
};

const fetchZones = async (search) => {
  const payload = search ? { searchTerm: search } : {};
  const res = await ZoneService.getAllZones(payload);
  return (res.data.data || []).map(z => ({
    value: z.code, label: `${z.code} — ${z.name}`, raw: z,
  }));
};

// ── Helpers ───────────────────────────────────────────────
const deriveReturnName = (name) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 3) {
    const [a, b, ...rest] = parts;
    return `${b} ${a} ${rest.join(' ')}`;
  }
  return '';
};

// ── Sub-components ────────────────────────────────────────
const SortIcon = ({ colKey, sort }) => {
  if (sort.sortBy !== colKey) return <ChevronsUpDown size={12} style={{ opacity: 0.3 }} />;
  return sort.sortDir === 'asc'
    ? <ChevronUp   size={12} style={{ color: 'var(--primary-600)' }} />
    : <ChevronDown size={12} style={{ color: 'var(--primary-600)' }} />;
};

const SkeletonRow = ({ colCount }) => (
  <tr>
    <td><div className="sm-skeleton" style={{ width: '55%' }} /></td>
    {Array.from({ length: colCount - 1 }).map((_, i) => (
      <td key={i}><div className="sm-skeleton" style={{ width: '60%' }} /></td>
    ))}
    <td />
  </tr>
);

// ── Toolbar ───────────────────────────────────────────────
const Toolbar = ({ filters, handleFilterChange, handleFilterReset, totalElements, loading }) => {
  const hasActive = filters.search || filters.trainTypeCode ||
    filters.zoneCode || filters.isActive !== '';

  return (
    <div className="sm-toolbar">
      <div className="sm-toolbar-filters">
        <div className="sm-filter-wrap">
          <span className="sm-filter-icon"><Search size={13} /></span>
          <input
            className="sm-filter-input"
            placeholder="Search number or name…"
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div style={{ width: 200 }}>
          <SearchableSelect
            value={filters.trainTypeCode}
            onChange={val => handleFilterChange('trainTypeCode', val || '')}
            fetchOptions={fetchTrainTypes}
            placeholder="All Types"
            clearable
          />
        </div>

        <div style={{ width: 200 }}>
          <SearchableSelect
            value={filters.zoneCode}
            onChange={val => handleFilterChange('zoneCode', val || '')}
            fetchOptions={fetchZones}
            placeholder="All Zones"
            clearable
          />
        </div>

        <select
          className="sm-filter-select"
          value={filters.isActive}
          onChange={e => handleFilterChange('isActive', e.target.value)}>
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasActive && (
          <button className="sm-reset-btn" onClick={handleFilterReset}>
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {!loading && (
        <div className="sm-result-count">
          {totalElements} train{totalElements !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

// ── Field wrapper (for modals) ────────────────────────────
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

// ── Excel Upload Modal ────────────────────────────────────
const ExcelUploadModal = ({ open, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [file,      setFile]      = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result,    setResult]    = useState(null);
  const [dragging,  setDragging]  = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setFile(null); setResult(null); setDragging(false); }
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape' && !uploading) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, uploading, onClose]);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.match(/\.(xlsx|xls)$/i)) { showError('Only .xlsx and .xls files are accepted.'); return; }
    setFile(f);
    setResult(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await TrainService.downloadTemplate();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'trains_upload_template.xlsx'; a.click();
      URL.revokeObjectURL(url);
    } catch { showError('Failed to download template.'); }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res  = await TrainService.uploadFromExcel(file);
      const data = res.data.data;
      setResult(data);
      if (data.successCount > 0) {
        showSuccess(`${data.successCount} train(s) uploaded successfully.`);
        onSuccess();
      }
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Upload failed.');
    } finally { setUploading(false); }
  };

  if (!open) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={uploading ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true" style={{ maxWidth: 560 }}>

        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <FileSpreadsheet size={17} />
            </div>
            <div>
              <h2 className="aam-title">Bulk Upload Trains</h2>
              <p className="aam-subtitle">Upload multiple trains via Excel file</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={uploading}><X size={18} /></button>
        </div>

        <div className="aam-body">
          <div className="trains-upload-template-row">
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              First time? Download the template with column headers and an example row.
            </span>
            <button className="trains-template-btn" onClick={handleDownloadTemplate}>
              <Download size={13} /> Template
            </button>
          </div>

          <div
            className={`trains-dropzone${dragging ? ' dragging' : ''}${file ? ' has-file' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
            onClick={() => !file && inputRef.current?.click()}>
            <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
                   onChange={e => handleFile(e.target.files?.[0])} />
            {file ? (
              <div className="trains-dropzone-file">
                <FileSpreadsheet size={22} style={{ color: '#16a34a' }} />
                <div>
                  <p className="trains-dropzone-filename">{file.name}</p>
                  <p className="trains-dropzone-size">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button className="trains-dropzone-remove"
                        onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="trains-dropzone-empty">
                <Upload size={22} style={{ color: 'var(--text-tertiary)' }} />
                <p className="trains-dropzone-hint">
                  Drop your .xlsx file here, or <span className="trains-dropzone-link">browse</span>
                </p>
                <p className="trains-dropzone-formats">Supports .xlsx and .xls</p>
              </div>
            )}
          </div>

          {result && (
            <div className="trains-upload-result">
              <div className="trains-result-stats">
                <div className="trains-result-stat success">
                  <CheckCircle2 size={15} /><span><strong>{result.successCount}</strong> added</span>
                </div>
                {result.duplicateCount > 0 && (
                  <div className="trains-result-stat duplicate">
                    <AlertCircle size={15} /><span><strong>{result.duplicateCount}</strong> duplicate</span>
                  </div>
                )}
                {result.failureCount > 0 && (
                  <div className="trains-result-stat failure">
                    <AlertCircle size={15} /><span><strong>{result.failureCount}</strong> failed</span>
                  </div>
                )}
              </div>
              {result.errors && result.errors.length > 0 && (
                <div className="trains-error-table-wrap">
                  <p className="trains-error-table-title">Issues found:</p>
                  <table className="trains-error-table">
                    <thead><tr><th>Row</th><th>Number</th><th>Name</th><th>Reason</th></tr></thead>
                    <tbody>
                    {result.errors.map((err, i) => (
                      <tr key={i}>
                        <td>{err.rowNumber}</td>
                        <td><code>{err.trainNumber || '—'}</code></td>
                        <td>{err.trainName || '—'}</td>
                        <td className="trains-error-reason">{err.reason}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={uploading}>
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button onClick={handleUpload} disabled={!file || uploading} className="trains-submit-btn">
              {uploading ? <><span className="aam-spinner" /> Uploading…</> : <><Upload size={14} /> Upload</>}
            </button>
          )}
          {result && result.successCount === 0 && (
            <button onClick={() => { setFile(null); setResult(null); }} className="trains-submit-btn">
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Return Train Prompt ───────────────────────────────────
const ReturnTrainPrompt = ({ open, data, onAddReturn, onDismiss }) => {
  if (!open || !data) return null;
  const { info, addedTrain } = data;
  return createPortal(
    <div className="rtp-wrapper" role="status" aria-live="polite">
      <div className="rtp-content">
        <div className="rtp-left">
          <div className={`rtp-icon ${info.exists ? 'exists' : 'new'}`}>
            {info.exists
              ? <Train size={14} style={{ color: '#16a34a' }} />
              : <ArrowLeftRight size={14} style={{ color: '#1d4ed8' }} />}
          </div>
          <div className="rtp-text">
            <p className="rtp-title">Train <strong>{addedTrain.trainNumber}</strong> added.</p>
            {info.exists ? (
              <p className="rtp-sub">
                Return <strong>{info.returnTrainNumber}</strong>{' '}
                <span className="rtp-exists-tag">already exists</span>
                {info.existingTrain?.trainName ? ` — ${info.existingTrain.trainName}` : ''}.
              </p>
            ) : (
              <p className="rtp-sub">Return <strong>{info.returnTrainNumber}</strong> not added yet.</p>
            )}
          </div>
        </div>
        <div className="rtp-actions">
          {!info.exists && (
            <button className="rtp-btn-add" onClick={onAddReturn}>
              <ArrowLeftRight size={12} /> Add {info.returnTrainNumber}
            </button>
          )}
          <button className="rtp-btn-dismiss" onClick={onDismiss}>Dismiss</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Add / Edit Modal ──────────────────────────────────────
const TrainModal = ({ open, onClose, editItem, prefill, onSuccess }) => {
  const { showError } = useToast();
  const isEdit    = !!editItem;
  const isPrefill = !isEdit && !!prefill;

  const EMPTY = { trainNumber: '', trainName: '', trainTypeCode: '', zoneCode: '', pantrycar: false };
  const [form,        setForm]        = useState(EMPTY);
  const [errors,      setErrors]      = useState({});
  const [saving,      setSaving]      = useState(false);
  const [selectedRaw, setSelectedRaw] = useState({ type: null });

  useEffect(() => {
    if (!open) return;
    setForm(isEdit ? {
      trainNumber: editItem.trainNumber, trainName: editItem.trainName,
      trainTypeCode: editItem.trainTypeCode, zoneCode: editItem.zoneCode,
      pantrycar: editItem.pantrycar ?? false,
    } : isPrefill ? {
      trainNumber: prefill.trainNumber, trainName: prefill.trainName,
      trainTypeCode: prefill.trainTypeCode, zoneCode: prefill.zoneCode,
      pantrycar: prefill.pantrycar ?? false,
    } : EMPTY);
    setErrors({});
    setSelectedRaw({ type: null });
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open, editItem, prefill]);

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

  const validate = () => {
    const e = {};
    if (!isEdit) {
      if (!form.trainNumber.trim()) e.trainNumber = 'Required.';
      else if (!/^\d{5}$/.test(form.trainNumber.trim())) e.trainNumber = 'Exactly 5 digits.';
    }
    if (!form.trainName.trim()) e.trainName = 'Required.';
    else if (form.trainName.trim().length < 3 || form.trainName.trim().length > 150)
      e.trainName = '3–150 characters.';
    if (!isEdit && !form.trainTypeCode) e.trainTypeCode = 'Required.';
    if (!form.zoneCode) e.zoneCode = 'Required.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      let res;
      if (isEdit) {
        res = await TrainService.updateTrain(editItem.trainNumber, {
          trainName: form.trainName.trim(), zoneCode: form.zoneCode, pantrycar: form.pantrycar,
        });
        onSuccess(res.data.data, false);
      } else {
        res = await TrainService.addTrain({
          trainNumber: form.trainNumber.trim(), trainName: form.trainName.trim(),
          trainTypeCode: form.trainTypeCode, zoneCode: form.zoneCode, pantrycar: form.pantrycar,
        });
        onSuccess(res.data.data, true);
      }
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to save train.');
    } finally { setSaving(false); }
  };

  if (!open) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true" style={{ maxWidth: 500 }}>
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              {isPrefill ? <ArrowLeftRight size={17} /> : <Train size={17} />}
            </div>
            <div>
              <h2 className="aam-title">
                {isEdit ? 'Edit Train' : isPrefill ? 'Add Return Train' : 'Add Train'}
              </h2>
              <p className="aam-subtitle">
                {isEdit
                  ? `Editing ${editItem.trainNumber} — ${editItem.trainName}`
                  : isPrefill
                    ? 'Pre-filled from paired train — verify before saving'
                    : 'Register a new train in the system'}
              </p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18} /></button>
        </div>

        <div className="aam-body">
          {isPrefill && (
            <div className="rtp-prefill-notice">
              <ArrowLeftRight size={13} />
              <span>Pre-filled from the paired train. Verify the name before saving.</span>
            </div>
          )}

          {!isEdit && (
            <Field label="Train Number" required error={errors.trainNumber}
                   hint="Exactly 5 digits. Cannot be changed after creation.">
              <div style={{ position: 'relative' }}>
                <Hash size={13} style={{
                  position: 'absolute', left: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)', pointerEvents: 'none',
                }} />
                <input
                  className={`aam-input${errors.trainNumber ? ' aam-input--error' : ''}`}
                  style={{ paddingLeft: 30, fontFamily: 'monospace', fontWeight: 700 }}
                  placeholder="e.g. 12951"
                  value={form.trainNumber}
                  onChange={e => set('trainNumber', e.target.value.replace(/\D/g, ''))}
                  disabled={saving}
                  maxLength={5}
                />
              </div>
            </Field>
          )}

          <Field label="Train Name" required error={errors.trainName}>
            <input
              className={`aam-input${errors.trainName ? ' aam-input--error' : ''}`}
              placeholder="e.g. Mumbai Central Rajdhani Express"
              value={form.trainName}
              onChange={e => set('trainName', e.target.value)}
              disabled={saving}
              maxLength={150}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <Field label="Train Type" required error={errors.trainTypeCode}>
              <SearchableSelect
                value={form.trainTypeCode}
                onChange={(val, raw) => { set('trainTypeCode', val); setSelectedRaw({ type: raw?.raw }); }}
                fetchOptions={fetchTrainTypes}
                placeholder="Select type…"
                disabled={saving || isEdit}
                size="full"
              />
              {isEdit && <p className="aam-hint">Cannot be changed after creation.</p>}
            </Field>
            <Field label="Zone" required error={errors.zoneCode}>
              <SearchableSelect
                value={form.zoneCode}
                onChange={val => set('zoneCode', val)}
                fetchOptions={fetchZones}
                placeholder="Select zone…"
                disabled={saving}
                size="full"
              />
            </Field>
          </div>

          <Field label="Pantry Car / Food Service">
            <button type="button"
                    onClick={() => set('pantrycar', !form.pantrycar)}
                    disabled={saving}
                    className={`trains-pantry-btn${form.pantrycar ? ' active' : ''}`}>
              <UtensilsCrossed size={14} />
              {form.pantrycar ? 'Yes — Has pantry car' : 'No — No onboard food'}
            </button>
          </Field>

          {selectedRaw.type && (
            <div className="fr-hints">
              <span className={`fr-hint ${selectedRaw.type.isSuperfast ? 'superfast' : 'regular'}`}>
                {selectedRaw.type.isSuperfast ? '⚡ Superfast' : 'Regular train'}
              </span>
            </div>
          )}
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="trains-submit-btn">
            {saving
              ? <><span className="aam-spinner" /> Saving…</>
              : isEdit ? 'Update Train' : isPrefill ? 'Add Return Train' : 'Add Train'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main Page ─────────────────────────────────────────────
const TrainsPage = () => {
  const { showSuccess, showError } = useToast();

  const navigate = useNavigate();

  const {
    data, loading, loadingMore, hasMore, totalElements,
    filters, sort,
    handleFilterChange, handleFilterReset, handleSort,
    loadMore,
    prependTrain, updateRowById,
    refresh,
    statsTotal, statsActive, statsSuperfast, statsPantry, statsInactive
  } = useTrainList();

  // ── Modals ────────────────────────────────────────────
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editItem,      setEditItem]      = useState(null);
  const [prefill,       setPrefill]       = useState(null);
  const [cascadeModal,  setCascadeModal]  = useState(null);
  const [uploadOpen,    setUploadOpen]    = useState(false);
  const [returnPrompt,  setReturnPrompt]  = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);

  const sentinelRef  = useRef(null);
  const dismissTimer = useRef(null);

  // ── Infinite scroll sentinel ──────────────────────────
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  useEffect(() => () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
  }, []);

  // ── Add / Edit success ────────────────────────────────
  const handleModalSuccess = async (saved, isNewTrain = false) => {
    if (isNewTrain) {
      prependTrain(saved);
    } else {
      updateRowById(saved.trainId, saved);
      showSuccess('Train updated successfully.');
    }

    if (!isNewTrain) return;

    setReturnLoading(true);
    try {
      const res  = await TrainService.getReturnTrainInfo(saved.trainNumber);
      const info = res.data.data;
      if (!info?.returnTrainNumber) {
        showSuccess(`Train ${saved.trainNumber} added successfully.`);
        return;
      }
      setReturnPrompt({ info, addedTrain: saved });
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      dismissTimer.current = setTimeout(() => setReturnPrompt(null), 15000);
    } catch {
      showSuccess(`Train ${saved.trainNumber} added successfully.`);
    } finally {
      setReturnLoading(false);
    }
  };

  const handleAddReturnTrain = () => {
    const { info, addedTrain } = returnPrompt;
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setReturnPrompt(null);
    setPrefill({
      trainNumber:   info.returnTrainNumber,
      trainName:     deriveReturnName(addedTrain.trainName),
      trainTypeCode: addedTrain.trainTypeCode,
      zoneCode:      addedTrain.zoneCode,
      pantrycar:     addedTrain.pantrycar,
    });
    setEditItem(null);
    setModalOpen(true);
  };

  // ── Toggle ────────────────────────────────────────────
  const handleToggleClick = (item) => setCascadeModal({ item, targetStatus: !item.isActive });

  const handleToggleConfirm = async (payload) => {
    const { item, targetStatus } = cascadeModal;
    updateRowById(item.trainId, { isActive: targetStatus });
    try {
      const res = await TrainService.toggleStatus(item.trainNumber, payload);
      showSuccess(res.data?.data?.message || 'Status updated.');
    } catch (err) {
      updateRowById(item.trainId, { isActive: item.isActive });
      showError(err?.response?.data?.error?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="page-container">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Trains</h1>
          <p className="page-subtitle">Manage train registrations, types, and zones</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setUploadOpen(true)}>
            <Upload size={15} /> Bulk Upload
          </button>
          <button className="btn btn-primary"
                  onClick={() => { setEditItem(null); setPrefill(null); setModalOpen(true); }}>
            <Plus size={16} /> Add Train
          </button>
        </div>
      </div>

      {/* ── Stat boxes ── */}
      <div className="trains-stat-row">
        <div className="trains-stat-box">
          <div className="trains-stat-label">Total</div>
          <div className="trains-stat-value">{statsTotal}</div>
        </div>
        <div className="trains-stat-box">
          <div className="trains-stat-label">Active(page wise)</div>
          <div className="trains-stat-value" style={{ color: '#16a34a' }}>{statsActive}</div>
        </div>
        <div className="trains-stat-box">
          <div className="trains-stat-label">Inactive(page wise)</div>
          <div className="trains-stat-value" style={{ color: '#dc2626' }}>
            {statsInactive}
          </div>
        </div>
        <div className="trains-stat-box">
          <div className="trains-stat-label">Superfast(page wise)</div>
          <div className="trains-stat-value" style={{ color: '#d97706' }}>{statsSuperfast}</div>
        </div>
        <div className="trains-stat-box">
          <div className="trains-stat-label">With Pantry(page wise)</div>
          <div className="trains-stat-value" style={{ color: '#7c3aed' }}>{statsPantry}</div>
        </div>
      </div>

      {returnLoading && (
        <div className="trains-return-checking">
          <span className="aam-spinner" style={{ width: 13, height: 13 }} />
          Checking return train…
        </div>
      )}

      {/* ── Main card ── */}
      <div className="card" style={{
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', maxHeight: 'calc(100vh - 280px)',
      }}>
        <Toolbar
          filters={filters}
          handleFilterChange={handleFilterChange}
          handleFilterReset={handleFilterReset}
          totalElements={totalElements}
          loading={loading}
        />

        <div className="sm-table-wrap">
          <table className="sm-table">
            <thead>
            <tr>
              {COLS.map(col => (
                <th key={col.key}
                    className={`sm-th-sortable${sort.sortBy === col.key ? ' sm-th-sorted' : ''}`}
                    onClick={() => handleSort(col.key)}>
                  <div className="sm-th-inner">
                    {col.label}
                    <SortIcon colKey={col.key} sort={sort} />
                  </div>
                </th>
              ))}
              <th style={{ width: 80 }} />
            </tr>
            </thead>
            <tbody>
            {loading && Array.from({ length: 10 }).map((_, i) => (
              <SkeletonRow key={i} colCount={6} />
            ))}

            {!loading && data.map(item => (
              <tr key={item.trainId}>
               <td onClick={() => navigate(`/trains/${item.trainNumber}`)}
                   style={{ cursor: 'pointer' }}>
                 <code className="trains-number-badge">{item.trainNumber}</code>
               </td>
                <td>
                  <div className="sm-station-name" style={{ marginBottom: 2 }}>{item.trainName}</div>
                  {item.isSuperfast && (
                    <span className="trains-superfast-tag"><Zap size={9} /> Superfast</span>
                  )}
                </td>
                <td>
                  <code className="trains-type-badge">{item.trainTypeCode}</code>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {item.trainTypeName}
                  </div>
                </td>
                <td>
                    <span className="sm-zone-pill">
                      <span className="sm-zone-code">{item.zoneCode}</span>
                      {item.zoneName}
                    </span>
                </td>
                <td>
                  {item.pantrycar
                    ? <span className="tt-badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                          <UtensilsCrossed size={10} /> Yes
                        </span>
                    : <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>—</span>
                  }
                </td>
                <td>
                    <span className={`sm-status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                      <span className="sm-status-dot" />
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                  <div className="sm-row-actions">

                    <button className="sm-action-btn" title="Manage coaches"
                              onClick={() => navigate(`/trains/${item.trainNumber}/coaches`)}>
                        <Armchair size={14} />
                      </button>


                    <button className="sm-action-btn" title="Edit"
                            onClick={() => { setEditItem(item); setPrefill(null); setModalOpen(true); }}>
                      <Pencil size={14} />
                    </button>
                    <button
                      className={`sm-action-btn${item.isActive ? ' danger' : ''}`}
                      title={item.isActive ? 'Deactivate' : 'Activate'}
                      onClick={() => handleToggleClick(item)}>
                      {item.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {loadingMore && Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={`lm${i}`} colCount={6} />
            ))}
            </tbody>
          </table>

          {/* Infinite scroll sentinel */}
          {!loading && hasMore && (
            <div ref={sentinelRef} style={{ height: 1 }} />
          )}

          {!loading && data.length === 0 && (
            <div className="sm-empty">
              <div className="sm-empty-icon"><Inbox size={24} /></div>
              <div className="sm-empty-title">
                {(filters.search || filters.trainTypeCode || filters.zoneCode || filters.isActive)
                  ? 'No trains match your filters'
                  : 'No trains found'}
              </div>
              <div className="sm-empty-desc">
                {(filters.search || filters.trainTypeCode || filters.zoneCode || filters.isActive)
                  ? 'Try resetting filters.'
                  : 'Add your first train to get started.'}
              </div>
            </div>
          )}
        </div>

        {/* Footer — matches sm-footer pattern from stations */}
        {!loading && data.length > 0 && (
          <div className="sm-footer">
            <span>
              Showing <strong>{data.length}</strong> of <strong>{totalElements}</strong> trains
            </span>
            {hasMore && <span>Scroll to load more</span>}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <TrainModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); setPrefill(null); }}
        editItem={editItem}
        prefill={prefill}
        onSuccess={handleModalSuccess}
      />

      <ExcelUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={refresh}
      />

      <ReturnTrainPrompt
        open={!!returnPrompt}
        data={returnPrompt}
        onAddReturn={handleAddReturnTrain}
        onDismiss={() => {
          if (dismissTimer.current) clearTimeout(dismissTimer.current);
          setReturnPrompt(null);
        }}
      />

      <CascadeToggleModal
        open={!!cascadeModal}
        onClose={() => setCascadeModal(null)}
        onConfirm={handleToggleConfirm}
        fetchInfo={() => TrainService.getCascadeInfo(cascadeModal?.item.trainNumber)}
        targetStatus={cascadeModal?.targetStatus ?? true}
        entityLabel="Train"
      />
    </div>
  );
};

export default TrainsPage;
