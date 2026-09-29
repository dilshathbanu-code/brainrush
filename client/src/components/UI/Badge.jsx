import React from 'react';

export default function Badge({
  children,
  variant = 'blue',
  size = 'md',
  className = '',
  icon: Icon
}) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-bold'
  };

  const variantStyles = {
    blue: 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}
