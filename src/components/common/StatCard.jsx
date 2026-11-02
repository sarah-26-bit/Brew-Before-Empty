import React from 'react';
import Card from './Card';
import Badge from './Badge';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'gold', // 'gold', 'emerald', 'amber', 'critical'
  trend,
  trendPositive,
  onClick,
}) {
  const iconVariants = {
    gold: 'bg-gold/15 text-gold-light border border-gold/40 shadow-gold-sm',
    potion: 'bg-gold/15 text-gold-light border border-gold/40 shadow-gold-sm',
    emerald: 'bg-emerald/20 text-emerald-light border border-emerald/40 shadow-emerald-sm',
    enchanted: 'bg-emerald/20 text-emerald-light border border-emerald/40 shadow-emerald-sm',
    arcane: 'bg-emerald/20 text-emerald-light border border-emerald/40 shadow-emerald-sm',
    amber: 'bg-amber/20 text-amber-light border border-amber/40 shadow-amber-glow',
    critical: 'bg-critical/20 text-critical-light border border-critical/40 shadow-critical-glow',
    curse: 'bg-critical/20 text-critical-light border border-critical/40 shadow-critical-glow',
  };

  return (
    <Card
      glow
      glowColor={variant}
      headerBorder={false}
      onClick={onClick}
      className={`relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Subtle ambient botanical gradient in card corner */}
      <div
        className={`absolute -right-10 -top-10 w-28 h-28 rounded-full blur-2xl opacity-15 pointer-events-none transition-all group-hover:scale-125 group-hover:opacity-30 ${
          variant === 'critical' || variant === 'curse'
            ? 'bg-critical'
            : variant === 'amber'
            ? 'bg-amber'
            : variant === 'emerald' || variant === 'enchanted' || variant === 'arcane'
            ? 'bg-emerald'
            : 'bg-gold'
        }`}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-sage">
            {title}
          </p>
          <div className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-ivory tracking-tight flex items-baseline gap-2">
            <span>{value}</span>
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${iconVariants[variant] || iconVariants.gold} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-forest-border/50">
          <span className="text-ivory-muted">{subtitle}</span>
          {trend && (
            <Badge variant={trendPositive ? 'emerald' : 'critical'} size="sm">
              {trend}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}
