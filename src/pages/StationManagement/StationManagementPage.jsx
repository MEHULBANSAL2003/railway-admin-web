import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown, Plus, RotateCcw, Inbox,
  ToggleLeft, ToggleRight, FileSpreadsheet, Pencil, Trash2,
} from 'lucide-react';
import { useStationList } from './useStationList.js';
import AddStationModal from './AddStationModal.jsx';
import EditStationModal from './EditStationModal.jsx';
import DeleteStationModal from './DeleteStationModal.jsx';
import ExcelUploadModal from '../../components/UI/ExcelUploadModal.jsx';
import { StationService } from '../../services/StationService.js';
import { StatesCitiesService } from '../../services/StatesCitiesService.js';
import { ZoneService } from '../../services/ZoneService.js';
import './StationManagementPage.css';
import '../AdminManagement/AddAdminModal.css';
import '../../components/UI/ExcelUploadModal.css';

// ── Constants ─────────────────────────────────────────────
const STATION_TYPE_OPTIONS = [
  { value: '',          label: 'All Types'  },
  { value: 'JUNCTION',  label: 'Junction'   },
  { value: 'REGULAR',   label: 'Regular'    },
  { value: 'TERMINUS',  label: 'Terminus'   },
  { value: 'HALT',      label: 'Halt'       },
];

const STATUS_OPTIONS = [
  { value: '',     label: 'All Status' },
  { value: 'true', label: 'Active'     },
  { value: 'false',label: 'Inactive'   },
];

const SORTABLE_COLS = [
  { key: 'stationName', label: 'Station'   },
  { key: 'stationType', label: 'Type'      },
  { key: 'zoneName',    label: 'Zone'      },
  { key: 'cityName',    label: 'City'      },
  { key: 'stateName',   label: 'State'     },
  { key: 'numPlatforms',label: 'Platforms' },
  { key: 'isActive',    label: 'Status'    },
  { key: 'createdAt',   label: 'Created'   },
];

const SKELETON_COUNT = 10;

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
    case 'TERMINUS': return 'terminus';
    case 'HALT':     return 'halt';
    default:         return 'regular';
  }
};

// ── Sub-components ────────────────────────────────────────
const SortIcon = ({ colKey, sort }) => {
  if (sort.sortBy !== colKey)
    return <ChevronsUpDown size={12} style={{ opacity: 0.3 }} />;
  return sort.sortDirection === 'ASC'
    ? <ChevronUp   size={12} style={{ color: 'var(--primary-600)' }} />
    : <ChevronDown size={12} style={{ color: 'var(--primary-600)' }} />;
};

const SkeletonRow = () => (
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
    <td><div className="sm-skeleton" style={{ width: 60 }} /></td>
    <td><div className="sm-skeleton" style={{ width: 90 }} /></td>
    <td><div className="sm-skeleton" style={{ width: 70 }} /></td>
    <td><div className="sm-skeleton" style={{ width: 80 }} /></td>
    <td><div className="sm-skeleton" style={{ width: 30 }} /></td>
    <td><div className="sm-skeleton" style={{ width: 55 }} /></td>
    <td><div className="sm-skeleton" style={{ width: 70 }} /></td>
    <td />
  </tr>
);

// ── Main component ────────────────────────────────────────
const StationManagementPage = () => {
  const {
    data, loading, loadingMore, hasMore, totalElements,
    filters, sort,
    handleFilterChange, handleFilterReset, handleSort,
    loadMore,
    handleStatusToggle, statusLoadingCode,
    prependStation, updateRowByCode, removeRowByCode, refresh,
  } = useStationList();

  // ── Reference data for modals ────────────────────────────
  const [states, setStates] = useState([]);
  const [zones,  setZones]  = useState([]);

  useEffect(() => {
    StatesCitiesService.getAllStates({ searchTerm: '' })
      .then(r => setStates(r.data.data || []))
      .catch(() => {});
    ZoneService.getAllZones({})
      .then(r => setZones(r.data.data || []))
      .catch(() => {});
  }, []);

  // ── Modal state ──────────────────────────────────────────
  const [addModalOpen,   setAddModalOpen]   = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [editStation,    setEditStation]    = useState(null); // station obj or null
  const [deleteStation,  setDeleteStation]  = useState(null); // station obj or null

  // ── Infinite scroll sentinel ─────────────────────────────
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const hasActiveFilters = filters.searchTerm || filters.state ||
    filters.zone || filters.stationType || filters.isActive !== '';
  const isEmpty = !loading && data.length === 0;

  return (
    <div className="page-container">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Station Management</h1>
          <p className="page-subtitle">
            Manage railway stations, types, zones, and active status
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setExcelModalOpen(true)}>
            <FileSpreadsheet size={15} />
            Import Excel
          </button>
          <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}
                  style={{ background: '#d97706' }}
          >
            <Plus size={16} />
            Add Station
          </button>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 'calc(100vh - 148px)' }}>

        {/* ── Toolbar ── */}
        <div className="sm-toolbar">
          <div className="sm-toolbar-filters">

            {/* Search — covers name + code via search API */}
            <div className="sm-filter-wrap">
              <span className="sm-filter-icon"><Search size={13} /></span>
              <input
                className="sm-filter-input"
                placeholder="Search name or code…"
                value={filters.searchTerm}
                onChange={e => handleFilterChange('searchTerm', e.target.value)}
              />
            </div>

            {/* State */}
            <select
              className="sm-filter-select"
              value={filters.state}
              onChange={e => handleFilterChange('state', e.target.value)}
            >
              <option value="">All States</option>
              {states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>

            {/* Zone */}
            <select
              className="sm-filter-select"
              value={filters.zone}
              onChange={e => handleFilterChange('zone', e.target.value)}
            >
              <option value="">All Zones</option>
              {zones.map(z => (
                <option key={z.zoneId ?? z.id} value={z.zoneCode ?? z.code}>
                  {z.zoneName ?? z.name}
                </option>
              ))}
            </select>

            {/* Station type */}
            <select
              className="sm-filter-select"
              value={filters.stationType}
              onChange={e => handleFilterChange('stationType', e.target.value)}
            >
              {STATION_TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Status */}
            <select
              className="sm-filter-select"
              value={filters.isActive}
              onChange={e => handleFilterChange('isActive', e.target.value)}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {hasActiveFilters && (
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

        {/* ── Table ── */}
        <div className="sm-table-wrap">
          <table className="sm-table">
            <thead>
            <tr>
              {SORTABLE_COLS.map(col => (
                <th
                  key={col.key}
                  className={`sm-th-sortable${sort.sortBy === col.key ? ' sm-th-sorted' : ''}`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="sm-th-inner">
                    {col.label}
                    <SortIcon colKey={col.key} sort={sort} />
                  </div>
                </th>
              ))}
              <th style={{ width: 60 }} />
            </tr>
            </thead>

            <tbody>
            {/* Initial skeleton */}
            {loading && Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}

            {/* Data rows */}
            {!loading && data.map(station => (
              <tr key={station.stationId}>

                {/* Station name + code */}
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

                {/* Type */}
                <td>
                    <span className={`sm-type-badge ${typeBadgeClass(station.stationType)}`}>
                      {station.stationType}
                    </span>
                </td>

                {/* Zone */}
                <td>
                    <span className="sm-zone-pill">
                      <span className="sm-zone-code">{station.zoneCode}</span>
                      {station.zoneName}
                    </span>
                </td>

                {/* City */}
                <td>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {station.cityName}
                    </span>
                </td>

                {/* State */}
                <td>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                      {station.stateCode}
                    </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginLeft: 4 }}>
                      {station.stateName}
                    </span>
                </td>

                {/* Platforms */}
                <td>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      {station.numPlatforms}
                    </span>
                </td>

                {/* Status */}
                <td>
                    <span className={`sm-status-badge ${station.isActive ? 'active' : 'inactive'}`}>
                      <span className="sm-status-dot" />
                      {station.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>

                {/* Created */}
                <td>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                      {formatDate(station.createdAt)}
                    </span>
                </td>

                {/* Actions */}
                <td>
                  <div className="sm-row-actions">
                    {station.canUpdatedByCurrentAdmin && (
                      <button
                        className="sm-action-btn"
                        title="Edit station"
                        onClick={() => setEditStation(station)}
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {station.canUpdatedByCurrentAdmin && (
                      <button
                        className={`sm-action-btn${station.isActive ? ' danger' : ''}`}
                        title={station.isActive ? 'Deactivate' : 'Activate'}
                        disabled={statusLoadingCode === station.stationCode}
                        onClick={() => handleStatusToggle(station)}
                      >
                        {statusLoadingCode === station.stationCode
                          ? <span className="sm-spinner" />
                          : station.isActive
                            ? <ToggleRight size={15} />
                            : <ToggleLeft  size={15} />
                        }
                      </button>
                    )}
                    {station.canDeletedByCurrentAdmin && (
                      <button
                        className="sm-action-btn danger"
                        title="Delete station"
                        onClick={() => setDeleteStation(station)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>

              </tr>
            ))}

            {/* Skeleton rows during load-more */}
            {loadingMore && Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={`more-${i}`} />
            ))}
            </tbody>
          </table>

          {/* Infinite scroll sentinel */}
          {!loading && hasMore && (
            <div ref={sentinelRef} style={{ height: 1 }} />
          )}

          {/* Empty state */}
          {isEmpty && (
            <div className="sm-empty">
              <div className="sm-empty-icon"><Inbox size={24} /></div>
              <div className="sm-empty-title">No stations found</div>
              <div className="sm-empty-desc">
                {hasActiveFilters
                  ? 'No stations match your current filters. Try adjusting or resetting them.'
                  : 'No stations have been added yet.'
                }
              </div>
              {hasActiveFilters && (
                <button className="btn btn-secondary btn-sm" onClick={handleFilterReset}
                        style={{ marginTop: 4 }}
                >
                  <RotateCcw size={13} /> Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && data.length > 0 && (
          <div className="sm-footer">
            <span>
              Showing <strong>{data.length}</strong> of <strong>{totalElements}</strong> stations
            </span>
            {hasMore && <span>Scroll down to load more</span>}
          </div>
        )}
      </div>

      {/* ── Add Station Modal ── */}
      <AddStationModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={(created) => {
          if (created) prependStation(created);
          else refresh();
        }}
        states={states}
        zones={zones}
      />

      {/* ── Excel Upload Modal ── */}
      <ExcelUploadModal
        open={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        title="Import Stations"
        subtitle="Upload an Excel file to bulk-import stations"
        onUpload={(file) => StationService.uploadStationExcel(file)}
        onSuccess={refresh}
      />

      {/* ── Edit Station Modal ── */}
      <EditStationModal
        open={!!editStation}
        onClose={() => setEditStation(null)}
        station={editStation}
        states={states}
        zones={zones}
        onSuccess={(updated) => {
          if (updated) updateRowByCode(editStation.stationCode, updated);
          else refresh();
          setEditStation(null);
        }}
      />

      {/* ── Delete Station Modal ── */}
      <DeleteStationModal
        open={!!deleteStation}
        onClose={() => setDeleteStation(null)}
        station={deleteStation}
        onSuccess={(code) => {
          removeRowByCode(code);
          setDeleteStation(null);
        }}
      />

    </div>
  );
};

export default StationManagementPage;
