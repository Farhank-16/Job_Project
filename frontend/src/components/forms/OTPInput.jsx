import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, value = '', onChange, disabled = false }) => {
  const [otp, setOtp]   = useState(Array(length).fill(''));
  const refs            = useRef([]);

  useEffect(() => {
    const arr = value.split('').concat(Array(length - value.length).fill(''));
    setOtp(arr.slice(0, length));
  }, [value, length]);

  const update = (newOtp) => { setOtp(newOtp); onChange(newOtp.join('')); };

  const handleChange = (i, digit) => {
    if (!/^\d?$/.test(digit)) return;
    const next = [...otp]; next[i] = digit; update(next);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const next  = text.split('').concat(Array(length - text.length).fill(''));
    update(next);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2.5">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="text-center text-2xl font-display font-black outline-none transition-all"
          style={{
            width:       '46px',
            height:      '56px',
            borderRadius: '12px',
            border:       `2px solid ${otp[i] ? '#16a34a' : '#e5e7eb'}`,
            boxShadow:    otp[i] ? '0 0 0 3px rgba(22,163,74,0.12)' : 'none',
            background:   disabled ? '#f9fafb' : 'white',
            color:        disabled ? '#9ca3af' : '#111827',
          }}
        />
      ))}
    </div>
  );
};

export default OTPInput;