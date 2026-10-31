import React from 'react';
import { Sparkles } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Sparkles,
  title = 'No Magical Essence Found',
  description = 'The ethereal registers are currently quiet. Cast a spell or add items to initiate activity.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-midnight-border/80 bg-midnight-card/30 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-arcane/10 border border-arcane/25 flex items-center justify-center text-arcane-light mb-4 shadow-arcane-sm animate-pulse-subtle">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-display font-semibold text-lg text-moonlight mb-2">
        {title}
      </h3>
      <p className="text-sm text-moonlight-muted max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

