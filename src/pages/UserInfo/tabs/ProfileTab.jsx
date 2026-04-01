import {
  Mail, Phone, User, Shield, MapPin, Monitor,
  Calendar, Lock, Globe, Fingerprint, Clock,
} from 'lucide-react';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="ui-info-item">
    <Icon size={15} className="ui-info-icon" />
    <div>
      <span className="ui-info-label">{label}</span>
      <span className="ui-info-value">{value || '—'}</span>
    </div>
  </div>
);

const ProfileTab = ({ user }) => {
  return (
    <div className="ui-profile-grid">
      {/* Identity */}
      <div className="ui-profile-section card">
        <div className="card-header">
          <h3 className="card-title">Identity</h3>
        </div>
        <div className="card-body">
          <div className="ui-info-grid">
            <InfoItem icon={User} label="Full Name" value={user.fullName} />
            <InfoItem icon={Fingerprint} label="Username" value={user.username} />
            <InfoItem icon={Mail} label="Email" value={user.email} />
            <InfoItem icon={Phone} label="Phone" value={user.phone ? `${user.countryCode || '+91'} ${user.phone}` : null} />
            <InfoItem icon={Calendar} label="Date of Birth" value={formatDate(user.dateOfBirth)} />
            <InfoItem icon={User} label="Gender" value={user.gender === 'M' ? 'Male' : user.gender === 'F' ? 'Female' : user.gender || '—'} />
          </div>
        </div>
      </div>

      {/* Verification & Security */}
      <div className="ui-profile-section card">
        <div className="card-header">
          <h3 className="card-title">Verification & Security</h3>
        </div>
        <div className="card-body">
          <div className="ui-info-grid">
            <InfoItem icon={Mail} label="Email Verified" value={
              <span className={`status-badge ${user.emailVerified ? 'active' : 'inactive'}`}>
                <span className="status-dot" />
                {user.emailVerified ? 'Verified' : 'Unverified'}
              </span>
            } />
            <InfoItem icon={Phone} label="Phone Verified" value={
              <span className={`status-badge ${user.phoneVerified ? 'active' : 'inactive'}`}>
                <span className="status-dot" />
                {user.phoneVerified ? 'Verified' : 'Unverified'}
              </span>
            } />
            <InfoItem icon={Shield} label="Account Status" value={
              <span className={`status-badge ${user.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                <span className="status-dot" />
                {user.status}
              </span>
            } />
            {user.statusReason && (
              <InfoItem icon={Shield} label="Status Reason" value={user.statusReason} />
            )}
            <InfoItem icon={Lock} label="Password Changes" value={user.passwordChangeCount ?? 0} />
            <InfoItem icon={Lock} label="Last Password Change" value={formatDateTime(user.lastPasswordChangeAt)} />
          </div>
        </div>
      </div>

      {/* Last Login Details */}
      <div className="ui-profile-section card">
        <div className="card-header">
          <h3 className="card-title">Last Login</h3>
        </div>
        <div className="card-body">
          <div className="ui-info-grid">
            <InfoItem icon={Clock} label="Login Time" value={formatDateTime(user.lastLoginAt)} />
            <InfoItem icon={Globe} label="IP Address" value={user.lastLoginIp} />
            <InfoItem icon={Monitor} label="Device" value={user.lastDeviceType} />
            <InfoItem icon={Monitor} label="OS" value={user.lastOs} />
            <InfoItem icon={Globe} label="Browser" value={user.lastBrowser} />
            <InfoItem icon={MapPin} label="Location" value={
              [user.lastLoginCity, user.lastLoginState, user.lastLoginCountry]
                .filter(Boolean)
                .join(', ') || '—'
            } />
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="ui-profile-section card">
        <div className="card-header">
          <h3 className="card-title">Timestamps</h3>
        </div>
        <div className="card-body">
          <div className="ui-info-grid">
            <InfoItem icon={Calendar} label="Account Created" value={formatDateTime(user.createdAt)} />
            <InfoItem icon={Calendar} label="Last Updated" value={formatDateTime(user.updatedAt)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
