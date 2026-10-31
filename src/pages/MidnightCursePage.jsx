import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import { useInventory } from '../context/InventoryContext';
import {
  Moon,
  Flame,
  Shield,
  ShieldAlert,
  Zap,
  Skull,
  Radio,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export default function MidnightCursePage() {
  const { showToast, refreshKey, triggerGlobalRefresh } = useInventory();
  const [curseState, setCurseState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(false);

  // Editable multiplier
  const [multiplier, setMultiplier] = useState(1.75);

  const fetchCurse = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCurseState();
      setCurseState(res.data);
      if (res.data?.multiplier) {
        setMultiplier(res.data.multiplier);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to connect to the Seasonal Event engine on the backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurse();
  }, [refreshKey]);

  const handleToggleCurse = async (forceActive = null) => {
    setToggling(true);
    try {
      const targetActive = forceActive !== null ? forceActive : !curseState.active;
      const res = await api.toggleCurse({
        active: targetActive,
        multiplier: Number(multiplier),
      });

      setCurseState(res.data.curseState);
      showToast(
        targetActive
          ? 'Demand Surge activated! Ingredient consumption forecasts are now multiplied.'
          : 'Demand Surge deactivated. Forecasts restored to standard baseline.',
        targetActive ? 'warning' : 'success'
      );
      triggerGlobalRefresh();
    } catch (err) {
      showToast('Failed to change seasonal event status.', 'error');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Crucible Hero Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          curseState?.active
            ? 'bg-gradient-to-r from-curse/25 via-purple-950/60 to-midnight-surface border-curse/60 shadow-curse-glow'
            : 'bg-gradient-to-r from-enchanted/15 via-midnight-surface to-midnight-card border-enchanted/40'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3.5 rounded-2xl border shrink-0 ${
                curseState?.active
                  ? 'bg-curse/20 text-curse-light border-curse/50 animate-pulse'
                  : 'bg-enchanted/20 text-enchanted-light border-enchanted/40'
              }`}
            >
              <Moon className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-display font-extrabold text-xl text-moonlight">
                  {curseState?.name || 'Blood Moon Necrotic Surge'}
                </h3>
                <Badge
                  variant={curseState?.active ? 'curse' : 'enchanted'}
                  size="md"
                >
                  {curseState?.active ? 'HIGH DEMAND SURGE ACTIVE' : 'NORMAL DEMAND (INACTIVE)'}
                </Badge>
              </div>

              <p className="text-xs text-moonlight-muted mt-2 max-w-2xl leading-relaxed">
                {curseState?.description ||
                  'Simulates holiday and festival events where customer traffic increases significantly, testing your inventory resilience before the real rush.'}
              </p>

              <div className="flex items-center gap-4 mt-3 text-xs font-mono text-moonlight-dark">
                <span>Event: <strong className="text-moonlight">{curseState?.curseLevel || 'Penumbral Surge'}</strong></span>
                <span>•</span>
                <span>Demand Rate: <strong className="text-potion-light">{multiplier}x normal sales</strong></span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Button
              variant={curseState?.active ? 'enchanted' : 'curse'}
              size="lg"
              isLoading={toggling}
              icon={curseState?.active ? Shield : Flame}
              onClick={() => handleToggleCurse()}
            >
              {curseState?.active ? 'Deactivate Surge (Return to Normal)' : 'Activate Demand Surge (+75%)'}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={fetchCurse} />
      ) : (
        <>
          {/* Crucible Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Demand Multiplier"
              value={`${multiplier}x`}
              subtitle="Sales rate compared to normal"
              icon={Flame}
              variant="potion"
            />
            <StatCard
              title="Estimated Spoilage Rate"
              value={curseState?.spoilageRate || '+32%'}
              subtitle="Extra buffer needed for waste"
              icon={Skull}
              variant="curse"
            />
            <StatCard
              title="Store Preparedness Level"
              value={curseState?.wardingStrength || '64%'}
              subtitle="Stock buffer capacity ready"
              icon={ShieldAlert}
              variant="arcane"
            />
          </div>

          {/* Curse Multiplier Tuning Card */}
          <Card
            title="Adjust Customer Traffic Multiplier"
            subtitle="Simulate different customer traffic levels to see how quickly stock depletes across your store"
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-midnight-card/50 border border-midnight-border">
                <div className="w-full sm:w-auto">
                  <span className="text-xs uppercase font-mono tracking-wider text-moonlight-muted block">
                    Current Simulation Rate
                  </span>
                  <span className="text-2xl font-display font-bold text-potion-light font-mono">
                    {multiplier}x Customer Demand
                  </span>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-2/3">
                  <input
                    type="range"
                    min="1.0"
                    max="3.5"
                    step="0.05"
                    value={multiplier}
                    onChange={(e) => setMultiplier(Number(e.target.value))}
                    className="w-full accent-potion cursor-pointer"
                  />
                  <Button
                    variant="potion"
                    size="sm"
                    isLoading={toggling}
                    onClick={() => handleToggleCurse(true)}
                  >
                    Apply Rate
                  </Button>
                </div>
              </div>

              {/* Afflicted Ingredients */}
              <div>
                <h4 className="font-display font-semibold text-sm text-moonlight mb-2">
                  Ingredients Most Heavily Consumed During This Surge:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {curseState?.affectedIngredients?.map((name, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-midnight-card/60 border border-curse/30 flex items-center gap-3 text-xs"
                    >
                      <div className="w-2 h-2 rounded-full bg-curse animate-ping" />
                      <span className="font-medium text-moonlight">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
