import { useRef, useEffect, useState } from 'react';
import {
  Search, ChevronRight, MapPin, Building2,
  Plus, X, Inbox, Map, FileSpreadsheet
} from 'lucide-react';
import { useStatesCities } from './useStatesCities.js';
import AddCityModal from './AddCityModal.jsx';
import ExcelUploadModal from '../../components/UI/ExcelUploadModal.jsx';
import { StatesCitiesService } from '../../services/StatesCitiesService.js';
import { HttpWrapper } from '../../httpWrapper/HttpWrapper.js';
import './StatesCities.css';
import '../AdminManagement/AddAdminModal.css';
import '../../components/UI/ExcelUploadModal.css';

// ── Helpers ──────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// ── Skeleton rows ─────────────────────────────────────────
const StateSkeletons = () => (
  <>
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="sc-skeleton-state">
        <div className="sc-skeleton-box" />
        <div style={{ flex: 1 }}>
          <div className="sc-skeleton" style={{ width: '70%' }} />
        </div>
      </div>
    ))}
  </>
);

const CitySkeletons = ({ count = 8 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <tr key={i}>
        <td><div className="sc-skeleton" style={{ width: '55%' }} /></td>
        <td><div className="sc-skeleton" style={{ width: '70%' }} /></td>
        <td><div className="sc-skeleton" style={{ width: '40%' }} /></td>
        <td><div className="sc-skeleton" style={{ width: '60%' }} /></td>
        <td><div className="sc-skeleton" style={{ width: '30%' }} /></td>
      </tr>
    ))}
  </>
);

// ── Main component ────────────────────────────────────────
const StatesCitiesPage = () => {
  const {
    states, statesLoading, stateSearch, selectedState,
    handleStateSearch, handleSelectState, handleClearStateFilter,

    cities, citiesLoading, loadingMore, hasMore, totalCities,
    citySearch, handleCitySearch, loadMoreCities,

    addingCity, handleAddCity,
  } = useStatesCities();

  const [addCityOpen,         setAddCityOpen]         = useState(false);
  const [cityExcelOpen,       setCityExcelOpen]       = useState(false);
  const [stateExcelOpen,      setStateExcelOpen]      = useState(false);

  // Infinite scroll sentinel
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMoreCities(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMoreCities]);

  const citiesEmpty = !citiesLoading && cities.length === 0;

  return (
    <div className="page-container">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">States &amp; Cities</h1>
          <p className="page-subtitle">
            Browse states and manage cities. Click a state to filter its cities.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setStateExcelOpen(true)}>
            <FileSpreadsheet size={15} />
            Import States
          </button>
          <button className="btn btn-secondary" onClick={() => setCityExcelOpen(true)}>
            <FileSpreadsheet size={15} />
            Import Cities
          </button>
          <button className="btn btn-primary" onClick={() => setAddCityOpen(true)}
                  style={{ background: '#16a34a' }}
          >
            <Plus size={16} />
            Add City
          </button>
        </div>
      </div>

      {/* ── Master-Detail Layout ── */}
      <div className="sc-layout">

        {/* ════════════════════════════════
            LEFT — States panel
            ════════════════════════════════ */}
        <div className="sc-panel">
          <div className="sc-panel-header">
            <div className="sc-panel-title">
              <span>
                <Map size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                States
              </span>
              {!statesLoading && (
                <span className="sc-panel-count">{states.length}</span>
              )}
            </div>
            <div className="sc-search">
              <span className="sc-search-icon"><Search size={13} /></span>
              <input
                className="sc-search-input"
                placeholder="Search states…"
                value={stateSearch}
                onChange={e => handleStateSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="sc-panel-body">
            {statesLoading && <StateSkeletons />}

            {!statesLoading && states.length === 0 && (
              <div className="sc-empty">
                <div className="sc-empty-icon"><Inbox size={22} /></div>
                <div className="sc-empty-title">No states found</div>
              </div>
            )}

            {!statesLoading && states.map(state => (
              <div
                key={state.id}
                className={`sc-state-item${selectedState?.id === state.id ? ' active' : ''}`}
                onClick={() => handleSelectState(state)}
              >
                <div className="sc-state-code">{state.code}</div>
                <div className="sc-state-name">{state.name}</div>
                <ChevronRight size={14} className="sc-state-arrow" />
              </div>
            ))}
          </div>

          {!statesLoading && states.length > 0 && (
            <div className="sc-panel-footer">
              <span>{states.length} state{states.length !== 1 ? 's' : ''}</span>
              {selectedState && (
                <span style={{ color: 'var(--primary-600)', fontWeight: 500 }}>
                  1 selected
                </span>
              )}
            </div>
          )}
        </div>

        {/* ════════════════════════════════
            RIGHT — Cities panel
            ════════════════════════════════ */}
        <div className="sc-panel">
          <div className="sc-panel-header">
            <div className="sc-cities-header-row">
              <div className="sc-panel-title" style={{ marginBottom: 0 }}>
                <span>
                  <Building2 size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Cities
                  {selectedState && (
                    <span style={{ color: 'var(--primary-600)', marginLeft: 6 }}>
                      — {selectedState.name}
                    </span>
                  )}
                </span>
                {!citiesLoading && (
                  <span className="sc-panel-count" style={{ marginLeft: 8 }}>{totalCities}</span>
                )}
              </div>
            </div>

            {/* Active state filter chip */}
            {selectedState && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--spacing-3)' }}>
                <div className="sc-filter-chip">
                  <MapPin size={11} />
                  {selectedState.name} ({selectedState.code})
                  <button className="sc-filter-chip-close" onClick={handleClearStateFilter}>
                    <X size={11} />
                  </button>
                </div>
              </div>
            )}

            <div className="sc-search">
              <span className="sc-search-icon"><Search size={13} /></span>
              <input
                className="sc-search-input"
                placeholder={selectedState ? `Search cities in ${selectedState.name}…` : 'Search all cities…'}
                value={citySearch}
                onChange={e => handleCitySearch(e.target.value)}
              />
            </div>
          </div>

          {/* Cities table */}
          <div className="sc-panel-body">
            <table className="sc-cities-table">
              <thead>
              <tr>
                <th>City</th>
                <th>State</th>
                <th>Code</th>
                <th>Created</th>
                <th>Status</th>
              </tr>
              </thead>
              <tbody>
              {/* Initial skeleton */}
              {citiesLoading && <CitySkeletons count={8} />}

              {/* Data rows */}
              {!citiesLoading && cities.map(city => (
                <tr key={city.id}>
                  <td>
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{city.name}</span>
                  </td>
                  <td>
                      <span className="sc-state-pill">
                        <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{city.stateCode}</span>
                        {city.stateName}
                      </span>
                  </td>
                  <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                        {city.stateCode}
                      </span>
                  </td>
                  <td>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                        {formatDate(city.createdAt)}
                      </span>
                  </td>
                  <td>
                    <span className={city.isActive ? 'sc-active-dot' : 'sc-inactive-dot'} />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginLeft: 6 }}>
                        {city.isActive ? 'Active' : 'Inactive'}
                      </span>
                  </td>
                </tr>
              ))}

              {/* Skeleton on load-more */}
              {loadingMore && <CitySkeletons count={3} />}
              </tbody>
            </table>

            {/* Infinite scroll sentinel */}
            {!citiesLoading && hasMore && (
              <div ref={sentinelRef} className="sc-sentinel" />
            )}

            {/* Empty state */}
            {citiesEmpty && (
              <div className="sc-empty">
                <div className="sc-empty-icon"><Building2 size={22} /></div>
                <div className="sc-empty-title">No cities found</div>
                <div className="sc-empty-desc">
                  {selectedState
                    ? `No cities found in ${selectedState.name}${citySearch ? ' matching your search' : ''}.`
                    : citySearch
                      ? 'No cities match your search.'
                      : 'No cities have been added yet.'
                  }
                </div>
                {!selectedState && !citySearch && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setAddCityOpen(true)}
                    style={{ background: '#16a34a', marginTop: 4 }}
                  >
                    <Plus size={13} /> Add First City
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!citiesLoading && cities.length > 0 && (
            <div className="sc-panel-footer">
              <span>
                Showing <strong>{cities.length}</strong> of <strong>{totalCities}</strong> cities
              </span>
              {hasMore && <span>Scroll to load more</span>}
            </div>
          )}
        </div>

      </div>

      {/* ── Add City Modal ── */}
      <AddCityModal
        open={addCityOpen}
        onClose={() => setAddCityOpen(false)}
        onSubmit={handleAddCity}
        saving={addingCity}
        states={states}
        preselectedState={selectedState}
      />

      {/* ── Import Cities via Excel ── */}
      <ExcelUploadModal
        open={cityExcelOpen}
        onClose={() => setCityExcelOpen(false)}
        title="Import Cities"
        subtitle="Upload an Excel file to bulk-import cities"
        onUpload={(file) => StatesCitiesService.addCitiesByExcel(file)}
        onSuccess={() => {}}
      />

      {/* ── Import States via Excel ── */}
      <ExcelUploadModal
        open={stateExcelOpen}
        onClose={() => setStateExcelOpen(false)}
        title="Import States"
        subtitle="Upload an Excel file to bulk-import states"
        onUpload={(file) => StatesCitiesService.addStatesByExcel(file)}
        onSuccess={() => {}}
      />

    </div>
  );
};

export default StatesCitiesPage;
