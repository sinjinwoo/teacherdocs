import React from 'react';

const IconButton = ({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  ariaLabel,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    default: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-500',
    primary: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    danger: 'text-red-600 hover:bg-red-50 focus:ring-red-500',
    success: 'text-green-600 hover:bg-green-50 focus:ring-green-500',
    ghost: 'text-slate-500 hover:text-slate-700 hover:bg-transparent focus:ring-slate-500',
  };

  const sizeStyles = {
    sm: 'w-7 h-7 p-1',
    md: 'w-9 h-9 p-2',
    lg: 'w-11 h-11 p-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
