import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-semibold text-slate-700 mb-1.5"
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-slate-400" />
        </div>
      )}
      <input
        ref={ref}
        className={`input ${Icon ? 'pl-9' : ''} ${error ? 'border-red-400 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;