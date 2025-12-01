import React from 'react';

const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  indeterminate = false,
  className = '',
  ...props
}) => {
  return (
    <label
      className={`inline-flex items-center cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div
          className={`
            w-5 h-5 border-2 rounded transition-all duration-200
            peer-focus:ring-2 peer-focus:ring-blue-200 peer-focus:ring-offset-1
            ${
              checked || indeterminate
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-slate-300 peer-hover:border-blue-400'
            }
          `}
        >
          {checked && !indeterminate && (
            <svg
              className="w-full h-full text-white p-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {indeterminate && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-2.5 h-0.5 bg-white rounded"></div>
            </div>
          )}
        </div>
      </div>
      {label && (
        <span className="ml-2 text-sm text-slate-700 select-none">{label}</span>
      )}
    </label>
  );
};

export default Checkbox;
