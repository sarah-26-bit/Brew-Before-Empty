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
        'Failed to commune with the Midnight Curse Crucible on the backend.'
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
          ? 'Blood Moon Necrotic Surge unleashed! Demand and decay accelerated.'
          : 'Holy Ward etched! The Midnight Curse has been temporarily subdued.',
        targetActive ? 'warning' : 'success'
      );
      triggerGlobalRefresh();
    } catch (err) {
      showToast('Failed to modify curse crucible state.', 'error');
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
                  {curseState?.active ? 'SURGE ACTIVE' : 'WARDED & DORMANT'}
                </Badge>
              </div>

              <p className="text-xs text-moonlight-muted mt-2 max-w-2xl leading-relaxed">
                {curseState?.description ||
                  'The celestial curse warps normal inventory dynamics, speeding up reagent decay and doubling consumer buying hysteria.'}
              </p>

              <div className="flex items-center gap-4 mt-3 text-xs font-mono text-moonlight-dark">
                <span>Phase: <strong className="text-moonlight">{curseState?.curseLevel || 'Penumbral'}</strong></span>
                <span>•</span>
                <span>Surge Multiplier: <strong className="text-potion-light">{multiplier}x</strong></span>
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
              {curseState?.active ? 'Dispel & Etch Holy Ward' : 'Unleash Blood Moon Surge'}
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
              title="Consumption Velocity"
              value={`${multiplier}x`}
              subtitle="Daily depletion acceleration"
              icon={Flame}
              variant="potion"
            />
            <StatCard
              title="Ethereal Spoilage Risk"
              value={curseState?.spoilageRate || '+32%'}
              subtitle="Organic & scaleless degradation"
              icon={Skull}
              variant="curse"
            />
            <StatCard
              title="Sanctum Ward Integrity"
              value={curseState?.wardingStrength || '64%'}
              subtitle="Remaining shield threshold"
              icon={ShieldAlert}
              variant="arcane"
            />
          </div>

          {/* Curse Multiplier Tuning Card */}
          <Card
            title="Curse Multiplier Calibration"
            subtitle="Fine-tune how aggressively the nocturnal surge drains reagents and inflates demand"
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-midnight-card/50 border border-midnight-border">
                <div className="w-full sm:w-auto">
                  <span className="text-xs uppercase font-mono tracking-wider text-moonlight-muted block">
                    Active Multiplier
                  </span>
                  <span className="text-2xl font-display font-bold text-potion-light font-mono">
                    {multiplier}x Velocity
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
                    Apply Intensity
                  </Button>
                </div>
              </div>

              {/* Afflicted Ingredients */}
              <div>
                <h4 className="font-display font-semibold text-sm text-moonlight mb-2">
                  Prime Targets of Current Curse:
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

