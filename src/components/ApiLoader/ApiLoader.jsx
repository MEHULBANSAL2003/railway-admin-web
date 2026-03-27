import { useLoaderContext } from '../../context/LoaderContext';
import './ApiLoader.css';

const ApiLoader = () => {
  const { isLoading, message } = useLoaderContext();

  if (!isLoading) return null;

  return (
    <div className="api-loader-overlay">
      <div className="api-loader-container">
        <div className="api-loader-spinner"></div>
        <p className="loader-message">{message}</p>
      </div>
    </div>
  );
};

export default ApiLoader;
