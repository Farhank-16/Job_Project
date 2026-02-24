import React from 'react';

export const Tabs = ({ children, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
};

export const TabList = ({ children, className = '' }) => {
  return (
    <div className={`flex border-b border-gray-200 overflow-x-auto no-scrollbar ${className}`}>
      {children}
    </div>
  );
};

export const Tab = ({ children, active, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
        ${active 
          ? 'border-primary-600 text-primary-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export const TabPanel = ({ children, active }) => {
  if (!active) return null;
  return <div className="py-4">{children}</div>;
};