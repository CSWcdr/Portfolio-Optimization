import React from 'react';

export const Button = ({ children, variant = 'default', size = 'md', className, ...props }) => {
  const baseStyle = 'px-4 py-2 rounded-md focus:outline-none';
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-600/80',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600/10',
  };
  const sizeStyles = {
    sm: 'text-sm py-1 px-3',
    md: 'text-base py-2 px-4',
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
