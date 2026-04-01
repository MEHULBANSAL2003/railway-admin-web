import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, History, Ticket, CreditCard, Ban,
} from 'lucide-react';
import { UserService } from '../../services/UserService.js';
import { useToast } from '../../context/Toast/useToast.js';
import ProfileTab from './tabs/ProfileTab.jsx';
import StatusHistoryTab from './tabs/StatusHistoryTab.jsx';
import './UserInfoPage.css';

const TABS = [
  { key: 'profile',        label: 'Profile',        icon: User },
  { key: 'status-history', label: 'Status History',  icon: History },
  // Future tabs — just add here:
  // { key: 'bookings',    label: 'Bookings',       icon: Ticket },
  // { key: 'payments',    label: 'Payments',        icon: CreditCard },
  // { key: 'cancellations', label: 'Cancellations', icon: Ban },
];

const UserInfoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Track which tabs have been activated at least once (for lazy mounting)
  const mountedTabsRef = useRef(new Set(['profile']));

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await UserService.getById(id);
        if (!cancelled) setUser(res.data.data);
      } catch (err) {
        if (!cancelled) {
          showError(err?.response?.data?.error?.message || 'Failed to load user details.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUser();
    return () => { cancelled = true; };
  }, [id]);

  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
    mountedTabsRef.current.add(tabKey);
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="ui-loading-center">
          <div className="inline-spinner" style={{ width: 32, height: 32 }} />
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="ui-loading-center">
          <p>Unable to load user details.</p>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayName = user.fullName || user.username || 'User';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="ui-page-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="page-title">User Details</h1>
            <p className="page-subtitle">Viewing profile for {displayName}</p>
          </div>
        </div>
      </div>

      {/* User Summary Banner */}
      <div className="ui-user-banner card">
        <div className="ui-user-banner-left">
          {user.profileImageUrl ? (
            <img src={user.profileImageUrl} alt={displayName} className="ui-user-avatar-img" />
          ) : (
            <div className="ui-user-avatar">{initials}</div>
          )}
          <div className="ui-user-banner-info">
            <h2 className="ui-user-banner-name">{displayName}</h2>
            <span className="ui-user-banner-username">@{user.username || '—'}</span>
          </div>
        </div>
        <div className="ui-user-banner-right">
          <span className={`status-badge ${user.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
            <span className="status-dot" />
            {user.status}
          </span>
          <span className="ui-user-banner-id">ID: {user.userId}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="ui-tabs">
        <div className="ui-tabs-nav">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                className={`ui-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.key)}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="ui-tabs-content">
          {/* Profile tab — always mounted */}
          <div className={`ui-tab-panel ${activeTab === 'profile' ? 'active' : ''}`}>
            <ProfileTab user={user} />
          </div>

          {/* Status History — mounted on first click, hidden when not active */}
          {mountedTabsRef.current.has('status-history') && (
            <div className={`ui-tab-panel ${activeTab === 'status-history' ? 'active' : ''}`}>
              <StatusHistoryTab userId={id} />
            </div>
          )}

          {/* Future tab panels go here using the same pattern */}
        </div>
      </div>
    </div>
  );
};

export default UserInfoPage;
