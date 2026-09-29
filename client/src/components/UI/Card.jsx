import React from 'react';

export default function Card({
  children,
  className = '',
  hoverEffect = true,
  glow = false,
  ...props
}) {
  return (
    <div
      className={`glass-card rounded-2xl p-6 transition-all duration-300 ${
        hoverEffect ? 'hover:-translate-y-1' : ''
      } ${
        glow ? 'border-primary-500/50 shadow-neon-blue' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
