import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-lg transition-shadow duration-200';

  const variantStyles = {
    default: 'bg-white border border-slate-200 shadow-sm hover:shadow-md',
    elevated: 'bg-white shadow-md hover:shadow-lg',
    flat: 'bg-white border border-slate-200',
    blue: 'bg-blue-50 border border-blue-200',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
