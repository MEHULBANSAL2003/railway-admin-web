import { useState, useCallback } from 'react';
import {AdminService} from '../../services/AdminService.js';

const useUsersAnalytics = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AdminService.getUserAnalyticsData();
      setData(response.data?.data ?? response.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchAnalytics };
};

export default useUsersAnalytics;
