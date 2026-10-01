import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', id, ...props }: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label htmlFor={id} className="text-[#E1E0CC]/70 text-sm mb-1.5 block">{label}</label>}
      <input
        id={id}
        className={`w-full px-3.5 py-2.5 bg-[#212121] border border-[#E1E0CC]/20 rounded-xl text-[#E1E0CC] placeholder:text-[#E1E0CC]/30 text-sm transition-all
          focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/20
          ${error ? 'border-[#E1E0CC]/20/60' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed`}
        {...props}
      />
      {error && <span className="text-[#E1E0CC]/70 text-xs mt-1">{error}</span>}
      {helperText && !error && <span className="text-[#E1E0CC]/40 text-xs mt-1">{helperText}</span>}
    </div>
  );
}

export function Textarea({ label, error, helperText, className = '', id, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string, error?: string, helperText?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label htmlFor={id} className="text-[#E1E0CC]/70 text-sm mb-1.5 block">{label}</label>}
      <textarea
        id={id}
        className={`w-full px-3.5 py-2.5 bg-[#212121] border border-[#E1E0CC]/20 rounded-xl text-[#E1E0CC] placeholder:text-[#E1E0CC]/30 text-sm transition-all resize-none min-h-[100px]
          focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/20
          ${error ? 'border-[#E1E0CC]/20/60' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed`}
        {...props}
      />
      {error && <span className="text-[#E1E0CC]/70 text-xs mt-1">{error}</span>}
      {helperText && !error && <span className="text-[#E1E0CC]/40 text-xs mt-1">{helperText}</span>}
    </div>
  );
}
