import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Pencil } from 'lucide-react';
import { StationService } from '../../services/StationService.js';
import { StatesCitiesService } from '../../services/StatesCitiesService.js';
import { useToast } from '../../context/Toast/useToast.js';
import '../AdminManagement/AddAdminModal.css';
import SearchableSelect from "../../components/UI/SearchableSelect/SearchableSelect.jsx";
import {fetchCities, fetchStates, fetchZones} from "../../utils/searchFetchers.js";

const STATION_TYPES = ['REGULAR', 'JUNCTION', 'TERMINAL', 'HALT', 'CANTT', 'CENTRAL'];

const EditStationModal = ({ open, onClose, station, onSuccess, states = [], zones = [] }) => {
  const { showSuccess, showError } = useToast();

  const [form,          setForm]          = useState({});
  const [errors,        setErrors]        = useState({});
  const [saving,        setSaving]        = useState(false);
  const [cities,        setCities]        = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // ── Pre-fill form when station changes ────────────────────
  useEffect(() => {
    if (open && station) {
      setForm({
        stationName:  station.stationName  || '',
        stateId:      station.stateId      || '',
        cityId:       station.cityId       || '',
        zoneId:       station.zoneId       || '',
        stationType:  station.stationType  || 'REGULAR',
        numPlatforms: station.numPlatforms ?? '',
      });
      setErrors({});
      // Pre-load cities for the current state
      if (station.stateId) loadCitiesForState(station.stateId, states);
    }
  }, [open, station]);

  const loadCitiesForState = (stateId, statesList) => {
    const selectedState = statesList.find(s => String(s.id) === String(stateId));
    if (!selectedState) return;
    setCitiesLoading(true);
    StatesCitiesService.getAllCitiesByState({ stateName: selectedState.name, page: 0, size: 500 })
      .then(res => {
        const d = res.data.data ?? res.data;
        setCities(d.content || []);
      })
      .catch(() => showError('Failed to load cities.'))
      .finally(() => setCitiesLoading(false));
  };

  // ESC + scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, saving]);

  const handleChange = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));

    // When state changes → reload cities, reset cityId
    if (key === 'stateId') {
      setForm(prev => ({ ...prev, stateId: value, cityId: '' }));
      setCities([]);
      if (value) loadCitiesForState(value, states);
    }
  }, [states]);

  const handleClose = useCallback(() => {
    if (saving) return;
    onClose();
  }, [saving, onClose]);

  const handleSubmit = async () => {
    // Validate only non-empty fields
    const newErrors = {};

    if (form.stationName !== undefined && form.stationName.trim().length === 0) {
      newErrors.stationName = 'Station name cannot be empty.';
    }

    if (form.numPlatforms !== '' && (isNaN(form.numPlatforms) || Number(form.numPlatforms) < 1)) {
      newErrors.numPlatforms = 'Enter a valid number (min 1).';
    }

    // cityId and stateId must be both set or both cleared
    const hasCityId  = form.cityId  !== '' && form.cityId  != null;
    const hasStateId = form.stateId !== '' && form.stateId != null;
    if (hasCityId !== hasStateId) {
      newErrors.cityId = 'City and state must both be set.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      // Build payload — only include fields that differ from original
      const payload = {};

      if (form.stationName.trim() !== station.stationName)
        payload.stationName = form.stationName.trim();

      if (String(form.stateId) !== String(station.stateId) ||
        String(form.cityId)  !== String(station.cityId)) {
        payload.stateId = Number(form.stateId) || null;
        payload.cityId  = Number(form.cityId)  || null;
      }

      if (String(form.zoneId) !== String(station.zoneId))
        payload.zoneId = Number(form.zoneId) || null;

      if (form.stationType !== station.stationType)
        payload.stationType = form.stationType;

      if (Number(form.numPlatforms) !== station.numPlatforms)
        payload.numPlatforms = Number(form.numPlatforms);

      if (Object.keys(payload).length === 0) {
        showError('No changes detected.');
        setSaving(false);
        return;
      }

      const res = await StationService.updateStationDetails(station.stationCode, payload);
      showSuccess(`Station "${station.stationName}" updated successfully.`);
      handleClose();
      onSuccess?.(res?.data?.data);
    } catch (err) {
      const msg = err?.response?.data?.error?.message || '';
      if (msg.toLowerCase().includes('name')) {
        setErrors(prev => ({ ...prev, stationName: msg }));
      } else {
        showError(msg || 'Failed to update station.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open || !station) return null;

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
            <div className="aam-header-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Pencil size={17} />
            </div>
            <div>
              <h2 className="aam-title">Edit Station</h2>
              <p className="aam-subtitle">
                <code style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--bg-tertiary)', padding: '1px 6px', borderRadius: 4 }}>
                  {station.stationCode}
                </code>
                <span style={{ marginLeft: 6 }}>{station.stationName}</span>
              </p>
            </div>
          </div>
          <button className="aam-close" onClick={handleClose} disabled={saving}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="aam-body">

          {/* Station Name */}
          <div className="aam-field">
            <label className="aam-label">Station Name</label>
            <input
              className={`aam-input${errors.stationName ? ' aam-input--error' : ''}`}
              value={form.stationName || ''}
              onChange={e => handleChange('stationName', e.target.value)}
              disabled={saving}
              placeholder="e.g. New Delhi Junction"
              autoFocus
            />
            {errors.stationName && <p className="aam-error">{errors.stationName}</p>}
          </div>

          {/* State → City */}
          <div className="aam-row">
            <div className="aam-field">
              <label className="aam-label">State</label>
              <SearchableSelect
                value={String(form.stateId || '')}
                onChange={(val, raw) => handleChange('stateId', val)}
                fetchOptions={fetchStates}
                placeholder="Search state…"
                initialLabel={station?.stateName || ''}  // for EditModal pre-fill
                error={errors.stateId}
                disabled={saving}
              />
            </div>

            <div className="aam-field">
              <label className="aam-label">
                City
                {citiesLoading && <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 6 }}>Loading…</span>}
              </label>
              <SearchableSelect
                value={String(form.cityId || '')}
                onChange={(val, raw) => handleChange('cityId', val)}
                fetchOptions={fetchCities(
                  states.find(s => String(s.id) === String(form.stateId))?.name || ''
                )}
                placeholder={!form.stateId ? 'Select state first…' : 'Search city…'}
                initialLabel={station?.cityName || ''}
                error={errors.cityId}
                disabled={saving || !form.stateId}
              />
            </div>
          </div>

          {/* Zone + Type */}
          <div className="aam-row">
            <div className="aam-field">
              <label className="aam-label">Zone</label>
              <SearchableSelect
                value={String(form.zoneId || '')}
                onChange={(val, raw) => handleChange('zoneId', val)}
                fetchOptions={fetchZones}
                placeholder="Search zone…"
                initialLabel={station?.zoneName || ''}
                error={errors.zoneId}
                disabled={saving}
              />
            </div>

            <div className="aam-field">
              <label className="aam-label">Station Type</label>
              <select
                className="aam-select"
                value={form.stationType || 'REGULAR'}
                onChange={e => handleChange('stationType', e.target.value)}
                disabled={saving}
              >
                {STATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Platforms */}
          <div className="aam-field" style={{ maxWidth: '50%' }}>
            <label className="aam-label">Number of Platforms</label>
            <input
              className={`aam-input${errors.numPlatforms ? ' aam-input--error' : ''}`}
              type="number"
              min={1}
              max={30}
              value={form.numPlatforms ?? ''}
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
                  style={{ background: '#2563eb' }}
          >
            {saving
              ? <><span className="aam-spinner" /> Saving…</>
              : <><Pencil size={13} /> Save Changes</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditStationModal;
