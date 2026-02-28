import React from 'react';

const VARIANTS = {
  rect:   'h-4 w-full',
  circle: 'h-12 w-12 rounded-full',
  card:   'h-32 w-full',
  text:   'h-3.5 w-3/4',
  title:  'h-5 w-1/2',
  avatar: 'h-11 w-11 rounded-xl',
};

export const Skeleton = ({ className = '', variant = 'rect' }) => (
  <div className={`skeleton ${VARIANTS[variant]} ${className}`} />
);

export const SkeletonCard = () => (
  <div className="card-elevated p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="title" />
        <Skeleton variant="text" />
      </div>
    </div>
    <Skeleton className="h-16 rounded-xl" />
    <div className="flex gap-2">
      <Skeleton className="h-7 w-20 rounded-full" />
      <Skeleton className="h-7 w-20 rounded-full" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

export default Skeleton;