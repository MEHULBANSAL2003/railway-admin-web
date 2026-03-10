import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Snowflake, Wind, Train,
  Radio, CheckCircle2, Ban, Loader2,
} from 'lucide-react';
import { InventoryService } from '../../services/InventoryService.js';
import { useToast }         from '../../context/Toast/useToast.js';
import './InventoryDrawer.css';

const fmtDate = (d) => {
  if (!d) return '—';
  if (d.includes('/')) return d;
  const [y, m, day] = String(d).split('-');
  return `${day}/${m}/${y}`;
};

const STATUS_CFG = {
  SCHEDULED: { cls: 'scheduled', icon: <Radio size={11}/>,        label: 'Scheduled' },
  DEPARTED:  { cls: 'departed',  icon: <Train size={11}/>,        label: 'Departed'  },
  COMPLETED: { cls: 'completed', icon: <CheckCircle2 size={11}/>, label: 'Completed' },
  CANCELLED: { cls: 'cancelled', icon: <Ban size={11}/>,          label: 'Cancelled' },
};
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { cls: '', icon: null, label: status };
  return <span className={`inv-status-badge ${cfg.cls}`}>{cfg.icon}{cfg.label}</span>;
};

// ── Single quota block ────────────────────────────────────
const QuotaBlock = ({ quota, isGeneral }) => {
  const showRac = isGeneral && quota.totalRac > 0;
  const showWl  = isGeneral && quota.waitlistLimit > 0;

  const confirmedPct = quota.totalSeats > 0
    ? Math.round((quota.bookedConfirmed / quota.totalSeats) * 100) : 0;
  const racPct = showRac && quota.totalRac > 0
    ? Math.round((quota.bookedRac / quota.totalRac) * 100) : 0;
  const wlPct = showWl && quota.waitlistLimit > 0
    ? Math.round((quota.bookedWaitlist / quota.waitlistLimit) * 100) : 0;

  return (
    <div className={`inv-quota-block ${isGeneral ? 'general' : 'tatkal'}`}>
      <div className="inv-quota-tag">{isGeneral ? 'General' : 'Tatkal'}</div>

      <div className="inv-slots-grid">

        {/* Confirmed */}
        <div className="inv-slot">
          <div className="inv-slot-top">
            <span className="inv-slot-name">Confirmed</span>
            <span className={`inv-avail-chip ${quota.availableConfirmed > 0 ? 'green' : 'red'}`}>
              {quota.availableConfirmed} avail
            </span>
          </div>
          <div className="inv-prog-track">
            <div className="inv-prog-fill confirmed" style={{ width: `${confirmedPct}%` }} />
          </div>
          <div className="inv-slot-bottom">
            <span className="inv-booked-label">
              <strong>{quota.bookedConfirmed}</strong> booked
            </span>
            <span className="inv-total-label">
              of <strong>{quota.totalSeats}</strong> total
            </span>
          </div>
        </div>

        {/* RAC */}
        {showRac && (
          <div className="inv-slot">
            <div className="inv-slot-top">
              <span className="inv-slot-name">RAC</span>
              <span className={`inv-avail-chip ${quota.availableRac > 0 ? 'amber' : 'red'}`}>
                {quota.availableRac} avail
              </span>
            </div>
            <div className="inv-prog-track">
              <div className="inv-prog-fill rac" style={{ width: `${racPct}%` }} />
            </div>
            <div className="inv-slot-bottom">
              <span className="inv-booked-label">
                <strong>{quota.bookedRac}</strong> booked
              </span>
              <span className="inv-total-label">
                of <strong>{quota.totalRac}</strong> total
              </span>
            </div>
          </div>
        )}

        {/* Waitlist */}
        {showWl && (
          <div className="inv-slot">
            <div className="inv-slot-top">
              <span className="inv-slot-name">Waitlist</span>
              <span className={`inv-avail-chip ${quota.availableWaitlist > 0 ? 'blue' : 'red'}`}>
                {quota.availableWaitlist} avail
              </span>
            </div>
            <div className="inv-prog-track">
              <div className="inv-prog-fill waitlist" style={{ width: `${wlPct}%` }} />
            </div>
            <div className="inv-slot-bottom">
              <span className="inv-booked-label">
                <strong>{quota.bookedWaitlist}</strong> booked
              </span>
              <span className="inv-total-label">
                of <strong>{quota.waitlistLimit}</strong> total
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ── Coach card ────────────────────────────────────────────
const CoachCard = ({ coach }) => {
  const { general: g, tatkal: t } = coach;
  const totalAvail = (g?.availableConfirmed ?? 0) +
    (g?.availableRac ?? 0) +
    (t?.availableConfirmed ?? 0);
  const isFull = totalAvail === 0;

  return (
    <div className="inv-coach-card">
      <div className="inv-coach-header">
        <div className="inv-coach-left">
          <div className="inv-coach-badge">{coach.coachTypeCode}</div>
          <div className="inv-coach-meta">
            <span className="inv-coach-name">{coach.coachTypeName}</span>
            <div className="inv-coach-tags">
              <span className={`inv-ac-tag ${coach.isAc ? 'ac' : 'non-ac'}`}>
                {coach.isAc ? <><Snowflake size={9}/> AC</> : <><Wind size={9}/> Non-AC</>}
              </span>
              <span className="inv-count-tag">
                {coach.coachCount} coach{coach.coachCount !== 1 ? 'es' : ''}
              </span>
            </div>
          </div>
        </div>
        <span className={`inv-coach-avail ${isFull ? 'full' : 'avail'}`}>
          {isFull ? 'Full' : `${totalAvail} available`}
        </span>
      </div>

      <div className="inv-quotas">
        {g && <QuotaBlock quota={g} isGeneral={true}  />}
        {t && <QuotaBlock quota={t} isGeneral={false} />}
      </div>
    </div>
  );
};

// ── InventoryDrawer ───────────────────────────────────────
const InventoryDrawer = ({ journey, trainNumber, onClose }) => {
  const { showError } = useToast();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!journey) return;
    setLoading(true);
    setData(null);
    InventoryService.getJourneyInventory(trainNumber, journey.journeyId)
      .then(res => setData(res.data.data))
      .catch(() => showError('Failed to load inventory.'))
      .finally(() => setLoading(false));
  }, [journey?.journeyId, trainNumber]);

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!journey) return null;

  const totalAvailAll = data?.coaches?.reduce((sum, c) =>
    sum + (c.general?.availableConfirmed ?? 0) +
    (c.general?.availableRac ?? 0) +
    (c.tatkal?.availableConfirmed ?? 0), 0) ?? 0;

  return createPortal(
    <>
      <div className="inv-backdrop" onClick={onClose} />
      <div className="inv-drawer" role="dialog" aria-modal="true">

        <div className="inv-drawer-header">
          <div className="inv-header-top">
            <h2 className="inv-drawer-title">Seat Inventory</h2>
            <button className="inv-close-btn" onClick={onClose}><X size={17}/></button>
          </div>
          <div className="inv-header-meta">
            <span className="inv-drawer-date">{fmtDate(journey.journeyDate)}</span>
            {data && <StatusBadge status={data.status} />}
          </div>
          {!loading && data && (
            <div className={`inv-grand-total ${totalAvailAll > 0 ? 'green' : 'red'}`}>
              <span className="inv-grand-num">{totalAvailAll}</span>
              <span className="inv-grand-label">
                {totalAvailAll === 1 ? 'seat available' : 'seats available'} across all classes
              </span>
            </div>
          )}
        </div>

        <div className="inv-drawer-body">
          {loading && (
            <div className="inv-loading">
              <Loader2 size={22} className="inv-spinner" />
              <span>Loading inventory…</span>
            </div>
          )}

          {!loading && data && (
            <div className="inv-coaches">
              {data.coaches.map(c => <CoachCard key={c.coachId} coach={c} />)}
              {data.coaches.length === 0 && (
                <div className="inv-empty">No inventory found for this journey.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default InventoryDrawer;
