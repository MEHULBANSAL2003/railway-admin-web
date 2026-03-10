import { useState, useEffect, useCallback, useRef } from 'react';
import { JourneyService } from '../../services/JourneyService.js';
import { useToast } from '../../context/Toast/useToast.js';

const PAGE_SIZE   = 20;
const DEBOUNCE_MS = 400;

const DEFAULT_FILTERS = {
  dateFrom:  '',
  dateTo:    '',
  statuses:  [], // multi-select: ['SCHEDULED','CANCELLED',...]
};

const DEFAULT_SORT = {
  sortBy:  'journeyDate',
  sortDir: 'desc',
};

export const useJourneyList = (trainNumber) => {
  const { showError } = useToast();

  const [data,          setData]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [hasMore,       setHasMore]       = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort,    setSort]    = useState(DEFAULT_SORT);

  const pageRef     = useRef(0);
  const debounceRef = useRef(null);
  const filtersRef  = useRef(DEFAULT_FILTERS);
  const sortRef     = useRef(DEFAULT_SORT);

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

    if (f.dateFrom)          params.dateFrom = f.dateFrom;
    if (f.dateTo)            params.dateTo   = f.dateTo;
    if (f.statuses.length)   params.statuses = f.statuses.join(',');

    return params;
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setData([]);
    pageRef.current = 0;

    try {
      const res = await JourneyService.getAllJourneysOfTrain(trainNumber, buildParams(0));
      const d   = res?.data?.data;
      setData(d?.content || []);
      setHasMore(!d.last);
      setTotalElements(d.totalElements ?? 0);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to load journeys.');
    } finally {
      setLoading(false);
    }
  }, [trainNumber, buildParams, showError]);

  useEffect(() => { fetchList(); }, [trainNumber]);

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
    scheduleFetch(false);
  }, [scheduleFetch]);

  const handleFilterReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    filtersRef.current = DEFAULT_FILTERS;
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
      const res = await JourneyService.getAllJourneysOfTrain(trainNumber, buildParams(nextPage));
      const d   = res?.data?.data;
      setData(prev => [...prev, ...(d?.content || [])]);
      setHasMore(!d.last);
      pageRef.current = nextPage;
    } catch {
      showError('Failed to load more journeys.');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, trainNumber, buildParams, showError]);

  // Optimistic: update a single row after cancel
  const updateRow = useCallback((journeyId, patch) => {
    setData(prev => prev.map(r => r.journeyId === journeyId ? { ...r, ...patch } : r));
  }, []);

  return {
    data, loading, loadingMore, hasMore, totalElements,
    filters, sort,
    handleFilterChange, handleFilterReset, handleSort,
    loadMore, updateRow,
    refresh: fetchList,
  };
};
