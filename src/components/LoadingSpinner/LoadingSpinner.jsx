import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        {/* Train Icon Animation */}
        <div className="train-loader">
          <div className="train-body">
            <div className="train-window"></div>
            <div className="train-window"></div>
          </div>
          <div className="train-wheels">
            <div className="wheel"></div>
            <div className="wheel"></div>
          </div>
        </div>

        {/* Spinner */}
        <div className="spinner"></div>

        {/* Text */}
        <p className="loading-text">Loading Railway System</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
