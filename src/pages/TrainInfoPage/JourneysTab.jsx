import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Plus, RotateCcw, Inbox, Ban,
  AlertTriangle, CalendarDays, Zap, RefreshCw,
  Radio, Train, CheckCircle2, X, LayoutGrid,
} from 'lucide-react';
import { useJourneyList }   from './useJourneyList.js';
import { JourneyService }   from '../../services/JourneyService.js';
import { InventoryService } from '../../services/InventoryService.js';
import { useToast }         from '../../context/Toast/useToast.js';
import InventoryDrawer      from './InventoryDrawer.jsx';
import '../AdminManagement/AddAdminModal.css';
import './JourneysTab.css';

// ── Helpers ───────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  const [y, m, day] = String(d).split('-');
  return `${day}/${m}/${y}`;
};
const fmtDay = (d) => {
  if (!d) return '';
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const [y, m, day] = String(d).split('-').map(Number);
  return days[new Date(y, m - 1, day).getDay()];
};
const addDaysStr = (n) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

// ── Status config ─────────────────────────────────────────
const STATUS_CFG = {
  SCHEDULED: { cls: 'scheduled', icon: <Radio size={10}/>,        label: 'Scheduled' },
  DEPARTED:  { cls: 'departed',  icon: <Train size={10}/>,        label: 'Departed'  },
  COMPLETED: { cls: 'completed', icon: <CheckCircle2 size={10}/>, label: 'Completed' },
  CANCELLED: { cls: 'cancelled', icon: <Ban size={10}/>,          label: 'Cancelled' },
};
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { cls: '', icon: null, label: status };
  return <span className={`jt-status-badge ${cfg.cls}`}>{cfg.icon} {cfg.label}</span>;
};

// ── Sort icon ─────────────────────────────────────────────
const SortIcon = ({ colKey, sort }) => {
  if (sort.sortBy !== colKey) return <ChevronsUpDown size={12} style={{ opacity: 0.3 }} />;
  return sort.sortDir === 'asc'
    ? <ChevronUp   size={12} style={{ color: 'var(--primary-600)' }} />
    : <ChevronDown size={12} style={{ color: 'var(--primary-600)' }} />;
};

// ── Skeleton row ──────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[45, 30, 55, 50, 60, 55].map((w, i) => (
      <td key={i}><div className="sm-skeleton" style={{ width: `${w}%` }} /></td>
    ))}
    <td />
  </tr>
);

// ── Status filter pills ───────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Scheduled', activeCls: 'pill-scheduled' },
  { value: 'DEPARTED',  label: 'Departed',  activeCls: 'pill-departed'  },
  { value: 'COMPLETED', label: 'Completed', activeCls: 'pill-completed' },
  { value: 'CANCELLED', label: 'Cancelled', activeCls: 'pill-cancelled' },
];

// ── Toolbar ───────────────────────────────────────────────
const Toolbar = ({ filters, handleFilterChange, handleFilterReset, totalElements, loading }) => {
  const hasActive = filters.dateFrom || filters.dateTo || filters.statuses.length > 0;

  const toggleStatus = (val) => {
    const cur = filters.statuses;
    handleFilterChange(
      'statuses',
      cur.includes(val) ? cur.filter(s => s !== val) : [...cur, val]
    );
  };

  return (
    <div className="sm-toolbar">
      <div className="sm-toolbar-filters">
        <div className="jt-date-wrap">
          <label className="jt-date-label">From</label>
          <input type="date" className="jt-date-input" value={filters.dateFrom}
                 onChange={e => handleFilterChange('dateFrom', e.target.value)} />
        </div>
        <div className="jt-date-wrap">
          <label className="jt-date-label">To</label>
          <input type="date" className="jt-date-input" value={filters.dateTo}
                 min={filters.dateFrom || undefined}
                 onChange={e => handleFilterChange('dateTo', e.target.value)} />
        </div>
        <div className="jt-toolbar-sep" />
        {STATUS_OPTIONS.map(opt => (
          <button key={opt.value}
                  className={`jt-status-pill${filters.statuses.includes(opt.value) ? ` active ${opt.activeCls}` : ''}`}
                  onClick={() => toggleStatus(opt.value)}>
            {opt.label}
          </button>
        ))}
        {hasActive && (
          <button className="sm-reset-btn" onClick={handleFilterReset}>
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>
      {!loading && (
        <div className="sm-result-count">
          {totalElements} journey{totalElements !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

// ── Add Journey Modal ─────────────────────────────────────
const AddJourneyModal = ({ open, onClose, trainNumber, onSuccess }) => {
  const { showError } = useToast();
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(''); setError('');
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, saving, onClose]);

  const handleSubmit = async () => {
    if (!date) { setError('Please select a date.'); return; }
    setSaving(true);
    try {
      await JourneyService.addJourneysOfTrain(trainNumber, date);
      onSuccess();
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to add journey.');
    } finally { setSaving(false); }
  };

  if (!open) return null;
  return createPortal(
    <div className="aam-backdrop" onClick={saving ? undefined : onClose}>
      <div className="aam-modal jt-modal" onClick={e => e.stopPropagation()}>
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon jt-icon-blue"><CalendarDays size={17} /></div>
            <div>
              <h2 className="aam-title">Add Journey</h2>
              <p className="aam-subtitle">Train · {trainNumber}</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={saving}><X size={18} /></button>
        </div>
        <div className="aam-body">
          <div className="jt-admin-note">
            <AlertTriangle size={13} />
            Journey will only be created if the date matches the schedule run days.
          </div>
          <div className="aam-field">
            <label className="aam-label">Journey Date <span className="aam-required">*</span></label>
            <input className={`aam-input${error ? ' aam-input--error' : ''}`}
                   type="date" min={addDaysStr(1)} value={date} disabled={saving}
                   onChange={e => { setDate(e.target.value); setError(''); }} />
            {error ? <p className="aam-error">{error}</p> : <p className="aam-hint">Must be a future date.</p>}
          </div>
        </div>
        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="jt-submit-btn" onClick={handleSubmit} disabled={saving || !date}>
            {saving ? <><span className="aam-spinner" /> Adding…</> : <><Plus size={14} /> Add Journey</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Cancel Modal ──────────────────────────────────────────
const CancelModal = ({ journey, onClose, trainNumber, onSuccess }) => {
  const { showError } = useToast();
  const [reason, setReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const h = e => { if (e.key === 'Escape' && !cancelling) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [cancelling, onClose]);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setCancelling(true);
    try {
      await JourneyService.cancelJourney(trainNumber, journey.journeyId, reason);
      onSuccess(journey.journeyId);
      onClose();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to cancel journey.');
    } finally { setCancelling(false); }
  };

  return createPortal(
    <div className="aam-backdrop" onClick={cancelling ? undefined : onClose}>
      <div className="aam-modal jt-cancel-modal" onClick={e => e.stopPropagation()}>
        <div className="aam-header">
          <div className="aam-header-left">
            <div className="aam-header-icon jt-icon-red"><Ban size={17} /></div>
            <div>
              <h2 className="aam-title">Cancel Journey</h2>
              <p className="aam-subtitle">{fmtDay(journey.journeyDate)}, {fmtDate(journey.journeyDate)}</p>
            </div>
          </div>
          <button className="aam-close" onClick={onClose} disabled={cancelling}><X size={18} /></button>
        </div>
        <div className="aam-body">
          <div className="jt-cancel-warning">
            <AlertTriangle size={14} />
            All bookings on this journey will need to be refunded manually.
          </div>
          <div className="aam-field">
            <label className="aam-label">Reason <span className="aam-required">*</span></label>
            <textarea className="aam-input jt-textarea" rows={3} value={reason}
                      disabled={cancelling}
                      placeholder="e.g. Flood — track blocked between NDLS and MTJ"
                      onChange={e => setReason(e.target.value)} />
          </div>
        </div>
        <div className="aam-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={cancelling}>Keep Journey</button>
          <button className="jt-cancel-confirm-btn" onClick={handleConfirm}
                  disabled={cancelling || !reason.trim()}>
            {cancelling ? <><span className="aam-spinner" /> Cancelling…</> : <><Ban size={14} /> Confirm Cancel</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Bulk Result Banner ────────────────────────────────────
const BulkBanner = ({ result, onDismiss }) => (
  <div className="jt-bulk-banner">
    <CheckCircle2 size={15} />
    <span>
      {result.created === 0
        ? <><strong>No new journeys</strong> — all dates already exist or not scheduled.</>
        : <><strong>{result.created} journeys created</strong>{result.skipped > 0 && `, ${result.skipped} skipped`}.</>}
    </span>
    <button className="jt-bulk-dismiss" onClick={onDismiss}><X size={13} /></button>
  </div>
);

// ── Columns ───────────────────────────────────────────────
const COLS = [
  { key: 'journeyDate',   label: 'Date'          },
  { key: 'day',           label: 'Day',  noSort: true },
  { key: 'status',        label: 'Status'        },
  { key: 'chartPrepared', label: 'Chart', noSort: true },
  { key: 'cancelReason',  label: 'Cancel Reason', noSort: true },
  { key: 'createdAt',     label: 'Created At'    },
];

// ── JourneysTab ───────────────────────────────────────────
const JourneysTab = ({ trainNumber }) => {
  const { showSuccess, showError } = useToast();

  const {
    data, loading, loadingMore, hasMore, totalElements,
    filters, sort,
    handleFilterChange, handleFilterReset, handleSort,
    loadMore, updateRow, refresh,
  } = useJourneyList(trainNumber);

  const [addOpen,        setAddOpen]        = useState(false);
  const [cancelTarget,   setCancelTarget]   = useState(null);
  const [inventoryJourney, setInventoryJourney] = useState(null);
  const [bulkResult,     setBulkResult]     = useState(null);
  const [bulkLoading,    setBulkLoading]    = useState(false);
  const [singleLoading,  setSingleLoading]  = useState(false);

  // Infinite scroll
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) loadMore(); }, { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const handleBulkGenerate = async () => {
    setBulkLoading(true); setBulkResult(null);
    try {
      const res = await JourneyService.bulkGenerateJourneyOfTrain(trainNumber);
      const result = res.data.data || res.data;
      setBulkResult(result);
      if (result.created > 0) showSuccess(`${result.created} journeys generated.`);
      refresh();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to generate journeys.');
    } finally { setBulkLoading(false); }
  };

  const handleSingleGenerate = async () => {
    setSingleLoading(true);
    try {
      const res = await JourneyService.generateJourneyOfTrain(trainNumber);
      const j = res.data.data || res.data;
      showSuccess(`Journey created for ${fmtDate(j?.journeyDate)}.`);
      refresh();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to generate journey.');
    } finally { setSingleLoading(false); }
  };

  const handleCancelSuccess = (journeyId) => {
    showSuccess('Journey cancelled.');
    updateRow(journeyId, { cancelled: true, status: 'CANCELLED' });
  };

  const anyLoading = bulkLoading || singleLoading;

  return (
    <div className="jt-root">

      {/* Header */}
      <div className="jt-tab-header">
        <p className="jt-tab-desc">All journeys — filter by date range or status. Click a row to view seat inventory.</p>
        <div className="jt-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setAddOpen(true)} disabled={anyLoading}>
            <Plus size={14} /> Add Journey
          </button>
          <button className="jt-btn-single" onClick={handleSingleGenerate} disabled={anyLoading}>
            {singleLoading ? <><span className="aam-spinner" /> Generating…</> : <><RefreshCw size={13} /> Generate (120d)</>}
          </button>
          <button className="jt-btn-bulk" onClick={handleBulkGenerate} disabled={anyLoading}>
            {bulkLoading ? <><span className="aam-spinner" /> Generating…</> : <><Zap size={13} /> Generate All Missing</>}
          </button>
        </div>
      </div>

      {bulkResult && <BulkBanner result={bulkResult} onDismiss={() => setBulkResult(null)} />}

      {/* Card */}
      <div className="card" style={{
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', maxHeight: 'calc(100vh - 300px)',
      }}>
        <Toolbar
          filters={filters}
          handleFilterChange={handleFilterChange}
          handleFilterReset={handleFilterReset}
          totalElements={totalElements}
          loading={loading}
        />

        <div className="sm-table-wrap">
          <table className="sm-table">
            <thead>
            <tr>
              {COLS.map(col => (
                <th key={col.key}
                    className={`${!col.noSort ? 'sm-th-sortable' : ''}${sort.sortBy === col.key ? ' sm-th-sorted' : ''}`}
                    onClick={() => !col.noSort && handleSort(col.key)}>
                  <div className="sm-th-inner">
                    {col.label}
                    {!col.noSort && <SortIcon colKey={col.key} sort={sort} />}
                  </div>
                </th>
              ))}
              <th style={{ width: 72 }} />
            </tr>
            </thead>
            <tbody>
            {loading && Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && data.map(j => {
              const canCancel = !j.cancelled && !j.chartPrepared &&
                j.status !== 'COMPLETED' && j.status !== 'DEPARTED';

              return (
                <tr key={j.journeyId}
                    className={`jt-row${j.cancelled ? ' jt-row-cancelled' : ''}`}
                    onClick={() => !j.cancelled && setInventoryJourney(j)}
                    style={{ cursor: j.cancelled ? 'default' : 'pointer' }}>
                  <td><span className="jt-date-val">{fmtDate(j.journeyDate)}</span></td>
                  <td><span className="jt-day-val">{fmtDay(j.journeyDate)}</span></td>
                  <td><StatusBadge status={j.status} /></td>
                  <td>
                      <span className={`jt-chart-badge ${j.chartPrepared ? 'prepared' : 'pending'}`}>
                        {j.chartPrepared ? 'Prepared' : 'Pending'}
                      </span>
                  </td>
                  <td>
                    {j.cancelReason
                      ? <span className="jt-cancel-reason-text" title={j.cancelReason}>
                            {j.cancelReason.length > 45 ? j.cancelReason.slice(0, 45) + '…' : j.cancelReason}
                          </span>
                      : <span className="jt-empty-cell">—</span>}
                  </td>
                  <td><span className="jt-created-val">{j.createdAt || '—'}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="sm-row-actions" style={{ opacity: 1 }}>
                      {!j.cancelled && (
                        <button className="sm-action-btn jt-inventory-btn"
                                title="View seat inventory"
                                onClick={e => { e.stopPropagation(); setInventoryJourney(j); }}>
                          <LayoutGrid size={13} />
                        </button>
                      )}
                      {canCancel && (
                        <button className="sm-action-btn jt-cancel-btn"
                                title="Cancel journey"
                                onClick={e => { e.stopPropagation(); setCancelTarget(j); }}>
                          <Ban size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {loadingMore && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={`lm${i}`} />)}
            </tbody>
          </table>

          {!loading && hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}

          {!loading && data.length === 0 && (
            <div className="sm-empty">
              <div className="sm-empty-icon"><Inbox size={24} /></div>
              <div className="sm-empty-title">
                {(filters.dateFrom || filters.dateTo || filters.statuses.length > 0)
                  ? 'No journeys match your filters'
                  : 'No journeys found'}
              </div>
              <div className="sm-empty-desc">
                {(filters.dateFrom || filters.dateTo || filters.statuses.length > 0)
                  ? 'Try adjusting the date range or status filters.'
                  : 'Click Generate All Missing to create journeys from the schedule.'}
              </div>
            </div>
          )}
        </div>

        {!loading && data.length > 0 && (
          <div className="sm-footer">
            <span>Showing <strong>{data.length}</strong> of <strong>{totalElements}</strong> journeys</span>
            {hasMore && <span>Scroll to load more</span>}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddJourneyModal open={addOpen} onClose={() => setAddOpen(false)}
                       trainNumber={trainNumber}
                       onSuccess={() => { showSuccess('Journey added.'); refresh(); }} />

      {cancelTarget && (
        <CancelModal journey={cancelTarget} trainNumber={trainNumber}
                     onClose={() => setCancelTarget(null)}
                     onSuccess={handleCancelSuccess} />
      )}

      {/* Inventory drawer */}
      {inventoryJourney && (
        <InventoryDrawer
          journey={inventoryJourney}
          trainNumber={trainNumber}
          onClose={() => setInventoryJourney(null)}
        />
      )}
    </div>
  );
};

export default JourneysTab;
