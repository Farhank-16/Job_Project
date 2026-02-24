import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, value = '', onChange, disabled = false }) => {
  const [otp, setOtp] = useState(value.split(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    setOtp(value.split('').concat(Array(length - value.length).fill('')));
  }, [value, length]);

  const handleChange = (index, digit) => {
    if (!/^\d*$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Move to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(length - pastedData.length).fill(''));
    setOtp(newOtp);
    onChange(newOtp.join(''));
    inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-center space-x-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-xl font-semibold rounded-lg border-2
            focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none
            transition-all duration-200
            ${disabled ? 'bg-gray-100 text-gray-400' : 'bg-white'}
            ${otp[index] ? 'border-primary-500' : 'border-gray-300'}
          `}
        />
      ))}
    </div>
  );
};

export default OTPInput;