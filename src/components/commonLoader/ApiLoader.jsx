import { useLoaderContext } from '../../context/LoaderContext';
import './ApiLoader.css';

const ApiLoader = () => {
  const { isLoading, message } = useLoaderContext();

  if (!isLoading) return null;

  return (
    <div className="api-loader-overlay">
      <div className="api-loader-container">
        <img
          src="https://travel-assets-akamai.paytm.com/travel/mweb-train/assets/b82f98ba.gif"
          alt="Loading..."
          className="api-loader-gif"
        />

        <p className="loader-message">{message}</p>
      </div>
    </div>
  );
};

export default ApiLoader;
