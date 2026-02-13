import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import FormField from '../FormField/FormField';
import { validators, validateForm } from '../../utils/formValidation';
import { StationService } from '../../services/StationService';
import { useToast } from '../../context/Toast/useToast';
import './AddStationModal.css';

const ZONES = [
  'NORTHERN',
  'SOUTHERN',
  'EASTERN',
  'WESTERN',
  'CENTRAL',
  'NORTH_EASTERN',
  'SOUTH_CENTRAL',
  'SOUTH_EASTERN',
  'EAST_CENTRAL',
  'NORTH_CENTRAL',
  'NORTH_WESTERN',
  'SOUTH_WESTERN',
  'WEST_CENTRAL',
  'EAST_COAST',
  'SOUTH_EAST_CENTRAL',
  'KOLKATA_METRO',
  'DELHI_METRO'
];

const AddStationModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    stationCode: '',
    stationName: '',
    city: '',
    state: '',
    zone: '',
    numberOfPlatforms: '',
    isJunction: false
  });

  const [errors, setErrors] = useState({});

  // Validation schema
  const validationSchema = {
    stationCode: [
      (value) => validators.required(value, 'Station code'),
      (value) => validators.minLength(value, 2, 'Station code'),
      (value) => validators.maxLength(value, 5, 'Station code'),
      (value) => validators.alphaNumeric(value, 'Station code'),
      (value) => validators.uppercase(value, 'Station code')
    ],
    stationName: [
      (value) => validators.required(value, 'Station name'),
      (value) => validators.minLength(value, 3, 'Station name')
    ],
    city: [
      (value) => validators.required(value, 'City'),
      (value) => validators.minLength(value, 2, 'City')
    ],
    state: [
      (value) => validators.required(value, 'State'),
      (value) => validators.minLength(value, 2, 'State')
    ],
    zone: [
      (value) => validators.required(value, 'Zone')
    ],
    numberOfPlatforms: [
      (value) => validators.required(value, 'Number of platforms'),
      (value) => validators.range(value, 1, 25, 'Number of platforms')
    ]
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    // Auto-uppercase for station code
    if (name === 'stationCode') {
      newValue = value.toUpperCase();
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = validateForm(formData, validationSchema);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Map frontend fields to backend fields
      const payload = {
        stationCode: formData.stationCode,
        stationName: formData.stationName,
        city: formData.city,
        state: formData.state,
        zone: formData.zone,
        numPlatforms: parseInt(formData.numberOfPlatforms, 10), // Backend expects numPlatforms
        isJunction: formData.isJunction
      };

      const response = await StationService.createNewStation(payload);

      if (response?.data?.status === 'success') {
        showSuccess('Station created successfully!');
        handleClose();
        if (onSuccess) onSuccess();
      } else {
        showError('Failed to create station. Please try again.');
      }
    } catch (error) {
      console.error('Error creating station:', error);
      showError(
        error?.response?.data?.error?.message ||
        error?.message ||
        'Something went wrong. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      stationCode: '',
      stationName: '',
      city: '',
      state: '',
      zone: '',
      numberOfPlatforms: '',
      isJunction: false
    });
    setErrors({});
    onClose();
  };

  const footer = (
    <>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleClose}
        disabled={isSubmitting}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="spinner-small"></span>
            Creating...
          </>
        ) : (
          'Create Station'
        )}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Station"
      subtitle="Enter station details to add to the network"
      footer={footer}
      size="md"
      closeOnOverlayClick={!isSubmitting}
      showCloseButton={!isSubmitting}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-row form-row-2">
          <FormField
            label="Station Code"
            name="stationCode"
            value={formData.stationCode}
            onChange={handleChange}
            placeholder="e.g., NDLS"
            error={errors.stationCode}
            required
            maxLength={5}
            helper="2-5 uppercase letters"
          />

          <FormField
            label="Number of Platforms"
            name="numberOfPlatforms"
            type="number"
            value={formData.numberOfPlatforms}
            onChange={handleChange}
            placeholder="e.g., 10"
            error={errors.numberOfPlatforms}
            required
            min={1}
            max={25}
            helper="Between 1 and 25"
          />
        </div>

        <FormField
          label="Station Name"
          name="stationName"
          value={formData.stationName}
          onChange={handleChange}
          placeholder="e.g., New Delhi Railway Station"
          error={errors.stationName}
          required
        />

        <div className="form-row form-row-2">
          <FormField
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g., New Delhi"
            error={errors.city}
            required
          />

          <FormField
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="e.g., Delhi"
            error={errors.state}
            required
          />
        </div>

        <FormField
          label="Zone"
          name="zone"
          type="select"
          value={formData.zone}
          onChange={handleChange}
          placeholder="Select zone"
          error={errors.zone}
          required
          options={ZONES.map(zone => ({
            value: zone,
            label: zone.replace(/_/g, ' ')
          }))}
        />

        <FormField
          label="Junction Station"
          name="isJunction"
          type="checkbox"
          value={formData.isJunction}
          onChange={handleChange}
          helper="Check if this is a junction station"
        />
      </form>
    </Modal>
  );
};

export default AddStationModal;
