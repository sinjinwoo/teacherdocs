import React, { useState, useRef } from 'react';

const FileUpload = ({
  label,
  accept,
  onChange,
  file,
  placeholder = '파일을 선택하거나 드래그하세요',
  helperText,
  error,
  className = '',
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onChange({ target: { files: [file] } });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        {...props}
      />

      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          flex items-center justify-center w-full px-4 py-8
          border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : error
              ? 'border-red-500 bg-red-50'
              : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
          }
        `}
      >
        <div className="text-center">
          {file ? (
            <div className="flex items-center gap-2 justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-blue-600 font-medium">{file.name}</span>
            </div>
          ) : (
            <>
              <svg
                className="w-10 h-10 text-slate-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div className="text-slate-600 font-medium">{placeholder}</div>
              {accept && (
                <div className="text-xs text-slate-400 mt-1">
                  허용된 파일: {accept}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}

      {!error && helperText && (
        <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
};

export default FileUpload;
