import React from 'react';

const Logo = ({ size = 'md', light = false }) => {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };
  const color = light ? 'text-white' : 'text-slate-900';
  const accentColor = light ? '#93c5fd' : '#2563eb';

  return (
    <span className={`logo-text ${sizes[size]} ${color} select-none`}>
      Job<span style={{ color: accentColor }}>Nest</span>
    </span>
  );
};

export default Logo;