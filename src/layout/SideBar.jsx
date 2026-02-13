import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Train,
  Users,
  Ticket,
  Calendar,
  DollarSign,
  Settings,
  BarChart3,
  Menu,
  X,
  MapPin,
} from 'lucide-react';
import './Sidebar.css';

const mainMenuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/trains', label: 'Trains', icon: Train },
  { path: '/admin/stations', label: 'Stations', icon: MapPin },
  { path: '/bookings', label: 'Bookings', icon: Ticket },
  { path: '/schedules', label: 'Schedules', icon: Calendar },
  { path: '/users', label: 'Users', icon: Users },
];

const analyticsMenuItems = [
  { path: '/revenue', label: 'Revenue', icon: DollarSign },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

const settingsMenuItems = [
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Logo & Toggle */}
      <div className="sidebar-header">
        {isOpen && <h1 className="sidebar-logo">RailAdmin</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sidebar-toggle"
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Main Menu */}
        {isOpen && <div className="sidebar-section-label">Main Menu</div>}
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              data-label={item.label}
            >
              <Icon size={20} />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Divider */}
        <div className="sidebar-divider" />

        {/* Analytics */}
        {isOpen && <div className="sidebar-section-label">Analytics</div>}
        {analyticsMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              data-label={item.label}
            >
              <Icon size={20} />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Divider */}
        <div className="sidebar-divider" />

        {/* Settings */}
        {settingsMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              data-label={item.label}
            >
              <Icon size={20} />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
