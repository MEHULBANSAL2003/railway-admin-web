import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin } from 'lucide-react';

const EMPTY_FORM   = { cityName: '', stateName: '' };
const EMPTY_ERRORS = { cityName: '', stateName: '' };

const validate = (form) => {
  const errors = { ...EMPTY_ERRORS };
  let isValid = true;

  if (!form.cityName.trim()) {
    errors.cityName = 'City name is required.';
    isValid = false;
  } else if (form.cityName.trim().length < 2) {
    errors.cityName = 'City name must be at least 2 characters.';
    isValid = false;
  }

  if (!form.stateName) {
    errors.stateName = 'Please select a state.';
    isValid = false;
  }

  return { errors, isValid };
};

const AddCityModal = ({ open, onClose, onSubmit, saving, states = [], preselectedState = null }) => {
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);

  // Pre-fill state if a state is selected in the panel
  useEffect(() => {
    if (open) {
      setForm({
        cityName:  '',
        stateName: preselectedState?.name || '',
      });
      setErrors(EMPTY_ERRORS);
    }
  }, [open, preselectedState]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, saving]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleChange = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  }, []);

  const handleSubmit = async () => {
    const { errors: ve, isValid } = validate(form);
    if (!isValid) { setErrors(ve); return; }
    const success = await onSubmit({ cityName: form.cityName.trim(), stateName: form.stateName });
    if (success) onClose();
  };

  if (!open) return null;

  return createPortal(
    <div
      className="aam-backdrop"
      onClick={saving ? undefined : onClose}
    >
      <div
        className="aam-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: 420 }}
      >
        {/* Header */}
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="aam-title">Add New City</h2>
              <p className="aam-subtitle">Add a city to a state</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="aam-body">

          {/* City name */}
          <div className="aam-field">
            <label className="aam-label">City Name <span className="aam-required">*</span></label>
            <input
              className={`aam-input${errors.cityName ? ' aam-input--error' : ''}`}
              type="text"
              placeholder="e.g. Barnala"
              value={form.cityName}
              onChange={e => handleChange('cityName', e.target.value)}
              disabled={saving}
              autoFocus
            />
            {errors.cityName && <p className="aam-error">{errors.cityName}</p>}
          </div>

          {/* State dropdown */}
          <div className="aam-field">
            <label className="aam-label">State <span className="aam-required">*</span></label>
            <select
              className={`aam-select${errors.stateName ? ' aam-input--error' : ''}`}
              value={form.stateName}
              onChange={e => handleChange('stateName', e.target.value)}
              disabled={saving}
            >
              <option value="">Select a state…</option>
              {states.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            {errors.stateName && <p className="aam-error">{errors.stateName}</p>}
          </div>

        </div>

        {/* Footer */}
        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}
                  style={{ background: '#16a34a' }}
          >
            {saving
              ? <><span className="aam-spinner" /> Adding…</>
              : <><MapPin size={14} /> Add City</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddCityModal;
