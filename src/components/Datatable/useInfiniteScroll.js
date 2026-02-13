import { useState, useEffect, useCallback, useRef } from 'react';

const useInfiniteScroll = (fetchData) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const observerTarget = useRef(null);

  // Fetch data function
  const loadData = useCallback(async (pageNum) => {
    if (loading || !hasMore) return;

    try {
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
    }
  }, [fetchData, loading, hasMore]);

  // Initial load
  useEffect(() => {
    loadData(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
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
  }, [hasMore, loading, loadData]);

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
