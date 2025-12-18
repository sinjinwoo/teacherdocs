import React from 'react';

const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  showCount = false,
  fullWidth = false,
  className = '',
  textareaClassName = '',
  ...props
}) => {
  const baseTextareaStyles = 'px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-100 disabled:cursor-not-allowed resize-y';

  const textareaStateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500';

  const widthStyle = fullWidth ? 'w-full' : '';

  const currentLength = value?.length || 0;

  return (
    <div className={`${widthStyle} ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className={`${baseTextareaStyles} ${textareaStateStyles} ${widthStyle} ${textareaClassName}`}
        {...props}
      />

      <div className="flex justify-between items-start mt-1.5">
        <div className="flex-1">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && helperText && (
            <p className="text-sm text-slate-500">{helperText}</p>
          )}
        </div>

        {showCount && maxLength && (
          <p className={`text-sm ml-2 ${
            currentLength > maxLength * 0.9 ? 'text-orange-600' : 'text-slate-500'
          }`}>
            {currentLength} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default Textarea;
