import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus } from 'lucide-react';
import { AdminService } from '../../services/AdminService.js';
import { useToast } from '../../context/Toast/useToast.js';
import './AddAdminModal.css';

const ROLE_OPTIONS = [
  { value: 'ADMIN',       label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

const DEPARTMENT_OPTIONS = [
  { value: 'TECH',       label: 'Tech' },
  { value: 'OPERATIONS', label: 'Operations' },
  { value: 'FINANCE',    label: 'Finance' },
];

const EMPTY_FORM = {
  firstName: '',
  email:     '',
  phone:     '',
  role:      'ADMIN',
  department: 'TECH',
};

const EMPTY_ERRORS = {
  firstName: '', email: '', phone: '', role: '', department: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{7,15}$/;

const validate = (form) => {
  const errors = { ...EMPTY_ERRORS };
  let isValid = true;

  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required.'; isValid = false;
  } else if (form.firstName.trim().length < 2) {
    errors.firstName = 'Name must be at least 2 characters.'; isValid = false;
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.'; isValid = false;
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.'; isValid = false;
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required.'; isValid = false;
  } else if (!PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = 'Enter a valid phone number (7-15 digits).'; isValid = false;
  }

  if (!form.role)       { errors.role = 'Role is required.';       isValid = false; }
  if (!form.department) { errors.department = 'Department is required.'; isValid = false; }

  return { errors, isValid };
};

const AddAdminModal = ({ open, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [saving, setSaving] = useState(false);

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

  const handleChange = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  }, []);

  const handleClose = useCallback(() => {
    if (saving) return;
    setForm(EMPTY_FORM);
    setErrors(EMPTY_ERRORS);
    onClose();
  }, [saving, onClose]);

  const handleSubmit = async () => {
    const { errors: ve, isValid } = validate(form);
    if (!isValid) { setErrors(ve); return; }

    setSaving(true);
    try {
      const payload = {
        firstName:  form.firstName.trim(),
        email:      form.email.trim().toLowerCase(),
        phone:      form.phone.trim(),
        role:       form.role,
        department: form.department,
      };
      const res = await AdminService.create(payload);
      const created = res?.data?.data;
      showSuccess(`Admin "${created?.firstName || form.firstName}" created successfully.`);
      handleClose();
      onSuccess?.();
    } catch (err) {
      const msg = err?.response?.data?.error?.message || '';
      if (msg.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: msg }));
      } else if (msg.toLowerCase().includes('phone')) {
        setErrors(prev => ({ ...prev, phone: msg }));
      } else {
        showError(msg || 'Failed to create admin. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : handleClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon"><UserPlus size={18} /></div>
            <div>
              <h2 className="aam-title">Add New Admin</h2>
              <p className="aam-subtitle">Fill in the details to create a new admin account</p>
            </div>
          </div>
          <button className="aam-close" onClick={handleClose} disabled={saving}>
            <X size={18} />
          </button>
        </div>

        <div className="aam-body">
          <div className="aam-field">
            <label className="aam-label">First Name <span className="aam-required">*</span></label>
            <input
              className={`aam-input${errors.firstName ? ' aam-input--error' : ''}`}
              type="text"
              placeholder="e.g. Mehul"
              value={form.firstName}
              onChange={e => handleChange('firstName', e.target.value)}
              disabled={saving}
              autoFocus
            />
            {errors.firstName && <p className="aam-error">{errors.firstName}</p>}
          </div>

          <div className="aam-field">
            <label className="aam-label">Email Address <span className="aam-required">*</span></label>
            <input
              className={`aam-input${errors.email ? ' aam-input--error' : ''}`}
              type="email"
              placeholder="e.g. mehul@company.com"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              disabled={saving}
            />
            {errors.email && <p className="aam-error">{errors.email}</p>}
          </div>

          <div className="aam-field">
            <label className="aam-label">Phone Number <span className="aam-required">*</span></label>
            <div className="aam-phone-row">
              <input className="aam-input aam-input--country" value="+91" readOnly tabIndex={-1} />
              <input
                className={`aam-input aam-input--phone${errors.phone ? ' aam-input--error' : ''}`}
                type="tel"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                disabled={saving}
                maxLength={15}
              />
            </div>
            {errors.phone && <p className="aam-error">{errors.phone}</p>}
          </div>

          <div className="aam-row">
            <div className="aam-field">
              <label className="aam-label">Role <span className="aam-required">*</span></label>
              <select
                className={`aam-select${errors.role ? ' aam-input--error' : ''}`}
                value={form.role}
                onChange={e => handleChange('role', e.target.value)}
                disabled={saving}
              >
                {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors.role && <p className="aam-error">{errors.role}</p>}
            </div>

            <div className="aam-field">
              <label className="aam-label">Department <span className="aam-required">*</span></label>
              <select
                className={`aam-select${errors.department ? ' aam-input--error' : ''}`}
                value={form.department}
                onChange={e => handleChange('department', e.target.value)}
                disabled={saving}
              >
                {DEPARTMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors.department && <p className="aam-error">{errors.department}</p>}
            </div>
          </div>
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <><span className="aam-spinner" /> Creating...</>
            ) : (
              <><UserPlus size={15} /> Create Admin</>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddAdminModal;
