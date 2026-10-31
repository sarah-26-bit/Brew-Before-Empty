import React from 'react';
import Card from './Card';
import Badge from './Badge';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'arcane', // 'arcane', 'potion', 'enchanted', 'curse'
  trend,
  trendPositive,
  onClick,
}) {
  const iconVariants = {
    arcane: 'bg-arcane/20 text-arcane-light border border-arcane/40 shadow-arcane-sm',
    potion: 'bg-potion/20 text-potion-light border border-potion/40 shadow-potion-glow',
    enchanted: 'bg-enchanted/20 text-enchanted-light border border-enchanted/40 shadow-enchanted-glow',
    curse: 'bg-curse/20 text-curse-light border border-curse/40 shadow-curse-glow',
  };

  return (
    <Card
      glow
      glowColor={variant}
      headerBorder={false}
      onClick={onClick}
      className={`relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Subtle ambient gradient mesh in card corner */}
      <div
        className={`absolute -right-10 -top-10 w-28 h-28 rounded-full blur-2xl opacity-15 pointer-events-none transition-all group-hover:scale-125 group-hover:opacity-30 ${
          variant === 'potion' ? 'bg-potion' : variant === 'curse' ? 'bg-curse' : variant === 'enchanted' ? 'bg-enchanted' : 'bg-arcane'
        }`}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-moonlight-muted">
            {title}
          </p>
          <div className="mt-2 text-3xl font-display font-bold text-moonlight tracking-tight flex items-baseline gap-2">
            <span>{value}</span>
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${iconVariants[variant]} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-midnight-border/40">
          <span className="text-moonlight-muted">{subtitle}</span>
          {trend && (
            <Badge variant={trendPositive ? 'enchanted' : 'curse'} size="sm">
              {trend}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}

