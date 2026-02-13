import { useState } from 'react';
import FormField from '../../components/FormField/FormField';
import { validators, validateForm } from '../../utils/formValidation';
import { AdminService } from "../../services/AdminService.js";
import { useToast } from "../../context/Toast/useToast.js";
import { UserPlus, Info } from 'lucide-react';
import './CreateAdmin.css';

const CreateAdmin = () => {
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+91',
    phoneNumber: '',
    role: '',
    department: ''
  });

  const [errors, setErrors] = useState({});

  const roles = ['ADMIN', 'SUPER_ADMIN'];
  const departments = ['TECH', 'SUPPORT'];

  // Validation schema using the reusable validators
  const validationSchema = {
    fullName: [
      (value) => validators.required(value, 'Full name'),
      (value) => validators.minLength(value, 3, 'Full name')
    ],
    email: [
      (value) => validators.required(value, 'Email'),
      (value) => validators.email(value)
    ],
    phoneNumber: [
      (value) => validators.required(value, 'Phone number'),
      (value) => validators.phone(value)
    ],
    role: [
      (value) => validators.required(value, 'Role')
    ],
    department: [
      (value) => validators.required(value, 'Department')
    ]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // Validate using the reusable validation system
    const newErrors = validateForm(formData, validationSchema);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await AdminService.createNewAdmin(formData);

      if (response?.data?.status === 'success') {
        showSuccess('Admin created successfully!');
        handleReset();
      } else {
        showError('Failed to create admin. Please try again.');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      showError(
        error?.response?.data?.error?.message ||
        'Something went wrong. Please try again later.'
      );
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
    <div className="page-container create-admin-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Create New Admin</h1>
          <p className="page-subtitle">
            Add a new administrator to the system
          </p>
        </div>
        <div className="page-header-icon">
          <UserPlus size={48} />
        </div>
      </div>

      <div className="form-container">
        {/* Main Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="card-body">
            {/* Admin Information Section */}
            <div className="form-section">
              <h3 className="section-title">Admin Information</h3>

              <FormField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                error={errors.fullName}
                required
              />

              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                error={errors.email}
                required
              />

              <FormField
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="1234567890"
                error={errors.phoneNumber}
                required
                maxLength={10}
                helper="Enter 10-digit mobile number"
              />
            </div>

            {/* Role & Department Section */}
            <div className="form-section">
              <h3 className="section-title">Role & Department</h3>

              <div className="form-row form-row-2">
                <FormField
                  label="Role"
                  name="role"
                  type="select"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Select role"
                  error={errors.role}
                  required
                  options={roles.map(role => ({
                    value: role,
                    label: role.replace('_', ' ')
                  }))}
                />

                <FormField
                  label="Department"
                  name="department"
                  type="select"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Select department"
                  error={errors.department}
                  required
                  options={departments}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-small"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Create Admin
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="card info-card">
          <div className="card-body">
            <div className="info-header">
              <Info size={20} />
              <h3>Important Notes</h3>
            </div>
            <ul className="info-list">
              <li>All fields are required to create an admin</li>
              <li>Admin will receive a verification email</li>
              <li>Default password will be sent via email</li>
              <li>Super Admin has full system access</li>
              <li>Regular Admin has department-based permissions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;
