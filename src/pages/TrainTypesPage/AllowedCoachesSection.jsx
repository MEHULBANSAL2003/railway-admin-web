// ── AllowedCoachesSection.jsx ─────────────────────────────
// Drop this component into your TrainTypesPage as an expandable
// section rendered below each train type row in the table.
//
// Usage in TrainTypesPage row:
//   const [expandedType, setExpandedType] = useState(null);
//   onClick row → setExpandedType(type.typeCode === expandedType ? null : type.typeCode)
//   Below <tr> render: expandedType === type.typeCode && <AllowedCoachesSection ... />

import { useState, useEffect } from 'react';
import { Armchair, Snowflake, Wind, Plus, Save, X, Loader } from 'lucide-react';
import { TrainTypeService } from '../../services/TrainTypeService.js';
import { CoachTypeService } from '../../services/CoachTypeService.js';
import { useToast }         from '../../context/Toast/useToast.js';
import './AllowedCoachesSection.css';

const AllowedCoachesSection = ({ typeCode, colSpan }) => {
  const { showSuccess, showError } = useToast();

  const [allowed,    setAllowed]    = useState([]);   // current saved list
  const [allTypes,   setAllTypes]   = useState([]);   // all active coach types
  const [selected,   setSelected]   = useState([]);   // working selection (codes)
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [dirty,      setDirty]      = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [allowedRes, allRes] = await Promise.all([
          TrainTypeService.getAllowedCoaches(typeCode),
          CoachTypeService.getAllForDropdown(''),
        ]);
        const allowedList = allowedRes.data.data || [];
        const allList     = allRes.data.data     || [];
        setAllowed(allowedList);
        setAllTypes(allList);
        setSelected(allowedList.map(a => a.coachTypeCode));
      } catch {
        showError('Failed to load allowed coaches.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [typeCode]);

  const toggle = (code) => {
    setSelected(prev => {
      const next = prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code];
      setDirty(true);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await TrainTypeService.setAllowedCoaches(typeCode, selected);
      const saved = res.data.data || [];
      setAllowed(saved);
      setSelected(saved.map(a => a.coachTypeCode));
      setDirty(false);
      showSuccess(`Allowed coaches updated for ${typeCode}.`);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelected(allowed.map(a => a.coachTypeCode));
    setDirty(false);
  };

  return (
    <tr className="acs-row">
      <td colSpan={colSpan} className="acs-cell">
        <div className="acs-container">

          <div className="acs-header">
            <div className="acs-header-left">
              <Armchair size={14} style={{ color: 'var(--primary-600)' }} />
              <span className="acs-title">Allowed Coach Types</span>
              <span className="acs-subtitle">
                Select which coach types can be added to trains of this type
              </span>
            </div>
            {dirty && (
              <div className="acs-actions">
                <button className="acs-btn-reset" onClick={handleReset} disabled={saving}>
                  <X size={12} /> Reset
                </button>
                <button className="acs-btn-save" onClick={handleSave} disabled={saving}>
                  {saving
                    ? <><Loader size={12} className="acs-spin" /> Saving…</>
                    : <><Save size={12} /> Save Changes</>}
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="acs-loading">
              <Loader size={14} className="acs-spin" /> Loading…
            </div>
          ) : (
            <>
              {allTypes.length === 0 ? (
                <div className="acs-empty">No active coach types found. Add coach types first.</div>
              ) : (
                <div className="acs-grid">
                  {allTypes.map(ct => {
                    const isSelected = selected.includes(ct.typeCode);
                    return (
                      <button
                        key={ct.typeCode}
                        className={`acs-coach-card${isSelected ? ' selected' : ''}`}
                        onClick={() => toggle(ct.typeCode)}
                        disabled={saving}>
                        <div className="acs-coach-top">
                          <span className="acs-coach-code">{ct.typeCode}</span>
                          {ct.isAc
                            ? <span className="tc-ac-tag"><Snowflake size={9} /> AC</span>
                            : <span className="tc-non-ac-tag"><Wind size={9} /> Non-AC</span>}
                        </div>
                        <div className="acs-coach-name">{ct.typeName}</div>
                        <div className="acs-coach-seats">{ct.totalSeats} seats</div>
                        {isSelected && (
                          <div className="acs-selected-check">✓</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="acs-footer">
                {selected.length === 0
                  ? <span className="acs-footer-warn">⚠ No coach types selected — trains of this type won't allow any coaches.</span>
                  : <span className="acs-footer-count"><strong>{selected.length}</strong> coach type{selected.length !== 1 ? 's' : ''} allowed</span>
                }
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default AllowedCoachesSection;
