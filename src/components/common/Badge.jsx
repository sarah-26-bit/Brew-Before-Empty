import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variantStyles = {
    default: 'bg-forest-border/60 text-ivory-muted border-forest-border/80',
    emerald: 'bg-emerald/15 text-sage-light border-emerald/40 shadow-sm shadow-emerald/10',
    arcane: 'bg-emerald/15 text-sage-light border-emerald/40 shadow-sm shadow-emerald/10',
    gold: 'bg-gold/15 text-gold-light border-gold/40 shadow-sm shadow-gold/10 font-semibold',
    potion: 'bg-gold/15 text-gold-light border-gold/40 shadow-sm shadow-gold/10 font-semibold',
    amber: 'bg-amber/15 text-amber-light border-amber/40 shadow-sm shadow-amber/10',
    curse: 'bg-critical/15 text-critical-light border-critical/40 shadow-sm shadow-critical/10',
    critical: 'bg-critical/15 text-critical-light border-critical/40 shadow-sm shadow-critical/10',
    enchanted: 'bg-emerald/15 text-sage-light border-emerald/40 shadow-sm shadow-emerald/10',
    sage: 'bg-sage/15 text-sage-light border-sage/40',
    ivory: 'bg-ivory/10 text-ivory border-ivory/30',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
