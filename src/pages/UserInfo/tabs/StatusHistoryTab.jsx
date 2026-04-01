import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, Inbox,
} from 'lucide-react';
import { UserService } from '../../../services/UserService.js';
import { useToast } from '../../../context/Toast/useToast.js';
import '../../AdminManagement/AdminManagement.css';

const PAGE_SIZE = 10;

const SORTABLE_COLUMNS = [
  { key: 'changedAt',   label: 'Changed At',  width: '170px' },
  { key: 'oldStatus',   label: 'Old Status',   width: '120px' },
  { key: 'newStatus',   label: 'New Status',   width: '120px' },
  { key: 'changedById', label: 'Changed By',   width: '180px' },
];

const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const STATUS_COLORS = {
  ACTIVE: 'active',
  DISABLED: 'inactive',
  SUSPENDED: 'inactive',
  LOCKED: 'inactive',
  DEACTIVATED: 'inactive',
  DELETED: 'inactive',
};

const StatusBadge = ({ status }) => {
  if (!status) return <span className="text-secondary text-sm">—</span>;
  return (
    <span className={`status-badge ${STATUS_COLORS[status] || 'inactive'}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
};

const SortIcon = ({ colKey, sort }) => {
  if (sort.sortBy !== colKey) {
    return <ChevronsUpDown size={13} className="th-sort-icon" style={{ opacity: 0.3 }} />;
  }
  return sort.sortDir === 'asc'
    ? <ChevronUp size={13} style={{ color: 'var(--primary-600)' }} />
    : <ChevronDown size={13} style={{ color: 'var(--primary-600)' }} />;
};

const SKELETON_COUNT = 5;

const SkeletonRow = () => (
  <tr>
    <td><div className="skeleton-cell" style={{ width: '80%' }} /></td>
    <td><div className="skeleton-cell" style={{ width: '60%' }} /></td>
    <td><div className="skeleton-cell" style={{ width: '60%' }} /></td>
    <td><div className="skeleton-cell" style={{ width: '70%' }} /></td>
    <td><div className="skeleton-cell" style={{ width: '90%' }} /></td>
    <td><div className="skeleton-cell" style={{ width: '50%' }} /></td>
  </tr>
);

const StatusHistoryTab = ({ userId }) => {
  const { showError } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sort, setSort] = useState({ sortBy: 'changedAt', sortDir: 'desc' });

  const abortRef = useRef(null);

  const fetchData = useCallback(async (pageNum, sortState) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await UserService.getStatusHistory(userId, {
        page: pageNum,
        size: PAGE_SIZE,
        sortBy: sortState.sortBy,
        sortDir: sortState.sortDir,
      });
      const payload = res.data.data;
      setData(payload.content);
      setTotalPages(payload.totalPages);
      setTotalElements(payload.totalElements);
    } catch (err) {
      if (err?.code !== 'ERR_CANCELED') {
        showError(err?.response?.data?.error?.message || 'Failed to load status history.');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData(page, sort);
    return () => abortRef.current?.abort();
  }, [page, sort, fetchData]);

  const handleSort = useCallback((colKey) => {
    setSort(prev => ({
      sortBy: colKey,
      sortDir: prev.sortBy === colKey && prev.sortDir === 'asc' ? 'desc' : 'asc',
    }));
    setPage(0);
  }, []);

  const isEmpty = !loading && data.length === 0;

  return (
    <div className="card">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {SORTABLE_COLUMNS.map(col => (
                <th
                  key={col.key}
                  className={`th-sortable${sort.sortBy === col.key ? ' th-sorted' : ''}`}
                  style={{ width: col.width }}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="th-inner">
                    {col.label}
                    <SortIcon colKey={col.key} sort={sort} />
                  </div>
                </th>
              ))}
              <th>Reason</th>
              <th style={{ width: '100px' }}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}

            {!loading && data.map(entry => (
              <tr key={entry.id}>
                <td>
                  <span className="date-cell">{formatDateTime(entry.changedAt)}</span>
                </td>
                <td><StatusBadge status={entry.oldStatus} /></td>
                <td><StatusBadge status={entry.newStatus} /></td>
                <td>
                  <div>
                    <div className="ui-sh-actor-name">{entry.changedByName || '—'}</div>
                    <div className="ui-sh-actor-type">
                      {entry.changedByType || '—'}
                      {entry.changedById ? ` #${entry.changedById}` : ''}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="ui-sh-reason">{entry.reason || '—'}</span>
                </td>
                <td>
                  <span className="phone-cell">{entry.ipAddress || '—'}</span>
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
            <div className="admin-table-empty-title">No status history</div>
            <div className="admin-table-empty-desc">
              No status changes have been recorded for this user yet.
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="ui-sh-pagination">
          <span className="ui-sh-pagination-info">
            Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
            {' '}&middot;{' '}{totalElements} total record{totalElements !== 1 ? 's' : ''}
          </span>
          <div className="ui-sh-pagination-btns">
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusHistoryTab;
