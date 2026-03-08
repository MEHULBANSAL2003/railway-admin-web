import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Zap, UtensilsCrossed, Armchair,
  Snowflake, Wind, Milestone, CalendarClock,
} from 'lucide-react';
import { TrainService }      from '../../services/TrainService.js';
import { TrainCoachService } from '../../services/TrainCoachService.js';
import { useToast }          from '../../context/Toast/useToast.js';
import StopsTab              from './StopsTab.jsx';
import '../AdminManagement/AddAdminModal.css';
import '../StationManagement/StationManagementPage.css';
import '../TrainPage/TrainsPage.css';
import '../TrainCoachesPage/TrainCoachesPage.css';
import './TrainInfoPage.css';

// ── Coaches Tab ───────────────────────────────────────────
const CoachesTab = ({ coaches, loading, onManage }) => (
  <div className="tip-tab-content">
    <div className="tip-tab-header">
      <p className="tip-tab-desc">
        Coach composition for this train. Manage seats, tatkal, RAC and waitlist limits.
      </p>
      <button className="btn btn-secondary btn-sm" onClick={onManage}>
        <Armchair size={14} /> Manage Coaches
      </button>
    </div>

    {loading ? (
      <div className="tc-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="tc-card tc-card-skeleton">
            <div className="sm-skeleton" style={{ width: '40%', height: 20, marginBottom: 8 }} />
            <div className="sm-skeleton" style={{ width: '65%', marginBottom: 16 }} />
            <div className="sm-skeleton" style={{ width: '80%' }} />
          </div>
        ))}
      </div>
    ) : coaches.length === 0 ? (
      <div className="sm-empty">
        <div className="sm-empty-icon"><Armchair size={24} /></div>
        <div className="sm-empty-title">No coaches configured</div>
        <div className="sm-empty-desc">
          Click "Manage Coaches" to add coach types to this train.
        </div>
      </div>
    ) : (
      <div className="tc-grid">
        {coaches.map(coach => (
          <div key={coach.coachId}
               className={`tc-card${!coach.isActive ? ' tc-card-inactive' : ''}`}>
            <div className="tc-card-header">
              <div className="tc-card-type">
                <span className="tc-code-badge">{coach.coachTypeCode}</span>
                {coach.isAc
                  ? <span className="tc-ac-tag"><Snowflake size={10} /> AC</span>
                  : <span className="tc-non-ac-tag"><Wind size={10} /> Non-AC</span>}
              </div>
              {!coach.isActive && <div className="tc-inactive-banner">Inactive</div>}
            </div>
            <div className="tc-card-name">{coach.coachTypeName}</div>
            <div className="tc-coach-pills">
              {Array.from({ length: Math.min(coach.coachCount, 12) }).map((_, i) => (
                <span key={i} className="tc-coach-pill">
                  {coach.coachTypeCode}{i + 1}
                </span>
              ))}
              {coach.coachCount > 12 && (
                <span className="tc-coach-pill more">+{coach.coachCount - 12}</span>
              )}
            </div>
            <div className="tc-card-stats">
              <div className="tc-stat">
                <span className="tc-stat-label">Total seats</span>
                <span className="tc-stat-value" style={{ color: '#16a34a' }}>{coach.totalCoachSeats}</span>
              </div>
              <div className="tc-stat">
                <span className="tc-stat-label">Tatkal</span>
                <span className="tc-stat-value" style={{ color: '#d97706' }}>{coach.totalTatkalSeats}</span>
              </div>
              <div className="tc-stat">
                <span className="tc-stat-label">RAC</span>
                <span className="tc-stat-value" style={{ color: '#7c3aed' }}>{coach.totalRacSeats}</span>
              </div>
              <div className="tc-stat">
                <span className="tc-stat-label">WL limit</span>
                <span className="tc-stat-value" style={{ color: '#0369a1' }}>{coach.waitlistLimit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ── Schedules Tab ─────────────────────────────────────────
const SchedulesTab = () => (
  <div className="tip-tab-content">
    <div className="sm-empty">
      <div className="sm-empty-icon"><CalendarClock size={24} /></div>
      <div className="sm-empty-title">Schedules coming soon</div>
      <div className="sm-empty-desc">
        Once stops and coaches are configured, you can create schedules here.
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────
const TrainInfoPage = () => {
  const { trainNumber } = useParams();
  const navigate        = useNavigate();
  const { showError }   = useToast();

  const [train,        setTrain]        = useState(null);
  const [stops,        setStops]        = useState([]);
  const [coaches,      setCoaches]      = useState([]);
  const [loadingTrain, setLoadingTrain] = useState(true);
  const [loadingStops, setLoadingStops] = useState(true);
  const [loadingCoach, setLoadingCoach] = useState(true);
  const [activeTab,    setActiveTab]    = useState('stops');

  const loadTrain = useCallback(async () => {
    setLoadingTrain(true);
    try {
      const res = await TrainService.getTrainByNumber(trainNumber);
      setTrain(res.data.data);
    } catch {
      showError('Failed to load train details.');
    } finally { setLoadingTrain(false); }
  }, [trainNumber]);

  const loadStops = useCallback(async () => {
    setLoadingStops(true);
    try {
      const { TrainStopService } = await import('../../services/TrainStopService.js');
      const res = await TrainStopService.getAllByTrain(trainNumber);
      setStops(res.data.data || []);
    } catch {
      // silently ignore — stops may not exist yet
    } finally { setLoadingStops(false); }
  }, [trainNumber]);

  const loadCoaches = useCallback(async () => {
    setLoadingCoach(true);
    try {
      const res = await TrainCoachService.getAllByTrain(trainNumber);
      setCoaches(res.data.data || []);
    } catch {
      showError('Failed to load coaches.');
    } finally { setLoadingCoach(false); }
  }, [trainNumber]);

  useEffect(() => {
    loadTrain();
    loadStops();
    loadCoaches();
  }, [trainNumber]);

  // Derived
  const activeCoaches = coaches.filter(c => c.isActive);
  const totalSeats    = activeCoaches.reduce((s, c) => s + c.totalCoachSeats, 0);
  const totalKm       = stops.length > 0 ? stops[stops.length - 1]?.kmFromSource : null;
  const sourceStation = stops[0];
  const destStation   = stops[stops.length - 1];

  const TABS = [
    { key: 'stops',     label: 'Stops',     icon: <Milestone size={14} />,     count: stops.length },
    { key: 'coaches',   label: 'Coaches',   icon: <Armchair size={14} />,      count: coaches.length },
    { key: 'schedules', label: 'Schedules', icon: <CalendarClock size={14} />, count: null },
  ];

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="tip-header">
        <div className="tip-header-left">
          <button className="tc-back-btn" onClick={() => navigate('/trains')}>
            <ArrowLeft size={16} />
          </button>
          <div className="tip-train-identity">
            {loadingTrain ? (
              <>
                <div className="sm-skeleton" style={{ width: 120, height: 28, marginBottom: 6 }} />
                <div className="sm-skeleton" style={{ width: 200, height: 16 }} />
              </>
            ) : (
              <>
                <div className="tip-train-title-row">
                  <code className="tip-train-number">{trainNumber}</code>
                  <h1 className="tip-train-name">{train?.trainName || '—'}</h1>
                </div>
                <div className="tip-train-tags">
                  <span className="tip-tag zone">{train?.zoneCode} Zone</span>
                  <span className="tip-tag type">
                    {train?.trainTypeName || train?.trainTypeCode}
                  </span>
                  {train?.isSuperfast && (
                    <span className="tip-tag superfast">
                      <Zap size={10} /> Superfast
                    </span>
                  )}
                  {train?.pantrycar && (
                    <span className="tip-tag pantry">
                      <UtensilsCrossed size={10} /> Pantry
                    </span>
                  )}
                  <span className={`sm-status-badge ${train?.isActive ? 'active' : 'inactive'}`}>
                    <span className="sm-status-dot" />
                    {train?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Journey summary strip ── */}
      {!loadingStops && stops.length > 0 && (
        <div className="tip-journey-strip">
          <div className="tip-journey-endpoint">
            <span className="tip-journey-code">{sourceStation?.stationCode}</span>
            <span className="tip-journey-station">{sourceStation?.stationName}</span>
            <span className="tip-journey-time">{sourceStation?.departureTime || '—'}</span>
          </div>
          <div className="tip-journey-middle">
            <div className="tip-journey-line">
              <div className="tip-journey-dot" />
              <div className="tip-journey-track" />
              {stops.slice(1, -1).map((s, i) => (
                <div key={i} className="tip-journey-intermediate" title={s.stationName} />
              ))}
              <div className="tip-journey-track" />
              <div className="tip-journey-dot dest" />
            </div>
            <div className="tip-journey-meta">
              <span>{stops.length} stops</span>
              {totalKm && <span>{totalKm} km</span>}
              {totalSeats > 0 && <span>{totalSeats} seats</span>}
            </div>
          </div>
          <div className="tip-journey-endpoint dest">
            <span className="tip-journey-code">{destStation?.stationCode}</span>
            <span className="tip-journey-station">{destStation?.stationName}</span>
            <span className="tip-journey-time">{destStation?.arrivalTime || '—'}</span>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="tip-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tip-tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}>
            {tab.icon}
            {tab.label}
            {tab.count != null && (
              <span className="tip-tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="card tip-card">
        {activeTab === 'stops' && (
          <StopsTab
            trainNumber={trainNumber}
            stops={stops}
            loading={loadingStops}
            onReload={loadStops}
          />
        )}
        {activeTab === 'coaches' && (
          <CoachesTab
            coaches={coaches}
            loading={loadingCoach}
            onManage={() => navigate(`/trains/${trainNumber}/coaches`)}
          />
        )}
        {activeTab === 'schedules' && <SchedulesTab />}
      </div>
    </div>
  );
};

export default TrainInfoPage;
