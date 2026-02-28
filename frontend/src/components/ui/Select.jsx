import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ label, options = [], error, placeholder = 'Select an option', className = '', ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-semibold text-slate-700 mb-1.5"
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {label}
      </label>
    )}
    <div className="relative">
      <select
        ref={ref}
        className={`input appearance-none pr-10 ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </div>
    </div>
    {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
  </div>
));

Select.displayName = 'Select';
export default Select;