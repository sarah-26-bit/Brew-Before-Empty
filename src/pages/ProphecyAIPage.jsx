import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import DemandForecastChart from '../components/charts/DemandForecastChart';
import { useInventory } from '../context/InventoryContext';
import {
  Eye,
  Flame,
  AlertTriangle,
  Zap,
  TrendingUp,
  Calendar,
  Sparkles,
  ShieldAlert,
  Moon,
  Clock,
  ArrowRight,
} from 'lucide-react';

const SPIKE_PRESETS = [
  { id: 'BLOOD_MOON', label: 'Blood Moon Surge', mult: 1.85, desc: 'Heightened vampiric & martial demand' },
  { id: 'WITCHES_EVE', label: "Witches' Eve", mult: 2.4, desc: 'Massive festive ritual consumption' },
  { id: 'SOLSTICE', label: 'Celestial Solstice', mult: 1.5, desc: 'Astral alignments accelerate clarity philters' },
  { id: 'NECROTIC_SURGE', label: 'Necrotic Plague Surge', mult: 3.1, desc: 'Emergency purification & antidote rush' },
];

export default function ProphecyAIPage({ onOpenRestock }) {
  const { refreshKey, showToast } = useInventory();
  const [prophecyData, setProphecyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulation state
  const [selectedSpike, setSelectedSpike] = useState('BLOOD_MOON');
  const [customMultiplier, setCustomMultiplier] = useState(1.85);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const fetchProphecy = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProphecy();
      setProphecyData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'The Prophecy AI Oracle could not divine future trends from the backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProphecy();
  }, [refreshKey]);

  const handleSimulateSpike = async (presetId = selectedSpike, mult = customMultiplier) => {
    setSimulating(true);
    try {
      const res = await api.simulateSpike({
        spikeType: presetId,
        multiplier: mult,
      });
      setSimulationResult(res.data);
      showToast(`Prophecy AI simulated ${presetId} with ${mult}x velocity!`, 'warning');
    } catch (err) {
      showToast('Failed to simulate seasonal spike.', 'error');
    } finally {
      setSimulating(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setSelectedSpike(preset.id);
    setCustomMultiplier(preset.mult);
    handleSimulateSpike(preset.id, preset.mult);
  };

  return (
    <div className="space-y-6">
      {/* Top Oracle Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-arcane/20 via-midnight-surface to-potion/15 border border-arcane/40 shadow-arcane-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-arcane/25 border border-arcane/50 flex items-center justify-center text-arcane-light shadow-arcane-sm">
            <Eye className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-moonlight flex items-center gap-2">
              <span>Prophecy AI — Predictive Oracle Engine</span>
              <Badge variant="arcane" size="sm">Active Model v4.2</Badge>
            </h3>
            <p className="text-xs text-moonlight-muted mt-1 max-w-xl">
              Simulating 14-day arcane demand curves, continuous reagent depletion velocity, and calculating exact stockout hazard dates.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Zap}
          isLoading={simulating}
          onClick={() => handleSimulateSpike()}
        >
          Run Seasonal Surge Simulation
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={fetchProphecy} />
      ) : (
        <>
          {/* Demand Forecast Chart */}
          <Card
            title="14-Day Demand Forecast & Upper Hazard Horizon"
            subtitle="Comparing logged historical sales with neural projected demand (dashed) and confidence envelopes"
          >
            <DemandForecastChart data={prophecyData?.forecastTimeline || []} height={340} />
          </Card>

          {/* SEASONAL DEMAND SPIKES SIMULATOR WIDGET */}
          <Card
            title="Simulate Seasonal Demand Spikes"
            subtitle="Test how celestial and calendar events accelerate inventory depletion across your pantry"
            glow
            glowColor="potion"
          >
            <div className="space-y-5">
              {/* Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {SPIKE_PRESETS.map((preset) => {
                  const isSelected = selectedSpike === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-potion/20 border-potion shadow-potion-glow'
                          : 'bg-midnight-card/50 border-midnight-border/70 hover:border-potion/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm text-moonlight">
                          {preset.label}
                        </span>
                        <Badge variant={isSelected ? 'potion' : 'default'} size="sm">
                          {preset.mult}x
                        </Badge>
                      </div>
                      <p className="text-[11px] text-moonlight-muted leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Slider for custom multiplier */}
              <div className="p-4 rounded-xl bg-midnight-card/40 border border-midnight-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Flame className="w-5 h-5 text-potion" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-moonlight">
                      Custom Surge Multiplier:
                    </span>
                    <span className="ml-2 font-mono font-bold text-potion-light text-sm">
                      {customMultiplier}x
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-1/2">
                  <input
                    type="range"
                    min="1.0"
                    max="4.0"
                    step="0.05"
                    value={customMultiplier}
                    onChange={(e) => setCustomMultiplier(Number(e.target.value))}
                    className="w-full accent-potion cursor-pointer"
                  />
                  <Button
                    variant="potion"
                    size="sm"
                    isLoading={simulating}
                    onClick={() => handleSimulateSpike(selectedSpike, customMultiplier)}
                  >
                    Simulate
                  </Button>
                </div>
              </div>

              {/* Simulation Results Table if present */}
              {simulationResult && (
                <div className="pt-3 border-t border-midnight-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-display font-bold text-sm text-potion-light flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-potion" />
                      <span>Surge Depletion Hazard Analysis: {simulationResult.spikeType} ({simulationResult.multiplier}x)</span>
                    </h4>
                    <span className="text-xs font-mono text-moonlight-muted">
                      {simulationResult.impactSummary}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-midnight-border/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-midnight-card/80 text-moonlight-muted font-mono uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Reagent</th>
                          <th className="py-2.5 px-3">Stock Level</th>
                          <th className="py-2.5 px-3">Standard Days</th>
                          <th className="py-2.5 px-3">Surge Days Remaining</th>
                          <th className="py-2.5 px-3">Days Lost to Surge</th>
                          <th className="py-2.5 px-3">Accelerated Stockout</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-midnight-border/40 font-mono">
                        {simulationResult.simulatedIngredients.slice(0, 6).map((item) => (
                          <tr key={item.id} className="hover:bg-midnight-card/40">
                            <td className="py-2.5 px-3 font-medium text-moonlight font-sans">
                              {item.name}
                            </td>
                            <td className="py-2.5 px-3">
                              {item.currentStock} {item.unit}
                            </td>
                            <td className="py-2.5 px-3 text-moonlight-muted">
                              {item.originalDaysRemaining} days
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`font-bold ${item.acceleratedDaysRemaining <= 3 ? 'text-curse' : 'text-potion-light'}`}>
                                {item.acceleratedDaysRemaining} days
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-curse-light font-bold">
                              -{item.daysLost} days
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={item.acceleratedDaysRemaining <= 3 ? 'text-curse font-bold' : 'text-moonlight'}>
                                {item.acceleratedStockoutDate}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* STOCKOUT DATES TABLE */}
          <Card
            title="Predicted Reagent Stockout Dates"
            subtitle="Continuous depletion tracking based on current burn rate & supply chain lead times"
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenRestock}
              >
                Restock At-Risk Reagents
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-midnight-border/70 text-moonlight-muted font-mono uppercase tracking-wider">
                  <tr>
                    <th className="pb-3 font-semibold">Reagent</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Current Stock</th>
                    <th className="pb-3 font-semibold">Daily Velocity</th>
                    <th className="pb-3 font-semibold">Stockout Horizon</th>
                    <th className="pb-3 font-semibold">Hazard Level</th>
                    <th className="pb-3 font-semibold">Recommended Safety Buffer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-border/40">
                  {prophecyData?.stockoutRisks?.map((risk) => (
                    <tr key={risk.id} className="hover:bg-midnight-card/40 transition-colors">
                      <td className="py-3.5 font-medium text-moonlight">
                        <span className="font-semibold text-sm">{risk.name}</span>
                      </td>
                      <td className="py-3.5 font-mono text-moonlight-muted">
                        {risk.category}
                      </td>
                      <td className="py-3.5 font-mono">
                        <span className="font-bold text-moonlight">{risk.currentStock}</span> {risk.unit}
                      </td>
                      <td className="py-3.5 font-mono text-moonlight-muted">
                        {risk.dailyConsumption} {risk.unit}/day
                      </td>
                      <td className="py-3.5 font-mono">
                        <span className={`font-semibold ${risk.daysRemaining <= 3 ? 'text-curse-light font-bold' : 'text-moonlight'}`}>
                          {risk.daysRemaining} days
                        </span>
                        <span className="block text-[10px] text-moonlight-muted">
                          {risk.stockoutDate}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <Badge
                          variant={
                            risk.riskLevel === 'CRITICAL'
                              ? 'curse'
                              : risk.riskLevel === 'HIGH'
                              ? 'potion'
                              : 'arcane'
                          }
                          size="sm"
                        >
                          {risk.riskLevel} RISK
                        </Badge>
                      </td>
                      <td className="py-3.5 font-mono text-moonlight-muted">
                        +{risk.recommendedBuffer} {risk.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* AI Prophet Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prophecyData?.aiProphetInsights?.map((insight) => (
              <div
                key={insight.id}
                className="p-4 rounded-2xl bg-midnight-surface/80 border border-midnight-border/80 hover:border-arcane/50 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-moonlight">
                    {insight.title}
                  </span>
                  <Badge
                    variant={
                      insight.urgency === 'HIGH'
                        ? 'curse'
                        : insight.urgency === 'POSITIVE'
                        ? 'enchanted'
                        : 'potion'
                    }
                    size="sm"
                  >
                    {insight.urgency}
                  </Badge>
                </div>
                <p className="text-xs text-moonlight-muted leading-relaxed">
                  {insight.body}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
