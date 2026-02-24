import React from 'react';

export const Skeleton = ({ className = '', variant = 'rect' }) => {
  const baseClass = 'skeleton rounded';
  
  const variants = {
    rect: 'h-4 w-full',
    circle: 'h-12 w-12 rounded-full',
    card: 'h-32 w-full',
    text: 'h-4 w-3/4',
    title: 'h-6 w-1/2',
    avatar: 'h-10 w-10 rounded-full',
  };

  return (
    <div className={`${baseClass} ${variants[variant]} ${className}`} />
  );
};

export const SkeletonCard = () => (
  <div className="card p-4 space-y-3">
    <div className="flex items-center space-x-3">
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="title" />
        <Skeleton variant="text" />
      </div>
    </div>
    <Skeleton className="h-20" />
    <div className="flex space-x-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default Skeleton;