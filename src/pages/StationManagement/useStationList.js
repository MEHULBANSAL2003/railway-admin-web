import { useState, useEffect, useCallback, useRef } from 'react';
import { StationService } from '../../services/StationService.js';
import { useToast } from '../../context/Toast/useToast.js';

const PAGE_SIZE   = 20;
const DEBOUNCE_MS = 400;

const DEFAULT_FILTERS = {
  searchTerm:  '',
  state:       '',
  zone:        '',
  stationType: '',
  isActive:    '',
};

const DEFAULT_SORT = {
  sortBy: 'stationCode',
  sortDirection: 'ASC',
};

export const useStationList = () => {
  const { showSuccess, showError } = useToast();

  const [data,          setData]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [hasMore,       setHasMore]       = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort,    setSort]    = useState(DEFAULT_SORT);

  const [statusLoadingCode, setStatusLoadingCode] = useState(null);

  const pageRef     = useRef(0);
  const debounceRef = useRef(null);
  const filtersRef  = useRef(DEFAULT_FILTERS);
  const sortRef     = useRef(DEFAULT_SORT);

  useEffect(() => { filtersRef.current = filters; }, [filters]);
  useEffect(() => { sortRef.current    = sort;    }, [sort]);

  // ── Build params — single endpoint handles everything ─────
  const buildParams = useCallback((page) => {
    const f = filtersRef.current;
    const s = sortRef.current;

    const params = {
      page,
      size:          PAGE_SIZE,
      sortBy:        s.sortBy,
      sortDirection: s.sortDirection,
    };

    if (f.searchTerm.trim()) params.searchTerm  = f.searchTerm.trim();
    if (f.state)             params.state       = f.state;
    if (f.zone)              params.zone        = f.zone;
    if (f.stationType)       params.stationType = f.stationType;
    if (f.isActive !== '')   params.isActive    = f.isActive;

    return params;
  }, []);

  // ── Fetch — always uses getAllStations ─────────────────────
  const fetchList = useCallback(async () => {
    setLoading(true);
    setData([]);
    pageRef.current = 0;

    try {
      const res = await StationService.getAllStations(buildParams(0));
      const d   = res.data.data;
      setData(d.content || []);
      setHasMore(!d.last);
      setTotalElements(d.totalElements ?? 0);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to load stations.');
    } finally {
      setLoading(false);
    }
  }, [buildParams, showError]);

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

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    filtersRef.current = { ...filtersRef.current, [key]: value };
    scheduleFetch(key === 'searchTerm');
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
      sortBy:        field,
      sortDirection: cur.sortBy === field && cur.sortDirection === 'ASC' ? 'DESC' : 'ASC',
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
      const res = await StationService.getAllStations(buildParams(nextPage));
      const d   = res.data.data;
      setData(prev => [...prev, ...(d.content || [])]);
      setHasMore(!d.last);
      pageRef.current = nextPage;
    } catch (err) {
      showError('Failed to load more stations.');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, buildParams, showError]);

  const handleStatusToggle = useCallback(async (station) => {
    if (!station.canUpdatedByCurrentAdmin) return;
    if (statusLoadingCode) return;

    const newStatus = !station.isActive;
    setStatusLoadingCode(station.stationCode);

    setData(prev =>
      prev.map(r => r.stationCode === station.stationCode ? { ...r, isActive: newStatus } : r)
    );

    try {
      await StationService.updateStationStatus(station.stationCode, newStatus);
      showSuccess(`${station.stationName} ${newStatus ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      setData(prev =>
        prev.map(r => r.stationCode === station.stationCode ? { ...r, isActive: station.isActive } : r)
      );
      showError(err?.response?.data?.error?.message || 'Failed to update station status.');
    } finally {
      setStatusLoadingCode(null);
    }
  }, [statusLoadingCode, showSuccess, showError]);

  const prependStation = useCallback((station) => {
    setData(prev => [station, ...prev]);
    setTotalElements(prev => prev + 1);
  }, []);

  return {
    data, loading, loadingMore, hasMore, totalElements,
    filters, sort,
    handleFilterChange, handleFilterReset, handleSort,
    loadMore,
    handleStatusToggle, statusLoadingCode,
    prependStation,
    refresh: fetchList,
  };
};
