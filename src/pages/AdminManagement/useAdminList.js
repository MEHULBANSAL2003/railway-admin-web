import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminService } from '../../services/AdminService.js';
import { useToast } from '../../context/Toast/useToast.js';

const DEFAULT_FILTERS = {
  name: '',
  email: '',
  phone: '',
  role: '',
  department: '',
};

const DEFAULT_SORT = {
  sortBy: 'adminId',
  sortDir: 'asc',
};

const PAGE_SIZE   = 10;
const DEBOUNCE_MS = 400;

export const useAdminList = () => {
  const { showSuccess, showError } = useToast();

  const [data,          setData]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [hasMore,       setHasMore]       = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort,    setSort]    = useState(DEFAULT_SORT);

  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [roleLoadingId,   setRoleLoadingId]   = useState(null);

  const pageRef     = useRef(0);
  const abortRef    = useRef(null);
  const debounceRef = useRef(null);

  const filtersRef = useRef(filters);
  const sortRef    = useRef(sort);
  useEffect(() => { filtersRef.current = filters; }, [filters]);
  useEffect(() => { sortRef.current    = sort;    }, [sort]);

  const buildParams = useCallback((page) => {
    const f = filtersRef.current;
    const s = sortRef.current;

    const params = {
      page,
      size:    PAGE_SIZE,
      sortBy:  s.sortBy,
      sortDir: s.sortDir,
    };

    if (f.name.trim())  params.name       = f.name.trim();
    if (f.email.trim()) params.email      = f.email.trim();
    if (f.phone.trim()) params.phone      = f.phone.trim();
    if (f.role)         params.role       = f.role;
    if (f.department)   params.department = f.department;

    return params;
  }, []);

  const fetchList = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setData([]);
    pageRef.current = 0;

    try {
      const res = await AdminService.list(buildParams(0));
      const { content, hasNext, totalElements: total } = res.data.data;

      setData(content);
      setHasMore(hasNext);
      setTotalElements(total);
    } catch (err) {
      if (err?.code === 'ERR_CANCELED') return;
      showError(err?.response?.data?.error?.message || 'Failed to load admins.');
    } finally {
      setLoading(false);
    }
  }, [buildParams, showError]);

  useEffect(() => {
    fetchList();
  }, []);

  const scheduleFetch = useCallback((debounce = false) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (debounce) {
      debounceRef.current = setTimeout(fetchList, DEBOUNCE_MS);
    } else {
      fetchList();
    }
  }, [fetchList]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    filtersRef.current = { ...filtersRef.current, [key]: value };

    const isTextField = ['name', 'email', 'phone'].includes(key);
    scheduleFetch(isTextField);
  }, [scheduleFetch]);

  const handleFilterReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSort(DEFAULT_SORT);
    filtersRef.current = DEFAULT_FILTERS;
    sortRef.current    = DEFAULT_SORT;
    scheduleFetch(false);
  }, [scheduleFetch]);

  const handleSort = useCallback((field) => {
    const cur = sortRef.current;
    const newSort = {
      sortBy:  field,
      sortDir: cur.sortBy === field && cur.sortDir === 'asc' ? 'desc' : 'asc',
    };
    setSort(newSort);
    sortRef.current = newSort;
    scheduleFetch(false);
  }, [scheduleFetch]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = pageRef.current + 1;

    try {
      const res = await AdminService.list(buildParams(nextPage));
      const { content, hasNext } = res.data.data;

      setData(prev => [...prev, ...content]);
      setHasMore(hasNext);
      pageRef.current = nextPage;
    } catch (err) {
      if (err?.code === 'ERR_CANCELED') return;
      showError('Failed to load more admins.');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, buildParams, showError]);

  const handleStatusToggle = useCallback(async (admin) => {
    if (statusLoadingId) return;

    const newEnabled = !admin.enabled;
    setStatusLoadingId(admin.adminId);

    // Optimistic update
    setData(prev =>
      prev.map(r => r.adminId === admin.adminId ? { ...r, enabled: newEnabled } : r)
    );

    try {
      await AdminService.toggleStatus(admin.adminId);
      const displayName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
      showSuccess(`${displayName} ${newEnabled ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      // Revert on failure
      setData(prev =>
        prev.map(r => r.adminId === admin.adminId ? { ...r, enabled: admin.enabled } : r)
      );
      showError(err?.response?.data?.error?.message || 'Failed to update status.');
    } finally {
      setStatusLoadingId(null);
    }
  }, [statusLoadingId, showSuccess, showError]);

  const handleRoleChange = useCallback(async (admin) => {
    if (roleLoadingId) return;

    const prevRole = admin.role;
    const newRole = prevRole === 'ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';
    setRoleLoadingId(admin.adminId);

    // Optimistic update
    setData(prev =>
      prev.map(r => r.adminId === admin.adminId ? { ...r, role: newRole } : r)
    );

    try {
      await AdminService.changeRole(admin.adminId);
      const displayName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
      showSuccess(`${displayName}'s role updated to ${newRole.replace('_', ' ')}.`);
    } catch (err) {
      // Revert on failure
      setData(prev =>
        prev.map(r => r.adminId === admin.adminId ? { ...r, role: prevRole } : r)
      );
      showError(err?.response?.data?.error?.message || 'Failed to update role.');
    } finally {
      setRoleLoadingId(null);
    }
  }, [roleLoadingId, showSuccess, showError]);

  const updateRowById = useCallback((id, patch) => {
    setData(prev => prev.map(r => r.adminId === id ? { ...r, ...patch } : r));
  }, []);

  return {
    data, loading, loadingMore, hasMore, totalElements,
    filters, sort,
    handleFilterChange, handleFilterReset, handleSort,
    loadMore,
    handleStatusToggle, handleRoleChange,
    statusLoadingId, roleLoadingId,
    updateRowById,
    refresh: fetchList,
  };
};
