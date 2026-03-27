import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        {/* Placeholder for breadcrumbs or page title */}
      </div>

      <div className="header-right">
        <div className="header-user">
          <div className="header-avatar">
            <User size={16} />
          </div>
          <span className="header-username">{user?.name || 'Admin'}</span>
        </div>
        <button className="header-logout" onClick={logout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
