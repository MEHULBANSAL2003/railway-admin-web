import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, X, Search, Loader } from 'lucide-react';
import './SearchableSelect.css';

const DEBOUNCE_MS = 400;

const SearchableSelect = ({
                            value,
                            onChange,
                            fetchOptions,
                            placeholder = 'Select…',
                            disabled = false,
                            error = '',
                            clearable = true,
                            initialLabel = '',
                          }) => {
  const [open,        setOpen]        = useState(false);
  const [search,      setSearch]      = useState('');
  const [options,     setOptions]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [selectedLbl, setSelectedLbl] = useState(initialLabel);

  const containerRef = useRef(null);
  const inputRef     = useRef(null);
  const debounceRef  = useRef(null);

  // Keep label in sync when initialLabel prop changes (e.g. modal pre-fill)
  useEffect(() => {
    setSelectedLbl(initialLabel);
  }, [initialLabel]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      doFetch(''); // load initial options
    }
  }, [open]);

  const doFetch = useCallback(async (term) => {
    setLoading(true);
    try {
      const results = await fetchOptions(term);
      setOptions(results);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [fetchOptions]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doFetch(val), DEBOUNCE_MS);
  };

  const handleSelect = (opt) => {
    setSelectedLbl(opt.label);
    onChange(opt.value, opt.raw);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedLbl('');
    onChange('', null);
  };

  const displayLabel = value ? selectedLbl || value : '';

  return (
    <div
      ref={containerRef}
      className={`ss-container${open ? ' ss-open' : ''}${error ? ' ss-error' : ''}${disabled ? ' ss-disabled' : ''}`}
    >
      {/* Trigger */}
      <div className="ss-trigger" onClick={() => !disabled && setOpen(o => !o)}>
        {displayLabel
          ? <span className="ss-value">{displayLabel}</span>
          : <span className="ss-placeholder">{placeholder}</span>
        }
        <div className="ss-icons">
          {clearable && value && !disabled && (
            <button className="ss-clear" onMouseDown={handleClear} tabIndex={-1}>
              <X size={11} />
            </button>
          )}
          <ChevronDown size={14} className={`ss-chevron${open ? ' ss-chevron-up' : ''}`} />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="ss-dropdown">
          {/* Search input */}
          <div className="ss-search-wrap">
            <Search size={12} className="ss-search-icon" />
            <input
              ref={inputRef}
              className="ss-search-input"
              value={search}
              onChange={handleSearchChange}
              placeholder="Type to search…"
              onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
            />
            {loading && <Loader size={12} className="ss-search-spinner" />}
          </div>

          {/* Options */}
          <ul className="ss-options">
            {!loading && options.length === 0 && (
              <li className="ss-empty">
                {search ? `No results for "${search}"` : 'No options available'}
              </li>
            )}
            {options.map(opt => (
              <li
                key={opt.value}
                className={`ss-option${opt.value === value ? ' ss-option-selected' : ''}`}
                onMouseDown={() => handleSelect(opt)}
              >
                <span className="ss-option-label">{opt.label}</span>
                {opt.meta && <span className="ss-option-meta">{opt.meta}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="ss-error-msg">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
