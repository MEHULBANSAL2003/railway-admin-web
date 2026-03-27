import { useAuth } from '../context/AuthContext.jsx';
import { Search, LogOut, User, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchRoutes } from '../config/routes.config.js';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const results = searchRoutes(query);
      setSearchResults(results);
      setShowSearchResults(true);
      setSelectedIndex(-1);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleRouteSelect = (route) => {
    navigate(route.path);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSearchResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < searchResults.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleRouteSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSearchResults(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
        setSelectedIndex(-1);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        {/* Search */}
        <div className="header-search" ref={searchRef}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery && setShowSearchResults(true)}
          />

          {showSearchResults && (
            <div className="search-results">
              {searchResults.length > 0 ? (
                searchResults.map((route, index) => (
                  <div
                    key={route.id}
                    className={`search-item ${index === selectedIndex ? 'active' : ''}`}
                    onClick={() => handleRouteSelect(route)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className="search-item-name">{route.name}</span>
                    <span className="search-item-tag">{route.category}</span>
                  </div>
                ))
              ) : (
                <div className="search-empty">
                  <span>No results found</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        {isAuthenticated && (
          <div className="user-menu" ref={dropdownRef}>
            <button
              className="user-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="user-name">{user?.firstName || user?.name || 'Admin'}</span>
              <div className="user-avatar">
                {(user?.firstName || user?.name || 'A').charAt(0).toUpperCase()}
              </div>
            </button>

            {showDropdown && (
              <div className="dropdown">
                <button className="dropdown-item" onClick={() => { navigate('/profile'); setShowDropdown(false); }}>
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button className="dropdown-item" onClick={() => { navigate('/settings'); setShowDropdown(false); }}>
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item logout" onClick={logout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
