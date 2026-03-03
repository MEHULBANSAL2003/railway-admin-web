import { useState, useEffect, useCallback, useRef } from 'react';
import { StatesCitiesService } from '../../services/StatesCitiesService.js';
import { useToast } from '../../context/Toast/useToast.js';

const CITY_PAGE_SIZE  = 20;
const DEBOUNCE_MS     = 400;

export const useStatesCities = () => {
  const { showSuccess, showError } = useToast();

  // ── States ───────────────────────────────────────────────
  const [states,        setStates]        = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [stateSearch,   setStateSearch]   = useState('');
  const [selectedState, setSelectedState] = useState(null); // full state object

  // ── Cities ───────────────────────────────────────────────
  const [cities,        setCities]        = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [hasMore,       setHasMore]       = useState(false);
  const [totalCities,   setTotalCities]   = useState(0);
  const [citySearch,    setCitySearch]    = useState('');

  // ── Add city ─────────────────────────────────────────────
  const [addingCity, setAddingCity] = useState(false);

  // ── Refs ─────────────────────────────────────────────────
  const cityPageRef      = useRef(0);
  const citySearchRef    = useRef('');
  const selectedStateRef = useRef(null);
  const debounceRef      = useRef(null);
  const stateDebounceRef = useRef(null);

  // ─────────────────────────────────────────────────────────
  // STATES — fetch all (filtered by searchTerm)
  // ─────────────────────────────────────────────────────────
  const fetchStates = useCallback(async (search = '') => {
    setStatesLoading(true);
    try {
      const params = search.trim() ? { searchTerm: search.trim() } : { searchTerm: '' };
      const res = await StatesCitiesService.getAllStates(params);
      setStates(res.data.data || []);
    } catch (err) {
      showError('Failed to load states.');
    } finally {
      setStatesLoading(false);
    }
  }, [showError]);

  // Mount — load states once
  useEffect(() => {
    fetchStates('');
  }, []);

  // ─────────────────────────────────────────────────────────
  // CITIES — fetch page 0, replaces list
  // ─────────────────────────────────────────────────────────
  const fetchCities = useCallback(async () => {
    setCitiesLoading(true);
    setCities([]);
    cityPageRef.current = 0;

    try {
      const state  = selectedStateRef.current;
      const search = citySearchRef.current;

      let res;
      if (state) {
        // fetch by state
        res = await StatesCitiesService.getAllCitiesByState({
          stateName:  state.name,
          searchTerm: search.trim() || '',
          page: 0,
          size: CITY_PAGE_SIZE,
        });
      } else {
        // fetch all cities
        res = await StatesCitiesService.getAllCities({
          searchTerm: search.trim() || '',
          page: 0,
          size: CITY_PAGE_SIZE,
        });
      }

      const d = res.data.data ?? res.data;
      setCities(d.content || []);
      setHasMore(!d.last);
      setTotalCities(d.totalElements ?? 0);
    } catch (err) {
      showError('Failed to load cities.');
    } finally {
      setCitiesLoading(false);
    }
  }, [showError]);

  // ─────────────────────────────────────────────────────────
  // CITIES — load next page (infinite scroll)
  // ─────────────────────────────────────────────────────────
  const loadMoreCities = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = cityPageRef.current + 1;

    try {
      const state  = selectedStateRef.current;
      const search = citySearchRef.current;

      let res;
      if (state) {
        res = await StatesCitiesService.getAllCitiesByState({
          stateName:  state.name,
          searchTerm: search.trim() || '',
          page: nextPage,
          size: CITY_PAGE_SIZE,
        });
      } else {
        res = await StatesCitiesService.getAllCities({
          searchTerm: search.trim() || '',
          page: nextPage,
          size: CITY_PAGE_SIZE,
        });
      }

      const d = res.data.data ?? res.data;
      setCities(prev => [...prev, ...(d.content || [])]);
      setHasMore(!d.last);
      cityPageRef.current = nextPage;
    } catch (err) {
      showError('Failed to load more cities.');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, showError]);

  // ─────────────────────────────────────────────────────────
  // Select a state → filter cities
  // ─────────────────────────────────────────────────────────
  const handleSelectState = useCallback((state) => {
    const isSame = selectedStateRef.current?.id === state?.id;
    const next   = isSame ? null : state; // click same → deselect

    selectedStateRef.current = next;
    setSelectedState(next);
    citySearchRef.current = '';
    setCitySearch('');
    fetchCities();
  }, [fetchCities]);

  const handleClearStateFilter = useCallback(() => {
    selectedStateRef.current = null;
    setSelectedState(null);
    citySearchRef.current = '';
    setCitySearch('');
    fetchCities();
  }, [fetchCities]);

  // ─────────────────────────────────────────────────────────
  // State search — debounced
  // ─────────────────────────────────────────────────────────
  const handleStateSearch = useCallback((value) => {
    setStateSearch(value);
    if (stateDebounceRef.current) clearTimeout(stateDebounceRef.current);
    stateDebounceRef.current = setTimeout(() => fetchStates(value), DEBOUNCE_MS);
  }, [fetchStates]);

  // ─────────────────────────────────────────────────────────
  // City search — debounced
  // ─────────────────────────────────────────────────────────
  const handleCitySearch = useCallback((value) => {
    setCitySearch(value);
    citySearchRef.current = value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchCities, DEBOUNCE_MS);
  }, [fetchCities]);

  // ─────────────────────────────────────────────────────────
  // Add city
  // ─────────────────────────────────────────────────────────
  const handleAddCity = useCallback(async ({ cityName, stateName }) => {
    setAddingCity(true);
    try {
      await StatesCitiesService.addNewCity({ cityName, stateName });
      showSuccess(`City "${cityName}" added successfully.`);
      fetchCities(); // refresh list
      return true;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Failed to add city.';
      showError(msg);
      return false;
    } finally {
      setAddingCity(false);
    }
  }, [fetchCities, showSuccess, showError]);

  return {
    // states
    states,
    statesLoading,
    stateSearch,
    selectedState,
    handleStateSearch,
    handleSelectState,
    handleClearStateFilter,

    // cities
    cities,
    citiesLoading,
    loadingMore,
    hasMore,
    totalCities,
    citySearch,
    handleCitySearch,
    loadMoreCities,

    // add
    addingCity,
    handleAddCity,
  };
};
