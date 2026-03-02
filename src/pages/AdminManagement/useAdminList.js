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
  sortBy: 'id',
  sortDir: 'asc',
};

const PAGE_SIZE   = 10;
const DEBOUNCE_MS = 400;

export const useAdminList = () => {
  const { showSuccess, showError } = useToast();

  // ── Data ─────────────────────────────────────────────────
  const [data,          setData]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [hasMore,       setHasMore]       = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  // ── Filters & sort ───────────────────────────────────────
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort,    setSort]    = useState(DEFAULT_SORT);

  // ── Action loading states ────────────────────────────────
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [roleLoadingId,   setRoleLoadingId]   = useState(null);

  // ── Refs ─────────────────────────────────────────────────
  const pageRef     = useRef(0);
  const abortRef    = useRef(null);
  const debounceRef = useRef(null);

  // Keep latest filters/sort in refs so fetchList() always
  // reads current values without being a dependency itself
  const filtersRef = useRef(filters);
  const sortRef    = useRef(sort);
  useEffect(() => { filtersRef.current = filters; }, [filters]);
  useEffect(() => { sortRef.current    = sort;    }, [sort]);

  // ─────────────────────────────────────────────────────────
  // Build params — reads from refs, no dependency issues
  // ─────────────────────────────────────────────────────────
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
  }, []); // stable — intentionally no deps

  // ─────────────────────────────────────────────────────────
  // Core fetch — replaces list, always page 0
  // ─────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setData([]);
    pageRef.current = 0;

    try {
      const res = await AdminService.getAllAdminList(buildParams(0));
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
  }, [buildParams, showError]); // stable

  // ─────────────────────────────────────────────────────────
  // Mount — single fetch, no dependency-triggered re-runs
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty

  // ─────────────────────────────────────────────────────────
  // Schedule fetch helper
  // debounce=true  → 400ms wait (text inputs)
  // debounce=false → immediate (dropdowns, sort, reset)
  // ─────────────────────────────────────────────────────────
  const scheduleFetch = useCallback((debounce = false) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (debounce) {
      debounceRef.current = setTimeout(fetchList, DEBOUNCE_MS);
    } else {
      fetchList();
    }
  }, [fetchList]);

  // ─────────────────────────────────────────────────────────
  // Filter handlers
  // ─────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────
  // Sort handler
  // ─────────────────────────────────────────────────────────
  const handleSort = useCallback((field) => {
    const cur = sortRef.current;
    const newSort = {
      sortBy:  field,
      sortDir: cur.sortBy === field && cur.sortDir === 'asc' ? 'desc' : 'asc',
    };
    setSort(newSort);
    sortRef.current = newSort; // update ref immediately so fetchList reads it
    scheduleFetch(false);
  }, [scheduleFetch]);

  // ─────────────────────────────────────────────────────────
  // Infinite scroll — append next page
  // ─────────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = pageRef.current + 1;

    try {
      const res = await AdminService.getAllAdminList(buildParams(nextPage));
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

  // ─────────────────────────────────────────────────────────
  // Toggle isActive — optimistic update + rollback on error
  // ─────────────────────────────────────────────────────────
  const handleStatusToggle = useCallback(async (admin) => {
    if (statusLoadingId) return;

    const newStatus  = !admin.isActive;
    setStatusLoadingId(admin.id);

    // Optimistic
    setData(prev =>
      prev.map(r => r.id === admin.id ? { ...r, isActive: newStatus } : r)
    );

    try {
      await AdminService.updateAdminActiveStatus(admin.id, { setActive: newStatus });
      showSuccess(`${admin.fullName} ${newStatus ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      // Rollback
      setData(prev =>
        prev.map(r => r.id === admin.id ? { ...r, isActive: admin.isActive } : r)
      );
      showError(err?.response?.data?.error?.message || 'Failed to update status.');
    } finally {
      setStatusLoadingId(null);
    }
  }, [statusLoadingId, showSuccess, showError]);

  // ─────────────────────────────────────────────────────────
  // Update role — optimistic update + rollback on error
  // ─────────────────────────────────────────────────────────
  const handleRoleChange = useCallback(async (admin, newRole) => {
    if (roleLoadingId) return;
    if (admin.adminRole === newRole) return;

    const prevRole = admin.adminRole;
    setRoleLoadingId(admin.id);

    // Optimistic
    setData(prev =>
      prev.map(r => r.id === admin.id ? { ...r, adminRole: newRole } : r)
    );

    try {
      await AdminService.updateAdminRole(admin.id, { newRole: newRole });
      showSuccess(`${admin.fullName}'s role updated to ${newRole.replace('_', ' ')}.`);
    } catch (err) {
      // Rollback
      setData(prev =>
        prev.map(r => r.id === admin.id ? { ...r, adminRole: prevRole } : r)
      );
      showError(err?.response?.data?.error?.message || 'Failed to update role.');
    } finally {
      setRoleLoadingId(null);
    }
  }, [roleLoadingId, showSuccess, showError]);

  // ─────────────────────────────────────────────────────────
  // Generic patch (for edit modal saves)
  // ─────────────────────────────────────────────────────────
  const updateRowById = useCallback((id, patch) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }, []);

  return {
    data,
    loading,
    loadingMore,
    hasMore,
    totalElements,

    filters,
    sort,
    handleFilterChange,
    handleFilterReset,
    handleSort,

    loadMore,

    handleStatusToggle,
    handleRoleChange,
    statusLoadingId,
    roleLoadingId,
    updateRowById,

    refresh: fetchList,
  };
};
