import { useRef, useEffect, useCallback } from 'react';
import {
  Search, Mail, Phone, Shield, Building2,
  ChevronUp, ChevronDown, ChevronsUpDown,
  UserPlus, RotateCcw, Users, Pencil,
  ToggleLeft, ToggleRight, Inbox
} from 'lucide-react';
import { useAdminList } from './useAdminList.js';
import './AdminManagement.css';

// ── Constants ────────────────────────────────────────────
const ROLE_OPTIONS = [
  { value: '',            label: 'All Roles' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN',       label: 'Admin' },
];

const DEPARTMENT_OPTIONS = [
  { value: '',          label: 'All Departments' },
  { value: 'TECH',      label: 'Tech' },
  {value: 'SUPPORT',   label: 'Support' },
];

const SORTABLE_COLUMNS = [
  { key: 'fullName',    label: 'Admin' },
  { key: 'adminRole',   label: 'Role' },
  { key: 'department',  label: 'Department' },
  { key: 'phoneNumber', label: 'Phone' },
  { key: 'isActive',    label: 'Status' },
  { key: 'lastLoginAt', label: 'Last Login' },
  { key: 'createdAt',   label: 'Created' },
];

const SKELETON_COUNT = 8;

// ── Helpers ──────────────────────────────────────────────
const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const formatPhone = (code, number) =>
  code && number ? `${code} ${number}` : number || '—';

// ── Sub-components ───────────────────────────────────────

const SortIcon = ({ colKey, sort }) => {
  if (sort.sortBy !== colKey) {
    return <ChevronsUpDown size={13} className="th-sort-icon" style={{ opacity: 0.3 }} />;
  }
  return sort.sortDir === 'asc'
    ? <ChevronUp   size={13} style={{ color: 'var(--primary-600)' }} />
    : <ChevronDown size={13} style={{ color: 'var(--primary-600)' }} />;
};

const RoleBadge = ({ role }) => {
  const isSuperAdmin = role === 'SUPER_ADMIN';
  return (
    <span className={`role-badge ${isSuperAdmin ? 'super-admin' : 'admin'}`}>
      <span className="role-badge-dot" />
      {isSuperAdmin ? 'Super Admin' : 'Admin'}
    </span>
  );
};

const StatusBadge = ({ isActive }) => (
  <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
    <span className="status-dot" />
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

// Skeleton row
const SkeletonRow = () => (
  <tr>
    <td>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="skeleton-avatar" />
        <div style={{ flex: 1 }}>
          <div className="skeleton-cell" style={{ width: '55%', marginBottom: 6 }} />
          <div className="skeleton-cell" style={{ width: '75%' }} />
        </div>
      </div>
    </td>
    <td><div className="skeleton-cell" style={{ width: '70%' }} /></td>
    <td><div className="skeleton-cell" style={{ width: '60%' }} /></td>
    <td><div className="skeleton-cell" style={{ width: '80%' }} /></td>
    <td><div className="skeleton-cell" style={{ width: '50%' }} /></td>
    <td><div className="skeleton-cell" style={{ width: '65%' }} /></td>
    <td><div className="skeleton-cell" style={{ width: '60%' }} /></td>
    <td />
  </tr>
);

// ── Main component ───────────────────────────────────────
const AdminManagementPage = () => {
  const {
    data, loading, loadingMore, hasMore, totalElements,
    filters, sort,
    handleFilterChange, handleFilterReset, handleSort,
    loadMore,
    handleStatusToggle, handleRoleChange,
    statusLoadingId, roleLoadingId,
  } = useAdminList();

  // IntersectionObserver for infinite scroll
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

  const hasActiveFilters =
    filters.name || filters.email || filters.phone ||
    filters.role || filters.department;

  const isEmpty = !loading && data.length === 0;

  return (
    <div className="page-container">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Management</h1>
          <p className="page-subtitle">
            Manage admin accounts, roles, and access permissions
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => {/* open add modal */}}>
            <UserPlus size={16} />
            Add Admin
          </button>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="card">

        {/* ── Toolbar ── */}
        <div className="admin-toolbar">
          <div className="admin-toolbar-filters">

            {/* Name search */}
            <div className="filter-input-wrap">
              <span className="filter-input-icon"><Search size={14} /></span>
              <input
                className="filter-input"
                placeholder="Search name…"
                value={filters.name}
                onChange={e => handleFilterChange('name', e.target.value)}
              />
            </div>

            {/* Email search */}
            <div className="filter-input-wrap">
              <span className="filter-input-icon"><Mail size={14} /></span>
              <input
                className="filter-input"
                placeholder="Search email…"
                value={filters.email}
                onChange={e => handleFilterChange('email', e.target.value)}
              />
            </div>

            {/* Phone search */}
            <div className="filter-input-wrap">
              <span className="filter-input-icon"><Phone size={14} /></span>
              <input
                className="filter-input"
                placeholder="Search phone…"
                value={filters.phone}
                onChange={e => handleFilterChange('phone', e.target.value)}
              />
            </div>

            {/* Role dropdown */}
            <select
              className="filter-select"
              value={filters.role}
              onChange={e => handleFilterChange('role', e.target.value)}
            >
              {ROLE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Department dropdown */}
            <select
              className="filter-select"
              value={filters.department}
              onChange={e => handleFilterChange('department', e.target.value)}
            >
              {DEPARTMENT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Reset button — only show when filters are active */}
            {hasActiveFilters && (
              <button className="filter-reset-btn" onClick={handleFilterReset}>
                <RotateCcw size={12} />
                Reset
              </button>
            )}
          </div>

          {/* Result count */}
          {!loading && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
              {totalElements} result{totalElements !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div className="admin-table-wrap" style={{ maxHeight: 'calc(100vh - 320px)' }}>
          <table className="admin-table">
            <thead>
            <tr>
              {SORTABLE_COLUMNS.map(col => (
                <th
                  key={col.key}
                  className={`th-sortable${sort.sortBy === col.key ? ' th-sorted' : ''}`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="th-inner">
                    {col.label}
                    <SortIcon colKey={col.key} sort={sort} />
                  </div>
                </th>
              ))}
              {/* Actions column — not sortable */}
              <th style={{ width: 80 }} />
            </tr>
            </thead>

            <tbody>
            {/* Skeleton rows on initial load */}
            {loading && Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}

            {/* Data rows */}
            {!loading && data.map(admin => (
              <tr key={admin.id}>

                {/* Admin info */}
                <td>
                  <div className="admin-info">
                    <div className="admin-avatar">
                      {admin.profilePictureUrl
                        ? <img src={admin.profilePictureUrl} alt={admin.fullName} />
                        : getInitials(admin.fullName)
                      }
                    </div>
                    <div>
                      <div className="admin-name">{admin.fullName}</div>
                      <div className="admin-email">{admin.email}</div>
                    </div>
                  </div>
                </td>

                {/* Role — inline select for permitted admins */}
                <td>
                  {admin.canUpdatedByCurrentAdmin ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select
                        className="filter-select"
                        value={admin.adminRole}
                        disabled={roleLoadingId === admin.id}
                        onChange={e => handleRoleChange(admin, e.target.value)}
                        style={{ fontSize: 'var(--font-size-xs)', height: 28, paddingLeft: 8, opacity: roleLoadingId === admin.id ? 0.5 : 1 }}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                      {roleLoadingId === admin.id && (
                        <span style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)' }}>
                            <div className="inline-spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} />
                          </span>
                      )}
                    </div>
                  ) : (
                    <RoleBadge role={admin.adminRole} />
                  )}
                </td>

                {/* Department */}
                <td>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {admin.department || '—'}
                    </span>
                </td>

                {/* Phone */}
                <td>
                    <span className="phone-cell">
                      {formatPhone(admin.countryCode, admin.phoneNumber)}
                    </span>
                </td>

                {/* Status */}
                <td><StatusBadge isActive={admin.isActive} /></td>

                {/* Last login */}
                <td><span className="date-cell">{formatDate(admin.lastLoginAt)}</span></td>

                {/* Created at */}
                <td><span className="date-cell">{formatDate(admin.createdAt)}</span></td>

                {/* Actions */}
                <td>
                  <div className="row-actions">
                    {admin.canUpdatedByCurrentAdmin && (
                      <button
                        className="action-btn"
                        title="Edit admin"
                        onClick={() => {/* open edit modal */}}
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {admin.canDeletedByCurrentAdmin && (
                      <button
                        className={`action-btn${admin.isActive ? ' danger' : ''}`}
                        title={admin.isActive ? 'Deactivate' : 'Activate'}
                        disabled={statusLoadingId === admin.id}
                        onClick={() => handleStatusToggle(admin)}
                      >
                        {statusLoadingId === admin.id
                          ? <div className="inline-spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                          : admin.isActive
                            ? <ToggleRight size={15} />
                            : <ToggleLeft  size={15} />
                        }
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>

          {/* Empty state */}
          {isEmpty && (
            <div className="admin-table-empty">
              <div className="admin-table-empty-icon">
                <Inbox size={24} />
              </div>
              <div className="admin-table-empty-title">No admins found</div>
              <div className="admin-table-empty-desc">
                {hasActiveFilters
                  ? 'No admins match your current filters. Try adjusting or resetting them.'
                  : 'No admin accounts have been created yet.'
                }
              </div>
              {hasActiveFilters && (
                <button className="btn btn-secondary btn-sm" onClick={handleFilterReset}>
                  <RotateCcw size={13} />
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          {!loading && hasMore && (
            <div ref={sentinelRef} className="load-more-sentinel" />
          )}
        </div>

        {/* Loading more spinner */}
        {loadingMore && (
          <div className="load-more-spinner">
            <div className="inline-spinner" />
            <span className="load-more-spinner-text">Loading more admins…</span>
          </div>
        )}

        {/* Footer count */}
        {!loading && data.length > 0 && (
          <div className="admin-table-footer">
            <span className="admin-table-count">
              Showing <strong>{data.length}</strong> of <strong>{totalElements}</strong> admins
            </span>
            {hasMore && (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                Scroll down to load more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagementPage;
