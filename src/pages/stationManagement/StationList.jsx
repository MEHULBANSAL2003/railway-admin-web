import React, { useState } from 'react';
import DataTable from '../../components/DataTable/DataTable';
import { stationColumns } from '../../config/tableConfigs';
// import StationService from '../../services/StationService';
import { fetchStationData, deleteStationData } from '../../utils/dummyData'; // TEMPORARY
import { useNavigate } from 'react-router-dom';
import './StationList.css';

const StationList = () => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Using dummy data for now
  const fetchStations = async (page = 0) => {
    try {
      const response = await fetchStationData(page);

      if (response?.data?.status === 'success') {
        return response?.data?.data; // Returns { content: [...], last: boolean, ... }
      }

      throw new Error('Invalid response');
    } catch (error) {
      throw new Error('Failed to fetch stations');
    }
  };

  const handleEdit = (station) => {
    console.log('Edit station:', station);
    navigate(`/admin/stations/edit/${station.id}`);
  };

  const handleDelete = (station) => {
    setSelectedStation(station);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteStationData(selectedStation.id);
      setShowDeleteConfirm(false);
      setSelectedStation(null);

      // Trigger table refresh by changing key
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete station');
    }
  };

  return (
    <div className="station-list-page">
      <div className="page-header">
        <h1>Stations Management</h1>
        <button
          className="add-btn"
          onClick={() => navigate('/admin/stations/add')}
        >
          + Add Station
        </button>
      </div>

      <DataTable
        key={refreshKey} // Forces remount on delete
        columns={stationColumns}
        fetchData={fetchStations}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No stations found. Add your first station!"
        rowKey="id"
        enableActions={true}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete{' '}
              <strong>{selectedStation?.stationName}</strong>?
            </p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="delete-confirm-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationList;
