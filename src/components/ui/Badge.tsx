import React from 'react';

export function Badge({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'error' | 'outline', className?: string }) {
  const variants = {
    default: "bg-[#212121] text-[#E1E0CC]/80 border border-[#E1E0CC]/10",
    success: "bg-[#E1E0CC]/10/10 text-[#E1E0CC]/70 border border-[#E1E0CC]/20/20",
    warning: "bg-[#E1E0CC]/10/10 text-[#E1E0CC]/70 border border-[#E1E0CC]/20/20",
    error: "bg-[#E1E0CC]/10/10 text-[#E1E0CC]/70 border border-[#E1E0CC]/20/20",
    outline: "border border-[#E1E0CC]/20 text-[#E1E0CC]"
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
