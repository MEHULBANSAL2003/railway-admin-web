import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Plus, Pencil, ToggleLeft, ToggleRight,
  Search, RotateCcw, X, Tag,
} from "lucide-react";
import { QuotaService } from "../../services/QuotaService.js";
import { useToast }     from "../../context/Toast/useToast.js";
import CascadeToggleModal from "../../components/UI/CascadeToggleModal/CascadeToggleModal.jsx";
import "../AdminManagement/AdminManagement.css";
import "../TrainTypesPage/TrainTypesPage.css";
import "../StationManagement/StationManagementPage.css";

// ── Add Modal ─────────────────────────────────────────────
const QuotaModal = ({ open, onClose, editItem, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const isEdit = !!editItem;

  const EMPTY = { quotaCode: "", quotaName: "", description: "" };
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editItem ? {
        quotaCode:   editItem.quotaCode,
        quotaName:   editItem.quotaName,
        description: editItem.description || "",
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

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!isEdit && !form.quotaCode.trim())            e.quotaCode = "Code is required.";
    if (!isEdit && form.quotaCode.trim().length > 20) e.quotaCode = "Max 20 characters.";
    if (!form.quotaName.trim())                       e.quotaName = "Name is required.";
    if (form.quotaName.trim().length > 50)            e.quotaName = "Max 50 characters.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      if (isEdit) {
        showError("Edit not supported — deactivate old quota and add a new one.");
        setSaving(false);
        return;
      }
      const payload = {
        quotaCode:   form.quotaCode.trim().toUpperCase(),
        quotaName:   form.quotaName.trim(),
        description: form.description.trim() || null,
      };
      const res = await QuotaService.addQuota(payload);
      showSuccess("Quota added successfully.");
      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || "Failed to save quota.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true" style={{ maxWidth: 440 }}>
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
              <Tag size={17} />
            </div>
            <div>
              <h2 className="aam-title">{isEdit ? "Quota Details" : "Add Quota"}</h2>
              <p className="aam-subtitle">{isEdit ? "View quota details" : "Add a new booking quota type"}</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18} /></button>
        </div>
        <div className="aam-body">
          {!isEdit && (
            <div className="aam-field">
              <label className="aam-label">Quota Code <span className="aam-required">*</span></label>
              <input
                className={`aam-input${errors.quotaCode ? " aam-input--error" : ""}`}
                placeholder="e.g. GENERAL, TATKAL, LADIES"
                value={form.quotaCode}
                onChange={e => set("quotaCode", e.target.value.toUpperCase())}
                disabled={saving} maxLength={20}
              />
              {errors.quotaCode && <p className="aam-error">{errors.quotaCode}</p>}
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>
                Short uppercase identifier. Cannot be changed after creation.
              </p>
            </div>
          )}
          <div className="aam-field">
            <label className="aam-label">Quota Name <span className="aam-required">*</span></label>
            <input
              className={`aam-input${errors.quotaName ? " aam-input--error" : ""}`}
              placeholder="e.g. General Quota"
              value={form.quotaName}
              onChange={e => set("quotaName", e.target.value)}
              disabled={saving || isEdit} maxLength={50}
            />
            {errors.quotaName && <p className="aam-error">{errors.quotaName}</p>}
          </div>
          <div className="aam-field">
            <label className="aam-label">Description</label>
            <textarea
              className="aam-input" rows={2}
              placeholder="Optional description..."
              value={form.description}
              onChange={e => set("description", e.target.value)}
              disabled={saving || isEdit}
              style={{ resize: "vertical", minHeight: 60, paddingTop: 8 }}
            />
          </div>
        </div>
        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            {isEdit ? "Close" : "Cancel"}
          </button>
          {!isEdit && (
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
              {saving ? <><span className="aam-spinner" /> Saving…</> : "Add Quota"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main Page ─────────────────────────────────────────────
const QuotasPage = () => {
  const { showSuccess, showError } = useToast();

  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [modalOpen,    setModalOpen]    = useState(false);
  const [viewItem,     setViewItem]     = useState(null);
  const [cascadeModal, setCascadeModal] = useState(null); // { item, targetStatus }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await QuotaService.getAllForAdmin();
      setData(res.data.data || []);
    } catch {
      showError("Failed to load quotas.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchData(); }, []);

  const filtered = data.filter(d =>
    !search ||
    d.quotaCode.toLowerCase().includes(search.toLowerCase()) ||
    d.quotaName.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleClick = (item) => {
    setCascadeModal({ item, targetStatus: !item.isActive });
  };

  const handleToggleConfirm = async () => {
    const { item, targetStatus } = cascadeModal;
    setData(prev => prev.map(r =>
      r.quotaId === item.quotaId ? { ...r, isActive: targetStatus } : r
    ));
    try {
      const res = await QuotaService.toggleStatus(item.quotaCode, targetStatus);
      showSuccess(res.data?.data?.message || "Status updated.");
      fetchData();
    } catch (err) {
      setData(prev => prev.map(r =>
        r.quotaId === item.quotaId ? { ...r, isActive: item.isActive } : r
      ));
      showError(err?.response?.data?.error?.message || "Failed to update status.");
    }
  };

  const handleModalSuccess = (added) => {
    setData(prev => {
      const exists = prev.find(r => r.quotaId === added.quotaId);
      if (exists) return prev.map(r => r.quotaId === added.quotaId ? added : r);
      return [added, ...prev];
    });
  };

  const activeCount   = data.filter(d => d.isActive).length;
  const inactiveCount = data.filter(d => !d.isActive).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotas</h1>
          <p className="page-subtitle">Manage booking quota types — General, Tatkal, and more</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setViewItem(null); setModalOpen(true); }}>
          <Plus size={16} /> Add Quota
        </button>
      </div>

      <div className="tt-stats">
        <div className="tt-stat-card">
          <div className="tt-stat-label">Total Quotas</div>
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
      </div>

      <div className="card">
        <div className="tt-toolbar">
          <div className="sm-filter-wrap">
            <span className="sm-filter-icon"><Search size={13} /></span>
            <input className="sm-filter-input" placeholder="Search code or name…"
                   value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {search && (
            <button className="sm-reset-btn" onClick={() => setSearch("")}>
              <RotateCcw size={12} /> Reset
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
            {filtered.length} quota{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="sm-table">
            <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th style={{ width: 80 }} />
            </tr>
            </thead>
            <tbody>
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <td key={j}><div className="sm-skeleton" style={{ width: "60%" }} /></td>
                ))}
                <td />
              </tr>
            ))}

            {!loading && filtered.map(item => (
              <tr key={item.quotaId}>
                <td>
                    <span style={{
                      fontFamily: "monospace", fontSize: 12, fontWeight: 700,
                      background: item.quotaCode === "TATKAL" ? "#fef3c7" : "#f5f3ff",
                      color:      item.quotaCode === "TATKAL" ? "#d97706"  : "#7c3aed",
                      padding: "2px 10px", borderRadius: 4,
                      display: "inline-flex", alignItems: "center", gap: 5,
                    }}>
                      <Tag size={10} />
                      {item.quotaCode}
                    </span>
                </td>
                <td>
                    <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)" }}>
                      {item.quotaName}
                    </span>
                </td>
                <td>
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
                      {item.description || "—"}
                    </span>
                </td>
                <td>
                    <span className={`sm-status-badge ${item.isActive ? "active" : "inactive"}`}>
                      <span className="sm-status-dot" />
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                </td>
                <td>
                  <div className="sm-row-actions">
                    <button className="sm-action-btn" title="View details"
                            onClick={() => { setViewItem(item); setModalOpen(true); }}>
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
              </tr>
            ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="sm-empty">
                    <div className="sm-empty-icon"><Tag size={24} /></div>
                    <div className="sm-empty-title">
                      {search ? "No quotas match your search" : "No quotas found"}
                    </div>
                    <div className="sm-empty-desc">
                      {search ? "Try a different search term." : "Add GENERAL and TATKAL to get started."}
                    </div>
                  </div>
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      <QuotaModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setViewItem(null); }}
        editItem={viewItem}
        onSuccess={handleModalSuccess}
      />

      <CascadeToggleModal
        open={!!cascadeModal}
        onClose={() => setCascadeModal(null)}
        onConfirm={handleToggleConfirm}
        fetchInfo={() => QuotaService.getCascadeInfo(cascadeModal?.item.quotaCode)}
        targetStatus={cascadeModal?.targetStatus ?? true}
        entityLabel="Quota"
      />
    </div>
  );
};

export default QuotasPage;
