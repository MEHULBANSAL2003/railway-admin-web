import { useState, useRef, useEffect } from 'react';
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  Plus, RotateCcw, Inbox, ToggleLeft, ToggleRight,
  FileSpreadsheet, Pencil, Trash2, Train, History,
} from 'lucide-react';
import { useStationList }         from './useStationList.js';
import { useDeletedStationList }  from './useDeletedStationList.js';
import AddStationModal     from './AddStationModal.jsx';
import EditStationModal    from './EditStationModal.jsx';
import DeleteStationModal  from './DeleteStationModal.jsx';
import RestoreStationModal from './RestoreStationModal.jsx';
import ExcelUploadModal    from '../../components/UI/ExcelUploadModal.jsx';
import { StationService }      from '../../services/StationService.js';
import { StatesCitiesService } from '../../services/StatesCitiesService.js';
import { ZoneService }         from '../../services/ZoneService.js';
import './StationManagementPage.css';
import '../AdminManagement/AddAdminModal.css';
import '../../components/UI/ExcelUploadModal.css';

// ── Constants ─────────────────────────────────────────────
const STATION_TYPE_OPTIONS = [
  { value: '',         label: 'All Types' },
  { value: 'JUNCTION', label: 'Junction'  },
  { value: 'REGULAR',  label: 'Regular'   },
  { value: 'TERMINAL', label: 'Terminal'  },
  { value: 'HALT',     label: 'Halt'      },
  { value: 'CANTT',    label: 'Cantt'     },
  { value: 'CENTRAL',  label: 'Central'   },
];

const STATUS_OPTIONS = [
  { value: '',      label: 'All Status' },
  { value: 'true',  label: 'Active'     },
  { value: 'false', label: 'Inactive'   },
];

const ACTIVE_COLS = [
  { key: 'stationName',  label: 'Station'   },
  { key: 'stationType',  label: 'Type'      },
  { key: 'zoneName',     label: 'Zone'      },
  { key: 'cityName',     label: 'City'      },
  { key: 'stateName',    label: 'State'     },
  { key: 'numPlatforms', label: 'Platforms' },
  { key: 'isActive',     label: 'Status'    },
  { key: 'createdAt',    label: 'Created'   },
];

const DELETED_COLS = [
  { key: 'stationName',  label: 'Station'    },
  { key: 'stationType',  label: 'Type'       },
  { key: 'zoneName',     label: 'Zone'       },
  { key: 'cityName',     label: 'City'       },
  { key: 'stateName',    label: 'State'      },
  { key: 'numPlatforms', label: 'Platforms'  },
  { key: 'deletedAt',    label: 'Deleted On' },
];

// ── Helpers ───────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const typeBadgeClass = (type) => {
  switch (type) {
    case 'JUNCTION': return 'junction';
    case 'TERMINAL': return 'terminus';
    case 'HALT':     return 'halt';
    default:         return 'regular';
  }
};

// ── Shared sub-components ─────────────────────────────────
const SortIcon = ({ colKey, sort }) => {
  if (sort.sortBy !== colKey) return <ChevronsUpDown size={12} style={{ opacity: 0.3 }} />;
  return sort.sortDirection === 'ASC'
    ? <ChevronUp   size={12} style={{ color: 'var(--primary-600)' }} />
    : <ChevronDown size={12} style={{ color: 'var(--primary-600)' }} />;
};

const SkeletonRow = ({ colCount }) => (
  <tr>
    <td>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="sm-skeleton-avatar" />
        <div style={{ flex: 1 }}>
          <div className="sm-skeleton" style={{ width: '60%', marginBottom: 6 }} />
          <div className="sm-skeleton" style={{ width: '35%' }} />
        </div>
      </div>
    </td>
    {Array.from({ length: colCount - 1 }).map((_, i) => (
      <td key={i}><div className="sm-skeleton" style={{ width: '60%' }} /></td>
    ))}
    <td />
  </tr>
);

// Shared toolbar — showStatus prop controls isActive dropdown (hidden on deleted tab)
const Toolbar = ({ filters, handleFilterChange, handleFilterReset,
                   states, zones, showStatus, totalElements, loading }) => {
  const hasActive = filters.searchTerm || filters.state || filters.zone ||
    filters.stationType || (showStatus && filters.isActive !== '');
  return (
    <div className="sm-toolbar">
      <div className="sm-toolbar-filters">
        <div className="sm-filter-wrap">
          <span className="sm-filter-icon"><Search size={13} /></span>
          <input className="sm-filter-input" placeholder="Search name or code…"
                 value={filters.searchTerm}
                 onChange={e => handleFilterChange('searchTerm', e.target.value)} />
        </div>
        <select className="sm-filter-select" value={filters.state}
                onChange={e => handleFilterChange('state', e.target.value)}>
          <option value="">All States</option>
          {states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
        <select className="sm-filter-select" value={filters.zone}
                onChange={e => handleFilterChange('zone', e.target.value)}>
          <option value="">All Zones</option>
          {zones.map(z => (
            <option key={z.zoneId ?? z.id} value={z.zoneCode ?? z.code}>
              {z.zoneName ?? z.name}
            </option>
          ))}
        </select>
        <select className="sm-filter-select" value={filters.stationType}
                onChange={e => handleFilterChange('stationType', e.target.value)}>
          {STATION_TYPE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {showStatus && (
          <select className="sm-filter-select" value={filters.isActive || ''}
                  onChange={e => handleFilterChange('isActive', e.target.value)}>
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}
        {hasActive && (
          <button className="sm-reset-btn" onClick={handleFilterReset}>
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>
      {!loading && (
        <div className="sm-result-count">
          {totalElements} station{totalElements !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────
const StationManagementPage = () => {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'deleted'

  // Reference data for modals
  const [states, setStates] = useState([]);
  const [zones,  setZones]  = useState([]);
  useEffect(() => {
    StatesCitiesService.getAllStates({ searchTerm: '' })
      .then(r => setStates(r.data.data || [])).catch(() => {});
    ZoneService.getAllZones({})
      .then(r => setZones(r.data.data || [])).catch(() => {});
  }, []);

  // ── Active stations ──────────────────────────────────────
  const {
    data: activeData, loading: activeLoading, loadingMore: activeLoadingMore,
    hasMore: activeHasMore, totalElements: activeTotal,
    filters: activeFilters, sort: activeSort,
    handleFilterChange: activeFilterChange, handleFilterReset: activeFilterReset,
    handleSort: activeSortFn, loadMore: activeLoadMore,
    handleStatusToggle, statusLoadingCode,
    prependStation, updateRowByCode, removeRowByCode: removeActive,
    refresh: refreshActive,
  } = useStationList();

  // ── Deleted stations ─────────────────────────────────────
  const {
    data: deletedData, loading: deletedLoading, loadingMore: deletedLoadingMore,
    hasMore: deletedHasMore, totalElements: deletedTotal,
    filters: deletedFilters, sort: deletedSort,
    handleFilterChange: deletedFilterChange, handleFilterReset: deletedFilterReset,
    handleSort: deletedSortFn, loadMore: deletedLoadMore,
    removeRowByCode: removeDeleted,
    refresh: refreshDeleted,
  } = useDeletedStationList();

  // ── Modals ───────────────────────────────────────────────
  const [addModalOpen,   setAddModalOpen]   = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [editStation,    setEditStation]    = useState(null);
  const [deleteStation,  setDeleteStation]  = useState(null);
  const [restoreStation, setRestoreStation] = useState(null);

  // ── Infinite scroll sentinels ────────────────────────────
  const activeSentinelRef  = useRef(null);
  const deletedSentinelRef = useRef(null);

  useEffect(() => {
    const el = activeSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) activeLoadMore(); }, { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [activeLoadMore]);

  useEffect(() => {
    const el = deletedSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) deletedLoadMore(); }, { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [deletedLoadMore]);

  // ── Tab style helper ─────────────────────────────────────
  const tabStyle = (tab) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '9px 18px', border: 'none', background: 'transparent',
    cursor: 'pointer', fontFamily: 'inherit', fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: activeTab === tab ? 'var(--primary-600)' : 'var(--text-secondary)',
    borderBottom: activeTab === tab
      ? '2px solid var(--primary-600)'
      : '2px solid transparent',
    transition: 'all 0.15s',
  });

  const badgePill = (count, isRed = false) => ({
    fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 99, marginLeft: 2,
    background: isRed ? '#fef2f2' : 'var(--primary-50)',
    color: isRed ? '#dc2626' : 'var(--primary-700)',
  });

  return (
    <div className="page-container">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Station Management</h1>
          <p className="page-subtitle">
            Manage railway stations, types, zones, and active status
          </p>
        </div>
        {activeTab === 'active' && (
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={() => setExcelModalOpen(true)}>
              <FileSpreadsheet size={15} /> Import Excel
            </button>
            <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}
                    style={{ background: '#d97706' }}>
              <Plus size={16} /> Add Station
            </button>
          </div>
        )}
      </div>

      {/* ── Tab switcher ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-primary)',
        marginBottom: 'var(--spacing-4)',
      }}>
        <button style={tabStyle('active')} onClick={() => setActiveTab('active')}>
          <Train size={14} />
          Active Stations
          {!activeLoading && (
            <span style={badgePill(activeTotal)}>{activeTotal}</span>
          )}
        </button>
        <button style={tabStyle('deleted')} onClick={() => setActiveTab('deleted')}>
          <History size={14} />
          Deleted Stations
          {!deletedLoading && deletedTotal > 0 && (
            <span style={badgePill(deletedTotal, true)}>{deletedTotal}</span>
          )}
        </button>
      </div>

      {/* ════════════════ ACTIVE TAB ════════════════ */}
      {activeTab === 'active' && (
        <div className="card" style={{
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', maxHeight: 'calc(100vh - 210px)',
        }}>
          <Toolbar
            filters={activeFilters}
            handleFilterChange={activeFilterChange}
            handleFilterReset={activeFilterReset}
            states={states} zones={zones}
            showStatus={true}
            totalElements={activeTotal}
            loading={activeLoading}
          />
          <div className="sm-table-wrap">
            <table className="sm-table">
              <thead>
              <tr>
                {ACTIVE_COLS.map(col => (
                  <th key={col.key}
                      className={`sm-th-sortable${activeSort.sortBy === col.key ? ' sm-th-sorted' : ''}`}
                      onClick={() => activeSortFn(col.key)}>
                    <div className="sm-th-inner">
                      {col.label}
                      <SortIcon colKey={col.key} sort={activeSort} />
                    </div>
                  </th>
                ))}
                <th style={{ width: 90 }} />
              </tr>
              </thead>
              <tbody>
              {activeLoading && Array.from({ length: 10 }).map((_, i) => (
                <SkeletonRow key={i} colCount={8} />
              ))}

              {!activeLoading && activeData.map(station => (
                <tr key={station.stationId}>
                  <td>
                    <div className="sm-station-info">
                      <div className="sm-station-avatar">
                        {station.stationCode?.slice(0, 4)}
                      </div>
                      <div>
                        <div className="sm-station-name">{station.stationName}</div>
                        <div className="sm-station-code">{station.stationCode}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                      <span className={`sm-type-badge ${typeBadgeClass(station.stationType)}`}>
                        {station.stationType}
                      </span>
                  </td>
                  <td>
                      <span className="sm-zone-pill">
                        <span className="sm-zone-code">{station.zoneCode}</span>
                        {station.zoneName}
                      </span>
                  </td>
                  <td>
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {station.cityName}
                      </span>
                  </td>
                  <td>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                        {station.stateCode}
                      </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginLeft: 4 }}>
                        {station.stateName}
                      </span>
                  </td>
                  <td>
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        {station.numPlatforms}
                      </span>
                  </td>
                  <td>
                      <span className={`sm-status-badge ${station.isActive ? 'active' : 'inactive'}`}>
                        <span className="sm-status-dot" />
                        {station.isActive ? 'Active' : 'Inactive'}
                      </span>
                  </td>
                  <td>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                        {formatDate(station.createdAt)}
                      </span>
                  </td>
                  <td>
                    <div className="sm-row-actions">
                      {station.canUpdatedByCurrentAdmin && (
                        <button className="sm-action-btn" title="Edit station"
                                onClick={() => setEditStation(station)}>
                          <Pencil size={14} />
                        </button>
                      )}
                      {station.canUpdatedByCurrentAdmin && (
                        <button
                          className={`sm-action-btn${station.isActive ? ' danger' : ''}`}
                          title={station.isActive ? 'Deactivate' : 'Activate'}
                          disabled={statusLoadingCode === station.stationCode}
                          onClick={() => handleStatusToggle(station)}>
                          {statusLoadingCode === station.stationCode
                            ? <span className="sm-spinner" />
                            : station.isActive
                              ? <ToggleRight size={15} />
                              : <ToggleLeft  size={15} />
                          }
                        </button>
                      )}
                      {station.canDeletedByCurrentAdmin && (
                        <button className="sm-action-btn danger" title="Delete station"
                                onClick={() => setDeleteStation(station)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {activeLoadingMore && Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={`am${i}`} colCount={8} />
              ))}
              </tbody>
            </table>

            {!activeLoading && activeHasMore && (
              <div ref={activeSentinelRef} style={{ height: 1 }} />
            )}

            {!activeLoading && activeData.length === 0 && (
              <div className="sm-empty">
                <div className="sm-empty-icon"><Inbox size={24} /></div>
                <div className="sm-empty-title">No stations found</div>
                <div className="sm-empty-desc">
                  Try adjusting your filters or add a new station.
                </div>
              </div>
            )}
          </div>

          {!activeLoading && activeData.length > 0 && (
            <div className="sm-footer">
              <span>
                Showing <strong>{activeData.length}</strong> of <strong>{activeTotal}</strong> stations
              </span>
              {activeHasMore && <span>Scroll to load more</span>}
            </div>
          )}
        </div>
      )}

      {/* ════════════════ DELETED TAB ════════════════ */}
      {activeTab === 'deleted' && (
        <div className="card" style={{
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', maxHeight: 'calc(100vh - 210px)',
        }}>
          <Toolbar
            filters={deletedFilters}
            handleFilterChange={deletedFilterChange}
            handleFilterReset={deletedFilterReset}
            states={states} zones={zones}
            showStatus={false}
            totalElements={deletedTotal}
            loading={deletedLoading}
          />
          <div className="sm-table-wrap">
            <table className="sm-table">
              <thead>
              <tr>
                {DELETED_COLS.map(col => (
                  <th key={col.key}
                      className={`sm-th-sortable${deletedSort.sortBy === col.key ? ' sm-th-sorted' : ''}`}
                      onClick={() => deletedSortFn(col.key)}>
                    <div className="sm-th-inner">
                      {col.label}
                      <SortIcon colKey={col.key} sort={deletedSort} />
                    </div>
                  </th>
                ))}
                <th style={{ width: 60 }} />
              </tr>
              </thead>
              <tbody>
              {deletedLoading && Array.from({ length: 10 }).map((_, i) => (
                <SkeletonRow key={i} colCount={7} />
              ))}

              {!deletedLoading && deletedData.map(station => (
                <tr key={station.stationId}>
                  {/* Avatar — red tint to indicate deleted */}
                  <td>
                    <div className="sm-station-info">
                      <div className="sm-station-avatar"
                           style={{ background: '#fef2f2', color: '#dc2626' }}>
                        {station.stationCode?.slice(0, 4)}
                      </div>
                      <div>
                        <div className="sm-station-name"
                             style={{ color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                          {station.stationName}
                        </div>
                        <div className="sm-station-code">{station.stationCode}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                      <span className={`sm-type-badge ${typeBadgeClass(station.stationType)}`}>
                        {station.stationType}
                      </span>
                  </td>
                  <td>
                      <span className="sm-zone-pill">
                        <span className="sm-zone-code">{station.zoneCode}</span>
                        {station.zoneName}
                      </span>
                  </td>
                  <td>
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {station.cityName}
                      </span>
                  </td>
                  <td>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                        {station.stateCode}
                      </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginLeft: 4 }}>
                        {station.stateName}
                      </span>
                  </td>
                  <td>
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        {station.numPlatforms}
                      </span>
                  </td>
                  <td>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: '#dc2626' }}>
                        {formatDate(station.deletedAt)}
                      </span>
                  </td>
                  <td>
                    <div className="sm-row-actions">
                      <button className="sm-action-btn" title="Restore station"
                              style={{ color: '#16a34a' }}
                              onClick={() => setRestoreStation(station)}>
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {deletedLoadingMore && Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={`dm${i}`} colCount={7} />
              ))}
              </tbody>
            </table>

            {!deletedLoading && deletedHasMore && (
              <div ref={deletedSentinelRef} style={{ height: 1 }} />
            )}

            {!deletedLoading && deletedData.length === 0 && (
              <div className="sm-empty">
                <div className="sm-empty-icon"><History size={24} /></div>
                <div className="sm-empty-title">No deleted stations</div>
                <div className="sm-empty-desc">
                  Permanently deleted stations will appear here.
                </div>
              </div>
            )}
          </div>

          {!deletedLoading && deletedData.length > 0 && (
            <div className="sm-footer">
              <span>
                Showing <strong>{deletedData.length}</strong> of <strong>{deletedTotal}</strong> deleted stations
              </span>
              {deletedHasMore && <span>Scroll to load more</span>}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <AddStationModal
        open={addModalOpen} onClose={() => setAddModalOpen(false)}
        states={states} zones={zones}
        onSuccess={(created) => { if (created) prependStation(created); else refreshActive(); }}
      />

      <ExcelUploadModal
        open={excelModalOpen} onClose={() => setExcelModalOpen(false)}
        title="Import Stations" subtitle="Upload an Excel file to bulk-import stations"
        onUpload={(file) => StationService.uploadStationExcel(file)}
        onSuccess={refreshActive}
      />

      <EditStationModal
        open={!!editStation} onClose={() => setEditStation(null)}
        station={editStation} states={states} zones={zones}
        onSuccess={(updated) => {
          if (updated) updateRowByCode(editStation?.stationCode, updated);
          else refreshActive();
          setEditStation(null);
        }}
      />

      <DeleteStationModal
        open={!!deleteStation} onClose={() => setDeleteStation(null)}
        station={deleteStation}
        onSuccess={(code) => {
          removeActive(code);
          setDeleteStation(null);
          refreshDeleted(); // so it immediately appears in deleted tab
        }}
      />

      <RestoreStationModal
        open={!!restoreStation} onClose={() => setRestoreStation(null)}
        station={restoreStation}
        onSuccess={(code) => {
          removeDeleted(code);
          setRestoreStation(null);
          refreshActive(); // so it immediately appears in active tab
        }}
      />

    </div>
  );
};

export default StationManagementPage;
