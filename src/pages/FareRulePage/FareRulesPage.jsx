import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Plus, X, ToggleLeft, ToggleRight, History,
  RotateCcw, BadgeDollarSign, CheckCircle2, Clock,
} from "lucide-react";
import { FareRuleService }  from "../../services/FareRuleService.js";
import { useToast }         from "../../context/Toast/useToast.js";
import { TrainTypeService } from "../../services/TrainTypeService.js";
import { CoachTypeService } from "../../services/CoachTypeService.js";
import SearchableSelect     from "../../components/UI/SearchableSelect/SearchableSelect.jsx";
import "../AdminManagement/AddAdminModal.css";
import "../TrainTypesPage/TrainTypesPage.css";
import "./FareRulesPage.css";
import "../StationManagement/StationManagementPage.css";

// ── Helpers ───────────────────────────────────────────────
const fmt     = (v) => v != null ? `₹${Number(v).toFixed(2)}`  : "—";
const fmtRate = (v) => v != null ? `₹${Number(v).toFixed(4)}`  : "—";
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
  : "—";

// ── Fetchers ──────────────────────────────────────────────
const fetchTrainTypes = async (search) => {
  const res = await TrainTypeService.getAllForDropdown(search);
  return (res.data.data || []).map(t => ({
    value: t.typeCode,
    label: t.typeName,
    meta:  t.typeCode,
    raw:   t,
  }));
};

const fetchCoachTypes = async (search) => {
  const res = await CoachTypeService.getAllForDropdown(search);
  return (res.data.data || []).map(c => ({
    value: c.typeCode,
    label: c.typeName,
    meta:  c.typeCode,
    raw:   c,
  }));
};

// ── Field wrapper ─────────────────────────────────────────
const Field = ({ label, required, error, note, children }) => (
  <div className="aam-field" style={{ marginBottom: 0 }}>
    <label className="aam-label">
      {label}{required && <span className="aam-required"> *</span>}
    </label>
    {children}
    {note  && <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{note}</p>}
    {error && <p className="aam-error">{error}</p>}
  </div>
);

// ── Add Modal ─────────────────────────────────────────────
const AddFareRuleModal = ({ open, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();

  const EMPTY = {
    trainTypeCode: "", coachTypeCode: "",
    baseFarePerKm: "", minFare: "", reservationCharge: "",
    superfastCharge: "", gstPct: "", effectiveFrom: "", effectiveUntil: "",
  };
  const [form,      setForm]      = useState(EMPTY);
  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);
  const [selTrain,  setSelTrain]  = useState(null);
  const [selCoach,  setSelCoach]  = useState(null);

  useEffect(() => {
    if (open) { setForm(EMPTY); setErrors({}); setSelTrain(null); setSelCoach(null); }
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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

  const handleTrainChange = (val, raw) => {
    set("trainTypeCode", val);
    setSelTrain(raw);
    if (raw && !raw.isSuperfast) set("superfastCharge", "0");
  };

  const handleCoachChange = (val, raw) => {
    set("coachTypeCode", val);
    setSelCoach(raw);
    if (raw) set("gstPct", raw.isAc ? "5" : "0");
  };

  const validate = () => {
    const e = {};
    if (!form.trainTypeCode) e.trainTypeCode = "Train type is required.";
    if (!form.coachTypeCode) e.coachTypeCode = "Coach type is required.";
    if (!form.baseFarePerKm || isNaN(form.baseFarePerKm) || +form.baseFarePerKm <= 0)
      e.baseFarePerKm = "Must be greater than 0.";
    if (form.minFare === "" || isNaN(form.minFare) || +form.minFare < 0)
      e.minFare = "Required, cannot be negative.";
    if (form.reservationCharge === "" || isNaN(form.reservationCharge) || +form.reservationCharge < 0)
      e.reservationCharge = "Required, cannot be negative.";
    if (form.superfastCharge === "" || isNaN(form.superfastCharge) || +form.superfastCharge < 0)
      e.superfastCharge = "Required, cannot be negative.";
    if (form.gstPct === "" || isNaN(form.gstPct) || +form.gstPct < 0 || +form.gstPct > 100)
      e.gstPct = "Must be 0–100.";
    if (!form.effectiveFrom) e.effectiveFrom = "Effective from is required.";
    if (form.effectiveUntil && form.effectiveFrom && form.effectiveUntil <= form.effectiveFrom)
      e.effectiveUntil = "Must be after effective from.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = {
        trainTypeCode:     form.trainTypeCode,
        coachTypeCode:     form.coachTypeCode,
        baseFarePerKm:     +form.baseFarePerKm,
        minFare:           +form.minFare,
        reservationCharge: +form.reservationCharge,
        superfastCharge:   +form.superfastCharge,
        gstPct:            +form.gstPct,
        effectiveFrom:     form.effectiveFrom,
        effectiveUntil:    form.effectiveUntil || null,
      };
      const res = await FareRuleService.addFareRule(payload);
      showSuccess("Fare rule added successfully.");
      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || "Failed to add fare rule.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true" style={{ maxWidth: 540 }}>

        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: "#fefce8", color: "#ca8a04" }}>
              <BadgeDollarSign size={17} />
            </div>
            <div>
              <h2 className="aam-title">Add Fare Rule</h2>
              <p className="aam-subtitle">Define fare for a train type + coach type combination</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18} /></button>
        </div>

        <div className="aam-body" style={{ gap: "var(--spacing-4)" }}>

          {/* Train + Coach searchable selects */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-4)" }}>
            <Field label="Train Type" required error={errors.trainTypeCode}>
              <SearchableSelect
                value={form.trainTypeCode}
                onChange={handleTrainChange}
                fetchOptions={fetchTrainTypes}
                placeholder="Search train type…"
                disabled={saving}
              />
            </Field>
            <Field label="Coach Type" required error={errors.coachTypeCode}>
              <SearchableSelect
                value={form.coachTypeCode}
                onChange={handleCoachChange}
                fetchOptions={fetchCoachTypes}
                placeholder="Search coach type…"
                disabled={saving}
              />
            </Field>
          </div>

          {/* Hints */}
          {(selTrain || selCoach) && (
            <div className="fr-hints">
              {selTrain && (
                <span className={`fr-hint ${selTrain.isSuperfast ? "superfast" : "regular"}`}>
                  {selTrain.isSuperfast ? "⚡ Superfast train" : "Regular train"}
                </span>
              )}
              {selCoach && (
                <span className={`fr-hint ${selCoach.isAc ? "ac" : "nonac"}`}>
                  {selCoach.isAc ? "❄ AC coach — GST 5% auto-filled" : "Non-AC coach — GST 0% auto-filled"}
                </span>
              )}
            </div>
          )}

          {/* Fare fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-4)" }}>
            <Field label="Base Fare / km (₹)" required error={errors.baseFarePerKm}>
              <input className={`aam-input${errors.baseFarePerKm ? " aam-input--error" : ""}`}
                     type="number" step="0.0001" min="0.0001" placeholder="e.g. 1.2369"
                     value={form.baseFarePerKm} onChange={e => set("baseFarePerKm", e.target.value)}
                     disabled={saving} />
            </Field>
            <Field label="Minimum Fare (₹)" required error={errors.minFare}>
              <input className={`aam-input${errors.minFare ? " aam-input--error" : ""}`}
                     type="number" step="0.01" min="0" placeholder="e.g. 475"
                     value={form.minFare} onChange={e => set("minFare", e.target.value)}
                     disabled={saving} />
            </Field>
            <Field label="Reservation Charge (₹)" required error={errors.reservationCharge}>
              <input className={`aam-input${errors.reservationCharge ? " aam-input--error" : ""}`}
                     type="number" step="0.01" min="0" placeholder="e.g. 40"
                     value={form.reservationCharge} onChange={e => set("reservationCharge", e.target.value)}
                     disabled={saving} />
            </Field>
            <Field label="Superfast Charge (₹)" required error={errors.superfastCharge}>
              <input className={`aam-input${errors.superfastCharge ? " aam-input--error" : ""}`}
                     type="number" step="0.01" min="0" placeholder="e.g. 45"
                     value={form.superfastCharge} onChange={e => set("superfastCharge", e.target.value)}
                     disabled={saving}
                     style={{ background: selTrain && !selTrain.isSuperfast ? "var(--bg-tertiary)" : undefined }} />
            </Field>
            <Field label="GST (%)" required error={errors.gstPct}>
              <input className={`aam-input${errors.gstPct ? " aam-input--error" : ""}`}
                     type="number" step="0.01" min="0" max="100" placeholder="e.g. 5"
                     value={form.gstPct} onChange={e => set("gstPct", e.target.value)}
                     disabled={saving} />
            </Field>
          </div>

          {/* Date range */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-4)" }}>
            <Field label="Effective From" required error={errors.effectiveFrom}>
              <input className={`aam-input${errors.effectiveFrom ? " aam-input--error" : ""}`}
                     type="date" value={form.effectiveFrom}
                     onChange={e => set("effectiveFrom", e.target.value)} disabled={saving} />
            </Field>
            <Field label="Effective Until" error={errors.effectiveUntil}
                   note="Leave blank for open-ended rule">
              <input className={`aam-input${errors.effectiveUntil ? " aam-input--error" : ""}`}
                     type="date" value={form.effectiveUntil}
                     onChange={e => set("effectiveUntil", e.target.value)} disabled={saving} />
            </Field>
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
            {saving ? <><span className="aam-spinner" /> Saving…</> : "Add Fare Rule"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── History Drawer ────────────────────────────────────────
const HistoryDrawer = ({ open, onClose, trainTypeCode, coachTypeCode }) => {
  const { showError } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !trainTypeCode || !coachTypeCode) return;
    setLoading(true);
    FareRuleService.getComboHistory(trainTypeCode, coachTypeCode)
      .then(r => setHistory(r.data.data || []))
      .catch(() => showError("Failed to load history."))
      .finally(() => setLoading(false));
  }, [open, trainTypeCode, coachTypeCode]);

  if (!open) return null;

  return createPortal(
    <div className="aam-backdrop" onClick={onClose}>
      <div className="fr-drawer" onClick={e => e.stopPropagation()}>
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
              <History size={17} />
            </div>
            <div>
              <h2 className="aam-title">Fare History</h2>
              <p className="aam-subtitle">{trainTypeCode} + {coachTypeCode} — all revisions</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: "var(--spacing-4)", overflowY: "auto", flex: 1 }}>
          {loading && (
            <p style={{ color: "var(--text-tertiary)", fontSize: "var(--font-size-sm)" }}>Loading…</p>
          )}
          {!loading && history.map((r) => (
            <div key={r.ruleId} className={`fr-history-card${r.isCurrent ? " current" : ""}`}>
              <div className="fr-history-header">
                <span className={`fr-history-badge ${r.isCurrent ? "current" : "past"}`}>
                  {r.isCurrent
                    ? <><CheckCircle2 size={11} /> Current</>
                    : <><Clock size={11} /> Past</>
                  }
                </span>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                  {fmtDate(r.effectiveFrom)} → {r.effectiveUntil ? fmtDate(r.effectiveUntil) : "Open"}
                </span>
              </div>
              <div className="fr-history-grid">
                <div><span className="fr-lbl">Base/km</span><span className="fr-val">{fmtRate(r.baseFarePerKm)}</span></div>
                <div><span className="fr-lbl">Min Fare</span><span className="fr-val">{fmt(r.minFare)}</span></div>
                <div><span className="fr-lbl">Reservation</span><span className="fr-val">{fmt(r.reservationCharge)}</span></div>
                <div><span className="fr-lbl">Superfast</span><span className="fr-val">{fmt(r.superfastCharge)}</span></div>
                <div><span className="fr-lbl">GST</span><span className="fr-val">{r.gstPct}%</span></div>
              </div>
            </div>
          ))}
          {!loading && history.length === 0 && (
            <p style={{ color: "var(--text-tertiary)", fontSize: "var(--font-size-sm)" }}>No history found.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main Page ─────────────────────────────────────────────
const FareRulesPage = () => {
  const { showSuccess, showError } = useToast();

  const [data,        setData]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [togglingId,  setTogglingId]  = useState(null);
  const [filterTrain, setFilterTrain] = useState("");
  const [filterCoach, setFilterCoach] = useState("");
  const [history,     setHistory]     = useState(null);

  const fetchData = useCallback(async (tc, cc) => {
    setLoading(true);
    try {
      const res = await FareRuleService.getAllForAdmin(tc || undefined, cc || undefined);
      setData(res.data.data || []);
    } catch {
      showError("Failed to load fare rules.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchData("", ""); }, []);

  const handleFilterTrain = (val, raw) => {
    const code = raw?.typeCode || "";
    setFilterTrain(code);
    fetchData(code, filterCoach);
  };

  const handleFilterCoach = (val, raw) => {
    const code = raw?.typeCode || "";
    setFilterCoach(code);
    fetchData(filterTrain, code);
  };

  const handleReset = () => {
    setFilterTrain("");
    setFilterCoach("");
    fetchData("", "");
  };

  const handleToggle = async (item) => {
    if (togglingId) return;
    setTogglingId(item.ruleId);
    const newStatus = !item.isActive;
    setData(prev => prev.map(r => r.ruleId === item.ruleId ? { ...r, isActive: newStatus } : r));
    try {
      await FareRuleService.toggleStatus(item.ruleId, newStatus);
      showSuccess(`Fare rule ${newStatus ? "activated" : "deactivated"}.`);
    } catch (err) {
      setData(prev => prev.map(r => r.ruleId === item.ruleId ? { ...r, isActive: item.isActive } : r));
      showError(err?.response?.data?.error?.message || "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const currentCount = data.filter(d => d.isCurrent).length;
  const acCount      = data.filter(d => d.isAc).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fare Rules</h1>
          <p className="page-subtitle">Manage fare configurations per train type and coach class</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Fare Rule
        </button>
      </div>

      {/* Stats */}
      <div className="tt-stats">
        <div className="tt-stat-card">
          <div className="tt-stat-label">Total Rules</div>
          <div className="tt-stat-value">{data.length}</div>
        </div>
        <div className="tt-stat-card">
          <div className="tt-stat-label">Currently Active</div>
          <div className="tt-stat-value" style={{ color: "#16a34a" }}>{currentCount}</div>
        </div>
        <div className="tt-stat-card">
          <div className="tt-stat-label">AC Rules</div>
          <div className="tt-stat-value" style={{ color: "#0891b2" }}>{acCount}</div>
        </div>
        <div className="tt-stat-card">
          <div className="tt-stat-label">Non-AC Rules</div>
          <div className="tt-stat-value" style={{ color: "var(--text-secondary)" }}>{data.length - acCount}</div>
        </div>
      </div>

      <div className="card">
        {/* Toolbar — SearchableSelect for filters */}
        <div className="tt-toolbar">
          <div style={{ width: 220 }}>
            <SearchableSelect
              value={filterTrain}
              onChange={handleFilterTrain}
              fetchOptions={fetchTrainTypes}
              placeholder="All Train Types"
              clearable
            />
          </div>
          <div style={{ width: 220 }}>
            <SearchableSelect
              value={filterCoach}
              onChange={handleFilterCoach}
              fetchOptions={fetchCoachTypes}
              placeholder="All Coach Types"
              clearable
            />
          </div>
          {(filterTrain || filterCoach) && (
            <button className="sm-reset-btn" onClick={handleReset}>
              <RotateCcw size={12} /> Reset
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)" }}>
            {data.length} rule{data.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="sm-table">
            <thead>
            <tr>
              <th>Train Type</th>
              <th>Coach Type</th>
              <th>Base / km</th>
              <th>Min Fare</th>
              <th>Reservation</th>
              <th>Superfast</th>
              <th>GST</th>
              <th>Effective Period</th>
              <th>Status</th>
              <th style={{ width: 90 }} />
            </tr>
            </thead>
            <tbody>
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 9 }).map((_, j) => (
                  <td key={j}><div className="sm-skeleton" style={{ width: "70%" }} /></td>
                ))}
                <td />
              </tr>
            ))}

            {!loading && data.map(item => (
              <tr key={item.ruleId}>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <code style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700,
                      background: "#eff6ff", color: "#1d4ed8", padding: "1px 6px", borderRadius: 4 }}>
                      {item.trainTypeCode}
                    </code>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{item.trainTypeName}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <code style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700,
                      background: "#f0fdf4", color: "#16a34a", padding: "1px 6px", borderRadius: 4 }}>
                      {item.coachTypeCode}
                    </code>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{item.coachTypeName}</span>
                  </div>
                </td>
                <td><span style={{ fontFamily: "monospace", fontSize: "var(--font-size-sm)" }}>{fmtRate(item.baseFarePerKm)}</span></td>
                <td><span style={{ fontSize: "var(--font-size-sm)" }}>{fmt(item.minFare)}</span></td>
                <td><span style={{ fontSize: "var(--font-size-sm)" }}>{fmt(item.reservationCharge)}</span></td>
                <td><span style={{ fontSize: "var(--font-size-sm)" }}>{fmt(item.superfastCharge)}</span></td>
                <td><span style={{ fontSize: "var(--font-size-sm)" }}>{item.gstPct}%</span></td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{fmtDate(item.effectiveFrom)}</span>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                        → {item.effectiveUntil ? fmtDate(item.effectiveUntil) : "Open"}
                      </span>
                  </div>
                </td>
                <td>
                  {item.isCurrent
                    ? <span className="sm-status-badge active"><span className="sm-status-dot" />Current</span>
                    : item.isActive
                      ? <span className="sm-status-badge" style={{ background: "#fef9c3", color: "#854d0e" }}>
                            <span className="sm-status-dot" style={{ background: "#ca8a04" }} />Scheduled
                          </span>
                      : <span className="sm-status-badge inactive"><span className="sm-status-dot" />Inactive</span>
                  }
                </td>
                <td>
                  <div className="sm-row-actions">
                    <button className="sm-action-btn" title="View history"
                            style={{ color: "#7c3aed" }}
                            onClick={() => setHistory({ trainTypeCode: item.trainTypeCode, coachTypeCode: item.coachTypeCode })}>
                      <History size={14} />
                    </button>
                    <button
                      className={`sm-action-btn${item.isActive ? " danger" : ""}`}
                      title={item.isActive ? "Deactivate" : "Activate"}
                      disabled={togglingId === item.ruleId}
                      onClick={() => handleToggle(item)}>
                      {togglingId === item.ruleId
                        ? <span className="sm-spinner" />
                        : item.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />
                      }
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && data.length === 0 && (
              <tr><td colSpan={10}>
                <div className="sm-empty">
                  <div className="sm-empty-icon"><BadgeDollarSign size={24} /></div>
                  <div className="sm-empty-title">No fare rules found</div>
                  <div className="sm-empty-desc">Add your first fare rule to define pricing.</div>
                </div>
              </td></tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      <AddFareRuleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(added) => setData(prev => [added, ...prev])}
      />

      <HistoryDrawer
        open={!!history}
        onClose={() => setHistory(null)}
        trainTypeCode={history?.trainTypeCode}
        coachTypeCode={history?.coachTypeCode}
      />
    </div>
  );
};

export default FareRulesPage;
