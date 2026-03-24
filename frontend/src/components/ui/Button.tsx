import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', isLoading, size = 'md', children, className = '', ...props }: ButtonProps) {
  const base = 'relative inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variants = {
    primary: 'bg-gradient-to-br from-[#7B68EE] to-[#6B7FDE] text-white shadow-[0_8px_24px_rgba(123,104,238,0.5)] hover:shadow-[0_12px_32px_rgba(123,104,238,0.7)] hover:-translate-y-0.5',
    secondary: 'bg-white/90 text-[#4A3F7A] border-2 border-[rgba(123,104,238,0.2)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-[rgba(123,104,238,0.4)] hover:shadow-[0_8px_20px_rgba(123,104,238,0.2)] hover:-translate-y-0.5',
    success: 'bg-gradient-to-br from-[#4CAF50] to-[#66BB6A] text-white shadow-[0_8px_24px_rgba(76,175,80,0.4)] hover:shadow-[0_12px_32px_rgba(76,175,80,0.6)] hover:-translate-y-0.5',
    danger: 'bg-gradient-to-br from-[#ef4444] to-[#dc2626] text-white shadow-[0_8px_24px_rgba(239,68,68,0.4)] hover:shadow-[0_12px_32px_rgba(239,68,68,0.6)] hover:-translate-y-0.5',
    ghost: 'bg-transparent text-[#6B5FA0] hover:bg-white/50 hover:text-[#7B68EE]',
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          กำลังโหลด...
        </span>
      ) : children}
    </button>
  );
}
