import { useLoaderContext } from '../context/LoaderContext';
export const useLoader = () => {
  const { showLoader, hideLoader } = useLoaderContext();

  // Wrapper for API calls with automatic loader
  const withLoader = async (apiCall, message = 'Loading...') => {
    try {
      showLoader(message);
      const result = await apiCall();
      return result;
    } catch (error) {
      throw error;
    } finally {
      hideLoader();
    }
  };

  return {
    showLoader,
    hideLoader,
    withLoader,
  };
};
