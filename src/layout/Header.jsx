import { useAuth } from '../context/AuthContext.jsx';
import { Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react';
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

  // Handle search input
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

  // Handle route selection
  const handleRouteSelect = (route) => {
    navigate(route.path);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSearchResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
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

  // Close search results when clicking outside
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

  // Clear search on route change
  useEffect(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  }, [navigate]);

  return (
    <header className="header">
      <div className="header-content">
        {/* Left - Search */}
        <div className="header-search" ref={searchRef}>
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search bookings, trains, users..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery && setShowSearchResults(true)}
          />

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="search-results">
              {searchResults.length > 0 ? (
                <>
                  <div className="search-results-header">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </div>
                  {searchResults.map((route, index) => (
                    <div
                      key={route.id}
                      className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                      onClick={() => handleRouteSelect(route)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="search-result-icon">{route.icon}</div>
                      <div className="search-result-content">
                        <div className="search-result-name">{route.name}</div>
                        <div className="search-result-description">{route.description}</div>
                      </div>
                      <div className="search-result-category">{route.category}</div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="search-no-results">
                  <div className="no-results-icon">🔍</div>
                  <p>No results found for "{searchQuery}"</p>
                  <span>Try searching for dashboard, bookings, or users</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right - User Info */}
        <div className="header-right">


          {/* User Menu */}
          {isAuthenticated && (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="user-menu-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="user-info">
                  <p className="user-name">{user?.name || 'Admin User'}</p>
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
