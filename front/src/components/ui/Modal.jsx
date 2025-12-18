import React, { useEffect } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  showCloseButton = true,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-200"
      onClick={handleOverlayClick}
      {...props}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl ${sizeStyles[size]} w-full max-h-[90vh] overflow-y-auto animate-fadeIn ${className}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                )}
                {subtitle && (
                  <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="닫기"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
