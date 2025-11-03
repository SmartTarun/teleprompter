
import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = '' }) => {
  return (
    <div className={`animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white dark:border-indigo-500 ${className}`}></div>
  );
};

export default LoadingSpinner;
