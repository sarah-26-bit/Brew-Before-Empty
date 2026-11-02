import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variants = {
    primary: 'bg-gradient-to-r from-emerald to-emerald-dark hover:from-emerald-light hover:to-emerald text-white shadow-emerald-sm hover:shadow-emerald-md focus:ring-emerald border border-emerald-light/40 font-semibold',
    gold: 'bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold text-midnight-900 shadow-gold-sm hover:shadow-gold-md focus:ring-gold border border-gold-light/40 font-semibold',
    potion: 'bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold text-midnight-900 shadow-gold-sm hover:shadow-gold-md focus:ring-gold border border-gold-light/40 font-semibold',
    amber: 'bg-gradient-to-r from-amber to-amber-dark hover:from-amber-light hover:to-amber text-midnight-900 font-semibold shadow-amber-glow focus:ring-amber border border-amber/40',
    curse: 'bg-gradient-to-r from-critical to-critical-dark hover:from-critical-light hover:to-critical text-white shadow-critical-glow focus:ring-critical border border-critical/40 font-semibold',
    danger: 'bg-critical/20 hover:bg-critical/30 text-critical-light border border-critical/40 focus:ring-critical',
    enchanted: 'bg-gradient-to-r from-emerald to-emerald-dark hover:from-emerald-light hover:to-emerald text-white shadow-emerald-sm focus:ring-emerald border border-emerald-light/40 font-semibold',
    secondary: 'bg-midnight-surface hover:bg-midnight-card text-ivory border border-forest-border hover:border-gold/50 focus:ring-gold',
    ghost: 'bg-transparent hover:bg-midnight-surface/70 text-ivory-muted hover:text-ivory focus:ring-emerald',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
