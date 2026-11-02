import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import { getIngredientArtwork } from '../assets/illustrations/ingredients';
import { useInventory } from '../context/InventoryContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
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
  Clock,
  Truck,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export default function MidnightCursePage() {
  const { showToast, refreshKey, triggerGlobalRefresh } = useInventory();
  const [curseState, setCurseState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(false);

  // Simulation controls
  const [multiplier, setMultiplier] = useState(1.75);
  const [supplierDelayDays, setSupplierDelayDays] = useState(3);
  const [selectedScenario, setSelectedScenario] = useState('halloween');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Preset festival scenarios
  const scenarios = [
    {
      id: 'halloween',
      name: 'Halloween All-Hallows Surge',
      multiplier: 1.8,
      delay: 3,
      desc: 'Annual festival celebrating the occult. Massive surge in Astral Clarity and Phoenix draught orders.'
    },
    {
      id: 'solstice',
      name: 'Winter Solstice Eve Gathering',
      multiplier: 2.2,
      delay: 4,
      desc: 'Deep winter celebration with heavy demand for warming potions and nocturnal sight draughts.'
    },
    {
      id: 'harvest',
      name: 'Autumn Harvest Guild Fair',
      multiplier: 1.4,
      delay: 2,
      desc: 'Seasonal marketplace fair with moderate increase in standard apothecary essentials.'
    }
  ];

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
        'Failed to connect to the Festival Event engine on the backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurse();
  }, [refreshKey]);

  const handleSelectScenario = (sc) => {
    setSelectedScenario(sc.id);
    setMultiplier(sc.multiplier);
    setSupplierDelayDays(sc.delay);
  };

  const handleToggleCurse = async (forceActive = null) => {
    setToggling(true);
    setConfirmModalOpen(false);
    try {
      const targetActive = forceActive !== null ? forceActive : !curseState.active;
      const res = await api.toggleCurse({
        active: targetActive,
        multiplier: Number(multiplier),
      });

      setCurseState(res.data.curseState);
      showToast(
        targetActive
          ? `Festival Surge (${multiplier}x) activated! Prophecy demand forecasts adjusted.`
          : 'Festival Surge deactivated. Forecasts restored to standard baseline.',
        targetActive ? 'warning' : 'success'
      );
      triggerGlobalRefresh();
    } catch (err) {
      showToast('Failed to change festival simulation status.', 'error');
    } finally {
      setToggling(false);
    }
  };

  // Comparative data for chart
  const comparativeChartData = [
    { name: 'Moonlit Dew', normal: 12, festival: Math.round(12 * multiplier), buffer: 18 },
    { name: 'Dragon Scale', normal: 8, festival: Math.round(8 * multiplier), buffer: 10 },
    { name: 'Phoenix Ash', normal: 6, festival: Math.round(6 * multiplier), buffer: 8 },
    { name: 'Mandrake Root', normal: 14, festival: Math.round(14 * multiplier), buffer: 20 },
    { name: 'Ghost Pepper', normal: 7, festival: Math.round(7 * multiplier), buffer: 9 },
    { name: 'Starlight Nectar', normal: 10, festival: Math.round(10 * multiplier), buffer: 15 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Crucible Hero Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all ${
          curseState?.active
            ? 'bg-gradient-to-r from-curse/20 via-deep-forest to-midnight border-curse/60 shadow-curse-glow'
            : 'bg-gradient-to-r from-enchanted/15 via-midnight-surface to-midnight border-enchanted/40'
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

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-moonlight">
                  {curseState?.name || 'All-Hallows Seasonal Demand Surge'}
                </h3>
                <Badge
                  variant={curseState?.active ? 'curse' : 'enchanted'}
                  size="md"
                >
                  {curseState?.active ? 'FESTIVAL SURGE ACTIVE' : 'STANDARD BASELINE (INACTIVE)'}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-moonlight-muted max-w-2xl leading-relaxed">
                {curseState?.description ||
                  'Simulates holiday and high-traffic festival periods where customer sales accelerate significantly, testing your inventory resilience before the real rush.'}
              </p>

              <div className="flex items-center gap-4 pt-1 text-xs font-mono text-moonlight-muted">
                <span>Festival Multiplier: <strong className="text-potion-light">{multiplier}x</strong></span>
                <span>•</span>
                <span>Simulated Supplier Delay: <strong className="text-curse-light">+{supplierDelayDays} days</strong></span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Button
              variant={curseState?.active ? 'enchanted' : 'curse'}
              size="lg"
              isLoading={toggling}
              icon={curseState?.active ? Shield : Flame}
              onClick={() => {
                if (!curseState?.active) {
                  setConfirmModalOpen(true);
                } else {
                  handleToggleCurse(false);
                }
              }}
            >
              {curseState?.active ? 'Deactivate Surge (Return to Normal)' : 'Simulate & Activate Surge'}
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
          {/* Preset Scenarios Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((sc) => {
              const isSelected = selectedScenario === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-midnight-card border-arcane shadow-arcane-sm'
                      : 'bg-midnight-surface/80 border-midnight-border hover:border-arcane/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-moonlight text-sm">{sc.name}</span>
                    <Badge variant={isSelected ? 'arcane' : 'enchanted'} size="sm">
                      {sc.multiplier}x Demand
                    </Badge>
                  </div>
                  <p className="text-xs text-moonlight-muted leading-relaxed line-clamp-2">
                    {sc.desc}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-moonlight-dark pt-1">
                    <span>Lead time delay: +{sc.delay} days</span>
                    <span className={isSelected ? 'text-arcane-light font-semibold' : ''}>
                      {isSelected ? 'Selected Preset' : 'Click to select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparative Simulation Chart: Normal vs Festival Demand */}
          <Card
            title="Demand Comparison: Standard Baseline vs Festival Surge"
            subtitle="Calculated daily unit consumption comparison under current simulation settings"
          >
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparativeChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F3327" vertical={false} />
                  <XAxis dataKey="name" stroke="#A6B99B" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#A6B99B" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101713',
                      border: '1px solid #237A57',
                      borderRadius: '0.75rem',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="normal" name="Standard Daily Usage" fill="#237A57" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="festival" name="Festival Surge Demand" fill="#E9A23B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="buffer" name="Current Stock Level" fill="#C5A46D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Multiplier Tuning Slider & Afflicted Ingredients */}
          <Card
            title="Fine-Tune Simulation Parameters"
            subtitle="Adjust custom multipliers and simulate supplier supply chain delays"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-midnight border border-midnight-border">
                {/* Traffic Multiplier */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-moonlight-muted">Demand Multiplier:</span>
                    <span className="text-potion-light font-bold text-base">{multiplier}x Normal Rate</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.05"
                    value={multiplier}
                    onChange={(e) => setMultiplier(Number(e.target.value))}
                    className="w-full accent-potion cursor-pointer"
                  />
                  <span className="text-[11px] text-moonlight-muted block">
                    Increases potion sales frequency and accelerates daily ingredient burn.
                  </span>
                </div>

                {/* Supplier Delay */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-moonlight-muted">Supplier Delivery Lead Time:</span>
                    <span className="text-curse-light font-bold text-base">+{supplierDelayDays} Days Delay</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="7"
                    step="1"
                    value={supplierDelayDays}
                    onChange={(e) => setSupplierDelayDays(Number(e.target.value))}
                    className="w-full accent-curse cursor-pointer"
                  />
                  <span className="text-[11px] text-moonlight-muted block">
                    Simulates courier disruptions during peak festival season.
                  </span>
                </div>
              </div>

              {/* Afflicted Ingredients Artwork Grid */}
              <div>
                <h4 className="font-serif font-bold text-sm text-moonlight mb-3">
                  Ingredients Most Affected by Festival Demand:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(curseState?.affectedIngredients || ['Moonlit Dewdrops', 'Dragon Scale Powder', 'Phoenix Ash', 'Mandrake Root']).map((name, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-midnight border border-curse/30 flex items-center gap-3.5 hover:border-curse transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-midnight-card border border-curse/20 flex items-center justify-center p-1.5 shrink-0">
                        {getIngredientArtwork(name, 'Herb', 'w-9 h-9')}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-moonlight text-xs truncate block">{name}</span>
                        <span className="text-[10px] text-curse-light font-mono block mt-0.5">Burn: ~{(3 * multiplier).toFixed(1)} units/day</span>
                        <Badge variant="curse" size="sm">High Impact</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Confirmation Modal before activating live surge */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-midnight border border-curse/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-curse-light">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif font-bold text-base text-moonlight">
                Confirm Festival Surge Activation
              </h3>
            </div>
            <p className="text-xs text-moonlight-muted leading-relaxed">
              Activating the festival surge will apply a <strong className="text-moonlight">{multiplier}x demand multiplier</strong> across all sales calculations and 7-day prophecy forecasts. Low-stock warnings will accelerate accordingly.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="curse"
                size="sm"
                loading={toggling}
                onClick={() => handleToggleCurse(true)}
              >
                Confirm & Activate
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
