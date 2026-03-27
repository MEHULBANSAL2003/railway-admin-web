import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Mail, Phone, Shield, Building2,
  ChevronUp, ChevronDown, ChevronsUpDown,
  UserPlus, RotateCcw, Users, Pencil,
  ToggleLeft, ToggleRight, Inbox
} from 'lucide-react';
import { useAdminList } from './useAdminList.js';
import AddAdminModal from './AddAdminModal.jsx';
import './AdminManagement.css';

// -- Constants --
const ROLE_OPTIONS = [
  { value: '',            label: 'All Roles' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN',       label: 'Admin' },
];

const DEPARTMENT_OPTIONS = [
  { value: '',           label: 'All Departments' },
  { value: 'TECH',       label: 'Tech' },
  { value: 'OPERATIONS', label: 'Operations' },
  { value: 'FINANCE',    label: 'Finance' },
];

const SORTABLE_COLUMNS = [
  { key: 'firstName',  label: 'Admin' },
  { key: 'role',       label: 'Role' },
  { key: 'department', label: 'Department' },
  { key: 'phone',      label: 'Phone' },
  { key: 'enabled',    label: 'Status' },
  { key: 'lastLoginAt', label: 'Last Login' },
  { key: 'createdAt',  label: 'Created' },
];

const SKELETON_COUNT = 8;

// -- Helpers --
const getInitials = (firstName = '', lastName = '') => {
  const f = firstName.charAt(0) || '';
  const l = lastName.charAt(0) || '';
  return (f + l).toUpperCase() || '?';
};

const getDisplayName = (admin) => {
  return `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.email || '—';
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// -- Sub-components --
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

const StatusBadge = ({ enabled }) => (
  <span className={`status-badge ${enabled ? 'active' : 'inactive'}`}>
    <span className="status-dot" />
    {enabled ? 'Active' : 'Inactive'}
  </span>
);

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

// -- Main component --
const AdminManagementPage = () => {
  const {
    data, loading, loadingMore, hasMore, totalElements,
    filters, sort,
    handleFilterChange, handleFilterReset, handleSort,
    loadMore,
    handleStatusToggle, handleRoleChange,
    statusLoadingId, roleLoadingId,
    refresh,
  } = useAdminList();

  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAdminCreated = useCallback(() => {
    refresh();
  }, [refresh]);

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

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Management</h1>
          <p className="page-subtitle">
            Manage admin accounts, roles, and access permissions
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
            <UserPlus size={16} />
            Add Admin
          </button>
        </div>
      </div>

      {/* Add Admin Modal */}
      <AddAdminModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAdminCreated}
      />

      {/* Table Card */}
      <div className="card">

        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-toolbar-filters">
            <div className="filter-input-wrap">
              <span className="filter-input-icon"><Search size={14} /></span>
              <input
                className="filter-input"
                placeholder="Search name..."
                value={filters.name}
                onChange={e => handleFilterChange('name', e.target.value)}
              />
            </div>

            <div className="filter-input-wrap">
              <span className="filter-input-icon"><Mail size={14} /></span>
              <input
                className="filter-input"
                placeholder="Search email..."
                value={filters.email}
                onChange={e => handleFilterChange('email', e.target.value)}
              />
            </div>

            <div className="filter-input-wrap">
              <span className="filter-input-icon"><Phone size={14} /></span>
              <input
                className="filter-input"
                placeholder="Search phone..."
                value={filters.phone}
                onChange={e => handleFilterChange('phone', e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={filters.role}
              onChange={e => handleFilterChange('role', e.target.value)}
            >
              {ROLE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={filters.department}
              onChange={e => handleFilterChange('department', e.target.value)}
            >
              {DEPARTMENT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button className="filter-reset-btn" onClick={handleFilterReset}>
                <RotateCcw size={12} />
                Reset
              </button>
            )}
          </div>

          {!loading && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
              {totalElements} result{totalElements !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Table */}
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
              <th style={{ width: 80 }} />
            </tr>
            </thead>

            <tbody>
            {loading && Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}

            {!loading && data.map(admin => (
              <tr key={admin.adminId}>
                <td>
                  <div className="admin-info">
                    <div className="admin-avatar">
                      {getInitials(admin.firstName, admin.lastName)}
                    </div>
                    <div>
                      <div className="admin-name">{getDisplayName(admin)}</div>
                      <div className="admin-email">{admin.email}</div>
                    </div>
                  </div>
                </td>

                <td><RoleBadge role={admin.role} /></td>

                <td>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {admin.department || '—'}
                  </span>
                </td>

                <td>
                  <span className="phone-cell">
                    {admin.phone || '—'}
                  </span>
                </td>

                <td><StatusBadge enabled={admin.enabled} /></td>

                <td><span className="date-cell">{formatDate(admin.lastLoginAt)}</span></td>

                <td><span className="date-cell">{formatDate(admin.createdAt)}</span></td>

                <td>
                  <div className="row-actions">
                    <button
                      className="action-btn"
                      title="Toggle role"
                      disabled={roleLoadingId === admin.adminId}
                      onClick={() => handleRoleChange(admin)}
                    >
                      {roleLoadingId === admin.adminId
                        ? <div className="inline-spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                        : <Shield size={14} />
                      }
                    </button>
                    <button
                      className={`action-btn${admin.enabled ? ' danger' : ''}`}
                      title={admin.enabled ? 'Deactivate' : 'Activate'}
                      disabled={statusLoadingId === admin.adminId}
                      onClick={() => handleStatusToggle(admin)}
                    >
                      {statusLoadingId === admin.adminId
                        ? <div className="inline-spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                        : admin.enabled
                          ? <ToggleRight size={15} />
                          : <ToggleLeft  size={15} />
                      }
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>

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

          {!loading && hasMore && (
            <div ref={sentinelRef} className="load-more-sentinel" />
          )}
        </div>

        {loadingMore && (
          <div className="load-more-spinner">
            <div className="inline-spinner" />
            <span className="load-more-spinner-text">Loading more admins...</span>
          </div>
        )}

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
