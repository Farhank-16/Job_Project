import React from 'react';

export const Tabs = ({ children, className = '' }) => (
  <div className={`w-full ${className}`}>{children}</div>
);

export const TabList = ({ children, className = '' }) => (
  <div className={`flex border-b border-slate-200 overflow-x-auto no-scrollbar ${className}`}>
    {children}
  </div>
);

export const Tab = ({ children, active, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors
      ${active
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
      }
      ${className}
    `}
    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
  >
    {children}
  </button>
);

export const TabPanel = ({ children, active }) =>
  active ? <div className="py-4">{children}</div> : null;