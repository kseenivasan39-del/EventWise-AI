import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gradient', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
    
    const variants = {
      gradient: 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-soft hover:shadow-glow-purple hover:opacity-95',
      primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-soft',
      secondary: 'bg-stone-100 text-slate-800 hover:bg-stone-200/80 border border-stone-200/70',
      outline: 'bg-white text-slate-700 border border-stone-300/80 hover:bg-stone-50 hover:border-stone-400 shadow-soft-sm',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-soft',
      ghost: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-stone-100',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-2.5 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
