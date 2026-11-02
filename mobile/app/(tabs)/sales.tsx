import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { RecordSaleModal } from '../../components/RecordSaleModal';
import { useInventory } from '../../context/InventoryContext';

export default function SalesScreen() {
  const { sales, refresh, refreshing } = useInventory();
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const totalRevenue = sales.reduce((acc, s) => acc + (s.totalGold || 0), 0);
  const totalPotionsSold = sales.reduce((acc, s) => acc + (s.quantity || 0), 0);

  const filteredSales = sales.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      (s.potionName && s.potionName.toLowerCase().includes(q)) ||
      (s.customer && s.customer.toLowerCase().includes(q)) ||
      (s.guild && s.guild.toLowerCase().includes(q)) ||
      (s.id && s.id.toLowerCase().includes(q))
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Sales & Transactions"
        subtitle="Record customer purchases and watch ingredient stock deduct automatically."
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
        {/* Sales Hero Card (Matches Web Dashboard) */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>Total Sanctuary Revenue</Text>
              <Text style={styles.heroGold}>{totalRevenue} ⟡</Text>
            </View>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={14} color={colors.accentGold} />
              <Text style={styles.heroBadgeText}>{totalPotionsSold} Brews Sold</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.dispenseBtn}
            onPress={() => setSaleModalOpen(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="cart" size={16} color={colors.textPrimary} />
            <Text style={styles.dispenseBtnText}>Record Customer Purchase</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar for Transactions */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders by potion, customer, group..."
            placeholderTextColor={colors.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Ledger Header */}
        <View style={styles.ledgerHeaderRow}>
          <Text style={styles.ledgerTitle}>Transaction History</Text>
          <Text style={styles.ledgerCount}>{filteredSales.length} logs recorded</Text>
        </View>

        {/* Sales Feed */}
        {filteredSales.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>No matching sales logs found.</Text>
          </View>
        ) : (
          filteredSales.map((sale) => (
            <View key={sale.id} style={styles.saleCard}>
              <View style={styles.saleHeader}>
                <View style={styles.potionTitleRow}>
                  <View style={styles.potionIconCircle}>
                    <Ionicons name="flask" size={16} color={colors.accentGold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.salePotionName}>{sale.potionName}</Text>
                    <Text style={styles.saleTime}>
                      {new Date(sale.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(sale.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.salePriceBlock}>
                  <Text style={styles.saleGold}>+{sale.totalGold} ⟡</Text>
                  <Text style={styles.saleQuantity}>{sale.quantity}x dispensed</Text>
                </View>
              </View>

              {/* Patron & Guild info */}
              <View style={styles.patronRow}>
                <Ionicons name="person-outline" size={12} color={colors.textMuted} />
                <Text style={styles.patronText}>
                  Patron: <Text style={styles.patronHighlight}>{sale.customer}</Text>
                  {sale.guild ? ` • ${sale.guild}` : ''}
                </Text>
              </View>

              {/* Deductions Breakdown */}
              {sale.deductions && sale.deductions.length > 0 && (
                <View style={styles.deductionsBox}>
                  <Text style={styles.deductionsTitle}>Reagents Deducted Automatically:</Text>
                  <View style={styles.deductionChips}>
                    {sale.deductions.map((ded, idx) => (
                      <View key={idx} style={styles.dedChip}>
                        <Text style={styles.dedText}>
                          {ded.ingredientName}: -{ded.deducted} {ded.unit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

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
  heroCard: {
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.sm,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  heroLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroGold: {
    ...typography.h1,
    color: colors.accentGold,
    fontSize: 26,
    marginTop: 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(197, 164, 109, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(197, 164, 109, 0.3)',
  },
  heroBadgeText: {
    ...typography.caption,
    color: colors.accentGold,
    fontWeight: '700',
  },
  dispenseBtn: {
    backgroundColor: colors.accentEmerald,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dispenseBtnText: {
    ...typography.button,
    color: colors.textPrimary,
    fontSize: 13,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(35, 122, 87, 0.3)',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
  },
  ledgerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ledgerTitle: {
    ...typography.caption,
    color: colors.accentGold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  ledgerCount: {
    ...typography.caption,
    color: colors.textMuted,
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
  saleCard: {
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  potionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  potionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(197, 164, 109, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(197, 164, 109, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  salePotionName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  saleTime: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  salePriceBlock: {
    alignItems: 'flex-end',
  },
  saleGold: {
    ...typography.bodyBold,
    color: colors.accentGold,
    fontSize: 15,
  },
  saleQuantity: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  patronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  patronText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  patronHighlight: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  deductionsBox: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  deductionsTitle: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 4,
  },
  deductionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dedChip: {
    backgroundColor: colors.bgMidnight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  dedText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.accentEmeraldLight,
  },
});
