

export const validators = {
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  minLength: (value, min, fieldName = 'This field') => {
    if (value && value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value, max, fieldName = 'This field') => {
    if (value && value.length > max) {
      return `${fieldName} must not exceed ${max} characters`;
    }
    return null;
  },

  email: (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email format';
    }
    return null;
  },

  phone: (value) => {
    if (value && !/^\d{10}$/.test(value)) {
      return 'Phone number must be 10 digits';
    }
    return null;
  },

  alphaNumeric: (value, fieldName = 'This field') => {
    if (value && !/^[a-zA-Z0-9]+$/.test(value)) {
      return `${fieldName} must contain only letters and numbers`;
    }
    return null;
  },

  uppercase: (value, fieldName = 'This field') => {
    if (value && value !== value.toUpperCase()) {
      return `${fieldName} must be in uppercase`;
    }
    return null;
  },

  range: (value, min, max, fieldName = 'This field') => {
    const num = Number(value);
    if (isNaN(num) || num < min || num > max) {
      return `${fieldName} must be between ${min} and ${max}`;
    }
    return null;
  },

  pattern: (value, regex, message) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return null;
  }
};

/**
 * Validate a single field based on rules
 * @param {string} value - Field value
 * @param {Array} rules - Array of validation rules
 * @returns {string|null} - Error message or null
 */
export const validateField = (value, rules) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

/**
 * Validate entire form based on validation schema
 * @param {Object} formData - Form data object
 * @param {Object} validationSchema - Validation rules for each field
 * @returns {Object} - Errors object
 */
export const validateForm = (formData, validationSchema) => {
  const errors = {};

  Object.keys(validationSchema).forEach(fieldName => {
    const rules = validationSchema[fieldName];
    const error = validateField(formData[fieldName], rules);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Custom hook for form validation
 */
export const useFormValidation = (initialState, validationSchema) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

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

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur
    if (validationSchema[name]) {
      const error = validateField(formData[name], validationSchema[name]);
      if (error) {
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    }
  };

  const validate = () => {
    const newErrors = validateForm(formData, validationSchema);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
  };

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    setFormData,
    setErrors
  };
};

// Export useState for the hook
import { useState } from 'react';
