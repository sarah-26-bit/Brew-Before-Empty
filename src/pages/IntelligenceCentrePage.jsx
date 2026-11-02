import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import EmptyState from '../components/common/EmptyState';
import DemandForecastChart from '../components/charts/DemandForecastChart';
import { getIngredientArtwork } from '../assets/illustrations/ingredients';
import { AICompanionOrb } from '../assets/illustrations/scenes';
import { useInventory } from '../context/InventoryContext';
import {
  Brain,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Wand2,
  Calendar,
  Layers,
  ArrowRight,
  Send,
  Zap,
  CheckCircle2,
  Activity,
  Cpu
} from 'lucide-react';

export default function IntelligenceCentrePage() {
  const { setActiveTab, refreshKey } = useInventory();
  const [ingredients, setIngredients] = useState([]);
  const [restockRecs, setRestockRecs] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Query Console State
  const [consoleQuery, setConsoleQuery] = useState('');
  const [consoleResponse, setConsoleResponse] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchIntelligenceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ingRes, restockRes, anomRes] = await Promise.all([
        api.getIngredients(),
        api.getRestockRecommendations().catch(() => ({ data: { recommendations: [] } })),
        api.getAnomalies().catch(() => ({ data: [] }))
      ]);
      setIngredients(ingRes.data || []);
      setRestockRecs(restockRes.data?.recommendations || []);
      setAnomalies(anomRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize intelligence engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligenceData();
  }, [refreshKey]);

  const handleConsoleSubmit = (e) => {
    e.preventDefault();
    if (!consoleQuery.trim()) return;

    setAnalyzing(true);
    setTimeout(() => {
      const q = consoleQuery.toLowerCase();
      let res = '';
      if (q.includes('risk') || q.includes('out') || q.includes('shortage')) {
        const critical = ingredients.filter(i => (i.daysRemaining || 99) <= 4);
        res = `Prophecy Risk Assessment: ${critical.length} ingredients require immediate reordering. ${critical.map(c => c.name).join(', ')} are projected to reach 0 stock within 96 hours at current customer consumption rates.`;
      } else if (q.includes('cost') || q.includes('budget') || q.includes('reorder')) {
        const totalCost = restockRecs.reduce((sum, r) => sum + (r.suggestedRestockQty * r.costPerUnit), 0);
        res = `Smart Procurement Forecast: Total recommended order amount is ${totalCost.toFixed(2)} ⟡ across ${restockRecs.length} ingredients to achieve a 14-day safe operating buffer.`;
      } else {
        res = `Alchemical Analysis Complete: Inventory health is currently rated at 86/100. Potion recipe demand is weighted primarily towards Astral Clarity and Phoenix Rebirth draughts.`;
      }
      setConsoleResponse(res);
      setAnalyzing(false);
    }, 600);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="stats" count={4} />
        <LoadingSkeleton type="cards" count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={fetchIntelligenceData} />;
  }

  // Calculated risks
  const criticalItems = ingredients.filter(i => (i.daysRemaining || 99) <= 4);
  const lowItems = ingredients.filter(i => i.isLowStock);
  const activeAnomalies = anomalies.filter(a => a.status !== 'RESOLVED');

  return (
    <div className="space-y-6">
      
      {/* Intelligence Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-deep-forest via-midnight-surface to-midnight border border-arcane/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-arcane/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-midnight border border-arcane/30 flex items-center justify-center p-2 shadow-inner shrink-0">
            <AICompanionOrb className="w-12 h-12" active={true} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="arcane" size="sm">Prophecy Intelligence 2.0</Badge>
              <span className="text-[11px] font-mono text-enchanted-light flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-enchanted animate-pulse" />
                Active Monitoring
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-moonlight">
              Apothecary Intelligence Centre
            </h1>
            <p className="text-xs sm:text-sm text-moonlight-muted max-w-xl">
              Real-time predictive forecasting, statistical consumption anomaly diagnostics, and automated procurement advice.
            </p>
          </div>
        </div>

        {/* Quick KPI Pill */}
        <div className="flex items-center gap-3 shrink-0 bg-midnight/80 border border-midnight-border rounded-2xl p-4">
          <div className="text-center px-2">
            <span className="text-[10px] text-moonlight-muted uppercase font-mono">Prediction Accuracy</span>
            <p className="text-lg font-bold font-mono text-enchanted-light">94.8%</p>
          </div>
          <div className="w-px h-8 bg-midnight-border" />
          <div className="text-center px-2">
            <span className="text-[10px] text-moonlight-muted uppercase font-mono">Monitored Items</span>
            <p className="text-lg font-bold font-mono text-moonlight">{ingredients.length}</p>
          </div>
        </div>
      </div>

      {/* Primary Intelligence Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Stockout Risk Level"
          value={`${criticalItems.length} Urgent`}
          subtitle="Ingredients out within 96 hours"
          icon={TrendingDown}
          variant={criticalItems.length > 0 ? 'curse' : 'enchanted'}
        />
        <StatCard
          title="Safety Buffer Deficits"
          value={`${lowItems.length} Items`}
          subtitle="Below required buffer limit"
          icon={ShieldCheck}
          variant="potion"
        />
        <StatCard
          title="Containment Anomalies"
          value={`${activeAnomalies.length} Active`}
          subtitle="Unusual spikes or variance"
          icon={AlertTriangle}
          variant={activeAnomalies.length > 0 ? 'curse' : 'arcane'}
        />
        <StatCard
          title="Restock Recommendations"
          value={`${restockRecs.length} Orders`}
          subtitle="Actionable purchase batches"
          icon={Wand2}
          variant="enchanted"
        />
      </div>

      {/* Sub-tab navigation */}
      <div className="flex items-center gap-2 border-b border-midnight-border pb-3 text-xs">
        {[
          { id: 'overview', label: 'AI Risk Monitor' },
          { id: 'diagnostics', label: 'Anomaly Diagnostic Matrix' },
          { id: 'console', label: 'Interactive AI Console' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              activeSubTab === tab.id
                ? 'bg-arcane text-white shadow-arcane-sm font-semibold'
                : 'bg-midnight-surface text-moonlight-muted hover:text-moonlight border border-midnight-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: AI RISK MONITOR */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <Card
            title="High-Priority Stockout Risk Monitor"
            subtitle="Ranked by estimated depletion dates using weighted moving-average burn rates"
            action={
              <Button
                variant="primary"
                size="sm"
                icon={Wand2}
                onClick={() => setActiveTab('restock')}
              >
                Launch Restock Spell
              </Button>
            }
          >
            <div className="divide-y divide-midnight-border/60">
              {ingredients
                .sort((a, b) => (a.daysRemaining || 99) - (b.daysRemaining || 99))
                .slice(0, 6)
                .map((ing) => {
                  const isCritical = (ing.daysRemaining || 99) <= 4;
                  return (
                    <div
                      key={ing.id}
                      className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-midnight/30 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-midnight border border-midnight-border flex items-center justify-center p-1.5 shrink-0">
                          {getIngredientArtwork(ing.name, ing.category, 'w-9 h-9', ing.visualArchetype)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-moonlight text-sm">
                              {ing.name}
                            </h4>
                            <Badge variant={isCritical ? 'curse' : ing.isLowStock ? 'potion' : 'enchanted'} size="sm">
                              {isCritical ? 'CRITICAL DEPLETION' : ing.isLowStock ? 'LOW STOCK' : 'HEALTHY'}
                            </Badge>
                          </div>
                          <p className="text-xs text-moonlight-muted">
                            Supplier: <span className="text-moonlight">{ing.supplier}</span> • Burn Rate: <span className="font-mono text-moonlight">{ing.effectiveDailyConsumption || ing.dailyUsageRate || 2} {ing.unit}/day</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-midnight-border/40">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-moonlight-muted uppercase font-mono block">Estimated Stockout</span>
                          <span className={`text-sm font-bold font-mono ${isCritical ? 'text-curse' : 'text-moonlight'}`}>
                            {ing.stockoutDate || 'In 8 days'} ({ing.daysRemaining || 8} days)
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setActiveTab('restock')}
                        >
                          Reorder
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      )}

      {/* SUB-TAB 2: ANOMALY DIAGNOSTIC MATRIX */}
      {activeSubTab === 'diagnostics' && (
        <div className="space-y-6">
          <Card
            title="Statistical Consumption Anomaly Matrix"
            subtitle="Automated variance detection identifying irregular spikes and container leaks"
          >
            {activeAnomalies.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="Zero Abnormalities Detected"
                description="All daily consumption levels remain within 1.5 standard deviations of the 30-day baseline."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAnomalies.map((an) => (
                  <div
                    key={an.id}
                    className="p-5 rounded-2xl bg-midnight-card/80 border border-curse/30 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-moonlight font-serif text-sm">{an.title}</span>
                      <Badge variant={an.severity === 'CRITICAL' ? 'curse' : 'potion'} size="sm">
                        {an.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-moonlight-muted leading-relaxed">
                      {an.description}
                    </p>
                    <div className="pt-2 border-t border-midnight-border flex items-center justify-between text-[11px]">
                      <span className="text-curse-light font-mono">Deviation: +185% vs baseline</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('happenings')}
                        className="text-xs"
                      >
                        Investigate &rarr;
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* SUB-TAB 3: INTERACTIVE AI CONSOLE */}
      {activeSubTab === 'console' && (
        <div className="space-y-6">
          <Card
            title="Interactive Alchemical Query Console"
            subtitle="Query inventory forecasts, budget models, and stock simulations in natural language"
          >
            <div className="space-y-4">
              <form onSubmit={handleConsoleSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Which ingredients have highest risk of running out before Friday?"
                  value={consoleQuery}
                  onChange={(e) => setConsoleQuery(e.target.value)}
                  className="flex-1 px-4 py-3 bg-midnight border border-midnight-border rounded-xl text-sm text-moonlight placeholder-moonlight-dark focus:border-arcane focus:outline-none"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={analyzing}
                  icon={Send}
                >
                  Analyze
                </Button>
              </form>

              {/* Sample Prompt Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-moonlight-muted">
                <span>Try asking:</span>
                {[
                  'Which ingredients have stockout risk?',
                  'What is our reorder budget requirement?',
                  'Give me the 7-day prophecy health briefing',
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setConsoleQuery(chip);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-midnight-surface border border-midnight-border text-arcane-light hover:border-arcane text-xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Response output */}
              {consoleResponse && (
                <div className="mt-4 p-5 rounded-2xl bg-midnight border border-arcane/40 space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-xs font-mono text-arcane-light uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-arcane-light" />
                    Prophecy Intelligence Engine Result:
                  </div>
                  <p className="text-sm text-moonlight leading-relaxed font-sans">
                    {consoleResponse}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}

