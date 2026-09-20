import React, { ButtonHTMLAttributes } from 'react';

interface SpatialSharpButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'outline-neon' | 'solid-white' | 'solid-dark' | 'outline';
  loading?: boolean;
}

export const SpatialSharpButton: React.FC<SpatialSharpButtonProps> = ({
  children,
  variant = 'outline-neon',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <div className="relative group transition-transform duration-200 ease-out hover:scale-[1.01] active:scale-[0.99] w-full">
      {/* Dynamic Glow Shadow Backdrop on Hover */}
      <div 
        className="absolute -inset-1 rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[#CCFF00]/25 blur-xl"
      />

      {/* Button Body: Outline Neon (#CCFF00) by default, fill solid #CCFF00 with Black text on hover */}
      <button
        disabled={disabled || loading}
        className={`relative z-10 w-full h-12 px-6 flex items-center justify-center font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-none transition-all duration-200 ${
          variant === 'outline-neon'
            ? 'bg-transparent text-[#CCFF00] border-2 border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.15)] hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00] hover:shadow-[0_0_35px_rgba(204,255,0,0.7),0_10px_25px_rgba(0,0,0,0.9)]'
            : variant === 'solid-white'
            ? 'bg-white text-black shadow-[0_12px_32px_rgba(0,0,0,0.7)] hover:bg-white/90'
            : variant === 'solid-dark'
            ? 'bg-[#121620] text-white border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.8)] hover:bg-[#1a202e]'
            : 'bg-white/[0.04] text-slate-300 border border-white/15 hover:bg-white/10 hover:text-white'
        } ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        {...props}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-none animate-spin" />
        ) : (
          children
        )}
      </button>
    </div>
  );
};
