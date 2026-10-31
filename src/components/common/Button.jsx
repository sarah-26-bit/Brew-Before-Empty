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
    primary: 'bg-gradient-to-r from-arcane to-purple-600 hover:from-arcane-light hover:to-arcane text-white shadow-arcane-sm hover:shadow-arcane-md focus:ring-arcane border border-purple-400/30',
    potion: 'bg-gradient-to-r from-potion to-amber-600 hover:from-potion-light hover:to-potion text-white shadow-potion-glow focus:ring-potion border border-orange-400/30',
    curse: 'bg-gradient-to-r from-curse to-rose-700 hover:from-curse-light hover:to-curse text-white shadow-curse-glow focus:ring-curse border border-rose-400/30',
    enchanted: 'bg-gradient-to-r from-enchanted to-emerald-600 hover:from-enchanted-light hover:to-enchanted text-midnight-900 font-semibold shadow-enchanted-glow focus:ring-enchanted border border-emerald-400/30',
    secondary: 'bg-midnight-surface hover:bg-midnight-card text-moonlight border border-midnight-border hover:border-arcane/40 focus:ring-arcane',
    ghost: 'bg-transparent hover:bg-midnight-surface/60 text-moonlight-muted hover:text-moonlight focus:ring-arcane',
    danger: 'bg-curse/20 hover:bg-curse/30 text-curse-light border border-curse/40 focus:ring-curse',
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

