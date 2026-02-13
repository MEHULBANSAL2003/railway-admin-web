import React from 'react';
import useInfiniteScroll from './useInfiniteScroll';
import DataTableSkeleton from './DataTableSkeleton';
import DataTableActions from './DataTableActions';
import './DataTable.css';

const DataTable = ({
                     columns,
                     fetchData,
                     onEdit,
                     onDelete,
                     emptyMessage = 'No data available',
                     rowKey = 'id',
                     enableActions = true,
                   }) => {
  const { data, loading, hasMore, error, observerTarget, refresh } =
    useInfiniteScroll(fetchData);

  // Render cell content
  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return row[column.key] || '-';
  };

  // Initial loading state
  if (loading && data.length === 0) {
    return <DataTableSkeleton rows={5} columns={columns.length + (enableActions ? 1 : 0)} />;
  }

  // Error state
  if (error) {
    return (
      <div className="table-error">
        <p>{error}</p>
        <button onClick={refresh} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className}>
                {column.label}
              </th>
            ))}
            {enableActions && <th className="actions-column">Actions</th>}
          </tr>
          </thead>
          <tbody>
          {data.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((column) => (
                <td key={column.key} className={column.className}>
                  {renderCell(row, column)}
                </td>
              ))}
              {enableActions && (
                <td className="actions-column">
                  <DataTableActions
                    row={row}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </td>
              )}
            </tr>
          ))}
          </tbody>
        </table>

        {/* Infinite Scroll Trigger */}
        {hasMore && (
          <div ref={observerTarget} className="scroll-trigger">
            {loading && <DataTableSkeleton rows={3} columns={columns.length + (enableActions ? 1 : 0)} />}
          </div>
        )}

        {/* End of data indicator */}
        {!hasMore && data.length > 0 && (
          <div className="end-of-data">
            <span>No more data to load</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
