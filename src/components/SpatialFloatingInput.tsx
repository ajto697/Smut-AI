import React, { useState, InputHTMLAttributes } from 'react';

interface SpatialFloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
}

export const SpatialFloatingInput: React.FC<SpatialFloatingInputProps> = ({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  className = '',
  id,
  type = 'text',
  placeholder,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });

  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isLifted = isFocused || hasValue;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 600);
  };

  return (
    <div 
      onClick={handleClick}
      className="relative pt-4 pb-1 group transition-transform duration-200 ease-out hover:scale-[1.005] overflow-hidden"
    >
      {/* Gentle Spatial Ripple on Click */}
      {rippleActive && (
        <span
          className="absolute rounded-full pointer-events-none bg-[#CCFF00]/15 animate-ping"
          style={{
            left: ripplePos.x - 20,
            top: ripplePos.y - 20,
            width: 40,
            height: 40,
          }}
        />
      )}

      {/* Floating Label with Smooth Slide & Shrink */}
      <label
        htmlFor={id}
        className={`absolute left-0 pointer-events-none transition-all duration-200 ease-out select-none font-mono ${
          isLifted
            ? 'top-0 text-[10px] font-bold tracking-widest text-[#CCFF00] uppercase scale-95 origin-left'
            : 'top-4 text-xs text-slate-400 font-medium tracking-normal scale-100 origin-left'
        } ${isFocused ? 'text-[#CCFF00]' : ''} ${error ? 'text-red-400' : ''}`}
      >
        {label}
      </label>

      {/* Transparent Input with Sharp Glowing Bottom Line */}
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          placeholder={isLifted ? placeholder : ''}
          className={`w-full h-11 px-0 bg-transparent text-sm text-white font-['Plus_Jakarta_Sans'] font-medium rounded-none border-0 outline-none placeholder:text-slate-600 transition-colors ${className}`}
          {...rest}
        />

        {/* Base Muted Gray Bottom Line */}
        <div className={`absolute bottom-0 left-0 right-0 h-[1px] ${error ? 'bg-red-500/80' : 'bg-white/15'}`} />

        {/* Animated Glowing Underline (Neon Lime #CCFF00 with Glow Effect) */}
        <div 
          className={`absolute bottom-0 left-0 h-[2px] bg-[#CCFF00] shadow-[0_0_14px_#CCFF00,0_0_4px_#CCFF00] transition-all duration-300 ease-out ${
            isFocused ? 'w-full opacity-100' : 'w-0 opacity-0'
          }`} 
        />
      </div>
    </div>
  );
};
