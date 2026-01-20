import { useLoaderContext } from '../../context/LoaderContext';
import './ApiLoader.css';

const ApiLoader = () => {
  const { isLoading, message } = useLoaderContext();

  if (!isLoading) return null;

  return (
    <div className="api-loader-overlay">
      <div className="api-loader-container">
        {/* Train Animation */}
        <div className="train-animation">
          {/* Train Track */}
          <div className="train-track">
            <div className="track-line"></div>
            <div className="track-sleepers">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          {/* Train */}
          <div className="train">
            {/* Engine */}
            <div className="train-engine">
              <div className="engine-top"></div>
              <div className="engine-body">
                <div className="engine-window"></div>
              </div>
              <div className="engine-wheels">
                <div className="wheel"></div>
                <div className="wheel"></div>
              </div>
            </div>

            {/* Coaches */}
            <div className="train-coach">
              <div className="coach-body">
                <div className="coach-window"></div>
                <div className="coach-window"></div>
              </div>
              <div className="coach-wheels">
                <div className="wheel"></div>
                <div className="wheel"></div>
              </div>
            </div>

            <div className="train-coach">
              <div className="coach-body">
                <div className="coach-window"></div>
                <div className="coach-window"></div>
              </div>
              <div className="coach-wheels">
                <div className="wheel"></div>
                <div className="wheel"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <p className="loader-message">{message}</p>

        {/* Loading Dots */}
        <div className="loader-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default ApiLoader;
