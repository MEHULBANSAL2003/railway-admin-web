import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Snowflake, Wind, Train,
  Radio, CheckCircle2, Ban, Loader2,
} from 'lucide-react';
import { InventoryService } from '../../services/InventoryService.js';
import { useToast }         from '../../context/Toast/useToast.js';
import './InventoryDrawer.css';

// ── Helpers ───────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  // Accept dd/MM/yyyy (already formatted) or yyyy-MM-dd
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
  return <span className={`inv-status-badge ${cfg.cls}`}>{cfg.icon} {cfg.label}</span>;
};

// ── Seat counter ──────────────────────────────────────────
const Counter = ({ label, booked, total, available, colorCls }) => (
  <div className="inv-counter">
    <div className={`inv-counter-avail ${colorCls}`}>{available ?? '—'}</div>
    <div className="inv-counter-label">{label}</div>
    <div className="inv-counter-sub">{booked}/{total}</div>
  </div>
);

// ── Coach card ────────────────────────────────────────────
const CoachCard = ({ coach }) => {
  const { general: g, tatkal: t } = coach;
  return (
    <div className="inv-coach-card">
      <div className="inv-coach-header">
        <div className="inv-coach-identity">
          <span className="inv-coach-code">{coach.coachTypeCode}</span>
          <span className="inv-coach-name">{coach.coachTypeName}</span>
          <span className={`inv-ac-tag ${coach.isAc ? 'ac' : 'non-ac'}`}>
            {coach.isAc ? <><Snowflake size={10}/> AC</> : <><Wind size={10}/> Non-AC</>}
          </span>
        </div>
        <span className="inv-coach-count">{coach.coachCount} coach{coach.coachCount !== 1 ? 'es' : ''}</span>
      </div>

      {g && (
        <div className="inv-quota-section">
          <div className="inv-quota-label general">General</div>
          <div className="inv-counters-row">
            <Counter label="Confirmed" booked={g.bookedConfirmed} total={g.totalSeats}
                     available={g.availableConfirmed}
                     colorCls={g.availableConfirmed > 0 ? 'green' : 'red'} />
            {g.totalRac > 0 && (
              <Counter label="RAC" booked={g.bookedRac} total={g.totalRac}
                       available={g.availableRac}
                       colorCls={g.availableRac > 0 ? 'amber' : 'red'} />
            )}
            {g.waitlistLimit > 0 && (
              <Counter label="Waitlist" booked={g.bookedWaitlist} total={g.waitlistLimit}
                       available={g.availableWaitlist}
                       colorCls={g.availableWaitlist > 0 ? 'blue' : 'red'} />
            )}
          </div>
        </div>
      )}

      {t && (
        <div className="inv-quota-section">
          <div className="inv-quota-label tatkal">Tatkal</div>
          <div className="inv-counters-row">
            <Counter label="Confirmed" booked={t.bookedConfirmed} total={t.totalSeats}
                     available={t.availableConfirmed}
                     colorCls={t.availableConfirmed > 0 ? 'green' : 'red'} />
          </div>
        </div>
      )}
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

  return createPortal(
    <>
      <div className="inv-backdrop" onClick={onClose} />
      <div className="inv-drawer" role="dialog" aria-modal="true">

        <div className="inv-drawer-header">
          <div className="inv-drawer-title-row">
            <div>
              <h2 className="inv-drawer-title">Seat Inventory</h2>
              <p className="inv-drawer-sub">
                {fmtDate(journey.journeyDate)}
                {data && <> · <StatusBadge status={data.status} /></>}
              </p>
            </div>
            <button className="inv-close-btn" onClick={onClose}><X size={18}/></button>
          </div>
        </div>

        <div className="inv-drawer-body">
          {loading && (
            <div className="inv-loading">
              <Loader2 size={22} className="inv-spinner" />
              <span>Loading inventory…</span>
            </div>
          )}

          {!loading && data && (
            <>
              {/* Summary strip */}
              <div className="inv-summary-strip">
                {data.coaches.map(c => {
                  const g = c.general;
                  const t = c.tatkal;
                  const totalAvail = (g?.availableConfirmed ?? 0) +
                    (g?.availableRac ?? 0) +
                    (t?.availableConfirmed ?? 0);
                  return (
                    <div key={c.coachId} className="inv-summary-pill">
                      <span className="inv-summary-code">{c.coachTypeCode}</span>
                      <span className={`inv-summary-count ${totalAvail > 0 ? 'avail' : 'full'}`}>
                        {totalAvail > 0 ? `${totalAvail} avail` : 'Full'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="inv-coaches">
                {data.coaches.map(c => <CoachCard key={c.coachId} coach={c} />)}
              </div>

              {data.coaches.length === 0 && (
                <div className="inv-empty">No inventory found for this journey.</div>
              )}
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default InventoryDrawer;
