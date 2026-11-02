import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { useInventory } from '../context/InventoryContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showCurseBanner?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Store Overview & Dashboard',
  subtitle = 'Predict demand. Prepare inventory. Prosper effortlessly.',
  showCurseBanner = true,
}) => {
  const { curseState, toggleCurse, refresh, refreshing } = useInventory();

  return (
    <View style={styles.wrapper}>
      {/* 1. Seasonal Surge Banner (Identical to Web Dashboard) */}
      {showCurseBanner && curseState.active && (
        <TouchableOpacity
          style={styles.surgeBanner}
          onPress={() => toggleCurse()}
          activeOpacity={0.85}
        >
          <View style={styles.surgeBannerContent}>
            <Ionicons name="moon" size={14} color={colors.curseRed} style={styles.surgeMoonIcon} />
            <Text style={styles.surgeTitle}>SEASONAL DEMAND SURGE ACTIVE:</Text>
            <Text style={styles.surgeDesc} numberOfLines={1}>
              {curseState.name || 'Blood Moon Festival'} (+75% consumption)
            </Text>
          </View>
          <View style={styles.surgeMultiplierBadge}>
            <Text style={styles.surgeMultiplierText}>1.75x</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* 2. Main Header Bar */}
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.brandRow}>
            <Ionicons name="flask" size={18} color={colors.accentGold} style={styles.logoIcon} />
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          </View>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        <View style={styles.actionsRow}>
          {/* System Connected Pulse Dot */}
          <View style={styles.systemConnectedPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.systemConnectedText}>System Live</Text>
          </View>

          {/* Refresh Action */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refresh}
            disabled={refreshing}
            activeOpacity={0.7}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={colors.accentEmeraldLight} />
            ) : (
              <Ionicons name="sync-outline" size={18} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.bgMidnight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  surgeBanner: {
    backgroundColor: 'rgba(214, 92, 86, 0.16)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 92, 86, 0.35)',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  surgeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  surgeMoonIcon: {
    marginRight: 2,
  },
  surgeTitle: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.curseRed,
    letterSpacing: 0.8,
  },
  surgeDesc: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textPrimary,
    flex: 1,
  },
  surgeMultiplierBadge: {
    backgroundColor: 'rgba(214, 92, 86, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(214, 92, 86, 0.5)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: spacing.xs,
  },
  surgeMultiplierText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.curseRed,
    fontFamily: 'monospace',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoIcon: {
    marginRight: 2,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  systemConnectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(35, 122, 87, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(35, 122, 87, 0.3)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.statusHealthy,
  },
  systemConnectedText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.accentEmeraldLight,
    fontFamily: 'monospace',
  },
  refreshButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.bgForest,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
});
