
import React from 'react';
import { Loader2, Sprout } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  variant?: 'default' | 'agricultural';
}

const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...', 
  variant = 'default' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerSizes = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-8'
  };

  if (variant === 'agricultural') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizes[size]}`}>
        <div className="relative">
          <Sprout className={`${sizeClasses[size]} text-green-600 animate-pulse`} />
          <div className="absolute inset-0 animate-spin">
            <div className={`${sizeClasses[size]} border-2 border-green-200 border-t-green-600 rounded-full`}></div>
          </div>
        </div>
        {message && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${containerSizes[size]}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-green-600`} />
      {message && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
