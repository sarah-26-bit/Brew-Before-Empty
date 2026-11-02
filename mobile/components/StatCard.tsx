import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { Badge } from './Badge';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: 'gold' | 'emerald' | 'amber' | 'critical' | 'curse';
  trend?: string;
  trendPositive?: boolean;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'gold',
  trend,
  trendPositive = true,
  onPress,
}) => {
  const getTheme = () => {
    switch (variant) {
      case 'emerald':
        return {
          iconBg: 'rgba(35, 122, 87, 0.2)',
          iconColor: colors.accentEmeraldLight,
          border: 'rgba(35, 122, 87, 0.35)',
          cornerGlow: 'rgba(35, 122, 87, 0.08)',
        };
      case 'amber':
        return {
          iconBg: 'rgba(233, 162, 59, 0.2)',
          iconColor: colors.statusLow,
          border: 'rgba(233, 162, 59, 0.35)',
          cornerGlow: 'rgba(233, 162, 59, 0.08)',
        };
      case 'critical':
      case 'curse':
        return {
          iconBg: 'rgba(214, 92, 86, 0.2)',
          iconColor: colors.statusCritical,
          border: 'rgba(214, 92, 86, 0.35)',
          cornerGlow: 'rgba(214, 92, 86, 0.08)',
        };
      case 'gold':
      default:
        return {
          iconBg: 'rgba(197, 164, 109, 0.18)',
          iconColor: colors.accentGold,
          border: 'rgba(197, 164, 109, 0.35)',
          cornerGlow: 'rgba(197, 164, 109, 0.08)',
        };
    }
  };

  const themeConfig = getTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: colors.borderSubtle }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      disabled={!onPress}
    >
      {/* Corner Ambient Glow */}
      <View style={[styles.cornerGlow, { backgroundColor: themeConfig.cornerGlow }]} />

      <View style={styles.topRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>

        <View style={[styles.iconContainer, { backgroundColor: themeConfig.iconBg, borderColor: themeConfig.border }]}>
          <Ionicons name={icon} size={20} color={themeConfig.iconColor} />
        </View>
      </View>

      {(subtitle || trend) && (
        <View style={styles.footerRow}>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
          {trend && (
            <Badge
              label={trend}
              variant={trendPositive ? 'HEALTHY' : 'CRITICAL'}
              size="sm"
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    flex: 1,
  },
  cornerGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.xs,
  },
  title: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    flex: 1,
    marginRight: spacing.xs,
  },
});
