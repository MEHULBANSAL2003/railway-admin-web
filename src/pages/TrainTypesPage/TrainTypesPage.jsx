import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Plus, Pencil, ToggleLeft, ToggleRight,
  Search, RotateCcw, X, Train, Zap, Gauge,
  ChevronDown, ChevronUp, Armchair, Snowflake,
  Wind, Save, Loader,
} from "lucide-react";
import { TrainTypeService } from "../../services/TrainTypeService.js";
import { CoachTypeService } from "../../services/CoachTypeService.js";
import { useToast } from "../../context/Toast/useToast.js";
import CascadeToggleModal from "../../components/UI/CascadeToggleModal/CascadeToggleModal.jsx";
import "../AdminManagement/AdminManagement.css";
import "./TrainTypesPage.css";
import "../StationManagement/StationManagementPage.css";
import './AllowedCoachesSection.css';

// ── Allowed Coaches Section ───────────────────────────────
const AllowedCoachesSection = ({ typeCode, colSpan }) => {
  const { showSuccess, showError } = useToast();

  const [allowed,  setAllowed]  = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [selected, setSelected] = useState([]);  // working set of codes
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [dirty,    setDirty]    = useState(false);

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
      const res  = await TrainTypeService.setAllowedCoaches(typeCode, selected);
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
      <td colSpan={colSpan} style={{ padding: 0, borderBottom: '2px solid var(--primary-100)' }}>
        <div className="acs-container">

          {/* Header */}
          <div className="acs-header">
            <div className="acs-header-left">
              <Armchair size={14} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
              <span className="acs-title">Allowed Coach Types</span>
              <span className="acs-subtitle">
                Only selected types can be added to trains of this category
              </span>
            </div>
            {dirty && (
              <div className="acs-actions">
                <button className="acs-btn-reset" onClick={handleReset} disabled={saving}>
                  <X size={12} /> Reset
                </button>
                <button className="acs-btn-save" onClick={handleSave} disabled={saving}>
                  {saving
                    ? <><span className="aam-spinner" style={{ width: 11, height: 11 }} /> Saving…</>
                    : <><Save size={12} /> Save Changes</>}
                </button>
              </div>
            )}
          </div>

          {/* Body */}
          {loading ? (
            <div className="acs-loading">
              <span className="aam-spinner" style={{ width: 13, height: 13 }} />
              Loading coach types…
            </div>
          ) : allTypes.length === 0 ? (
            <div className="acs-empty">
              No active coach types found. Add coach types first.
            </div>
          ) : (
            <>
              <div className="acs-grid">
                {allTypes.map(ct => {
                  const isSelected = selected.includes(ct.typeCode);
                  return (
                    <button
                      key={ct.typeCode}
                      className={`acs-coach-card${isSelected ? ' selected' : ''}`}
                      onClick={() => toggle(ct.typeCode)}
                      disabled={saving}>

                      {isSelected && <span className="acs-check">✓</span>}

                      <div className="acs-coach-top">
                        <span className="acs-coach-code">{ct.typeCode}</span>
                        {ct.isAc
                          ? <span className="tc-ac-tag"><Snowflake size={9} /> AC</span>
                          : <span className="tc-non-ac-tag"><Wind size={9} /> Non-AC</span>}
                      </div>
                      <div className="acs-coach-name">{ct.typeName}</div>
                      <div className="acs-coach-seats">{ct.totalSeats} seats / coach</div>
                    </button>
                  );
                })}
              </div>

              <div className="acs-footer">
                {selected.length === 0
                  ? <span className="acs-footer-warn">
                      ⚠ No coach types selected — trains of this type won't allow any coaches.
                    </span>
                  : <span className="acs-footer-count">
                      <strong>{selected.length}</strong> coach type{selected.length !== 1 ? 's' : ''} allowed
                    {!dirty && <span style={{ color: 'var(--text-tertiary)', marginLeft: 6 }}>· Saved</span>}
                    </span>
                }
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

// ── Add / Edit Modal ──────────────────────────────────────
const TrainTypeModal = ({ open, onClose, editItem, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const isEdit = !!editItem;

  const EMPTY = { typeCode: "", typeName: "", description: "", typicalSpeedKmh: "", isSuperfast: false };
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editItem ? {
        typeCode:        editItem.typeCode,
        typeName:        editItem.typeName,
        description:     editItem.description || "",
        typicalSpeedKmh: editItem.typicalSpeedKmh ?? "",
        isSuperfast:     editItem.isSuperfast ?? false,
      } : EMPTY);
      setErrors({});
    }
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open, editItem]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape" && !saving) onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, saving]);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!isEdit && !form.typeCode.trim()) e.typeCode = "Code is required.";
    if (!isEdit && form.typeCode.trim().length > 20) e.typeCode = "Max 20 characters.";
    if (!form.typeName.trim()) e.typeName = "Name is required.";
    if (form.typeName.trim().length > 100) e.typeName = "Max 100 characters.";
    if (form.typicalSpeedKmh !== "" &&
      (isNaN(form.typicalSpeedKmh) || +form.typicalSpeedKmh < 1 || +form.typicalSpeedKmh > 600))
      e.typicalSpeedKmh = "Speed must be between 1 and 600.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = {
        typeName:        form.typeName.trim(),
        description:     form.description.trim() || null,
        typicalSpeedKmh: form.typicalSpeedKmh !== "" ? +form.typicalSpeedKmh : null,
        isSuperfast:     form.isSuperfast,
      };
      if (!isEdit) payload.typeCode = form.typeCode.trim().toUpperCase();

      if (isEdit) {
        const res = await TrainTypeService.updateTrainType(editItem.typeCode, payload);
        showSuccess("Train type updated successfully.");
        onSuccess(res.data.data);
      } else {
        const res = await TrainTypeService.addTrainType(payload);
        showSuccess("Train type added successfully.");
        onSuccess(res.data.data);
      }
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || "Failed to save train type.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true" style={{ maxWidth: 480 }}>
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: "#eff6ff", color: "#1d4ed8" }}>
              <Train size={17} />
            </div>
            <div>
              <h2 className="aam-title">{isEdit ? "Edit Train Type" : "Add Train Type"}</h2>
              <p className="aam-subtitle">
                {isEdit ? "Update train type details" : "Add a new train type to the system"}
              </p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18} /></button>
        </div>

        <div className="aam-body">
          {!isEdit && (
            <div className="aam-field">
              <label className="aam-label">Type Code <span className="aam-required">*</span></label>
              <input className={`aam-input${errors.typeCode ? " aam-input--error" : ""}`}
                     placeholder="e.g. RAJDHANI"
                     value={form.typeCode}
                     onChange={e => set("typeCode", e.target.value.toUpperCase())}
                     disabled={saving} maxLength={20} />
              {errors.typeCode && <p className="aam-error">{errors.typeCode}</p>}
            </div>
          )}
          <div className="aam-field">
            <label className="aam-label">Type Name <span className="aam-required">*</span></label>
            <input className={`aam-input${errors.typeName ? " aam-input--error" : ""}`}
                   placeholder="e.g. Rajdhani Express"
                   value={form.typeName}
                   onChange={e => set("typeName", e.target.value)}
                   disabled={saving} maxLength={100} />
            {errors.typeName && <p className="aam-error">{errors.typeName}</p>}
          </div>
          <div className="aam-field">
            <label className="aam-label">Description</label>
            <textarea className="aam-input" rows={2}
                      placeholder="Optional description..."
                      value={form.description}
                      onChange={e => set("description", e.target.value)}
                      disabled={saving}
                      style={{ resize: "vertical", minHeight: 60, paddingTop: 8 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-4)" }}>
            <div className="aam-field" style={{ marginBottom: 0 }}>
              <label className="aam-label">Avg Speed (km/h)</label>
              <div style={{ position: "relative" }}>
                <Gauge size={13} style={{
                  position: "absolute", left: 10, top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-tertiary)", pointerEvents: "none",
                }} />
                <input className={`aam-input${errors.typicalSpeedKmh ? " aam-input--error" : ""}`}
                       style={{ paddingLeft: 30 }}
                       type="number" min={1} max={600} placeholder="e.g. 130"
                       value={form.typicalSpeedKmh}
                       onChange={e => set("typicalSpeedKmh", e.target.value)}
                       disabled={saving} />
              </div>
              {errors.typicalSpeedKmh && <p className="aam-error">{errors.typicalSpeedKmh}</p>}
            </div>
            <div className="aam-field" style={{ marginBottom: 0 }}>
              <label className="aam-label">Superfast</label>
              <button type="button"
                      onClick={() => set("isSuperfast", !form.isSuperfast)}
                      disabled={saving}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        height: 36, padding: "0 var(--spacing-3)",
                        border: "1px solid var(--border-primary)",
                        borderRadius: "var(--radius-md)", background: "var(--bg-primary)",
                        cursor: saving ? "not-allowed" : "pointer",
                        fontFamily: "inherit", fontSize: "var(--font-size-sm)",
                        color: form.isSuperfast ? "#d97706" : "var(--text-secondary)", width: "100%",
                      }}>
                <Zap size={14} style={{ color: form.isSuperfast ? "#d97706" : "var(--text-tertiary)" }} />
                {form.isSuperfast ? "Yes — Superfast" : "No — Regular"}
              </button>
            </div>
          </div>
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{
            display: "flex", alignItems: "center", gap: 6, height: 36,
            padding: "0 var(--spacing-4)",
            background: saving ? "var(--primary-300)" : "var(--primary-600)",
            color: "#fff", border: "none", borderRadius: "var(--radius-md)",
            fontFamily: "inherit", fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            cursor: saving ? "not-allowed" : "pointer",
          }}>
            {saving
              ? <><span className="aam-spinner" /> Saving…</>
              : isEdit ? "Update Type" : "Add Type"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main Page ─────────────────────────────────────────────
const TrainTypesPage = () => {
  const { showSuccess, showError } = useToast();

  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editItem,     setEditItem]     = useState(null);
  const [cascadeModal, setCascadeModal] = useState(null);
  const [expandedType, setExpandedType] = useState(null); // typeCode of expanded row

  const debounceRef = useRef(null);

  const fetchData = useCallback(async (s = "") => {
    setLoading(true);
    try {
      const params = s ? { search: s } : {};
      const res = await TrainTypeService.getAllForAdmin(params);
      setData(res.data.data || []);
    } catch {
      showError("Failed to load train types.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (val) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchData(val), 400);
  };

  const toggleExpand = (typeCode) =>
    setExpandedType(prev => prev === typeCode ? null : typeCode);

  const handleToggleClick  = (item) => setCascadeModal({ item, targetStatus: !item.isActive });

  const handleToggleConfirm = async () => {
    const { item, targetStatus } = cascadeModal;
    setData(prev => prev.map(r =>
      r.typeId === item.typeId ? { ...r, isActive: targetStatus } : r
    ));
    try {
      const res = await TrainTypeService.toggleStatus(item.typeCode, targetStatus);
      showSuccess(res.data?.data?.message || "Status updated.");
      fetchData(search);
    } catch (err) {
      setData(prev => prev.map(r =>
        r.typeId === item.typeId ? { ...r, isActive: item.isActive } : r
      ));
      showError(err?.response?.data?.error?.message || "Failed to update status.");
    }
  };

  const handleModalSuccess = (updated) => {
    setData(prev => {
      const exists = prev.find(r => r.typeId === updated.typeId);
      if (exists) return prev.map(r => r.typeId === updated.typeId ? updated : r);
      return [updated, ...prev];
    });
  };

  const activeCount    = data.filter(d => d.isActive).length;
  const inactiveCount  = data.filter(d => !d.isActive).length;
  const superfastCount = data.filter(d => d.isSuperfast && d.isActive).length;

  // 7 cols: Code, Name, Desc, Speed, Superfast, Status, Actions, Expand
  const COL_COUNT = 8;

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1 className="page-title">Train Types</h1>
          <p className="page-subtitle">Manage train type classifications and allowed coach types</p>
        </div>
        <button className="btn btn-primary"
                onClick={() => { setEditItem(null); setModalOpen(true); }}>
          <Plus size={16} /> Add Train Type
        </button>
      </div>

      {/* Stats */}
      <div className="tt-stats">
        <div className="tt-stat-card">
          <div className="tt-stat-label">Total Types</div>
          <div className="tt-stat-value">{data.length}</div>
        </div>
        <div className="tt-stat-card">
          <div className="tt-stat-label">Active</div>
          <div className="tt-stat-value" style={{ color: "#16a34a" }}>{activeCount}</div>
        </div>
        <div className="tt-stat-card">
          <div className="tt-stat-label">Inactive</div>
          <div className="tt-stat-value" style={{ color: "var(--text-tertiary)" }}>{inactiveCount}</div>
        </div>
        <div className="tt-stat-card">
          <div className="tt-stat-label">Superfast</div>
          <div className="tt-stat-value" style={{ color: "#d97706" }}>{superfastCount}</div>
        </div>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="tt-toolbar">
          <div className="sm-filter-wrap">
            <span className="sm-filter-icon"><Search size={13} /></span>
            <input className="sm-filter-input" placeholder="Search code or name…"
                   value={search} onChange={e => handleSearch(e.target.value)} />
          </div>
          {search && (
            <button className="sm-reset-btn" onClick={() => { setSearch(""); fetchData(); }}>
              <RotateCcw size={12} /> Reset
            </button>
          )}
          <span style={{
            marginLeft: "auto", fontSize: "var(--font-size-xs)",
            color: "var(--text-tertiary)",
          }}>
            {data.length} type{data.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="sm-table">
            <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Avg Speed</th>
              <th>Superfast</th>
              <th>Status</th>
              <th style={{ width: 80 }} />
              {/* Expand column */}
              <th style={{ width: 36 }} />
            </tr>
            </thead>
            <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j}><div className="sm-skeleton" style={{ width: "60%" }} /></td>
                ))}
                <td /><td />
              </tr>
            ))}

            {!loading && data.map(item => (
              <>
                {/* ── Data row ── */}
                <tr key={item.typeId}
                    className={expandedType === item.typeCode ? 'acs-expanded-row' : ''}
                    style={{ cursor: 'default' }}>
                  <td>
                    <code style={{
                      fontFamily: "monospace", fontSize: 12, fontWeight: 700,
                      background: "#eff6ff", color: "#1d4ed8",
                      padding: "2px 8px", borderRadius: 4,
                    }}>
                      {item.typeCode}
                    </code>
                  </td>
                  <td>
                      <span style={{
                        fontWeight: "var(--font-weight-medium)",
                        fontSize: "var(--font-size-sm)",
                      }}>
                        {item.typeName}
                      </span>
                  </td>
                  <td>
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
                        {item.description || "—"}
                      </span>
                  </td>
                  <td>
                    {item.typicalSpeedKmh
                      ? <span style={{ fontSize: "var(--font-size-sm)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Gauge size={12} style={{ color: "var(--text-tertiary)" }} />
                        {item.typicalSpeedKmh} km/h
                          </span>
                      : <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                  </td>
                  <td>
                    {item.isSuperfast
                      ? <span className="tt-badge superfast"><Zap size={11} /> Superfast</span>
                      : <span className="tt-badge regular">Regular</span>}
                  </td>
                  <td>
                      <span className={`sm-status-badge ${item.isActive ? "active" : "inactive"}`}>
                        <span className="sm-status-dot" />
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                  </td>
                  <td>
                    <div className="sm-row-actions">
                      <button className="sm-action-btn" title="Edit"
                              onClick={() => { setEditItem(item); setModalOpen(true); }}>
                        <Pencil size={14} />
                      </button>
                      <button
                        className={`sm-action-btn${item.isActive ? " danger" : ""}`}
                        title={item.isActive ? "Deactivate" : "Activate"}
                        onClick={() => handleToggleClick(item)}>
                        {item.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                    </div>
                  </td>
                  {/* Expand / collapse button */}
                  <td>
                    <button
                      className={`sm-action-btn${expandedType === item.typeCode ? ' acs-expand-active' : ''}`}
                      title="Manage allowed coach types"
                      onClick={() => toggleExpand(item.typeCode)}>
                      {expandedType === item.typeCode
                        ? <ChevronUp size={14} />
                        : <ChevronDown size={14} />}
                    </button>
                  </td>
                </tr>

                {/* ── Allowed coaches section — expands inline ── */}
                {expandedType === item.typeCode && (
                  <AllowedCoachesSection
                    key={`acs-${item.typeCode}`}
                    typeCode={item.typeCode}
                    colSpan={COL_COUNT}
                  />
                )}
              </>
            ))}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={COL_COUNT}>
                  <div className="sm-empty">
                    <div className="sm-empty-icon"><Train size={24} /></div>
                    <div className="sm-empty-title">No train types found</div>
                    <div className="sm-empty-desc">Add your first train type to get started.</div>
                  </div>
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      <TrainTypeModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        editItem={editItem}
        onSuccess={handleModalSuccess}
      />

      <CascadeToggleModal
        open={!!cascadeModal}
        onClose={() => setCascadeModal(null)}
        onConfirm={handleToggleConfirm}
        fetchInfo={() => TrainTypeService.getCascadeInfo(cascadeModal?.item.typeCode)}
        targetStatus={cascadeModal?.targetStatus ?? true}
        entityLabel="Train Type"
      />
    </div>
  );
};

export default TrainTypesPage;
