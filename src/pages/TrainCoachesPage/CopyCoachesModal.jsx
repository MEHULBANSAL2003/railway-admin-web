import { useState, useEffect } from 'react';
import { createPortal }        from 'react-dom';
import { Copy, X, AlertTriangle, CheckCircle2, Train } from 'lucide-react';
import { TrainCoachService } from '../../services/TrainCoachService.js';
import { useToast }          from '../../context/Toast/useToast.js';
import SearchableSelect      from '../../components/UI/SearchableSelect/SearchableSelect.jsx';
import { fetchTrains }       from '../../utils/searchFetchers.js';
import '../AdminManagement/AddAdminModal.css';
import './CopyCoachesModal.css';

// ─────────────────────────────────────────────────────────────────────────────
// CopyCoachesModal
//
// Props:
//   open           — boolean
//   onClose        — () => void
//   sourceTrainNumber — string  (the train we're copying FROM)
//   coachCount     — number  (how many coach types source has, for preview)
//   onSuccess      — () => void  (reload parent after copy)
// ─────────────────────────────────────────────────────────────────────────────
const CopyCoachesModal = ({ open, onClose, sourceTrainNumber, coachCount, onSuccess }) => {
  const { showError } = useToast();

  const [targetTrain, setTargetTrain] = useState('');   // train number string
  const [targetLabel, setTargetLabel] = useState('');   // display label
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setTargetTrain('');
    setTargetLabel('');
    setError('');
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, saving, onClose]);

  // Fetch trains for dropdown — exclude the source train
  const fetchTargetTrains = async (search) => {
    const options = await fetchTrains(search);
    return options.filter(o => o.value !== sourceTrainNumber);
  };

  const handleSubmit = async () => {
    if (!targetTrain) { setError('Please select a target train.'); return; }
    setSaving(true);
    try {
      await TrainCoachService.copyCoaches(sourceTrainNumber, targetTrain);
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.error?.message ||
        'Failed to copy coaches. Please try again.';
      showError(msg);
    } finally { setSaving(false); }
  };

  if (!open) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true" style={{ maxWidth: 460 }}>

        {/* Header */}
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Copy size={17}/>
            </div>
            <div>
              <h2 className="aam-title">Copy Coaches</h2>
              <p className="aam-subtitle">Copy from Train {sourceTrainNumber}</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}>
            <X size={18}/>
          </button>
        </div>

        <div className="aam-body">

          {/* What will be copied */}
          <div className="ccm-source-info">
            <div className="ccm-source-row">
              <Train size={14}/>
              <span>
                <strong>{coachCount} coach type{coachCount !== 1 ? 's' : ''}</strong> will be
                copied from train <strong>{sourceTrainNumber}</strong>
              </span>
            </div>
          </div>

          {/* Target train selector */}
          <div className="aam-field">
            <label className="aam-label">
              Copy To Train <span className="aam-required">*</span>
            </label>
            <SearchableSelect
              value={targetTrain}
              onChange={(val, opt) => {
                setTargetTrain(val || '');
                setTargetLabel(opt?.label || '');
                setError('');
              }}
              fetchOptions={fetchTargetTrains}
              placeholder="Search train number or name…"
              disabled={saving}
              size="full"
            />
            {error && <p className="aam-error">{error}</p>}
          </div>

          {/* Warning */}
          <div className="ccm-warning">
            <AlertTriangle size={14}/>
            <span>
              Target train must have <strong>no existing coaches</strong>.
              This action cannot be undone.
            </span>
          </div>

          {/* Preview — shown once target is selected */}
          {targetTrain && (
            <div className="ccm-preview">
              <CheckCircle2 size={14}/>
              <span>
                Will copy <strong>{coachCount}</strong> coach type{coachCount !== 1 ? 's' : ''}
                {' '}to train <strong>{targetTrain}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="ccm-submit-btn" onClick={handleSubmit} disabled={saving || !targetTrain}>
            {saving
              ? <><span className="aam-spinner"/> Copying…</>
              : <><Copy size={14}/> Copy Coaches</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CopyCoachesModal;
