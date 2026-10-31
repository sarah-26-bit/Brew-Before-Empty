import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variantStyles = {
    default: 'bg-midnight-border text-moonlight-muted border-midnight-border/80',
    arcane: 'bg-arcane/15 text-arcane-light border-arcane/40 shadow-sm shadow-arcane/10',
    potion: 'bg-potion/15 text-potion-light border-potion/40 shadow-sm shadow-potion/10',
    enchanted: 'bg-enchanted/15 text-enchanted-light border-enchanted/40 shadow-sm shadow-enchanted/10',
    curse: 'bg-curse/15 text-curse-light border-curse/40 shadow-sm shadow-curse/10 animate-pulse-subtle',
    moonlight: 'bg-moonlight/10 text-moonlight border-moonlight/30',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
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

