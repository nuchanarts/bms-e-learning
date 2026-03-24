import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const hoverClass = hover
    ? 'cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] hover:border-[rgba(123,104,238,0.4)] hover:shadow-[0_20px_48px_rgba(123,104,238,0.25),0_8px_24px_rgba(123,104,238,0.15)]'
    : '';
  return (
    <div
      className={`glass-card ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
