import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Train,
  Milestone,
  Armchair,
  Ticket,
  MapPin,
  CreditCard,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trains', label: 'Trains', icon: Train },
  { to: '/train-types', label: 'Train Types', icon: Milestone },
  { to: '/coach-types', label: 'Coach Types', icon: Armchair },
  { to: '/quotas', label: 'Quotas', icon: Ticket },
  { to: '/stations', label: 'Stations', icon: MapPin },
  { to: '/fare-rules', label: 'Fare Rules', icon: CreditCard },
  { to: '/admins', label: 'Admins', icon: Users },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-brand">
        <Train size={24} className="sidebar-logo" />
        {!collapsed && <span className="sidebar-brand-text">Rail Admin</span>}
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-toggle" onClick={onToggle}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
