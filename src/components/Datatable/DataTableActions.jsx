import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import './DataTableActions.css';

const DataTableActions = ({ row, onEdit, onDelete }) => {
  // Use backend permission fields
  const { canUpdatedByCurrentAdmin, canDeletedByCurrentAdmin } = row;

  if (!canUpdatedByCurrentAdmin && !canDeletedByCurrentAdmin) {
    return <span className="no-actions">-</span>;
  }

  return (
    <div className="table-actions">
      {canUpdatedByCurrentAdmin && (
        <button
          className="action-btn edit-btn"
          onClick={() => onEdit(row)}
          title="Edit"
        >
          <FiEdit2 />
        </button>
      )}
      {canDeletedByCurrentAdmin && (
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete(row)}
          title="Delete"
        >
          <FiTrash2 />
        </button>
      )}
    </div>
  );
};

export default DataTableActions;
