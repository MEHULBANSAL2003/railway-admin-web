import { useState, useEffect, useCallback, useRef } from 'react';

const useInfiniteScroll = (fetchData, sortBy, sortDirection) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const observerTarget = useRef(null);
  const loadingRef = useRef(false); // Prevent duplicate calls
  const previousSort = useRef({ sortBy, sortDirection });

  // Fetch data function
  const loadData = useCallback(async (pageNum) => {
    // Prevent duplicate calls
    if (loadingRef.current || (!hasMore && pageNum !== 0)) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await fetchData(pageNum);

      // Handle Spring Boot Page response
      const newData = response.content || response.data || [];
      const isLast = response.last ?? (newData.length === 0);

      setData(prev => pageNum === 0 ? newData : [...prev, ...newData]);
      setHasMore(!isLast);

    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchData, hasMore]);

  // Reset when sort changes
  useEffect(() => {
    const sortChanged =
      previousSort.current.sortBy !== sortBy ||
      previousSort.current.sortDirection !== sortDirection;

    if (sortChanged) {
      previousSort.current = { sortBy, sortDirection };
      setData([]);
      setPage(0);
      setHasMore(true);
      loadData(0);
    }
  }, [sortBy, sortDirection, loadData]);

  // Initial load
  useEffect(() => {
    loadData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          setPage(prev => {
            const nextPage = prev + 1;
            loadData(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore]); // Removed loadData to prevent re-triggering

  // Refresh function
  const refresh = useCallback(() => {
    setData([]);
    setPage(0);
    setHasMore(true);
    loadData(0);
  }, [loadData]);

  return {
    data,
    loading,
    hasMore,
    error,
    observerTarget,
    refresh
  };
};

export default useInfiniteScroll;
