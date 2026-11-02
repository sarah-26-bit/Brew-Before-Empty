import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { api } from '../../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isGuest, logout } = useAuth();
  const { refresh } = useInventory();

  // Settings State matching Web SettingsPage.jsx
  const [settings, setSettings] = useState({
    shopName: 'Brew Before Empty Apothecary Sanctum',
    alchemistInCharge: 'Grand Magister Cynthia',
    currencySymbol: '⟡ ARC',
    lowStockWarningThreshold: 25,
    autoRestockThresholdDays: 3,
    prophecyHorizonDays: 14,
    soundEffectsEnabled: true,
    hapticRunes: true,
    autoWardingDefense: false,
  });

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [resettingData, setResettingData] = useState(false);

  // Gateway Connection State
  const [baseUrl, setBaseUrlState] = useState(api.getBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  useEffect(() => {
    setBaseUrlState(api.getBaseUrl());
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await api.getSettings();
      if (res?.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch {
      // Keep sensible defaults
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.updateSettings(settings);
      Alert.alert('Settings Inscribed', 'Apothecary store parameters have been saved to the vault.');
      refresh();
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Unable to update store settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveHost = async (url: string) => {
    try {
      await api.setBaseUrl(url);
      setBaseUrlState(api.getBaseUrl());
      Alert.alert('Grim Wards Re-aligned', `Apothecary backend host updated to:\n${api.getBaseUrl()}`);
    } catch (err: any) {
      Alert.alert('Host Configuration Error', err.message);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setConnectionStatus(null);
      const res = await api.getHealth();
      setConnectionStatus(`Connected! System: ${res.data.system || 'Online'}`);
      Alert.alert('Arcane Gateway Verified', `Gateway is responsive.\n\nHost: ${api.getBaseUrl()}\nStatus: ${res.data.status}`);
    } catch (err: any) {
      setConnectionStatus(`Offline: ${err.message}`);
      Alert.alert(
        'Sanctuary Unreachable',
        `Could not reach backend at ${api.getBaseUrl()}.\n\nTip: For Android emulator use http://10.0.2.2:5001/api`
      );
    } finally {
      setTestingConnection(false);
    }
  };

  const handleResetDemoData = () => {
    Alert.alert(
      'Reset to Demo Baseline',
      'WARNING: Restoring demo data will reset all inventory counts, restock logs, and sales records back to the default Hack-O-Lantern 2026 starter dataset. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Demo Data',
          style: 'destructive',
          onPress: async () => {
            setResettingData(true);
            try {
              await api.resetDatabase();
              await refresh();
              await fetchSettings();
              Alert.alert('Vault Purged & Restored', 'Inventory reset to default starter dataset!');
            } catch (err: any) {
              Alert.alert('Reset Failed', err.message || 'Unable to reset store data.');
            } finally {
              setResettingData(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    await logout();
    router.replace('/auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Sanctuary Settings & Profile"
        subtitle="Configure shop parameters, arcane gateway, and alert preferences"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Alchemist Identity Card (Web Overview & Profile Header) */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color={colors.accentGold} />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.profileTitleRow}>
              <Text style={styles.userName}>
                {settings.alchemistInCharge || user?.fullName || (isGuest ? 'Guest Alchemist' : 'Master Deva')}
              </Text>
              <View style={styles.liveIndicatorBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>
            <Text style={styles.userEmail}>{settings.shopName}</Text>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={11} color={colors.accentEmeraldLight} />
              <Text style={styles.roleText}>Grand Magister & Vault Steward</Text>
            </View>
          </View>
        </View>

        {/* 2. Store Information & Branding (Matches Web SettingsPage.jsx) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Information & Branding</Text>
          <View style={styles.settingsCard}>
            <Text style={styles.settingDesc}>
              Configure your sanctuary display name, store manager, and currency representation.
            </Text>

            {loadingSettings ? (
              <ActivityIndicator size="small" color={colors.accentEmeraldLight} style={{ marginVertical: 12 }} />
            ) : (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>SHOP / STORE NAME</Text>
                  <TextInput
                    style={styles.textInput}
                    value={settings.shopName}
                    onChangeText={(val) => setSettings({ ...settings, shopName: val })}
                    placeholder="Shop Name"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>HEAD ALCHEMIST / STORE MANAGER</Text>
                  <TextInput
                    style={styles.textInput}
                    value={settings.alchemistInCharge}
                    onChangeText={(val) => setSettings({ ...settings, alchemistInCharge: val })}
                    placeholder="Head Alchemist"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <View style={styles.rowTwoCols}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>CURRENCY SYMBOL</Text>
                    <TextInput
                      style={[styles.textInput, { fontFamily: 'monospace' }]}
                      value={settings.currencySymbol}
                      onChangeText={(val) => setSettings({ ...settings, currencySymbol: val })}
                      placeholder="⟡ ARC"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>FORECAST WINDOW (DAYS)</Text>
                    <TextInput
                      style={[styles.textInput, { fontFamily: 'monospace' }]}
                      value={String(settings.prophecyHorizonDays || 14)}
                      keyboardType="number-pad"
                      onChangeText={(val) => setSettings({ ...settings, prophecyHorizonDays: Number(val) || 14 })}
                      placeholder="14"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                {/* Save Store Parameters Button */}
                <TouchableOpacity
                  style={styles.saveSettingsBtn}
                  onPress={handleSaveSettings}
                  disabled={savingSettings}
                  activeOpacity={0.8}
                >
                  {savingSettings ? (
                    <ActivityIndicator size="small" color={colors.textPrimary} />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={15} color={colors.textPrimary} />
                      <Text style={styles.saveSettingsBtnText}>Save Store Settings</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* 3. Alert Settings & Automation (Matches Web SettingsPage.jsx) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Settings & Audio</Text>
          <View style={styles.settingsCard}>
            {/* Automatic Alert Resolution */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextGroup}>
                <Text style={styles.switchLabel}>Automatic Alert Resolution</Text>
                <Text style={styles.switchSublabel}>
                  Automatically resolve low-stock alerts once ingredients have been restocked.
                </Text>
              </View>
              <Switch
                value={settings.autoWardingDefense}
                onValueChange={(val) => setSettings({ ...settings, autoWardingDefense: val })}
                trackColor={{ false: colors.bgMidnight, true: colors.accentEmerald }}
                thumbColor={colors.textPrimary}
              />
            </View>

            {/* Sound Effects & Chimes */}
            <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
              <View style={styles.switchTextGroup}>
                <Text style={styles.switchLabel}>Sound Effects & Chimes</Text>
                <Text style={styles.switchSublabel}>
                  Play audio runes upon successful restock orders and completed customer sales.
                </Text>
              </View>
              <Switch
                value={settings.soundEffectsEnabled}
                onValueChange={(val) => setSettings({ ...settings, soundEffectsEnabled: val })}
                trackColor={{ false: colors.bgMidnight, true: colors.accentEmerald }}
                thumbColor={colors.textPrimary}
              />
            </View>
          </View>
        </View>

        {/* 4. Arcane Gateway (API Host & Environment Sync) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arcane Gateway (API Host)</Text>
          <View style={styles.settingsCard}>
            <Text style={styles.settingDesc}>
              Host endpoint for Express & Supabase backend server. Android emulators connect via 10.0.2.2:5001.
            </Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.hostInput}
                value={baseUrl}
                onChangeText={setBaseUrlState}
                autoCapitalize="none"
                placeholder="http://10.0.2.2:5001/api"
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity
                style={styles.saveHostBtn}
                onPress={() => handleSaveHost(baseUrl)}
                activeOpacity={0.8}
              >
                <Text style={styles.saveHostText}>Save</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Switch Presets */}
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => handleSaveHost('http://10.0.2.2:5001/api')}
              >
                <Text style={styles.presetBtnText}>Emulator (10.0.2.2)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => handleSaveHost('http://localhost:5001/api')}
              >
                <Text style={styles.presetBtnText}>Localhost (5001)</Text>
              </TouchableOpacity>
            </View>

            {/* Test Connection Button */}
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestConnection}
              disabled={testingConnection}
              activeOpacity={0.8}
            >
              {testingConnection ? (
                <ActivityIndicator size="small" color={colors.accentEmeraldLight} />
              ) : (
                <>
                  <Ionicons name="radio-outline" size={15} color={colors.accentEmeraldLight} />
                  <Text style={styles.testBtnText}>Test Server Connection</Text>
                </>
              )}
            </TouchableOpacity>

            {connectionStatus && (
              <Text
                style={[
                  styles.statusMessage,
                  connectionStatus.startsWith('Connected')
                    ? { color: colors.statusHealthy }
                    : { color: colors.statusCritical },
                ]}
              >
                {connectionStatus}
              </Text>
            )}
          </View>
        </View>

        {/* 5. Danger Zone: Primordial Reset (Matches Web Settings Danger Zone) */}
        <View style={styles.dangerCard}>
          <View style={styles.dangerHeaderRow}>
            <Ionicons name="shield-outline" size={18} color={colors.curseRed} />
            <Text style={styles.dangerTitle}>Reset to Demo Data (Restore Defaults)</Text>
          </View>
          <Text style={styles.dangerDesc}>
            Reset all inventory counts, restock logs, and sales records back to the clean Hack-O-Lantern 2026 starter dataset.
          </Text>
          <TouchableOpacity
            style={styles.dangerResetBtn}
            onPress={handleResetDemoData}
            disabled={resettingData}
            activeOpacity={0.8}
          >
            {resettingData ? (
              <ActivityIndicator size="small" color={colors.curseRed} />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={15} color={colors.curseRed} />
                <Text style={styles.dangerResetBtnText}>Reset All Data to Demo Baseline</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 6. Sign Out Button */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={colors.textMuted} />
          <Text style={styles.signOutText}>Seal Grimoire & Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.bgMidnight,
    borderWidth: 2,
    borderColor: colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
    fontSize: 15,
  },
  liveIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(35, 122, 87, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(35, 122, 87, 0.5)',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.statusHealthy,
  },
  liveText: {
    ...typography.caption,
    color: colors.accentEmeraldLight,
    fontSize: 9,
    fontWeight: '700',
  },
  userEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 11,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(35, 122, 87, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  roleText: {
    ...typography.caption,
    color: colors.accentEmeraldLight,
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.accentGold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '700',
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  settingsCard: {
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  settingDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  fieldGroup: {
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.bgMidnight,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.md,
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    fontSize: 12.5,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  saveSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accentEmerald,
    borderRadius: borderRadius.md,
    paddingVertical: 9,
    marginTop: spacing.sm,
  },
  saveSettingsBtnText: {
    ...typography.button,
    color: colors.textPrimary,
    fontSize: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  switchTextGroup: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  switchLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 12.5,
  },
  switchSublabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  hostInput: {
    flex: 1,
    backgroundColor: colors.bgMidnight,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.md,
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    fontSize: 12,
  },
  saveHostBtn: {
    backgroundColor: colors.accentEmerald,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveHostText: {
    ...typography.button,
    color: colors.textPrimary,
    fontSize: 12,
  },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: colors.bgMidnight,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.sm,
    paddingVertical: 6,
    alignItems: 'center',
  },
  presetBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgMidnight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingVertical: 8,
    gap: spacing.xs,
    marginTop: 2,
  },
  testBtnText: {
    ...typography.button,
    color: colors.accentEmeraldLight,
    fontSize: 11.5,
  },
  statusMessage: {
    ...typography.caption,
    fontSize: 11,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  dangerCard: {
    backgroundColor: 'rgba(214, 92, 86, 0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(214, 92, 86, 0.35)',
    marginBottom: spacing.lg,
  },
  dangerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dangerTitle: {
    ...typography.bodyBold,
    color: colors.curseRed,
    fontSize: 12.5,
  },
  dangerDesc: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10.5,
    lineHeight: 15,
    marginBottom: spacing.sm,
  },
  dangerResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(214, 92, 86, 0.15)',
    borderWidth: 1,
    borderColor: colors.curseRed,
    borderRadius: borderRadius.md,
    paddingVertical: 8,
  },
  dangerResetBtnText: {
    ...typography.button,
    color: colors.curseRed,
    fontSize: 11.5,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgForest,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  signOutText: {
    ...typography.button,
    color: colors.textMuted,
    fontSize: 12,
  },
});
