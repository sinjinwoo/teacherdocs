import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold';

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-sky-100 text-sky-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const roundedStyle = rounded ? 'rounded-full' : 'rounded';

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${roundedStyle} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
