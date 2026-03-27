import { ChevronLeft, ChevronRight } from 'lucide-react';
import './DataTable.css';

export default function DataTable({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No data found',
  page,
  totalPages,
  onPageChange,
}) {
  if (loading) {
    return (
      <div className="table-wrapper">
        <div className="table-loading">
          <span className="table-spinner" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id ?? i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="table-pagination">
          <span className="text-sm text-secondary">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              className="pagination-btn"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="pagination-btn"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
