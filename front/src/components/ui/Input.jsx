import React from 'react';

const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  className = '',
  inputClassName = '',
  ...props
}) => {
  const baseInputStyles = 'px-4 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-100 disabled:cursor-not-allowed';

  const inputStateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500';

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthStyle} ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${baseInputStyles} ${inputStateStyles} ${widthStyle} ${inputClassName}`}
        {...props}
      />

      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}

      {!error && helperText && (
        <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
