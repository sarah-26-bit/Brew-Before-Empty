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
import { useInventory } from '../context/InventoryContext';

interface AddIngredientModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'General Reagents',
  'Flora & Fauna',
  'Minerals & Ores',
  'Essences & Fluids',
  'Celestial & Rare',
];

export const AddIngredientModal: React.FC<AddIngredientModalProps> = ({ visible, onClose }) => {
  const { addIngredient } = useInventory();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [currentStock, setCurrentStock] = useState('50');
  const [unit, setUnit] = useState('vials');
  const [minThreshold, setMinThreshold] = useState('20');
  const [costPerUnit, setCostPerUnit] = useState('15');
  const [supplier, setSupplier] = useState('Alchemical Guild');
  const [dailyConsumption, setDailyConsumption] = useState('3.5');
  const [leadTimeDays, setLeadTimeDays] = useState('3');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a name for the reagent.');
      return;
    }

    try {
      setLoading(true);
      await addIngredient({
        name: name.trim(),
        category,
        currentStock: parseFloat(currentStock) || 0,
        unit: unit.trim() || 'units',
        minThreshold: parseFloat(minThreshold) || 10,
        costPerUnit: parseFloat(costPerUnit) || 5,
        supplier: supplier.trim() || 'Alchemical Guild',
        dailyConsumption: parseFloat(dailyConsumption) || 2.0,
        leadTimeDays: parseInt(leadTimeDays, 10) || 3,
      });

      // Reset
      setName('');
      onClose();
      Alert.alert('Grim Grimoire Updated', `Cataloged "${name.trim()}" into inventory.`);
    } catch (err: any) {
      Alert.alert('Cataloging Error', err.response?.data?.error || err.message);
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="sparkles" size={20} color={colors.accentGold} />
              <Text style={styles.headerTitle}>Inscribe New Reagent</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Reagent Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Phoenix Feather Essence"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Category Chips */}
            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, category === cat && styles.chipActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Current Stock & Unit */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.label}>Initial Stock</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={currentStock}
                  onChangeText={setCurrentStock}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Unit (vials, oz, etc.)</Text>
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            {/* Min Threshold & Cost */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.label}>Min Threshold</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={minThreshold}
                  onChangeText={setMinThreshold}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Cost Per Unit (Gold)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={costPerUnit}
                  onChangeText={setCostPerUnit}
                />
              </View>
            </View>

            {/* Daily Consumption & Lead Time */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.label}>Daily Consumption</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={dailyConsumption}
                  onChangeText={setDailyConsumption}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Lead Time (Days)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={leadTimeDays}
                  onChangeText={setLeadTimeDays}
                />
              </View>
            </View>

            {/* Supplier */}
            <View style={styles.field}>
              <Text style={styles.label}>Supplier Guild</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Alchemical Guild"
                placeholderTextColor={colors.textMuted}
                value={supplier}
                onChangeText={setSupplier}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.textPrimary} />
                  <Text style={styles.submitBtnText}>Inscribe into Vault</Text>
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
  field: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  chipsRow: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: colors.bgForest,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(35, 122, 87, 0.3)',
    borderColor: colors.accentEmerald,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.accentEmeraldLight,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: colors.accentEmerald,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});

