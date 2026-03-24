import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Info, X, ToggleLeft, ToggleRight } from "lucide-react";
import "../../../pages/AdminManagement/AddAdminModal.css";
import "./CascadeToggleModal.css";

const todayStr = () => new Date().toISOString().split("T")[0];

/**
 * Reusable cascade warning modal with date-based activation form.
 *
 * Props:
 *   open          — boolean
 *   onClose       — fn
 *   onConfirm     — fn({ status, effectiveFrom, effectiveTill, reason }) called after user confirms (async ok)
 *   fetchInfo     — async fn() → axios response with data.data = CascadeInfoResponse
 *   targetStatus  — boolean — what we're toggling TO (true=activate, false=deactivate)
 *   entityLabel   — string  — "Coach Type" / "Train Type" / "Quota" / "Train" etc.
 */
const CascadeToggleModal = ({
                              open, onClose, onConfirm, fetchInfo,
                              targetStatus, entityLabel,
                            }) => {
  const [info,    setInfo]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const isDeactivating = !targetStatus;

  // Form fields
  const [effectiveFrom, setEffectiveFrom] = useState(todayStr());
  const [effectiveTill, setEffectiveTill] = useState("");
  const [reason,        setReason]        = useState("");
  const [errors,        setErrors]        = useState({});

  // Fetch cascade info whenever modal opens
  useEffect(() => {
    if (!open) {
      setInfo(null);
      setLoading(false);
      return;
    }
    // Reset form
    setEffectiveFrom(todayStr());
    setEffectiveTill("");
    setReason("");
    setErrors({});

    setLoading(true);
    setInfo(null);
    fetchInfo()
      .then(res => {
        const payload = res?.data?.data ?? res?.data ?? null;
        setInfo(payload);
      })
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key to close
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape" && !saving) onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, saving, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const validate = () => {
    const e = {};
    if (!effectiveFrom) e.effectiveFrom = "Effective from date is required.";
    else if (effectiveFrom < todayStr()) e.effectiveFrom = "Must be today or a future date.";
    if (effectiveTill && effectiveTill <= effectiveFrom)
      e.effectiveTill = "Must be after effective from.";
    if (!reason.trim()) e.reason = "Reason is required.";
    else if (reason.trim().length > 500) e.reason = "Maximum 500 characters.";
    return e;
  };

  const handleConfirm = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    try {
      await onConfirm({
        status: targetStatus ? "ACTIVE" : "INACTIVE",
        effectiveFrom,
        effectiveTill: effectiveTill || null,
        reason: reason.trim(),
      });
    } finally {
      setSaving(false);
      onClose();
    }
  };

  // Don't unmount — keep in DOM, portal handles visibility
  if (!open) return null;

  const hasLinkedRules = info && info.activeFareRulesCount > 0;
  const showWarning    = isDeactivating && hasLinkedRules;

  return createPortal(
    <div
      className="aam-backdrop"
      onClick={saving ? undefined : onClose}
      style={{ zIndex: 1000 }}
    >
      <div
        className="aam-modal ctm-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* ── Header ── */}
        <div className="aam-header">
          <div className="aam-header-left">
            <div
              className="aam-header-icon"
              style={{
                background: isDeactivating ? "#fef2f2" : "#f0fdf4",
                color:      isDeactivating ? "#dc2626" : "#16a34a",
              }}
            >
              {isDeactivating ? <ToggleLeft size={17} /> : <ToggleRight size={17} />}
            </div>
            <div>
              <h2 className="aam-title">
                {isDeactivating ? `Deactivate ${entityLabel}` : `Activate ${entityLabel}`}
              </h2>
              <p className="aam-subtitle">
                {loading
                  ? "Checking linked records…"
                  : info
                    ? `${info.entityCode} — ${info.entityName}`
                    : "Loading…"}
              </p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}>
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="aam-body">
          {/* Loading state */}
          {loading && (
            <div className="ctm-loading">
              <span className="aam-spinner" />
              <span>Checking linked fare rules…</span>
            </div>
          )}

          {/* Loaded state */}
          {!loading && info && (
            <>
              {/* Red warning — deactivating with linked rules */}
              {showWarning && (
                <div className="ctm-warning-box">
                  <AlertTriangle size={16} className="ctm-warning-icon" />
                  <div>
                    <p className="ctm-warning-title">
                      {info.activeFareRulesCount} active fare rule{info.activeFareRulesCount !== 1 ? "s" : ""} will be deactivated
                    </p>
                    <p className="ctm-warning-desc">
                      All fare rules linked to <strong>{info.entityCode}</strong> will be
                      deactivated immediately. Existing bookings are not affected.
                      Fare rules will <strong>not</strong> be auto-reactivated when you
                      re-enable this {entityLabel.toLowerCase()}.
                    </p>
                  </div>
                </div>
              )}

              {/* Green info — clean deactivate (no linked rules) */}
              {isDeactivating && !hasLinkedRules && (
                <div className="ctm-info-box">
                  <Info size={15} className="ctm-info-icon" />
                  <p>
                    No active fare rules linked to <strong>{info.entityCode}</strong>.
                    Safe to deactivate.
                  </p>
                </div>
              )}

              {/* Blue info — activating */}
              {!isDeactivating && (
                <div className="ctm-info-box activate">
                  <Info size={15} className="ctm-info-icon" />
                  <div>
                    <p><strong>{info.entityCode}</strong> will be marked active.</p>
                    <p style={{ marginTop: 4, color: "var(--text-tertiary)" }}>
                      Linked fare rules are <strong>not</strong> auto-reactivated.
                      Re-enable them manually from the Fare Rules page if needed.
                    </p>
                  </div>
                </div>
              )}

              {/* Summary table */}
              <div className="ctm-summary">
                <div className="ctm-summary-row">
                  <span className="ctm-summary-label">{entityLabel}</span>
                  <span className="ctm-summary-value">{info.entityCode} — {info.entityName}</span>
                </div>
                <div className="ctm-summary-row">
                  <span className="ctm-summary-label">Current status</span>
                  <span
                    className={`sm-status-badge ${info.currentlyActive ? "active" : "inactive"}`}
                    style={{ fontSize: 11 }}
                  >
                    <span className="sm-status-dot" />
                    {info.currentlyActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="ctm-summary-row">
                  <span className="ctm-summary-label">Linked fare rules</span>
                  <span
                    className="ctm-summary-value"
                    style={{
                      color: hasLinkedRules && isDeactivating ? "#dc2626" : "inherit",
                      fontWeight: 600,
                    }}
                  >
                    {info.activeFareRulesCount} active
                  </span>
                </div>
                <div className="ctm-summary-row">
                  <span className="ctm-summary-label">Action</span>
                  <span
                    className="ctm-summary-value"
                    style={{ color: isDeactivating ? "#dc2626" : "#16a34a" }}
                  >
                    {isDeactivating
                      ? `Deactivate ${entityLabel.toLowerCase()}${hasLinkedRules ? ` + ${info.activeFareRulesCount} fare rule(s)` : ""}`
                      : `Activate ${entityLabel.toLowerCase()} only`}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Error state — fetch failed */}
          {!loading && !info && (
            <div className="ctm-info-box" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
              <AlertTriangle size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
              <p style={{ color: "#dc2626" }}>
                Failed to load linked record info. You can still proceed.
              </p>
            </div>
          )}

          {/* ── Date & Reason form ── */}
          <div className="ctm-form">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-4)" }}>
              <div className="aam-field">
                <label className="aam-label">
                  Effective From <span className="aam-required">*</span>
                </label>
                <input
                  className={`aam-input${errors.effectiveFrom ? " aam-input--error" : ""}`}
                  type="date"
                  value={effectiveFrom}
                  min={todayStr()}
                  disabled={saving}
                  onChange={e => {
                    setEffectiveFrom(e.target.value);
                    setErrors(p => ({ ...p, effectiveFrom: "" }));
                  }}
                />
                {errors.effectiveFrom && <p className="aam-error">{errors.effectiveFrom}</p>}
              </div>
              <div className="aam-field">
                <label className="aam-label">Effective Till</label>
                <input
                  className={`aam-input${errors.effectiveTill ? " aam-input--error" : ""}`}
                  type="date"
                  value={effectiveTill}
                  min={effectiveFrom || todayStr()}
                  disabled={saving}
                  onChange={e => {
                    setEffectiveTill(e.target.value);
                    setErrors(p => ({ ...p, effectiveTill: "" }));
                  }}
                />
                {errors.effectiveTill && <p className="aam-error">{errors.effectiveTill}</p>}
                <p className="aam-hint" style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>
                  Leave blank for indefinite
                </p>
              </div>
            </div>
            <div className="aam-field">
              <label className="aam-label">
                Reason <span className="aam-required">*</span>
              </label>
              <textarea
                className={`aam-input${errors.reason ? " aam-input--error" : ""}`}
                rows={2}
                value={reason}
                disabled={saving}
                maxLength={500}
                placeholder={isDeactivating
                  ? "e.g. Temporarily removing due to maintenance"
                  : "e.g. Reinstated after maintenance"}
                onChange={e => {
                  setReason(e.target.value);
                  setErrors(p => ({ ...p, reason: "" }));
                }}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
              {errors.reason && <p className="aam-error">{errors.reason}</p>}
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3, textAlign: "right" }}>
                {reason.length}/500
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || loading}
            style={{
              display: "flex", alignItems: "center", gap: 6, height: 36,
              padding: "0 var(--spacing-4)", border: "none",
              borderRadius: "var(--radius-md)", fontFamily: "inherit",
              fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)",
              cursor: saving || loading ? "not-allowed" : "pointer",
              background: saving || loading
                ? "var(--bg-tertiary)"
                : isDeactivating ? "#dc2626" : "#16a34a",
              color: saving || loading ? "var(--text-tertiary)" : "#fff",
              transition: "background 0.15s",
            }}
          >
            {saving
              ? <><span className="aam-spinner" /> Processing…</>
              : loading
                ? "Loading…"
                : isDeactivating
                  ? `Deactivate${hasLinkedRules ? ` + ${info?.activeFareRulesCount} rules` : ""}`
                  : "Activate"
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CascadeToggleModal;
