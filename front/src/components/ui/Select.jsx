import React from 'react';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = '선택하세요',
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  className = '',
  selectClassName = '',
  ...props
}) => {
  const baseSelectStyles = 'px-4 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-100 disabled:cursor-not-allowed appearance-none bg-white';

  const selectStateStyles = error
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

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`${baseSelectStyles} ${selectStateStyles} ${widthStyle} ${selectClassName}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option
              key={option.value || index}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}

      {!error && helperText && (
        <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
