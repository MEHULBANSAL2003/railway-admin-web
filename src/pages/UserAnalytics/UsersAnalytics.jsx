import { useEffect, useState } from 'react';
import './UsersAnalytics.css';
import useUsersAnalytics from './useUsersAnalytics';

/* ── helpers ── */
const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString());
const pct = (part, total) =>
  total > 0 ? ((part / total) * 100).toFixed(1) : '0.0';

/* ── Donut chart (pure SVG, no lib needed) ── */
const DonutChart = ({ segments, size = 110, stroke = 22 }) => {
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const cx     = size / 2;

  let offset = 0;
  return (
    <svg
      className="ua-donut-svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1a1e28" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circ;
        const gap  = circ - dash;
        const el   = (
          <circle
            key={i}
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
};

/* ── Timeline bar row ── */
const TimelineItem = ({ label, value, max, color }) => (
  <div className="ua-timeline-item">
    <span className="tl-label">{label}</span>
    <div className="tl-bar-wrap">
      <div
        className="tl-bar"
        style={{ '--bar-color': color, width: max ? `${(value / max) * 100}%` : '0%' }}
      />
    </div>
    <span className="tl-value">{fmt(value)}</span>
  </div>
);

/* ── Verification bar ── */
const VerifyItem = ({ label, count, total, color }) => {
  const p = pct(count, total);
  return (
    <div className="ua-verify-item">
      <div className="vi-top">
        <span className="vi-name">{label}</span>
        <span className="vi-pct">{p}%</span>
      </div>
      <div className="vi-track">
        <div className="vi-fill" style={{ width: `${p}%`, background: color }} />
      </div>
      <div className="vi-count">{fmt(count)} of {fmt(total)} users</div>
    </div>
  );
};

/* ── Stat card ── */
const StatCard = ({ label, value, sub, icon, accent, accentDim }) => (
  <div
    className="ua-stat-card"
    style={{ '--card-accent': accent, '--card-accent-dim': accentDim }}
  >
    <div className="ua-stat-icon">{icon}</div>
    <div className="ua-stat-label">{label}</div>
    <div className="ua-stat-value">{fmt(value)}</div>
    {sub && <div className="ua-stat-sub">{sub}</div>}
  </div>
);

/* ═══════════════════════════════════════════
   Main Page
═══════════════════════════════════════════ */
const UsersAnalytics = () => {
  const { data, loading, error, fetchAnalytics } = useUsersAnalytics();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  /* ── Loading ── */
  if (loading && !data) {
    return (
      <div className="ua-page">
        <div className="ua-loading">
          <div className="ua-loading-ring" />
          <p>Loading analytics…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error && !data) {
    return (
      <div className="ua-page">
        <div className="ua-error">
          <span className="ua-error-icon">⚠</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const d = data;
  const total = d.totalUsers || 1; // avoid /0

  /* Status segments for donut */
  const statusSegments = [
    { label: 'Active',    value: d.activeUsers,    color: '#00e5a0', pct: +pct(d.activeUsers,    total) },
    { label: 'Inactive',  value: d.inactiveUsers,  color: '#4d9fff', pct: +pct(d.inactiveUsers,  total) },
    { label: 'Suspended', value: d.suspendedUsers, color: '#ffd166', pct: +pct(d.suspendedUsers, total) },
    { label: 'Banned',    value: d.bannedUsers,    color: '#ff4d6d', pct: +pct(d.bannedUsers,    total) },
  ].filter(s => s.value > 0);

  /* Device segments */
  const deviceMap   = d.registeredByDeviceType || {};
  const deviceTotal = Object.values(deviceMap).reduce((a, b) => a + b, 0) || 1;
  const deviceColors = ['#00e5a0', '#4d9fff', '#b57aff', '#ffd166', '#ff8c42'];
  const deviceSegments = Object.entries(deviceMap).map(([k, v], i) => ({
    label: k, value: v, color: deviceColors[i % deviceColors.length],
    pct: +pct(v, deviceTotal),
  }));

  /* OS segments */
  const osMap   = d.registeredByOs || {};
  const osTotal = Object.values(osMap).reduce((a, b) => a + b, 0) || 1;
  const osColors = ['#4d9fff', '#00e5a0', '#ffd166', '#ff8c42', '#b57aff', '#ff4d6d'];
  const osSegments = Object.entries(osMap).map(([k, v], i) => ({
    label: k, value: v, color: osColors[i % osColors.length],
    pct: +pct(v, osTotal),
  }));

  /* Browser segments */
  const browserMap   = d.registeredByBrowser || {};
  const browserTotal = Object.values(browserMap).reduce((a, b) => a + b, 0) || 1;
  const browserColors = ['#ff8c42', '#4d9fff', '#b57aff', '#00e5a0', '#ffd166'];
  const browserSegments = Object.entries(browserMap).map(([k, v], i) => ({
    label: k, value: v, color: browserColors[i % browserColors.length],
    pct: +pct(v, browserTotal),
  }));

  const regMax   = Math.max(d.registrationsToday, d.registrationsThisWeek, d.registrationsThisMonth) || 1;
  const loginMax = Math.max(d.loginsToday, d.loginsThisWeek, d.loginsThisMonth) || 1;

  return (
    <div className="ua-page">

      {/* ── Header ── */}
      <div className="ua-header">
        <div className="ua-header-left">
          <h1>User Analytics</h1>
          <p>PLATFORM OVERVIEW · REAL-TIME</p>
        </div>
        <button
          className={`ua-refresh-btn${refreshing ? ' spinning' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1.5 8A6.5 6.5 0 1 0 8 1.5" strokeLinecap="round"/>
            <path d="M1.5 4.5v3.5h3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Overview Cards ── */}
      <p className="ua-section-label">Overview</p>
      <div className="ua-overview-grid">
        <StatCard
          label="Total Users"
          value={d.totalUsers}
          sub="all time"
          icon="👥"
          accent="var(--ua-accent)"
          accentDim="var(--ua-accent-dim)"
        />
        <StatCard
          label="Active"
          value={d.activeUsers}
          sub={`${pct(d.activeUsers, total)}% of total`}
          icon="✓"
          accent="var(--ua-accent)"
          accentDim="var(--ua-accent-dim)"
        />
        <StatCard
          label="Inactive"
          value={d.inactiveUsers}
          sub={`${pct(d.inactiveUsers, total)}%`}
          icon="◌"
          accent="var(--ua-blue)"
          accentDim="var(--ua-blue-dim)"
        />
        <StatCard
          label="Suspended"
          value={d.suspendedUsers}
          sub={`${pct(d.suspendedUsers, total)}%`}
          icon="⏸"
          accent="var(--ua-yellow)"
          accentDim="var(--ua-yellow-dim)"
        />
        <StatCard
          label="Banned"
          value={d.bannedUsers}
          sub={`${pct(d.bannedUsers, total)}%`}
          icon="⊘"
          accent="var(--ua-red)"
          accentDim="var(--ua-red-dim)"
        />
      </div>

      {/* ── Registrations + Logins ── */}
      <p className="ua-section-label">Activity</p>
      <div className="ua-two-col" style={{ marginBottom: 16 }}>

        {/* Registrations */}
        <div className="ua-panel">
          <div className="ua-panel-title">
            <span className="dot" style={{ background: 'var(--ua-accent)' }} />
            New Registrations
          </div>
          <div className="ua-timeline-row">
            <TimelineItem label="Today"  value={d.registrationsToday}      max={regMax} color="var(--ua-accent)" />
            <TimelineItem label="7 days" value={d.registrationsThisWeek}   max={regMax} color="var(--ua-accent)" />
            <TimelineItem label="30 days"value={d.registrationsThisMonth}  max={regMax} color="var(--ua-accent)" />
          </div>
        </div>

        {/* Logins */}
        <div className="ua-panel">
          <div className="ua-panel-title">
            <span className="dot" style={{ background: 'var(--ua-blue)' }} />
            Logins
          </div>
          <div className="ua-timeline-row">
            <TimelineItem label="Today"  value={d.loginsToday}      max={loginMax} color="var(--ua-blue)" />
            <TimelineItem label="7 days" value={d.loginsThisWeek}   max={loginMax} color="var(--ua-blue)" />
            <TimelineItem label="30 days"value={d.loginsThisMonth}  max={loginMax} color="var(--ua-blue)" />
          </div>
        </div>
      </div>

      {/* ── Status + Verification + Password ── */}
      <p className="ua-section-label">Users Detail</p>
      <div className="ua-three-col" style={{ marginBottom: 16 }}>

        {/* Status donut */}
        <div className="ua-panel">
          <div className="ua-panel-title">
            <span className="dot" style={{ background: 'var(--ua-accent)' }} />
            Status Breakdown
          </div>
          <div className="ua-donut-wrap">
            <DonutChart segments={statusSegments} />
            <div className="ua-donut-legend">
              {statusSegments.map((s) => (
                <div key={s.label} className="ua-legend-item">
                  <div className="ua-legend-dot" style={{ background: s.color }} />
                  <span className="ua-legend-label">{s.label}</span>
                  <span className="ua-legend-val">{fmt(s.value)}</span>
                  <span className="ua-legend-pct">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="ua-panel">
          <div className="ua-panel-title">
            <span className="dot" style={{ background: 'var(--ua-purple)' }} />
            Verification Rates
          </div>
          <div className="ua-verify-row">
            <VerifyItem label="Email Verified"         count={d.emailVerifiedUsers}  total={total} color="var(--ua-purple)" />
            <VerifyItem label="Phone Verified"         count={d.phoneVerifiedUsers}  total={total} color="var(--ua-orange)" />
            <VerifyItem label="Fully Verified (Both)"  count={d.fullyVerifiedUsers}  total={total} color="var(--ua-accent)" />
          </div>
        </div>

        {/* Password */}
        <div className="ua-panel">
          <div className="ua-panel-title">
            <span className="dot" style={{ background: 'var(--ua-orange)' }} />
            Password Health
          </div>
          <div className="ua-password-grid">
            <div className="ua-pwd-card">
              <div className="ua-pwd-card pwd-val" style={{ color: 'var(--ua-accent)' }}>
                {d.avgPasswordChangeCount ?? '—'}
              </div>
              <div className="pwd-label">AVG CHANGES</div>
            </div>
            <div className="ua-pwd-card">
              <div className="ua-pwd-card pwd-val" style={{ color: 'var(--ua-red)' }}>
                {fmt(d.usersNeverChangedPassword)}
              </div>
              <div className="pwd-label">NEVER CHANGED</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Device / OS / Browser ── */}
      <p className="ua-section-label">Device & Platform</p>
      <div className="ua-three-col">

        {/* Device Type */}
        <div className="ua-panel">
          <div className="ua-panel-title">
            <span className="dot" style={{ background: 'var(--ua-accent)' }} />
            Device Type
          </div>
          {deviceSegments.length > 0 ? (
            <div className="ua-donut-wrap">
              <DonutChart segments={deviceSegments} size={100} stroke={20} />
              <div className="ua-donut-legend">
                {deviceSegments.map((s) => (
                  <div key={s.label} className="ua-legend-item">
                    <div className="ua-legend-dot" style={{ background: s.color }} />
                    <span className="ua-legend-label">{s.label}</span>
                    <span className="ua-legend-val">{fmt(s.value)}</span>
                    <span className="ua-legend-pct">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p style={{ color: 'var(--ua-text-muted)', fontSize: '0.75rem' }}>No data</p>}
        </div>

        {/* OS */}
        <div className="ua-panel">
          <div className="ua-panel-title">
            <span className="dot" style={{ background: 'var(--ua-blue)' }} />
            Operating System
          </div>
          {osSegments.length > 0 ? (
            <div className="ua-status-list">
              {osSegments.map((s) => (
                <div key={s.label} className="ua-status-row">
                  <div className="ua-status-badge" style={{ background: s.color }} />
                  <span className="ua-status-name">{s.label}</span>
                  <span className="ua-status-count">{fmt(s.value)}</span>
                  <span className="ua-status-pct">{s.pct}%</span>
                </div>
              ))}
            </div>
          ) : <p style={{ color: 'var(--ua-text-muted)', fontSize: '0.75rem' }}>No data</p>}
        </div>

        {/* Browser */}
        <div className="ua-panel">
          <div className="ua-panel-title">
            <span className="dot" style={{ background: 'var(--ua-purple)' }} />
            Browser
          </div>
          {browserSegments.length > 0 ? (
            <div className="ua-status-list">
              {browserSegments.map((s) => (
                <div key={s.label} className="ua-status-row">
                  <div className="ua-status-badge" style={{ background: s.color }} />
                  <span className="ua-status-name">{s.label}</span>
                  <span className="ua-status-count">{fmt(s.value)}</span>
                  <span className="ua-status-pct">{s.pct}%</span>
                </div>
              ))}
            </div>
          ) : <p style={{ color: 'var(--ua-text-muted)', fontSize: '0.75rem' }}>No data</p>}
        </div>
      </div>

      {/* ── Last Login Device ── */}
      <p className="ua-section-label" style={{ marginTop: 16 }}>Last Login Devices</p>
      <div className="ua-two-col">

        {/* Last device type */}
        <div className="ua-panel">
          <div className="ua-panel-title">
            <span className="dot" style={{ background: 'var(--ua-orange)' }} />
            Last Login · Device Type
          </div>
          {Object.keys(d.lastLoginByDeviceType || {}).length > 0 ? (() => {
            const map   = d.lastLoginByDeviceType;
            const tot   = Object.values(map).reduce((a, b) => a + b, 0) || 1;
            const segs  = Object.entries(map).map(([k, v], i) => ({
              label: k, value: v, color: deviceColors[i % deviceColors.length],
              pct: +pct(v, tot),
            }));
            return (
              <div className="ua-donut-wrap">
                <DonutChart segments={segs} size={100} stroke={20} />
                <div className="ua-donut-legend">
                  {segs.map((s) => (
                    <div key={s.label} className="ua-legend-item">
                      <div className="ua-legend-dot" style={{ background: s.color }} />
                      <span className="ua-legend-label">{s.label}</span>
                      <span className="ua-legend-val">{fmt(s.value)}</span>
                      <span className="ua-legend-pct">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })() : <p style={{ color: 'var(--ua-text-muted)', fontSize: '0.75rem' }}>No data</p>}
        </div>

        {/* Last OS */}
        <div className="ua-panel">
          <div className="ua-panel-title">
            <span className="dot" style={{ background: 'var(--ua-yellow)' }} />
            Last Login · OS
          </div>
          {Object.keys(d.lastLoginByOs || {}).length > 0 ? (() => {
            const map   = d.lastLoginByOs;
            const tot   = Object.values(map).reduce((a, b) => a + b, 0) || 1;
            return (
              <div className="ua-status-list">
                {Object.entries(map).map(([k, v], i) => (
                  <div key={k} className="ua-status-row">
                    <div className="ua-status-badge" style={{ background: osColors[i % osColors.length] }} />
                    <span className="ua-status-name">{k}</span>
                    <span className="ua-status-count">{fmt(v)}</span>
                    <span className="ua-status-pct">{pct(v, tot)}%</span>
                  </div>
                ))}
              </div>
            );
          })() : <p style={{ color: 'var(--ua-text-muted)', fontSize: '0.75rem' }}>No data</p>}
        </div>
      </div>

    </div>
  );
};

export default UsersAnalytics;
