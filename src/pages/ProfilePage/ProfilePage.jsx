import { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2, Shield, Calendar } from 'lucide-react';
import { AdminService } from '../../services/AdminService.js';
import { useToast } from '../../context/Toast/useToast.js';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await AdminService.getMyProfile();
        setProfile(res.data.data);
      } catch (err) {
        showError(err?.response?.data?.error?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Your account information</p>
        </div>
      </div>

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
              <span className="profile-detail-label">Status</span>
              <span className="profile-detail-value">
                <span className={`status-badge ${profile.enabled ? 'active' : 'inactive'}`}>
                  <span className="status-dot" />
                  {profile.enabled ? 'Active' : 'Inactive'}
                </span>
              </span>
            </div>
          </div>

          {profile.createdAt && (
            <div className="profile-detail-item">
              <Calendar size={16} className="profile-detail-icon" />
              <div>
                <span className="profile-detail-label">Member since</span>
                <span className="profile-detail-value">
                  {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
