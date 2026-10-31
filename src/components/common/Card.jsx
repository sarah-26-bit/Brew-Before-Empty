import React from 'react';

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  glow = false,
  glowColor = 'arcane',
  headerBorder = true,
  ...props
}) {
  const glowStyles = {
    arcane: 'hover:border-arcane/50 hover:shadow-arcane-sm',
    potion: 'hover:border-potion/50 hover:shadow-potion-glow',
    curse: 'hover:border-curse/50 hover:shadow-curse-glow',
    enchanted: 'hover:border-enchanted/50 hover:shadow-enchanted-glow',
  };

  return (
    <div
      className={`glass-card p-6 ${glow ? glowStyles[glowColor] : ''} ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className={`flex items-start justify-between gap-4 pb-4 ${headerBorder ? 'border-b border-midnight-border/60 mb-5' : 'mb-3'}`}>
          <div>
            {title && (
              <h3 className="font-display font-bold text-lg text-moonlight tracking-wide flex items-center gap-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-moonlight-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
