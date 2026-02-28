import React from 'react';

const VARIANTS = {
  default:  'bg-slate-100 text-slate-700',
  primary:  'bg-blue-50 text-blue-700',
  success:  'bg-green-50 text-green-700',
  warning:  'bg-amber-50 text-amber-700',
  danger:   'bg-red-50 text-red-700',
  info:     'bg-sky-50 text-sky-700',
  purple:   'bg-purple-50 text-purple-700',
};

const SIZES = {
  xs: 'px-2 py-0.5 text-[11px]',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => (
  <span className={`inline-flex items-center font-semibold rounded-full
    ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
    {children}
  </span>
);

export default Badge;