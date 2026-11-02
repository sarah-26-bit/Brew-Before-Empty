import React from 'react';

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  glow = false,
  glowColor = 'gold', // 'gold', 'emerald', 'amber', 'critical'
  headerBorder = true,
  ...props
}) {
  const glowStyles = {
    gold: 'hover:border-gold/50 hover:shadow-gold-sm',
    emerald: 'hover:border-emerald/50 hover:shadow-emerald-sm',
    amber: 'hover:border-amber/50 hover:shadow-amber-glow',
    critical: 'hover:border-critical/50 hover:shadow-critical-glow',
    arcane: 'hover:border-emerald/50 hover:shadow-emerald-sm',
    potion: 'hover:border-gold/50 hover:shadow-gold-sm',
    curse: 'hover:border-critical/50 hover:shadow-critical-glow',
  };

  return (
    <div
      className={`glass-card p-6 ${glow ? glowStyles[glowColor] || glowStyles.gold : ''} ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className={`flex items-start justify-between gap-4 pb-4 ${headerBorder ? 'border-b border-forest-border/70 mb-5' : 'mb-3'}`}>
          <div>
            {title && (
              <h3 className="font-serif font-bold text-lg text-ivory tracking-wide flex items-center gap-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-sage mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
