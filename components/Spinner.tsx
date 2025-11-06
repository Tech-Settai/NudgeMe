import React from 'react';

const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  }[size];

  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses} border-light-primary dark:border-dark-primary border-t-transparent`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    />
  );
};

export default Spinner;
