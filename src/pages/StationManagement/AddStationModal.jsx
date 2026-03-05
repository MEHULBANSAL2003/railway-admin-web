import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Train } from 'lucide-react';
import { StationService } from '../../services/StationService.js';
import { StatesCitiesService } from '../../services/StatesCitiesService.js';
import { ZoneService } from '../../services/ZoneService.js';
import { useToast } from '../../context/Toast/useToast.js';
import '../AdminManagement/AddAdminModal.css';
import SearchableSelect from "../../components/UI/SearchableSelect/SearchableSelect.jsx";
import {fetchCities, fetchStates, fetchZones} from "../../utils/searchFetchers.js";

const STATION_TYPES = ['REGULAR', 'JUNCTION', 'TERMINUS', 'HALT'];

const EMPTY_FORM = {
  stationCode:  '',
  stationName:  '',
  stateId:      '',
  cityId:       '',
  zoneId:       '',
  stationType:  'REGULAR',
  numPlatforms: '',
};

const EMPTY_ERRORS = {
  stationCode: '', stationName: '', stateId: '',
  cityId: '', zoneId: '', stationType: '', numPlatforms: '',
};

const validate = (form) => {
  const errors = { ...EMPTY_ERRORS };
  let isValid = true;

  if (!form.stationCode.trim()) {
    errors.stationCode = 'Station code is required.'; isValid = false;
  } else if (!/^[A-Z0-9]{2,8}$/.test(form.stationCode.trim())) {
    errors.stationCode = 'Code must be 2–8 uppercase letters/numbers.'; isValid = false;
  }
  if (!form.stationName.trim()) {
    errors.stationName = 'Station name is required.'; isValid = false;
  }
  if (!form.stateId) {
    errors.stateId = 'Please select a state.'; isValid = false;
  }
  if (!form.cityId) {
    errors.cityId = 'Please select a city.'; isValid = false;
  }
  if (!form.zoneId) {
    errors.zoneId = 'Please select a zone.'; isValid = false;
  }
  if (!form.numPlatforms || isNaN(form.numPlatforms) || Number(form.numPlatforms) < 1) {
    errors.numPlatforms = 'Enter a valid number of platforms (min 1).'; isValid = false;
  }

  return { errors, isValid };
};

const AddStationModal = ({ open, onClose, onSuccess, states = [], zones = [] }) => {
  const { showSuccess, showError } = useToast();

  const [form,         setForm]         = useState(EMPTY_FORM);
  const [errors,       setErrors]       = useState(EMPTY_ERRORS);
  const [saving,       setSaving]       = useState(false);
  const [cities,       setCities]       = useState([]);
  const [citiesLoading,setCitiesLoading]= useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrors(EMPTY_ERRORS);
      setCities([]);
    }
  }, [open]);

  // ESC + scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && !saving) handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, saving]);

  // When state changes → load cities for that state
  useEffect(() => {
    if (!form.stateId) { setCities([]); return; }

    const selectedState = states.find(s => String(s.id) === String(form.stateId));
    if (!selectedState) return;

    setCitiesLoading(true);
    setCities([]);
    setForm(prev => ({ ...prev, cityId: '' })); // reset city

    StatesCitiesService.getAllCitiesByState({ stateName: selectedState.name, page: 0, size: 500 })
      .then(res => {
        const d = res.data.data ?? res.data;
        setCities(d.content || []);
      })
      .catch(() => showError('Failed to load cities for selected state.'))
      .finally(() => setCitiesLoading(false));
  }, [form.stateId]);

  const handleChange = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  }, []);

  const handleClose = useCallback(() => {
    if (saving) return;
    onClose();
  }, [saving, onClose]);

  const handleSubmit = async () => {
    // Auto-uppercase station code
    const normalized = { ...form, stationCode: form.stationCode.trim().toUpperCase() };
    setForm(normalized);

    const { errors: ve, isValid } = validate(normalized);
    if (!isValid) { setErrors(ve); return; }

    setSaving(true);
    try {
      const payload = {
        stationCode:  normalized.stationCode,
        stationName:  normalized.stationName.trim(),
        cityId:       Number(normalized.cityId),
        stateId:      Number(normalized.stateId),
        zoneId:       Number(normalized.zoneId),
        stationType:  normalized.stationType,
        numPlatforms: Number(normalized.numPlatforms),
      };

      const res = await StationService.createNewStation(payload);
      showSuccess(`Station "${payload.stationName}" created successfully.`);
      handleClose();
      onSuccess?.(res?.data?.data);
    } catch (err) {
      const msg = err?.response?.data?.error?.message || '';
      if (msg.toLowerCase().includes('code')) {
        setErrors(prev => ({ ...prev, stationCode: msg }));
      } else {
        showError(msg || 'Failed to create station.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : handleClose}>
      <div
        className="aam-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: 540 }}
      >
        {/* Header */}
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Train size={18} />
            </div>
            <div>
              <h2 className="aam-title">Add New Station</h2>
              <p className="aam-subtitle">Fill in the details to register a new station</p>
            </div>
          </div>
          <button className="aam-close" onClick={handleClose} disabled={saving}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="aam-body">

          {/* Code + Name */}
          <div className="aam-row">
            <div className="aam-field">
              <label className="aam-label">Station Code <span className="aam-required">*</span></label>
              <input
                className={`aam-input${errors.stationCode ? ' aam-input--error' : ''}`}
                placeholder="e.g. NDLS"
                value={form.stationCode}
                onChange={e => handleChange('stationCode', e.target.value.toUpperCase())}
                disabled={saving}
                maxLength={8}
                autoFocus
                style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
              />
              {errors.stationCode && <p className="aam-error">{errors.stationCode}</p>}
            </div>

            <div className="aam-field">
              <label className="aam-label">Station Name <span className="aam-required">*</span></label>
              <input
                className={`aam-input${errors.stationName ? ' aam-input--error' : ''}`}
                placeholder="e.g. New Delhi Junction"
                value={form.stationName}
                onChange={e => handleChange('stationName', e.target.value)}
                disabled={saving}
              />
              {errors.stationName && <p className="aam-error">{errors.stationName}</p>}
            </div>
          </div>

          {/* State → City (cascading) */}
          <div className="aam-row">
            <div className="aam-field">
              <label className="aam-label">State <span className="aam-required">*</span></label>
              <SearchableSelect
                value={String(form.stateId || '')}
                onChange={(val, raw) => handleChange('stateId', val)}
                fetchOptions={fetchStates}
                placeholder="Search state…"
                error={errors.stateId}
                disabled={saving}
              />

            </div>

            <div className="aam-field">
              <label className="aam-label">
                City <span className="aam-required">*</span>
                {citiesLoading && <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 6 }}>Loading…</span>}
              </label>
              <SearchableSelect
                value={String(form.cityId || '')}
                onChange={(val, raw) => handleChange('cityId', val)}
                fetchOptions={fetchCities(
                  states.find(s => String(s.id) === String(form.stateId))?.name || ''
                )}
                placeholder={!form.stateId ? 'Select state first…' : 'Search city…'}
                error={errors.cityId}
                disabled={saving || !form.stateId}
              />

            </div>
          </div>

          {/* Zone + Type */}
          <div className="aam-row">
            <div className="aam-field">
              <label className="aam-label">Zone <span className="aam-required">*</span></label>
              <SearchableSelect
                value={String(form.zoneId || '')}
                onChange={(val, raw) => handleChange('zoneId', val)}
                fetchOptions={fetchZones}
                placeholder="Search zone…"
                error={errors.zoneId}
                disabled={saving}
              />
            </div>

            <div className="aam-field">
              <label className="aam-label">Station Type <span className="aam-required">*</span></label>
              <select
                className="aam-select"
                value={form.stationType}
                onChange={e => handleChange('stationType', e.target.value)}
                disabled={saving}
              >
                {STATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Platforms */}
          <div className="aam-field" style={{ maxWidth: '50%' }}>
            <label className="aam-label">Number of Platforms <span className="aam-required">*</span></label>
            <input
              className={`aam-input${errors.numPlatforms ? ' aam-input--error' : ''}`}
              type="number"
              min={1}
              max={30}
              placeholder="e.g. 5"
              value={form.numPlatforms}
              onChange={e => handleChange('numPlatforms', e.target.value)}
              disabled={saving}
            />
            {errors.numPlatforms && <p className="aam-error">{errors.numPlatforms}</p>}
          </div>

        </div>

        {/* Footer */}
        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={handleClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}
                  style={{ background: '#d97706' }}
          >
            {saving
              ? <><span className="aam-spinner" /> Creating…</>
              : <><Train size={14} /> Create Station</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddStationModal;
