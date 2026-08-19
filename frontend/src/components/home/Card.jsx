import React from 'react';

export const Card = ({ children, className }) => {
  return (
    <div className={` shadow-md rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => {
  return <div className={`font-bold ${className}`}>{children}</div>;
};

export const CardContent = ({ children, className }) => {
  return <div className={`text-sm ${className}`}>{children}</div>;
};

export const CardDescription = ({ children, className }) => {
  return <p className={`text-muted-foreground text-xs ${className}`}>{children}</p>;
};

export const CardTitle = ({ children, className }) => {
  return <h3 className={`text-lg font-medium ${className}`}>{children}</h3>;
};
