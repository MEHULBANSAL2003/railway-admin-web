import { useState } from 'react';
import './CreateAdmin.css';
import {AdminService} from "../../services/AdminService.js";
import {useToast} from "../../context/Toast/useToast.js";

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+91',
    phoneNumber: '',
    role: '',
    department: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {showSuccess, showError} = useToast();

  const roles = ['ADMIN', 'SUPER_ADMIN'];
  const departments = ['TECH', 'SUPPORT'];


  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    // Department validation
    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call

      const response = await AdminService.createNewAdmin(formData);

         if(response?.data?.status === 'success'){

           showSuccess('Admin created successfully!');
           setFormData({
             fullName: '',
             email: '',
             countryCode: '+91',
             phoneNumber: '',
             role: '',
             department: ''
           });
         }
         else{
           showError('Failed to create admin. Please try again.');
         }
    } catch (error) {
      console.error('Error creating admin:', error);
      showError(error?.response?.data?.error?.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      countryCode: '+91',
      phoneNumber: '',
      role: '',
      department: ''
    });
    setErrors({});
  };

  return (
    <div className="create-admin-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Create New Admin</h1>
        </div>
        <div className="header-icon">
          <span>👤</span>
        </div>
      </div>



      {errors.submit && (
        <div className="error-message">
          <span className="error-icon">⚠</span>
          <p>{errors.submit}</p>
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="admin-form">

          {/* Personal Information Section */}
          <div className="form-section">
            <h2 className="section-title">Admin Information</h2>

            <div className="form-group">
              <label htmlFor="fullName">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && (
                <span className="error-text">{errors.fullName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-row">

              <div className="form-group flex-grow">
                <label htmlFor="phoneNumber">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="1234567890"
                  maxLength="10"
                  className={errors.phoneNumber ? 'error' : ''}
                />
                {errors.phoneNumber && (
                  <span className="error-text">{errors.phoneNumber}</span>
                )}
              </div>
            </div>
          </div>

          {/* Role & Department Section */}
          <div className="form-section">
            <h2 className="section-title">Role & Department</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="role">
                  Role <span className="required">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={errors.role ? 'error' : ''}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <span className="error-text">{errors.role}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="department">
                  Department <span className="required">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={errors.department ? 'error' : ''}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <span className="error-text">{errors.department}</span>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleReset}
              className="btn-reset"
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                'Create Admin'
              )}
            </button>
          </div>
        </form>

        {/* Info Card */}
        <div className="info-card">
          <h3>📋 Important Notes</h3>
          <ul>
            <li>All fields marked with <span className="required">*</span> are required</li>
            <li>Admin will receive a verification email after creation</li>
            <li>Default password will be sent to the registered email</li>
            <li>Super Admin has full access to all system features</li>
            <li>Regular Admin has limited permissions based on department</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;
