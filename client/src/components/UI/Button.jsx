import React from 'react';
import { useSound } from '../../context/SoundContext';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  icon: Icon,
  type = 'button',
  ...props
}) {
  const { play } = useSound();

  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2 font-semibold",
    lg: "px-7 py-3.5 text-base gap-2.5 font-bold shadow-lg"
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white shadow-neon-blue hover:shadow-neon-hover border border-primary-400/30",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60",
    outline: "border-2 border-primary-500/80 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 dark:hover:bg-primary-500/20",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20",
    ghost: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white",
    glass: "glass-panel hover:border-primary-500 text-slate-800 dark:text-slate-100 shadow-glass-light dark:shadow-glass-dark"
  };

  const handleClick = (e) => {
    if (disabled || loading) return;
    play('click');
    if (onClick) onClick(e);
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      ) : null}
      {children}
    </button>
  );
}
