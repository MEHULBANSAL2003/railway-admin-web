import { useAuth } from '../context/AuthContext.jsx';
import { Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useState } from 'react';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        {/* Left - Search */}
        <div className="header-search">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search bookings, trains, users..."
            className="search-input"
          />
        </div>

        {/* Right - User Info */}
        <div className="header-right">
          {/* Notifications */}
          <button className="header-icon-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>

          {/* User Menu */}
          {isAuthenticated && (
            <div className="user-menu">
              <button
                className="user-menu-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="user-info">
                  <p className="user-name">{user?.name || 'Admin User'}</p>
                  <p className="user-role">{user?.role || 'Administrator'}</p>
                </div>
                <ChevronDown size={16} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="dropdown-menu">
                  <button className="dropdown-item">
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  <button className="dropdown-item">
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item" onClick={logout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
