import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { AddIngredientModal } from '../../components/AddIngredientModal';
import { RecordSaleModal } from '../../components/RecordSaleModal';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    overview,
    ingredients,
    sales,
    anomalies,
    curseState,
    refresh,
    refreshing,
  } = useInventory();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);

  // Daily Quests Interactive State (matches Web Overview)
  const [quests, setQuests] = useState({
    q1: true,
    q2: false,
    q3: true,
  });

  const toggleQuest = (key: 'q1' | 'q2' | 'q3') => {
    setQuests((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const lowStockItems = ingredients.filter((i) => i.isLowStock);
  const totalItems = overview?.totalStockItems || ingredients.reduce((sum, i) => sum + i.currentStock, 0);
  const totalRevenue = overview?.totalSalesRevenue || sales.reduce((sum, s) => sum + s.totalGold, 0);

  // Dynamic Alchemical Health Score (0 - 100)
  const healthScore = Math.max(
    10,
    Math.min(
      98,
      100 -
        (overview?.lowStockCount || lowStockItems.length) * 8 -
        (overview?.activeAnomaliesCount || anomalies.filter((a) => a.status === 'ACTIVE').length) * 12
    )
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Store Overview & Dashboard"
        subtitle="Predict demand. Prepare inventory. Prosper effortlessly."
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.accentEmeraldLight}
            colors={[colors.accentEmeraldLight]}
          />
        }
      >
        {/* 1. Grand Master's Chamber Hero Banner (Matches Web Dashboard) */}
        <View style={styles.heroBanner}>
          <View style={styles.heroHeader}>
            <View style={styles.heroChamberRow}>
              <View style={styles.heroPingDot} />
              <Text style={styles.heroChamberText}>GRAND MASTER'S CHAMBER</Text>
            </View>
            <View style={styles.heroUserBadge}>
              <Text style={styles.heroUserText}>{user?.fullName || 'Master Deva'}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Brew Before Empty Intelligence Core</Text>
          <Text style={styles.heroDesc}>
            Real-time alchemical inventory monitoring, automated consumption deductions, and prophecy forecasting.
          </Text>

          {/* Quick Action Pills on Hero */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              style={styles.primaryPillBtn}
              onPress={() => setSaleModalOpen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="cart" size={14} color={colors.textPrimary} />
              <Text style={styles.primaryPillText}>Record Sale</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.goldPillBtn}
              onPress={() => router.push('/(tabs)/insights')}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={14} color={colors.accentGold} />
              <Text style={styles.goldPillText}>Prophecy AI</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlinePillBtn}
              onPress={() => setAddModalOpen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={14} color={colors.accentEmeraldLight} />
              <Text style={styles.outlinePillText}>Inscribe Reagent</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Seasonal Demand Surge Warning Banner (if curse is active) */}
        {curseState.active && (
          <View style={styles.curseCard}>
            <View style={styles.curseTopRow}>
              <View style={styles.curseIconCircle}>
                <Ionicons name="moon" size={18} color={colors.curseRed} />
              </View>
              <View style={styles.curseTextGroup}>
                <View style={styles.curseHeadingRow}>
                  <Text style={styles.curseHeading}>{curseState.name || 'Blood Moon Festival Rush'}</Text>
                  <View style={styles.curseMultiplierPill}>
                    <Text style={styles.curseMultiplierPillText}>1.75x Demand</Text>
                  </View>
                </View>
                <Text style={styles.curseSubtext}>
                  Festival rush is active. High reagent depletion detected on ritual components.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.curseReviewBtn}
              onPress={() => router.push('/(tabs)/insights')}
              activeOpacity={0.8}
            >
              <Text style={styles.curseReviewBtnText}>Review Simulation</Text>
              <Ionicons name="arrow-forward" size={12} color={colors.curseRed} />
            </TouchableOpacity>
          </View>
        )}

        {/* 3. Primary Key Metrics Grid (4 StatCards matching Web) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sanctuary Metrics</Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            <StatCard
              title="Total in Stock"
              value={`${totalItems}`}
              subtitle="Ingredient units available"
              icon="cube-outline"
              variant="emerald"
              trend="+12% this week"
              trendPositive={true}
              onPress={() => router.push('/(tabs)/inventory')}
            />
            <StatCard
              title="Total Revenue"
              value={`${totalRevenue} ⟡`}
              subtitle={`${sales.length} orders completed`}
              icon="wallet-outline"
              variant="gold"
              trend="Treasury Active"
              trendPositive={true}
              onPress={() => router.push('/(tabs)/sales')}
            />
          </View>

          <View style={[styles.metricsRow, { marginTop: spacing.sm }]}>
            <StatCard
              title="Low Stock Alerts"
              value={`${overview?.lowStockCount || lowStockItems.length}`}
              subtitle={`${overview?.criticalStockCount || 1} critically low`}
              icon="warning-outline"
              variant={lowStockItems.length > 0 ? 'amber' : 'emerald'}
              trend={lowStockItems.length > 0 ? 'Reorder Needed' : 'All Healthy'}
              trendPositive={lowStockItems.length === 0}
              onPress={() => router.push('/(tabs)/inventory')}
            />
            <StatCard
              title="Unusual Activity"
              value={`${overview?.activeAnomaliesCount || anomalies.filter((a) => a.status === 'ACTIVE').length}`}
              subtitle="Spikes or leaks"
              icon="alert-circle-outline"
              variant="curse"
              trend={anomalies.length > 0 ? 'Requires Review' : 'No Anomalies'}
              trendPositive={anomalies.length === 0}
              onPress={() => router.push('/(tabs)/insights')}
            />
          </View>
        </View>

        {/* 4. Health Score & Daily Objectives (Matches Web Dashboard) */}
        <View style={styles.healthAndQuestsSection}>
          {/* Health Score Card */}
          <View style={styles.healthCard}>
            <View style={styles.healthCardHeader}>
              <View>
                <Text style={styles.cardHeaderTitle}>Inventory Health Score</Text>
                <Text style={styles.cardHeaderSubtitle}>Automated weighted index</Text>
              </View>
              <Text style={styles.healthScoreBig}>{healthScore}%</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${healthScore}%`,
                    backgroundColor: healthScore > 75 ? colors.statusHealthy : colors.statusLow,
                  },
                ]}
              />
            </View>

            {/* Health Breakdown */}
            <View style={styles.healthBreakdownRow}>
              <View style={styles.healthBreakdownCol}>
                <Text style={styles.breakdownLabel}>Availability</Text>
                <Text style={styles.breakdownVal}>94%</Text>
              </View>
              <View style={styles.healthBreakdownCol}>
                <Text style={styles.breakdownLabel}>Safety Buffer</Text>
                <Text style={styles.breakdownVal}>86%</Text>
              </View>
              <View style={styles.healthBreakdownCol}>
                <Text style={styles.breakdownLabel}>Anomalies</Text>
                <Text style={styles.breakdownVal}>91%</Text>
              </View>
            </View>
          </View>

          {/* Daily Objectives Card */}
          <View style={styles.questsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>Alchemical Daily Objectives</Text>
              <Text style={styles.cardHeaderSubtitle}>Daily shop maintenance tasks</Text>
            </View>

            <View style={styles.questsList}>
              <TouchableOpacity
                style={styles.questItem}
                onPress={() => toggleQuest('q1')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={quests.q1 ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={quests.q1 ? colors.statusHealthy : colors.textMuted}
                />
                <Text style={[styles.questText, quests.q1 && styles.questTextDone]}>
                  Audit low-stock alerts & prepare restocks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.questItem}
                onPress={() => toggleQuest('q2')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={quests.q2 ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={quests.q2 ? colors.statusHealthy : colors.textMuted}
                />
                <Text style={[styles.questText, quests.q2 && styles.questTextDone]}>
                  Review 7-day Prophecy AI demand forecasts
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.questItem}
                onPress={() => toggleQuest('q3')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={quests.q3 ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={quests.q3 ? colors.statusHealthy : colors.textMuted}
                />
                <Text style={[styles.questText, quests.q3 && styles.questTextDone]}>
                  Record daily potion dispensations in ledger
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 5. Depletion Warnings Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Depletion Warnings ({lowStockItems.length})</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/inventory')}>
              <Text style={styles.seeAllLink}>View All Reagents →</Text>
            </TouchableOpacity>
          </View>

          {lowStockItems.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Ionicons name="shield-checkmark" size={26} color={colors.statusHealthy} />
              <Text style={styles.emptyStateText}>All reagents are safely above min thresholds</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalCards}>
              {lowStockItems.map((item) => (
                <View key={item.id} style={styles.alertCard}>
                  <View style={styles.alertCardHeader}>
                    <Badge
                      label={item.stockStatus}
                      variant={item.stockStatus === 'CRITICAL' ? 'CRITICAL' : 'LOW'}
                    />
                    <Text style={styles.alertCardCategory}>{item.category}</Text>
                  </View>
                  <Text style={styles.alertCardName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.alertCardStock}>
                    {item.currentStock} {item.unit}{' '}
                    <Text style={styles.alertCardMin}>/ Min: {item.minThreshold}</Text>
                  </Text>
                  <View style={styles.burnRateRow}>
                    <Ionicons name="flame" size={13} color={colors.accentGold} />
                    <Text style={styles.burnRateText}>
                      Burn: ~{item.effectiveDailyConsumption || item.dailyConsumption} {item.unit}/day
                    </Text>
                  </View>
                  <View style={styles.countdownRow}>
                    <Ionicons name="time-outline" size={12} color={colors.statusCritical} />
                    <Text style={styles.countdownText}>
                      Depletion: in {item.daysRemaining ?? 2} days
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 6. Recent Sales Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Customer Purchases</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/sales')}>
              <Text style={styles.seeAllLink}>Full Ledger →</Text>
            </TouchableOpacity>
          </View>

          {sales.slice(0, 4).map((sale) => (
            <View key={sale.id} style={styles.transactionCard}>
              <View style={styles.txIcon}>
                <Ionicons name="flask" size={18} color={colors.accentGold} />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txTitle}>
                  {sale.quantity}x {sale.potionName}
                </Text>
                <Text style={styles.txBuyer} numberOfLines={1}>
                  Patron: {sale.customer} ({sale.guild || 'Independent'})
                </Text>
              </View>
              <View style={styles.txAmount}>
                <Text style={styles.txGold}>+{sale.totalGold} ⟡</Text>
                <Text style={styles.txDate}>
                  {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <AddIngredientModal visible={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <RecordSaleModal visible={saleModalOpen} onClose={() => setSaleModalOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMidnight,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  // Hero Banner
  heroBanner: {
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.xl,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: 'rgba(35, 122, 87, 0.4)',
    marginBottom: spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  heroChamberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroPingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.statusHealthy,
  },
  heroChamberText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentEmeraldLight,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  heroUserBadge: {
    backgroundColor: 'rgba(197, 164, 109, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(197, 164, 109, 0.3)',
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  heroUserText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.accentGold,
    fontWeight: '700',
  },
  heroTitle: {
    ...typography.h2,
    fontSize: 19,
    color: colors.textPrimary,
    marginVertical: 4,
    letterSpacing: 0.3,
  },
  heroDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 17,
    fontSize: 12,
  },
  heroActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  primaryPillBtn: {
    backgroundColor: colors.accentEmerald,
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  primaryPillText: {
    ...typography.button,
    fontSize: 11,
    color: colors.textPrimary,
  },
  goldPillBtn: {
    backgroundColor: 'rgba(197, 164, 109, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(197, 164, 109, 0.4)',
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goldPillText: {
    ...typography.button,
    fontSize: 11,
    color: colors.accentGold,
  },
  outlinePillBtn: {
    backgroundColor: 'rgba(35, 122, 87, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(35, 122, 87, 0.4)',
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  outlinePillText: {
    ...typography.button,
    fontSize: 11,
    color: colors.accentEmeraldLight,
  },
  // Curse Card
  curseCard: {
    backgroundColor: 'rgba(214, 92, 86, 0.12)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(214, 92, 86, 0.4)',
    marginBottom: spacing.md,
  },
  curseTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  curseIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(214, 92, 86, 0.2)',
    borderWidth: 1,
    borderColor: colors.curseRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  curseTextGroup: {
    flex: 1,
  },
  curseHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  curseHeading: {
    ...typography.bodyBold,
    color: colors.curseRed,
    fontSize: 13,
  },
  curseMultiplierPill: {
    backgroundColor: 'rgba(214, 92, 86, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
  },
  curseMultiplierPillText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: colors.curseRed,
    fontFamily: 'monospace',
  },
  curseSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  curseReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: spacing.xs,
  },
  curseReviewBtnText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.curseRed,
  },
  // Metrics Grid
  sectionHeader: {
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.accentGold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '700',
    fontSize: 11,
  },
  metricsGrid: {
    marginBottom: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  // Health & Quests
  healthAndQuestsSection: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  healthCard: {
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  healthCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardHeaderTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  cardHeaderSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  healthScoreBig: {
    ...typography.h1,
    fontSize: 26,
    color: colors.accentEmeraldLight,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  healthBreakdownCol: {
    alignItems: 'center',
  },
  breakdownLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  breakdownVal: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentGold,
  },
  questsCard: {
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cardHeader: {
    marginBottom: spacing.xs,
  },
  questsList: {
    gap: spacing.xs,
    marginTop: 4,
  },
  questItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  questText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  questTextDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  // Depletion Warnings
  section: {
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  seeAllLink: {
    ...typography.caption,
    color: colors.accentEmeraldLight,
    fontWeight: '700',
    fontSize: 11,
  },
  horizontalCards: {
    flexDirection: 'row',
  },
  alertCard: {
    width: 210,
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(233, 162, 59, 0.35)',
    marginRight: spacing.sm,
  },
  alertCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  alertCardCategory: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  alertCardName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
    marginVertical: 2,
  },
  alertCardStock: {
    ...typography.h3,
    color: colors.statusLow,
    fontSize: 15,
  },
  alertCardMin: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  burnRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  burnRateText: {
    ...typography.caption,
    color: colors.accentGold,
    fontSize: 11,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  countdownText: {
    ...typography.caption,
    color: colors.statusCritical,
    fontSize: 10,
    fontWeight: '600',
  },
  emptyStateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgForest,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  // Transactions
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(197, 164, 109, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(197, 164, 109, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  txBuyer: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 11,
  },
  txAmount: {
    alignItems: 'flex-end',
  },
  txGold: {
    ...typography.bodyBold,
    color: colors.accentGold,
    fontSize: 14,
  },
  txDate: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
