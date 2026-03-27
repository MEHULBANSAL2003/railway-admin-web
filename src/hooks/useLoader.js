import { useLoaderContext } from '../context/LoaderContext';

export const useLoader = () => {
  const { showLoader, hideLoader } = useLoaderContext();

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
