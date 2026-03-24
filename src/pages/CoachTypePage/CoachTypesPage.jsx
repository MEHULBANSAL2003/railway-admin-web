import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Plus, Pencil, ToggleLeft, ToggleRight,
  Search, RotateCcw, X, Armchair, Wind, Users,
} from "lucide-react";
import { CoachTypeService } from "../../services/CoachTypeService.js";
import { useToast } from "../../context/Toast/useToast.js";
import CascadeToggleModal from "../../components/UI/CascadeToggleModal/CascadeToggleModal.jsx";
import "../AdminManagement/AdminManagement.css";
import "../TrainTypesPage/TrainTypesPage.css";
import "../StationManagement/StationManagementPage.css";

// ── Add / Edit Modal ───────────────────────────────────────
const CoachTypeModal = ({ open, onClose, editItem, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const isEdit = !!editItem;

  const EMPTY = { typeCode: "", typeName: "", description: "", totalSeats: "", isAc: false };
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editItem ? {
        typeCode:    editItem.typeCode,
        typeName:    editItem.typeName,
        description: editItem.description || "",
        totalSeats:  editItem.totalSeats ?? "",
        isAc:        editItem.isAc ?? false,
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
    if (!isEdit && form.typeCode.trim().length > 10) e.typeCode = "Max 10 characters.";
    if (!form.typeName.trim()) e.typeName = "Name is required.";
    if (form.typeName.trim().length > 100) e.typeName = "Max 100 characters.";
    if (!form.totalSeats || isNaN(form.totalSeats) || +form.totalSeats < 1 || +form.totalSeats > 200)
      e.totalSeats = "Total seats must be between 1 and 200.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = {
        typeName:    form.typeName.trim(),
        description: form.description.trim() || null,
        totalSeats:  +form.totalSeats,
        isAc:        form.isAc,
      };
      if (!isEdit) payload.typeCode = form.typeCode.trim().toUpperCase();

      let res;
      if (isEdit) {
        res = await CoachTypeService.updateCoachType(editItem.typeCode, payload);
        showSuccess("Coach type updated successfully.");
      } else {
        res = await CoachTypeService.addCoachType(payload);
        showSuccess("Coach type added successfully.");
      }
      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || "Failed to save coach type.");
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
            <div className="aam-header-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <Armchair size={17} />
            </div>
            <div>
              <h2 className="aam-title">{isEdit ? "Edit Coach Type" : "Add Coach Type"}</h2>
              <p className="aam-subtitle">{isEdit ? "Update coach type details" : "Add a new coach type to the system"}</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18} /></button>
        </div>

        <div className="aam-body">
          {!isEdit && (
            <div className="aam-field">
              <label className="aam-label">Type Code <span className="aam-required">*</span></label>
              <input className={`aam-input${errors.typeCode ? " aam-input--error" : ""}`}
                     placeholder="e.g. SL, 3A, 2A, 1A, CC"
                     value={form.typeCode}
                     onChange={e => set("typeCode", e.target.value.toUpperCase())}
                     disabled={saving} maxLength={10} />
              {errors.typeCode && <p className="aam-error">{errors.typeCode}</p>}
            </div>
          )}
          <div className="aam-field">
            <label className="aam-label">Type Name <span className="aam-required">*</span></label>
            <input className={`aam-input${errors.typeName ? " aam-input--error" : ""}`}
                   placeholder="e.g. Sleeper Class"
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
              <label className="aam-label">Total Seats <span className="aam-required">*</span></label>
              <div style={{ position: "relative" }}>
                <Users size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }} />
                <input className={`aam-input${errors.totalSeats ? " aam-input--error" : ""}`}
                       style={{ paddingLeft: 30 }}
                       type="number" min={1} max={200}
                       placeholder="e.g. 72"
                       value={form.totalSeats}
                       onChange={e => set("totalSeats", e.target.value)}
                       disabled={saving} />
              </div>
              {errors.totalSeats && <p className="aam-error">{errors.totalSeats}</p>}
            </div>
            <div className="aam-field" style={{ marginBottom: 0 }}>
              <label className="aam-label">Air Conditioned</label>
              <button type="button"
                      onClick={() => set("isAc", !form.isAc)}
                      disabled={saving}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        height: 36, padding: "0 var(--spacing-3)",
                        border: "1px solid var(--border-primary)",
                        borderRadius: "var(--radius-md)", background: "var(--bg-primary)",
                        cursor: saving ? "not-allowed" : "pointer",
                        fontFamily: "inherit", fontSize: "var(--font-size-sm)",
                        color: form.isAc ? "#0891b2" : "var(--text-secondary)", width: "100%",
                      }}>
                <Wind size={14} style={{ color: form.isAc ? "#0891b2" : "var(--text-tertiary)" }} />
                {form.isAc ? "Yes — AC Coach" : "No — Non-AC"}
              </button>
            </div>
          </div>
        </div>

        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, height: 36,
                    padding: "0 var(--spacing-4)",
                    background: saving ? "var(--primary-300)" : "var(--primary-600)",
                    color: "#fff", border: "none", borderRadius: "var(--radius-md)",
                    fontFamily: "inherit", fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-medium)",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}>
            {saving ? <><span className="aam-spinner" /> Saving…</> : isEdit ? "Update Type" : "Add Type"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main Page ─────────────────────────────────────────────
const CoachTypesPage = () => {
  const { showError, showSuccess } = useToast();

  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editItem,     setEditItem]     = useState(null);
  // ── CHANGED: replaced togglingId with cascadeModal state ──
  const [cascadeModal, setCascadeModal] = useState(null);
  // shape: { item, targetStatus }

  const debounceRef = useRef(null);

  const fetchData = useCallback(async (s = "") => {
    setLoading(true);
    try {
      const params = s ? { search: s } : {};
      const res = await CoachTypeService.getAllForAdmin(params);
      setData(res.data.data || []);
    } catch {
      showError("Failed to load coach types.");
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

  // ── CHANGED: click now opens modal instead of toggling directly ──
  const handleToggleClick = (item) => {
    setCascadeModal({ item, targetStatus: !item.isActive });
  };

  // ── NEW: called by CascadeToggleModal on confirm ──
  const handleToggleConfirm = async (payload) => {
    const { item, targetStatus } = cascadeModal;
    // Optimistic update
    setData(prev => prev.map(r =>
      r.typeId === item.typeId ? { ...r, isActive: targetStatus } : r
    ));
    try {
      const res = await CoachTypeService.toggleStatus(item.typeCode, payload);
      // Backend returns cascade message e.g. "Deactivated. 5 fare rules also deactivated."
      showSuccess(res.data?.data?.message || `Status updated.`);
      // Refresh to reflect any cascaded fare rule changes
      fetchData(search);
    } catch (err) {
      // Rollback
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

  const totalAc     = data.filter(d => d.isAc).length;
  const totalNonAc  = data.filter(d => !d.isAc).length;
  const activeCount = data.filter(d => d.isActive).length;

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1 className="page-title">Coach Types</h1>
          <p className="page-subtitle">Manage coach classifications, seat counts, and AC configuration</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setModalOpen(true); }}>
          <Plus size={16} /> Add Coach Type
        </button>
      </div>

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
          <div className="tt-stat-label">AC Coaches</div>
          <div className="tt-stat-value" style={{ color: "#0891b2" }}>{totalAc}</div>
        </div>
        <div className="tt-stat-card">
          <div className="tt-stat-label">Non-AC Coaches</div>
          <div className="tt-stat-value" style={{ color: "var(--text-secondary)" }}>{totalNonAc}</div>
        </div>
      </div>

      <div className="card">
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
          <span style={{ marginLeft: "auto", fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
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
              <th>Total Seats</th>
              <th>AC</th>
              <th>Status</th>
              <th style={{ width: 80 }} />
            </tr>
            </thead>
            <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j}><div className="sm-skeleton" style={{ width: "60%" }} /></td>
                ))}
                <td />
              </tr>
            ))}

            {!loading && data.map(item => (
              <tr key={item.typeId}>
                <td>
                  <code style={{
                    fontFamily: "monospace", fontSize: 12, fontWeight: 700,
                    background: "#f0fdf4", color: "#16a34a",
                    padding: "2px 8px", borderRadius: 4,
                  }}>
                    {item.typeCode}
                  </code>
                </td>
                <td>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)" }}>
                      {item.typeName}
                    </span>
                </td>
                <td>
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
                      {item.description || "—"}
                    </span>
                </td>
                <td>
                    <span style={{ fontSize: "var(--font-size-sm)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Users size={12} style={{ color: "var(--text-tertiary)" }} />
                      {item.totalSeats}
                    </span>
                </td>
                <td>
                  {item.isAc
                    ? <span className="tt-badge" style={{ background: "#ecfeff", color: "#0891b2" }}>
                          <Wind size={11} /> AC
                        </span>
                    : <span className="tt-badge regular">Non-AC</span>
                  }
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
                    {/* ── CHANGED: onClick now opens cascade modal ── */}
                    <button
                      className={`sm-action-btn${item.isActive ? " danger" : ""}`}
                      title={item.isActive ? "Deactivate" : "Activate"}
                      onClick={() => handleToggleClick(item)}>
                      {item.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="sm-empty">
                    <div className="sm-empty-icon"><Armchair size={24} /></div>
                    <div className="sm-empty-title">No coach types found</div>
                    <div className="sm-empty-desc">Add your first coach type to get started.</div>
                  </div>
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      <CoachTypeModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        editItem={editItem}
        onSuccess={handleModalSuccess}
      />

      {/* ── NEW: cascade modal ── */}
      <CascadeToggleModal
        open={!!cascadeModal}
        onClose={() => setCascadeModal(null)}
        onConfirm={handleToggleConfirm}
        fetchInfo={() => CoachTypeService.getCascadeInfo(cascadeModal.item.typeCode)}
        targetStatus={cascadeModal?.targetStatus ?? true}
        entityLabel="Coach Type"
      />
    </div>
  );
};

export default CoachTypesPage;
