import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Phone, Building2, Shield, Calendar, Clock, Hash,
  Globe, Monitor, Copy, Check, AlertCircle, Key,
} from 'lucide-react';
import { AdminService } from '../../services/AdminService.js';
import { useToast } from '../../context/Toast/useToast.js';
import { Storage } from '../../utils/storage.js';
import { STORAGE_KEYS } from '../../constants/AppConstants.js';
import './ProfilePage.css';
import '../AdminManagement/AdminManagement.css';

const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

const getTimeRemaining = (expiresAt) => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${mins}m remaining`;
  return `${mins}m remaining`;
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionFetched, setSessionFetched] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await AdminService.getMyProfile();
        setProfile(res.data.data);
      } catch (err) {
        showError(err?.response?.data?.reason || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFetchSession = useCallback(async () => {
    setSessionLoading(true);
    try {
      const res = await AdminService.getMySession();
      setSession(res.data.data);
      setSessionFetched(true);
    } catch (err) {
      setSession(null);
      setSessionFetched(true);
      showError(err?.response?.data?.reason || 'Failed to fetch session.');
    } finally {
      setSessionLoading(false);
    }
  }, [showError]);

  const handleCopyToken = useCallback(async () => {
    const token = Storage.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      showError('No access token found.');
      return;
    }
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      showSuccess('Access token copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showError('Failed to copy token.');
    }
  }, [showError, showSuccess]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="profile-loading">
          <div className="inline-spinner" style={{ width: 32, height: 32 }} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container">
        <div className="profile-loading">
          <p>Unable to load profile.</p>
        </div>
      </div>
    );
  }

  const displayName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Admin';
  const initials = `${(profile.firstName || '')[0] || ''}${(profile.lastName || '')[0] || ''}`.toUpperCase() || 'A';
  const timeRemaining = session ? getTimeRemaining(session.expiresAt) : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Your account information</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Profile Card */}
        <div className="profile-card card">
          <div className="profile-header">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-header-info">
              <h2 className="profile-name">{displayName}</h2>
              <span className={`role-badge ${profile.role === 'SUPER_ADMIN' ? 'super-admin' : 'admin'}`}>
                <span className="role-badge-dot" />
                {profile.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-detail-item">
              <Hash size={16} className="profile-detail-icon" />
              <div>
                <span className="profile-detail-label">Admin ID</span>
                <span className="profile-detail-value">{profile.adminId ?? '—'}</span>
              </div>
            </div>

            <div className="profile-detail-item">
              <Mail size={16} className="profile-detail-icon" />
              <div>
                <span className="profile-detail-label">Email</span>
                <span className="profile-detail-value">{profile.email || '—'}</span>
              </div>
            </div>

            <div className="profile-detail-item">
              <Phone size={16} className="profile-detail-icon" />
              <div>
                <span className="profile-detail-label">Phone</span>
                <span className="profile-detail-value">{profile.phone || '—'}</span>
              </div>
            </div>

            <div className="profile-detail-item">
              <Building2 size={16} className="profile-detail-icon" />
              <div>
                <span className="profile-detail-label">Department</span>
                <span className="profile-detail-value">{profile.department || '—'}</span>
              </div>
            </div>

            <div className="profile-detail-item">
              <Shield size={16} className="profile-detail-icon" />
              <div>
                <span className="profile-detail-label">Account Status</span>
                <span className="profile-detail-value">
                  <span className={`status-badge ${profile.enabled ? 'active' : 'inactive'}`}>
                    <span className="status-dot" />
                    {profile.enabled ? 'Active' : 'Inactive'}
                  </span>
                </span>
              </div>
            </div>

            {profile.lastLoginAt && (
              <div className="profile-detail-item">
                <Clock size={16} className="profile-detail-icon" />
                <div>
                  <span className="profile-detail-label">Last Login</span>
                  <span className="profile-detail-value">
                    {formatDateTime(profile.lastLoginAt)}
                  </span>
                </div>
              </div>
            )}

            {profile.createdAt && (
              <div className="profile-detail-item">
                <Calendar size={16} className="profile-detail-icon" />
                <div>
                  <span className="profile-detail-label">Member Since</span>
                  <span className="profile-detail-value">
                    {formatDate(profile.createdAt)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Session Card */}
        <div className="session-card card">
          <div className="session-card-header">
            <div className="session-card-title-row">
              <h3 className="session-card-title">Active Session</h3>
              {session && <span className="session-live-dot" />}
            </div>
            <p className="session-card-subtitle">View your current login session details</p>
          </div>

          <div className="session-card-body">
            {!sessionFetched ? (
              <button
                className="session-fetch-btn"
                onClick={handleFetchSession}
                disabled={sessionLoading}
              >
                {sessionLoading ? (
                  <>
                    <div className="inline-spinner" style={{ width: 15, height: 15 }} />
                    Fetching session...
                  </>
                ) : (
                  <>
                    <Key size={15} />
                    Get Session Info
                  </>
                )}
              </button>
            ) : session ? (
              <>
                <div className="session-detail-grid">
                  <div className="session-detail">
                    <Globe size={14} className="session-detail-icon" />
                    <div>
                      <span className="session-detail-label">IP Address</span>
                      <span className="session-detail-value">{session.ipAddress || '—'}</span>
                    </div>
                  </div>

                  <div className="session-detail">
                    <Monitor size={14} className="session-detail-icon" />
                    <div>
                      <span className="session-detail-label">Device</span>
                      <span className="session-detail-value">{session.deviceInfo || '—'}</span>
                    </div>
                  </div>

                  <div className="session-detail">
                    <Clock size={14} className="session-detail-icon" />
                    <div>
                      <span className="session-detail-label">Session Started</span>
                      <span className="session-detail-value">{formatDateTime(session.issuedAt)}</span>
                    </div>
                  </div>

                  <div className="session-detail">
                    <Calendar size={14} className="session-detail-icon" />
                    <div>
                      <span className="session-detail-label">Expires At</span>
                      <span className="session-detail-value">{formatDateTime(session.expiresAt)}</span>
                    </div>
                  </div>
                </div>

                {timeRemaining && (
                  <div className={`session-expiry-bar ${timeRemaining === 'Expired' ? 'expired' : ''}`}>
                    <Clock size={13} />
                    <span>{timeRemaining}</span>
                  </div>
                )}

                <button className="session-copy-btn" onClick={handleCopyToken}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Refresh Token'}
                </button>
              </>
            ) : (
              <div className="session-empty">
                <AlertCircle size={20} />
                <span>No active session found.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
