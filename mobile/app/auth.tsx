import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const { login, register, enterGuestMode } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('kunjatadevu2008@gmail.com');
  const [password, setPassword] = useState('Password123!');
  const [fullName, setFullName] = useState('Deva');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please provide email and password to open the grim gates.');
      return;
    }

    try {
      setLoading(true);
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, fullName.trim() || 'Alchemist Deva');
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Grim Wards Alert', err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    enterGuestMode();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Logo & Header */}
          <View style={styles.branding}>
            <View style={styles.logoCircle}>
              <Ionicons name="flask" size={36} color={colors.accentGold} />
            </View>
            <Text style={styles.appName}>BREW BEFORE EMPTY</Text>
            <Text style={styles.appTagline}>Grim Botanical Inventory & AI Intelligence</Text>
          </View>

          {/* Mode Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                Unseal Grimoire (Login)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'register' && styles.tabActive]}
              onPress={() => setMode('register')}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                Inscribe Oath (Register)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Inputs */}
          <View style={styles.form}>
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alchemist Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Master Deva"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Arcane Address (Email)</Text>
              <TextInput
                style={styles.input}
                placeholder="kunjatadevu2008@gmail.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Passphrase</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === 'login' ? 'Enter Sanctuary' : 'Register Alchemist'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuest}
              activeOpacity={0.8}
            >
              <Text style={styles.guestButtonText}>Continue as Guest Alchemist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMidnight,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  branding: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.bgForest,
    borderWidth: 2,
    borderColor: colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    ...typography.h2,
    color: colors.textPrimary,
    letterSpacing: 1.5,
  },
  appTagline: {
    ...typography.caption,
    color: colors.accentGold,
    marginTop: 4,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bgForest,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabActive: {
    backgroundColor: colors.accentEmerald,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
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
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: colors.accentEmerald,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  guestButtonText: {
    ...typography.caption,
    color: colors.accentGold,
    textDecorationLine: 'underline',
  },
});

