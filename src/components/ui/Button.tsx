import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled, 
  ...props 
}: ButtonProps) {
  
  const baseStyle = "inline-flex items-center justify-center font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#DEDBC8] text-black rounded-full hover:bg-[#E1E0CC] active:scale-[0.98]",
    secondary: "border border-[#E1E0CC]/20 text-[#E1E0CC] rounded-full hover:border-[#E1E0CC]/40 hover:bg-white/5",
    outline: "border border-[#E1E0CC]/20 text-[#E1E0CC] rounded-full hover:border-[#E1E0CC]/40 hover:bg-white/5",
    ghost: "text-[#E1E0CC]/60 hover:text-[#E1E0CC] rounded-xl hover:bg-white/5",
    danger: "bg-[#E1E0CC]/10/10 text-[#E1E0CC]/70 border border-[#E1E0CC]/20/20 rounded-full hover:bg-[#E1E0CC]/10/20",
    "icon-only": "bg-[#212121] text-[#E1E0CC] rounded-xl p-2 hover:bg-[#2a2a2a] w-9 h-9 flex items-center justify-center"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2 text-sm",
    lg: "px-7 py-3 text-base"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${variant === 'icon-only' ? '' : sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="animate-spin rounded-full border-2 border-[#E1E0CC]/20 border-t-[#E1E0CC] w-4 h-4 mr-2" />
      )}
      {children}
    </button>
  );
}
