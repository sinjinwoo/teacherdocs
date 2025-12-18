import React from 'react';

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 ${className}`}
      {...props}
    >
      {icon && (
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          {typeof icon === 'string' ? (
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={icon}
              />
            </svg>
          ) : (
            icon
          )}
        </div>
      )}

      {title && (
        <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
      )}

      {description && (
        <p className="text-slate-500 text-sm max-w-md">{description}</p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
