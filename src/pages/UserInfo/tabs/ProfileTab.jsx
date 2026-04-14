import {
  Mail, Phone, User, Shield, MapPin, Monitor,
  Calendar, Lock, Globe, Fingerprint, Clock, Smartphone,
  Chrome, Wifi,
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

const MetadataSection = ({ title, metadata, icon: Icon = Monitor }) => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <div className="ui-profile-section card">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
        <div className="card-body">
          <p className="text-muted" style={{ textAlign: 'center', padding: '1rem 0' }}>
            No metadata available
          </p>
        </div>
      </div>
    );
  }

  const getIconForField = (key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('ip')) return Globe;
    if (lowerKey.includes('device') || lowerKey.includes('model')) return Smartphone;
    if (lowerKey.includes('browser')) return Chrome;
    if (lowerKey.includes('os') || lowerKey.includes('platform')) return Monitor;
    if (lowerKey.includes('city') || lowerKey.includes('state') || lowerKey.includes('country') || lowerKey.includes('location')) return MapPin;
    if (lowerKey.includes('time') || lowerKey.includes('date') || lowerKey.includes('at')) return Clock;
    if (lowerKey.includes('network') || lowerKey.includes('isp')) return Wifi;
    return Icon;
  };

  const formatKey = (key) => {
    // Convert camelCase to Title Case with spaces
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    // Check if value looks like an ISO date
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return formatDateTime(value);
    }
    return String(value);
  };

  return (
    <div className="ui-profile-section card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-body">
        <div className="ui-info-grid">
          {Object.entries(metadata).map(([key, value]) => {
            const FieldIcon = getIconForField(key);
            return (
              <InfoItem
                key={key}
                icon={FieldIcon}
                label={formatKey(key)}
                value={formatValue(value)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ProfileTab = ({ user }) => {
  console.log(user);
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

      {/* Registration Metadata */}
      <MetadataSection
        title="Registration Metadata"
        metadata={user.registrationMetadata}
        icon={User}
      />

      {/* Login Metadata */}
      <MetadataSection
        title="Login Metadata"
        metadata={user.lastLoginMetadata}
        icon={Lock}
      />

      {/* Timestamps */}
      <div className="ui-profile-section card" style={{ gridColumn: '1 / -1', maxWidth: '600px' }}>
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
