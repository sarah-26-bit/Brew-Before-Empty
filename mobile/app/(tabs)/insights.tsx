import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { useInventory } from '../../context/InventoryContext';

type TabMode = 'prophecy' | 'restock' | 'anomalies' | 'curse';

export default function InsightsScreen() {
  const {
    ingredients,
    restockRecs,
    anomalies,
    curseState,
    toggleCurse,
    executeRestock,
    resolveAnomaly,
    refresh,
    refreshing,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<TabMode>('prophecy');
  const [restockingId, setRestockingId] = useState<string | null>(null);

  const handleExecuteRestock = async (rec: any) => {
    try {
      setRestockingId(rec.ingredientId);
      await executeRestock(rec.ingredientId, rec.suggestedOrderQty);
      Alert.alert(
        'Procurement Order Dispatched',
        `Dispatched ${rec.suggestedOrderQty} ${rec.unit} order for "${rec.ingredientName}" to ${rec.supplier}.`
      );
    } catch (err: any) {
      Alert.alert('Restock Failed', err.message);
    } finally {
      setRestockingId(null);
    }
  };

  const handleResolveAnomaly = async (anomId: string) => {
    try {
      await resolveAnomaly(anomId, 'Purged and verified by Mobile Alchemist.');
      Alert.alert('Anomaly Dispelled', 'The variance has been neutralized and logged in the archives.');
    } catch (err: any) {
      Alert.alert('Resolution Failed', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Apothecary Intelligence Centre"
        subtitle="Predictive forecasting, statistical consumption anomalies, and procurement advice."
      />

      {/* Segmented Control Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'prophecy' && styles.tabBtnActive]}
          onPress={() => setActiveTab('prophecy')}
        >
          <Ionicons
            name="eye-outline"
            size={15}
            color={activeTab === 'prophecy' ? colors.accentEmeraldLight : colors.textMuted}
          />
          <Text style={[styles.tabBtnText, activeTab === 'prophecy' && styles.tabBtnTextActive]}>
            Prophecy AI
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'restock' && styles.tabBtnActive]}
          onPress={() => setActiveTab('restock')}
        >
          <Ionicons
            name="cart-outline"
            size={15}
            color={activeTab === 'restock' ? colors.accentEmeraldLight : colors.textMuted}
          />
          <Text style={[styles.tabBtnText, activeTab === 'restock' && styles.tabBtnTextActive]}>
            Restock
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'anomalies' && styles.tabBtnActive]}
          onPress={() => setActiveTab('anomalies')}
        >
          <Ionicons
            name="warning-outline"
            size={15}
            color={activeTab === 'anomalies' ? colors.accentEmeraldLight : colors.textMuted}
          />
          <Text style={[styles.tabBtnText, activeTab === 'anomalies' && styles.tabBtnTextActive]}>
            Anomalies
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'curse' && styles.tabBtnActive]}
          onPress={() => setActiveTab('curse')}
        >
          <Ionicons
            name="moon-outline"
            size={15}
            color={activeTab === 'curse' ? colors.accentEmeraldLight : colors.textMuted}
          />
          <Text style={[styles.tabBtnText, activeTab === 'curse' && styles.tabBtnTextActive]}>
            Curse Surge
          </Text>
        </TouchableOpacity>
      </View>

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
        {/* SUBVIEW 1: PROPHECY AI */}
        {activeTab === 'prophecy' && (
          <View>
            <View style={styles.introBox}>
              <Ionicons name="sparkles" size={16} color={colors.accentGold} />
              <Text style={styles.introText}>
                Prophetic forecasting models predict consumption rates based on historical potion sales and lunar cycles.
              </Text>
            </View>

            {ingredients.map((ing) => (
              <View key={ing.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{ing.name}</Text>
                    <Text style={styles.cardSubtitle}>{ing.category}</Text>
                  </View>
                  <Badge
                    label={ing.daysRemaining !== undefined && ing.daysRemaining <= 3 ? 'URGENT DEPLETION' : 'STABLE BUFFER'}
                    variant={ing.daysRemaining !== undefined && ing.daysRemaining <= 3 ? 'CRITICAL' : 'HEALTHY'}
                  />
                </View>

                <View style={styles.forecastGrid}>
                  <View style={styles.forecastCol}>
                    <Text style={styles.forecastLabel}>Daily Burn</Text>
                    <Text style={styles.forecastVal}>
                      ~{ing.effectiveDailyConsumption || ing.dailyConsumption} {ing.unit}
                    </Text>
                  </View>
                  <View style={styles.forecastCol}>
                    <Text style={styles.forecastLabel}>Days Left</Text>
                    <Text
                      style={[
                        styles.forecastVal,
                        { color: (ing.daysRemaining || 0) < 5 ? colors.statusCritical : colors.accentGold },
                      ]}
                    >
                      {ing.daysRemaining !== undefined ? `${ing.daysRemaining} days` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.forecastCol}>
                    <Text style={styles.forecastLabel}>Depletion Date</Text>
                    <Text style={styles.forecastVal}>{ing.stockoutDate || 'Depleted'}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* SUBVIEW 2: RESTOCK SPELL */}
        {activeTab === 'restock' && (
          <View>
            <View style={styles.introBox}>
              <Ionicons name="cart" size={16} color={colors.accentEmeraldLight} />
              <Text style={styles.introText}>
                Calculate exact order amounts based on daily usage and supplier delivery time.
              </Text>
            </View>

            {restockRecs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-done-circle" size={36} color={colors.statusHealthy} />
                <Text style={styles.emptyText}>All stocks are well-buffered. No restock needed.</Text>
              </View>
            ) : (
              restockRecs.map((rec) => (
                <View key={rec.ingredientId} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{rec.ingredientName}</Text>
                      <Text style={styles.cardSubtitle}>
                        Supplier: {rec.supplier} ({rec.leadTimeDays}d lead)
                      </Text>
                    </View>
                    <Badge
                      label={rec.urgency || 'HIGH'}
                      variant={rec.urgency === 'IMMEDIATE' ? 'CRITICAL' : 'LOW'}
                    />
                  </View>

                  <View style={styles.restockDetails}>
                    <View style={styles.restockDetailRow}>
                      <Text style={styles.restockLabel}>Current Vault Stock:</Text>
                      <Text style={styles.restockVal}>{rec.currentStock} {rec.unit}</Text>
                    </View>
                    <View style={styles.restockDetailRow}>
                      <Text style={styles.restockLabel}>Recommended Reorder:</Text>
                      <Text style={[styles.restockVal, { color: colors.accentGold }]}>
                        +{rec.suggestedOrderQty} {rec.unit}
                      </Text>
                    </View>
                    <View style={styles.restockDetailRow}>
                      <Text style={styles.restockLabel}>Estimated Cost:</Text>
                      <Text style={styles.restockVal}>{rec.totalCost || (rec.suggestedOrderQty * rec.costPerUnit)} ⟡</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.orderBtn}
                    onPress={() => handleExecuteRestock(rec)}
                    disabled={restockingId === rec.ingredientId}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="flash" size={15} color={colors.textPrimary} />
                    <Text style={styles.orderBtnText}>
                      {restockingId === rec.ingredientId ? 'Dispatching...' : 'Dispatch Restock Order'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* SUBVIEW 3: STRANGE HAPPENINGS */}
        {activeTab === 'anomalies' && (
          <View>
            <View style={styles.introBox}>
              <Ionicons name="warning" size={16} color={colors.curseRed} />
              <Text style={styles.introText}>
                Automatic detection of sudden usage spikes, stock leaks, and shortages with Z-scores.
              </Text>
            </View>

            {anomalies.map((anom) => {
              const isResolved = anom.status === 'RESOLVED';
              return (
                <View key={anom.id} style={[styles.card, isResolved && { opacity: 0.6 }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1, marginRight: spacing.sm }}>
                      <Text style={styles.cardTitle}>{anom.title}</Text>
                      <Text style={styles.cardSubtitle}>
                        Reagent: {anom.ingredientName} • {anom.anomalyType}
                      </Text>
                    </View>
                    <Badge
                      label={anom.severity}
                      variant={anom.severity === 'CRITICAL' ? 'CRITICAL' : 'LOW'}
                    />
                  </View>

                  <Text style={styles.anomDesc}>{anom.description}</Text>

                  <View style={styles.anomActionRow}>
                    <View style={styles.actionNote}>
                      <Ionicons name="bulb-outline" size={14} color={colors.accentGold} />
                      <Text style={styles.actionNoteText}>{anom.recommendedAction}</Text>
                    </View>

                    {!isResolved && (
                      <TouchableOpacity
                        style={styles.resolveBtn}
                        onPress={() => handleResolveAnomaly(anom.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.resolveBtnText}>Dispel</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* SUBVIEW 4: MIDNIGHT CURSE */}
        {activeTab === 'curse' && (
          <View>
            <View style={[styles.curseHeroCard, curseState.active && styles.curseHeroActive]}>
              <View style={styles.curseHeroTop}>
                <View style={styles.curseIconCircle}>
                  <Ionicons
                    name={curseState.active ? 'moon' : 'moon-outline'}
                    size={26}
                    color={curseState.active ? colors.curseRed : colors.accentGold}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.curseTitle}>Blood Moon Festival</Text>
                  <Text style={styles.curseSubtitle}>Midnight Curse Demand Surge Simulator</Text>
                </View>
                <Switch
                  value={curseState.active}
                  onValueChange={(val) => {
                    toggleCurse(val);
                  }}
                  trackColor={{ false: colors.bgMidnight, true: colors.curseRed }}
                  thumbColor={colors.textPrimary}
                />
              </View>

              <Text style={styles.curseDescription}>
                During the festival, customer demand accelerates by +75% across popular ritual ingredients (1.75x multiplier).
              </Text>

              <View style={styles.curseStatsRow}>
                <View style={styles.curseStat}>
                  <Text style={styles.curseStatLabel}>Demand Surge</Text>
                  <Text style={styles.curseStatVal}>+75% Burn Rate</Text>
                </View>
                <View style={styles.curseStat}>
                  <Text style={styles.curseStatLabel}>Status</Text>
                  <Text
                    style={[
                      styles.curseStatVal,
                      { color: curseState.active ? colors.curseRed : colors.statusHealthy },
                    ]}
                  >
                    {curseState.active ? 'CURSE SURGE ACTIVE' : 'WARDED SANCTUARY'}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.subHeading}>Cursed Festival Ingredients</Text>
            {ingredients.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.cursedItemCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Badge label="CURSED 1.75x" variant="CURSE" />
                </View>
                <Text style={styles.cursedBurnInfo}>
                  Normal burn: {item.dailyConsumption}/day →{' '}
                  <Text style={{ color: colors.curseRed, fontWeight: '700' }}>
                    Curse burn: {((item.dailyConsumption || 2) * 1.75).toFixed(1)}/day
                  </Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMidnight,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bgForest,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(35, 122, 87, 0.25)',
    borderBottomWidth: 2,
    borderBottomColor: colors.accentEmerald,
  },
  tabBtnText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: colors.accentEmeraldLight,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  introBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  introText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  card: {
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 11,
  },
  forecastGrid: {
    flexDirection: 'row',
    backgroundColor: colors.bgMidnight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  forecastCol: {
    flex: 1,
    alignItems: 'center',
  },
  forecastLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  forecastVal: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  restockDetails: {
    backgroundColor: colors.bgMidnight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginVertical: spacing.sm,
  },
  restockDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  restockLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  restockVal: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  orderBtn: {
    backgroundColor: colors.accentEmerald,
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  orderBtnText: {
    ...typography.button,
    color: colors.textPrimary,
    fontSize: 12,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  anomDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginVertical: spacing.xs,
    lineHeight: 16,
  },
  anomActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  actionNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: spacing.sm,
  },
  actionNoteText: {
    ...typography.caption,
    color: colors.accentGold,
    fontSize: 10,
    flex: 1,
  },
  resolveBtn: {
    backgroundColor: colors.bgMidnight,
    borderWidth: 1,
    borderColor: colors.accentEmerald,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  resolveBtnText: {
    ...typography.caption,
    color: colors.accentEmeraldLight,
    fontWeight: '700',
  },
  curseHeroCard: {
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.lg,
  },
  curseHeroActive: {
    borderColor: colors.curseRed,
    backgroundColor: 'rgba(214, 92, 86, 0.1)',
  },
  curseHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  curseIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgMidnight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  curseTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  curseSubtitle: {
    ...typography.caption,
    color: colors.accentGold,
    fontSize: 11,
  },
  curseDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 17,
    marginVertical: spacing.xs,
  },
  curseStatsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgMidnight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  curseStat: {
    flex: 1,
    alignItems: 'center',
  },
  curseStatLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  curseStatVal: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.accentGold,
    marginTop: 2,
  },
  subHeading: {
    ...typography.caption,
    color: colors.accentGold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  cursedItemCard: {
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cursedBurnInfo: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
