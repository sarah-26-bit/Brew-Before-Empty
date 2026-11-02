import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import { useInventory } from '../context/InventoryContext';
import {
  Settings,
  Save,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Server,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const { showToast, triggerGlobalRefresh, refreshKey } = useInventory();
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSettings();
      setSettings(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to load store settings from the backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [refreshKey]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      showToast('Store settings saved successfully!', 'success');
      triggerGlobalRefresh();
    } catch (err) {
      showToast('Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        'WARNING: Resetting to demo data will clear custom sales and restore default Hack-O-Lantern 2026 inventory. Proceed?'
      )
    ) {
      return;
    }

    setResetting(true);
    try {
      await api.resetDatabase();
      showToast('Inventory reset to default demo dataset!', 'success');
      triggerGlobalRefresh();
    } catch (err) {
      showToast('Failed to reset store data.', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={fetchSettings} />
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* General Store Parameters */}
          <Card
            title="Store Information & Branding"
            subtitle="Configure your shop display name, store manager, and currency representation"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
                  Shop / Store Name
                </label>
                <input
                  type="text"
                  value={settings.shopName}
                  onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                  className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
                  Store Manager / Head Alchemist
                </label>
                <input
                  type="text"
                  value={settings.alchemistInCharge}
                  onChange={(e) => setSettings({ ...settings, alchemistInCharge: e.target.value })}
                  className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight font-mono focus:border-arcane focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
                  Demand Forecast Window (Days)
                </label>
                <input
                  type="number"
                  min="7"
                  max="60"
                  value={settings.prophecyHorizonDays}
                  onChange={(e) => setSettings({ ...settings, prophecyHorizonDays: Number(e.target.value) })}
                  className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight font-mono focus:border-arcane focus:outline-none"
                />
              </div>
            </div>
          </Card>

          {/* Thresholds and Automation */}
          <Card
            title="Alert Settings & Audio"
            subtitle="Configure proactive alerts and notification preferences"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-midnight-card/50 border border-midnight-border/60">
                <div>
                  <span className="font-semibold text-sm text-moonlight block">
                    Automatic Alert Resolution
                  </span>
                  <span className="text-xs text-moonlight-muted">
                    Automatically resolve low-stock alerts once ingredients have been restocked
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoWardingDefense}
                  onChange={(e) => setSettings({ ...settings, autoWardingDefense: e.target.checked })}
                  className="w-4 h-4 accent-arcane cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-midnight-card/50 border border-midnight-border/60">
                <div>
                  <span className="font-semibold text-sm text-moonlight block">
                    Sound Effects & Chimes
                  </span>
                  <span className="text-xs text-moonlight-muted">
                    Play cheerful chimes upon successful restock orders and completed customer sales
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEffectsEnabled}
                  onChange={(e) => setSettings({ ...settings, soundEffectsEnabled: e.target.checked })}
                  className="w-4 h-4 accent-arcane cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              isLoading={saving}
            >
              Save Store Settings
            </Button>
          </div>

          {/* Danger Zone: Primordial Reset */}
          <div className="p-6 rounded-2xl border border-curse/40 bg-curse/10 shadow-curse-glow space-y-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-curse shrink-0" />
              <h4 className="font-display font-bold text-base text-curse-light">
                Reset to Demo Data (Restore Defaults)
              </h4>
            </div>
            <p className="text-xs text-moonlight-muted leading-relaxed">
              Reset all inventory counts, restock logs, and sales records back to the clean Hack-O-Lantern 2026 starter dataset.
            </p>
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={RotateCcw}
              isLoading={resetting}
              onClick={handleReset}
            >
              Reset All Data to Demo Baseline
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
