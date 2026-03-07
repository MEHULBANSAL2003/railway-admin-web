import { useState, useEffect, useCallback, useRef } from 'react';
import { TrainService } from '../../services/TrainService.js';
import { useToast } from '../../context/Toast/useToast.js';

const PAGE_SIZE   = 20;
const DEBOUNCE_MS = 400;

const DEFAULT_FILTERS = {
  search:        '',
  trainTypeCode: '',
  zoneCode:      '',
  isActive:      '',
};

const DEFAULT_SORT = {
  sortBy:  'trainNumber',
  sortDir: 'asc',
};

export const useTrainList = () => {
  const { showError } = useToast();

  const [data,          setData]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [hasMore,       setHasMore]       = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  // Stats — from backend totalElements; active/superfast from accumulated data
  const [statsTotal,     setStatsTotal]     = useState(0);
  const [statsActive,    setStatsActive]    = useState(0);
  const [statsInactive,  setStatsInactive]  = useState(0);
  const [statsSuperfast, setStatsSuperfast] = useState(0);
  const [statsPantry,    setStatsPantry]    = useState(0);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort,    setSort]    = useState(DEFAULT_SORT);

  const pageRef     = useRef(0);
  const debounceRef = useRef(null);
  const filtersRef  = useRef(DEFAULT_FILTERS);
  const sortRef     = useRef(DEFAULT_SORT);

  useEffect(() => { filtersRef.current = filters; }, [filters]);
  useEffect(() => { sortRef.current    = sort;    }, [sort]);

  // ── Build params ──────────────────────────────────────────
  const buildParams = useCallback((page) => {
    const f = filtersRef.current;
    const s = sortRef.current;

    const params = {
      page,
      size:    PAGE_SIZE,
      sortBy:  s.sortBy,
      sortDir: s.sortDir,
    };

    if (f.search.trim())   params.search        = f.search.trim();
    if (f.trainTypeCode)   params.trainTypeCode = f.trainTypeCode;
    if (f.zoneCode)        params.zoneCode      = f.zoneCode;
    if (f.isActive !== '') params.isActive      = f.isActive;

    return params;
  }, []);

  // ── Compute stats from full data array ────────────────────
  const computeStats = (rows) => {
    setStatsActive(rows.filter(r => r.isActive).length);
    setStatsSuperfast(rows.filter(r => r.isSuperfast).length);
    setStatsPantry(rows.filter(r => r.pantrycar).length);
    setStatsInactive(rows.filter(r => !r.isActive).length);
  };

  // ── Initial / refresh fetch — resets to page 0 ───────────
  const fetchList = useCallback(async () => {
    setLoading(true);
    setData([]);
    pageRef.current = 0;

    try {
      const res = await TrainService.getAllForAdmin(buildParams(0));
      const d   = res.data.data;
      const rows = d.content || [];
      setData(rows);
      setHasMore(!d.last);
      setTotalElements(d.totalElements ?? 0);
      setStatsTotal(d.totalElements ?? 0);
      computeStats(rows);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to load trains.');
    } finally {
      setLoading(false);
    }
  }, [buildParams, showError]);

  // Run on mount
  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleFetch = useCallback((debounce = false) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (debounce) {
      debounceRef.current = setTimeout(fetchList, DEBOUNCE_MS);
    } else {
      fetchList();
    }
  }, [fetchList]);

  // ── Filter change ─────────────────────────────────────────
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    filtersRef.current = { ...filtersRef.current, [key]: value };
    scheduleFetch(key === 'search');
  }, [scheduleFetch]);

  const handleFilterReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSort(DEFAULT_SORT);
    filtersRef.current = DEFAULT_FILTERS;
    sortRef.current    = DEFAULT_SORT;
    scheduleFetch(false);
  }, [scheduleFetch]);

  // ── Sort ──────────────────────────────────────────────────
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

  // ── Infinite scroll load more ─────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;

    try {
      const res  = await TrainService.getAllForAdmin(buildParams(nextPage));
      const d    = res.data.data;
      const rows = d.content || [];
      setData(prev => {
        const merged = [...prev, ...rows];
        computeStats(merged);
        return merged;
      });
      setHasMore(!d.last);
      pageRef.current = nextPage;
    } catch {
      showError('Failed to load more trains.');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, buildParams, showError]);

  // ── Optimistic helpers ────────────────────────────────────
  const prependTrain = useCallback((train) => {
    setData(prev => {
      const merged = [train, ...prev];
      computeStats(merged);
      return merged;
    });
    setTotalElements(prev => prev + 1);
    setStatsTotal(prev => prev + 1);
  }, []);

  const updateRowById = useCallback((trainId, patch) => {
    setData(prev => {
      const merged = prev.map(r => r.trainId === trainId ? { ...r, ...patch } : r);
      computeStats(merged);
      return merged;
    });
  }, []);

  return {
    data, loading, loadingMore, hasMore, totalElements,
    filters, sort,
    handleFilterChange, handleFilterReset, handleSort,
    loadMore,
    prependTrain, updateRowById,
    refresh: fetchList,
    // Stats
    statsTotal, statsActive, statsSuperfast, statsPantry, statsInactive
  };
};
