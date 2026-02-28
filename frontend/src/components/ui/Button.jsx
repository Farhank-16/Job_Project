import React from 'react';

const VARIANTS = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm shadow-blue-200',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-300',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  success:   'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
  link:      'bg-transparent text-blue-600 hover:text-blue-700 hover:underline p-0 shadow-none',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => (
  <button
    className={`
      inline-flex items-center justify-center gap-2
      font-semibold rounded-xl
      transition-all duration-150
      focus:outline-none focus:ring-2 focus:ring-offset-2
      active:scale-[0.97]
      ${VARIANTS[variant]}
      ${variant !== 'link' ? SIZES[size] : ''}
      ${fullWidth ? 'w-full' : ''}
      ${disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      ${className}
    `}
    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    ) : (
      <>
        {Icon && iconPosition === 'left'  && <Icon className="w-4 h-4 flex-shrink-0" />}
        {children}
        {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
      </>
    )}
  </button>
);

export default Button;