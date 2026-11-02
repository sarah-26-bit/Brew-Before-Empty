import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { useInventory, Potion } from '../context/InventoryContext';

interface RecordSaleModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({ visible, onClose }) => {
  const { potions, ingredients, recordSale } = useInventory();
  const [selectedPotionId, setSelectedPotionId] = useState<string>(potions[0]?.id || '');
  const [quantity, setQuantity] = useState('1');
  const [customer, setCustomer] = useState('Sorcerer Devon');
  const [guild, setGuild] = useState('Emerald Enclave');
  const [loading, setLoading] = useState(false);

  const selectedPotion = potions.find((p) => p.id === selectedPotionId) || potions[0];
  const qtyNumber = parseInt(quantity, 10) || 1;

  // Calculate deductions & validity
  const recipePreview = (selectedPotion?.recipe || []).map((req) => {
    const ing = ingredients.find((i) => i.id === req.ingredientId);
    const needed = req.quantity * qtyNumber;
    const available = ing ? ing.currentStock : 0;
    const isSufficient = available >= needed;
    return {
      ...req,
      needed,
      available,
      remaining: available - needed,
      isSufficient,
    };
  });

  const canFulfill = recipePreview.every((item) => item.isSufficient);
  const totalCost = (selectedPotion?.price || 0) * qtyNumber;

  const handleSale = async () => {
    if (!selectedPotion) {
      Alert.alert('Selection Error', 'Please select a potion recipe first.');
      return;
    }
    if (!canFulfill) {
      Alert.alert(
        'Insufficient Reagents',
        'Cannot fulfill this potion order. Some ingredients are depleted or below the required dosage.'
      );
      return;
    }

    try {
      setLoading(true);
      await recordSale({
        potionId: selectedPotion.id,
        quantity: qtyNumber,
        customer: customer.trim() || 'Anonymous Patron',
        guild: guild.trim() || 'Independent Wanderer',
      });

      onClose();
      Alert.alert(
        'Potion Dispensed!',
        `Successfully sold ${qtyNumber}x ${selectedPotion.name} for ${totalCost} Gold.`
      );
    } catch (err: any) {
      Alert.alert('Transaction Failed', err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="cart" size={20} color={colors.accentGold} />
              <Text style={styles.headerTitle}>Dispense Potion Order</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Potion Selector Carousel */}
            <Text style={styles.label}>Select Potion to Dispense</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.potionList}>
              {potions.map((pot) => {
                const isSelected = (selectedPotion?.id === pot.id);
                return (
                  <TouchableOpacity
                    key={pot.id}
                    style={[styles.potionCard, isSelected && styles.potionCardSelected]}
                    onPress={() => setSelectedPotionId(pot.id)}
                  >
                    <Ionicons
                      name="flask"
                      size={20}
                      color={isSelected ? colors.accentEmeraldLight : colors.accentGold}
                    />
                    <Text
                      style={[styles.potionName, isSelected && styles.potionNameSelected]}
                      numberOfLines={1}
                    >
                      {pot.name}
                    </Text>
                    <Text style={styles.potionPrice}>{pot.price} Gold</Text>
                    <Text style={styles.potionCraftable}>
                      Can brew: {pot.maxCraftable ?? '?'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Quantity Stepper */}
            <View style={styles.field}>
              <Text style={styles.label}>Quantity to Dispense</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQuantity(String(Math.max(1, qtyNumber - 1)))}
                >
                  <Ionicons name="remove" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <TextInput
                  style={styles.stepperInput}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={(val) => setQuantity(val.replace(/[^0-9]/g, ''))}
                />
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQuantity(String(qtyNumber + 1))}
                >
                  <Ionicons name="add" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.totalBadge}>
                  <Text style={styles.totalBadgeLabel}>Total:</Text>
                  <Text style={styles.totalBadgeValue}>{totalCost} Gold</Text>
                </View>
              </View>
            </View>

            {/* Customer & Guild */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.label}>Patron / Buyer</Text>
                <TextInput
                  style={styles.input}
                  value={customer}
                  onChangeText={setCustomer}
                  placeholder="Patron Name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Affiliation Guild</Text>
                <TextInput
                  style={styles.input}
                  value={guild}
                  onChangeText={setGuild}
                  placeholder="Guild"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Recipe & Stock Deductions Preview */}
            <View style={styles.recipePreviewBox}>
              <Text style={styles.previewTitle}>Automatic Reagent Deductions</Text>
              {recipePreview.map((item, idx) => (
                <View key={idx} style={styles.previewItem}>
                  <View style={styles.previewLeft}>
                    <Ionicons
                      name={item.isSufficient ? 'checkmark-circle' : 'alert-circle'}
                      size={16}
                      color={item.isSufficient ? colors.statusHealthy : colors.statusCritical}
                    />
                    <Text style={styles.previewItemName}>{item.ingredientName}</Text>
                  </View>
                  <Text
                    style={[
                      styles.previewItemStock,
                      !item.isSufficient && { color: colors.statusCritical },
                    ]}
                  >
                    -{item.needed} {item.unit} (Vault: {item.available})
                  </Text>
                </View>
              ))}
            </View>

            {/* Execute Sale Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!canFulfill || loading) && styles.submitBtnDisabled,
              ]}
              onPress={handleSale}
              disabled={!canFulfill || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color={colors.textPrimary} />
                  <Text style={styles.submitBtnText}>
                    {canFulfill
                      ? `Dispense & Collect ${totalCost} Gold`
                      : 'Missing Reagents to Brew'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgMidnight,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  form: {
    marginTop: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  potionList: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  potionCard: {
    width: 140,
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  potionCardSelected: {
    borderColor: colors.accentEmerald,
    backgroundColor: 'rgba(35, 122, 87, 0.25)',
  },
  potionName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    fontSize: 13,
  },
  potionNameSelected: {
    color: colors.accentEmeraldLight,
  },
  potionPrice: {
    ...typography.caption,
    color: colors.accentGold,
    marginTop: 2,
    fontWeight: '600',
  },
  potionCraftable: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stepperBtn: {
    backgroundColor: colors.bgForest,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperInput: {
    backgroundColor: colors.bgForest,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.md,
    color: colors.textPrimary,
    width: 60,
    height: 44,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  totalBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  totalBadgeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  totalBadgeValue: {
    ...typography.bodyBold,
    color: colors.accentGold,
    fontSize: 16,
  },
  field: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  input: {
    backgroundColor: colors.bgForest,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.md,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
  },
  recipePreviewBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.lg,
  },
  previewTitle: {
    ...typography.caption,
    color: colors.accentGold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  previewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  previewItemName: {
    ...typography.body,
    fontSize: 13,
  },
  previewItemStock: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: colors.accentEmerald,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  submitBtnDisabled: {
    backgroundColor: colors.bgForest,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    opacity: 0.6,
  },
  submitBtnText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});

