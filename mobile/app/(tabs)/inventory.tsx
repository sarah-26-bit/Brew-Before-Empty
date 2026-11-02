import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { AddIngredientModal } from '../../components/AddIngredientModal';
import { useInventory, Ingredient } from '../../context/InventoryContext';

const STATUS_FILTERS = ['ALL', 'LOW', 'CRITICAL', 'HEALTHY'];

export default function InventoryScreen() {
  const {
    ingredients,
    refresh,
    refreshing,
    quickAdjustStock,
    deleteIngredient,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  // Dynamic Categories from real data
  const categories = ['ALL', ...Array.from(new Set(ingredients.map((i) => i.category || 'General Reagents')))];

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(search.toLowerCase()) ||
      (ing.supplier && ing.supplier.toLowerCase().includes(search.toLowerCase())) ||
      (ing.category && ing.category.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || ing.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'LOW' && ing.isLowStock) ||
      (selectedStatus === 'CRITICAL' && (ing.stockStatus === 'CRITICAL' || ing.stockStatus === 'OUT_OF_STOCK')) ||
      (selectedStatus === 'HEALTHY' && !ing.isLowStock);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = (item: Ingredient) => {
    Alert.alert(
      'Banish Reagent',
      `Are you certain you wish to purge "${item.name}" from the apothecary vault?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Banish',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIngredient(item.id);
            } catch (err: any) {
              Alert.alert('Banishment Failed', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Potion Pantry (Ingredients)"
        subtitle="View, add, edit, and track ingredient stock levels and reorder alerts."
      />

      {/* Search & Filter Header (Matches Web Dashboard) */}
      <View style={styles.searchSection}>
        {/* Dark Transparent Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ingredient name, supplier, or category..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filter Row */}
        <View style={styles.statusFilterRow}>
          {STATUS_FILTERS.map((st) => {
            const active = selectedStatus === st;
            return (
              <TouchableOpacity
                key={st}
                style={[styles.statusChip, active && styles.statusChipActive]}
                onPress={() => setSelectedStatus(st)}
              >
                <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>
                  {st === 'ALL' ? 'All Stocks' : st === 'LOW' ? '⚠️ Low Stock' : st === 'CRITICAL' ? '⛔ Critical' : '✓ Healthy'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Ingredient List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
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
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            Showing <Text style={{ color: colors.accentEmeraldLight, fontWeight: '700' }}>{filteredIngredients.length}</Text> of {ingredients.length} reagents in vault
          </Text>
        </View>

        {filteredIngredients.map((item) => {
          const isCritical = item.stockStatus === 'CRITICAL' || item.stockStatus === 'OUT_OF_STOCK';
          const isLow = item.stockStatus === 'LOW';

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBlock}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category || 'General Reagent'}</Text>
                </View>
                <Badge
                  label={item.stockStatus}
                  variant={isCritical ? 'CRITICAL' : isLow ? 'LOW' : 'HEALTHY'}
                />
              </View>

              {/* 3-Column Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Current Stock</Text>
                  <Text
                    style={[
                      styles.statVal,
                      isCritical
                        ? { color: colors.statusCritical }
                        : isLow
                        ? { color: colors.statusLow }
                        : { color: colors.statusHealthy },
                    ]}
                  >
                    {item.currentStock} {item.unit}
                  </Text>
                </View>

                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Min Threshold</Text>
                  <Text style={styles.statVal}>{item.minThreshold} {item.unit}</Text>
                </View>

                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Days Left</Text>
                  <Text style={[styles.statVal, { color: colors.accentGold }]}>
                    {item.daysRemaining !== undefined ? `${item.daysRemaining}d` : '~'}
                  </Text>
                </View>
              </View>

              {/* Burn Rate & Supplier */}
              <View style={styles.detailsRow}>
                <View style={styles.burnRateBadge}>
                  <Ionicons name="flame" size={12} color={colors.accentGold} />
                  <Text style={styles.burnRateText}>
                    Burn: ~{item.effectiveDailyConsumption || item.dailyConsumption} {item.unit}/day
                  </Text>
                </View>
                <Text style={styles.supplierText} numberOfLines={1}>
                  {item.supplier} ({item.leadTimeDays || 3}d lead)
                </Text>
              </View>

              {/* Stepper & Action Controls */}
              <View style={styles.actionRow}>
                <Text style={styles.stepperLabel}>Quick Stock Adjust:</Text>

                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => quickAdjustStock(item.id, -1)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={16} color={colors.textPrimary} />
                  </TouchableOpacity>

                  <Text style={styles.stepperValue}>{item.currentStock}</Text>

                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => quickAdjustStock(item.id, 1)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={16} color={colors.textPrimary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingAddBtn}
        onPress={() => setModalOpen(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={20} color={colors.textPrimary} />
        <Text style={styles.floatingAddText}>Inscribe Reagent</Text>
      </TouchableOpacity>

      <AddIngredientModal visible={modalOpen} onClose={() => setModalOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMidnight,
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.bgMidnight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 42,
    borderWidth: 1,
    borderColor: 'rgba(35, 122, 87, 0.3)',
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
  },
  statusFilterRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.xs + 2,
  },
  statusChip: {
    backgroundColor: colors.bgForest,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  statusChipActive: {
    backgroundColor: 'rgba(35, 122, 87, 0.25)',
    borderColor: colors.accentEmerald,
  },
  statusChipText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: colors.accentEmeraldLight,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginTop: spacing.xs + 2,
  },
  categoryChip: {
    backgroundColor: colors.bgForest,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(197, 164, 109, 0.2)',
    borderColor: colors.accentGold,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  categoryTextActive: {
    color: colors.accentGold,
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  countRow: {
    marginBottom: spacing.sm,
  },
  countText: {
    ...typography.caption,
    color: colors.textMuted,
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
    marginBottom: spacing.sm,
  },
  cardTitleBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  itemCategory: {
    ...typography.caption,
    color: colors.accentGold,
    fontSize: 11,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgMidnight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  statVal: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  burnRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  burnRateText: {
    ...typography.caption,
    color: colors.accentGold,
    fontSize: 11,
  },
  supplierText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  stepperLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.bgMidnight,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 26,
    textAlign: 'center',
  },
  deleteBtn: {
    marginLeft: 6,
    padding: 6,
  },
  floatingAddBtn: {
    position: 'absolute',
    left: spacing.lg,
    bottom: 20,
    backgroundColor: colors.accentEmerald,
    borderRadius: borderRadius.full,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: colors.accentEmerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  floatingAddText: {
    ...typography.button,
    color: colors.textPrimary,
    fontSize: 13,
  },
});
