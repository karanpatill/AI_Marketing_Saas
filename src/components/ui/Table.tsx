import React from 'react';

export function Table({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`w-full overflow-auto bg-[#101010] rounded-2xl border border-[#E1E0CC]/10 ${className}`}>
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-[#212121] text-[#E1E0CC]/60 text-xs uppercase tracking-wider border-b border-[#E1E0CC]/10">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-[#E1E0CC]/5 text-[#E1E0CC]">{children}</tbody>;
}

export function TableRow({ children, className = '', onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
  return (
    <tr 
      onClick={onClick}
      className={`hover:bg-white/[0.02] transition-colors border-t border-[#E1E0CC]/5 ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <th className={`px-6 py-3 font-medium text-[#E1E0CC]/60 ${className}`}>{children}</th>;
}

export function TableCell({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <td className={`px-6 py-4 whitespace-nowrap text-[#E1E0CC] ${className}`}>{children}</td>;
}
