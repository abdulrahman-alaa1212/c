import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
}) => {
  const baseInputStyles = `
    w-full px-4 py-2 rounded-lg border
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

  const inputStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50 bg-red-50'
    : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/50 bg-white dark:bg-gray-700';

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${baseInputStyles} ${inputStyles}`}
        aria-invalid={error ? 'true' : 'false'}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
