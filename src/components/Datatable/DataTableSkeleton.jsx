import React from 'react';
import './DataTableSkeleton.css';

const DataTableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="skeleton-table">
      {/* Header Skeleton */}
      <div className="skeleton-header">
        {Array.from({ length: columns }).map((_, idx) => (
          <div key={idx} className="skeleton-header-cell shimmer" />
        ))}
      </div>

      {/* Body Skeleton */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="skeleton-row">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div key={colIdx} className="skeleton-cell shimmer" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default DataTableSkeleton;
