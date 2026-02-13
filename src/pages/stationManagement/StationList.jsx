import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import DataTable from '../../components/DataTable/DataTable';
import AddStationModal from '../../components/AddStationModal/AddStationModal';
import { stationColumns } from '../../config/tableConfigs';
import { StationService } from '../../services/StationService';
import './StationList.css';

const StationList = () => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stationStats, setStationStats] = useState();

  // Fetch stations from API with pagination
  const fetchStations = async (page = 0) => {
    try {
      const payload = {
        page: page,
        size: 20,
        sortBy: 'id',
        sortDirection: 'ASC'
      };

      const response = await StationService.getAllStations(payload);

      if (response?.data?.status === 'success') {
        const data = response.data.data;
        setStationStats(data);

        return {
          content: data.content || [],
          last: data.last ?? true,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          number: data.number || 0,
          size: data.size || 20
        };
      }

      throw new Error('Invalid response');
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      throw new Error('Failed to fetch stations');
    }
  };

  const handleEdit = (station) => {
    console.log('Edit station:', station);
    navigate(`/admin/stations/edit/${station.stationId}`);
  };

  const handleDelete = (station) => {
    setSelectedStation(station);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      // TODO: Implement delete API call when backend endpoint is ready
      // await StationService.deleteStation(selectedStation.stationId);

      console.log('Delete station:', selectedStation.stationId);
      setShowDeleteConfirm(false);
      setSelectedStation(null);

      // Trigger table refresh
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete station');
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAddSuccess = () => {
    // Refresh the table after adding a new station
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="page-container station-list-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Station Management</h1>
          <p className="page-subtitle">
            Manage railway stations across the network
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={handleRefresh}
            aria-label="Refresh data"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Add Station
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="stat-card">
          <div className="stat-label">Total Stations</div>
          <div className="stat-value">{stationStats?.totalElements}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value">92</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Maintenance</div>
          <div className="stat-value">6</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inactive</div>
          <div className="stat-value">2</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">All Stations</h2>
        </div>

        <DataTable
          key={refreshKey}
          columns={stationColumns}
          fetchData={fetchStations}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No stations found. Add your first station to get started!"
          rowKey="stationId"
          enableActions={true}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Confirm Deletion</h3>
              <p className="modal-description">
                Are you sure you want to delete{' '}
                <span className="modal-highlight">
                  {selectedStation?.stationName}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete Station
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Station Modal */}
      <AddStationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default StationList;
