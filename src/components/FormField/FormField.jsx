import React from 'react';
import './FormField.css';

const FormField = ({
                     label,
                     name,
                     type = 'text',
                     value,
                     onChange,
                     onBlur,
                     placeholder,
                     error,
                     helper,
                     required = false,
                     disabled = false,
                     options = [], // For select
                     rows = 4, // For textarea
                     className = '',
                     icon,
                     ...props
                   }) => {
  const inputId = `form-field-${name}`;
  const hasError = !!error;

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`form-field-select ${hasError ? 'error' : ''} ${className}`}
          {...props}
        >
          <option value="">{placeholder || 'Select an option'}</option>
          {options.map((option) => (
            <option
              key={typeof option === 'string' ? option : option.value}
              value={typeof option === 'string' ? option : option.value}
            >
              {typeof option === 'string' ? option : option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`form-field-textarea ${hasError ? 'error' : ''} ${className}`}
          {...props}
        />
      );
    }

    if (type === 'checkbox') {
      return (
        <div className="form-field-checkbox">
          <input
            type="checkbox"
            id={inputId}
            name={name}
            checked={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            {...props}
          />
          <label htmlFor={inputId}>
            {label}
            {required && <span className="form-field-required">*</span>}
          </label>
        </div>
      );
    }

    // Regular input (text, email, tel, number, etc.)
    if (icon) {
      return (
        <div className="form-field-input-wrapper">
          <span className="form-field-input-icon">{icon}</span>
          <input
            type={type}
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`form-field-input ${hasError ? 'error' : ''} ${className}`}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-field-input ${hasError ? 'error' : ''} ${className}`}
        {...props}
      />
    );
  };

  // Checkbox has different layout
  if (type === 'checkbox') {
    return (
      <div className="form-field">
        {renderInput()}
        {hasError && <span className="form-field-error">{error}</span>}
        {!hasError && helper && <span className="form-field-helper">{helper}</span>}
      </div>
    );
  }

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={inputId} className="form-field-label">
          {label}
          {required && <span className="form-field-required">*</span>}
        </label>
      )}
      {renderInput()}
      {hasError && <span className="form-field-error">{error}</span>}
      {!hasError && helper && <span className="form-field-helper">{helper}</span>}
    </div>
  );
};

export default FormField;
