import React from 'react';

const SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
  xl: 'h-16 w-16 border-4',
};

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const spinner = (
    <div className={`${SIZES[size]} rounded-full border-blue-100 border-t-blue-600 animate-spin`} />
  );

  if (fullScreen) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
      {spinner}
    </div>
  );

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
};

export default LoadingSpinner;