import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius } from '../constants/theme';

export type BadgeVariant =
  | 'HEALTHY'
  | 'LOW'
  | 'CRITICAL'
  | 'OUT_OF_STOCK'
  | 'INFO'
  | 'GOLD'
  | 'CURSE'
  | 'RESOLVED';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'INFO', size = 'sm' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'HEALTHY':
        return {
          bg: 'rgba(46, 184, 114, 0.15)',
          border: 'rgba(46, 184, 114, 0.4)',
          text: colors.statusHealthy,
        };
      case 'LOW':
        return {
          bg: 'rgba(233, 162, 59, 0.15)',
          border: 'rgba(233, 162, 59, 0.4)',
          text: colors.statusLow,
        };
      case 'CRITICAL':
      case 'OUT_OF_STOCK':
      case 'CURSE':
        return {
          bg: 'rgba(214, 92, 86, 0.15)',
          border: 'rgba(214, 92, 86, 0.4)',
          text: colors.statusCritical,
        };
      case 'GOLD':
        return {
          bg: 'rgba(197, 164, 109, 0.15)',
          border: 'rgba(197, 164, 109, 0.4)',
          text: colors.accentGold,
        };
      case 'RESOLVED':
        return {
          bg: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.15)',
          text: colors.textMuted,
        };
      case 'INFO':
      default:
        return {
          bg: 'rgba(35, 122, 87, 0.2)',
          border: 'rgba(35, 122, 87, 0.5)',
          text: colors.accentEmerald,
        };
    }
  };

  const styleConfig = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        {
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: styleConfig.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 12,
  },
});

