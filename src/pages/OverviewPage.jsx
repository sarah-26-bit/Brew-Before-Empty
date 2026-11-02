import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import EmptyState from '../components/common/EmptyState';
import StockLevelBarChart from '../components/charts/StockLevelBarChart';
import ReportGeneratorModal from '../components/modals/ReportGeneratorModal';
import { getIngredientArtwork } from '../assets/illustrations/ingredients';
import { ApothecaryLaboratoryBanner } from '../assets/illustrations/scenes';
import { useInventory } from '../context/InventoryContext';
import {
  Boxes,
  Coins,
  AlertTriangle,
  Flame,
  ArrowRight,
  Wand2,
  Clock,
  Sparkles,
  AlertOctagon,
  Moon,
  FileText,
  CheckCircle2,
  ListTodo,
  ShieldCheck,
  TrendingUp,
  Receipt
} from 'lucide-react';

export default function OverviewPage({ onOpenRecordSale, onOpenRestock }) {
  const { setActiveTab, refreshKey } = useInventory();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Daily Quests State (Interactive)
  const [completedQuests, setCompletedQuests] = useState({
    quest1: false,
    quest2: false,
    quest3: false
  });

  const toggleQuest = (id) => {
    setCompletedQuests(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getOverview();
      setData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to connect to the Brew Before Empty backend server. Please verify the server is running on port 5001.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="stats" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LoadingSkeleton type="table" count={5} />
          </div>
          <div>
            <LoadingSkeleton type="card" count={3} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={fetchOverview} />;
  }

  const { metrics, lowStockIngredients = [], recentSales = [], recentAnomalies = [], curseState } = data || {};

  // Dynamic Inventory Health Score (0 - 100)
  // Availability component (up to 40)
  // Buffer safety component (up to 30)
  // Anomaly health component (up to 30)
  const totalItems = metrics?.totalStockItems || 10;
  const lowCount = metrics?.lowStockCount || 0;
  const criticalCount = metrics?.criticalStockCount || 0;
  const anomalyCount = metrics?.activeAnomaliesCount || 0;

  const availabilityScore = Math.max(0, Math.round(40 - (criticalCount * 12 + (lowCount - criticalCount) * 4)));
  const bufferScore = Math.max(0, Math.round(30 - (lowCount * 5)));
  const anomalyScore = Math.max(0, Math.round(30 - (anomalyCount * 10)));
  const healthScore = Math.min(100, Math.max(0, availabilityScore + bufferScore + anomalyScore));

  const getHealthRating = (score) => {
    if (score >= 85) return { label: 'Optimal Inventory Condition', color: 'text-enchanted-light', stroke: '#237A57' };
    if (score >= 65) return { label: 'Moderate Reorder Attention', color: 'text-potion-light', stroke: '#E9A23B' };
    return { label: 'Critical Shortages Detected', color: 'text-curse-light', stroke: '#D65C56' };
  };

  const healthMeta = getHealthRating(healthScore);

  return (
    <div className="space-y-6">
      
      {/* CINEMATIC APOTHECARY BANNER */}
      <div className="relative rounded-3xl overflow-hidden border border-arcane/30 shadow-2xl bg-midnight-card">
        {/* SVG Illustration Background */}
        <ApothecaryLaboratoryBanner className="w-full h-44 sm:h-52 object-cover opacity-80" />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/80 to-transparent flex flex-col justify-between p-6 sm:p-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-arcane animate-ping" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-arcane-light font-bold">
                Grand Master's Chamber
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-moonlight tracking-tight">
              Brew Before Empty Intelligence Core
            </h1>
            <p className="text-xs sm:text-sm text-moonlight-muted max-w-xl">
              Real-time alchemical inventory monitoring, automated consumption deductions, and prophecy forecasting.
            </p>
          </div>

          {/* Quick Action Pills on Banner */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={onOpenRecordSale}
            >
              Record Customer Sale
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={FileText}
              onClick={() => setIsReportModalOpen(true)}
            >
              Generate Audit Report
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Wand2}
              onClick={onOpenRestock}
            >
              Restock Spell
            </Button>
          </div>
        </div>
      </div>

      {/* Seasonal Surge Warning Banner if active */}
      {curseState?.active && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-curse/20 via-midnight-card to-curse/10 border border-curse/50 shadow-curse-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-curse/30 text-curse-light border border-curse/40 shrink-0">
              <Moon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-curse-light flex items-center gap-2">
                <span>{curseState.name} (Festival Surge Active)</span>
                <Badge variant="curse" size="sm">{curseState.multiplier}x Normal Demand</Badge>
              </h4>
              <p className="text-xs text-moonlight-muted mt-0.5">
                {curseState.description}
              </p>
            </div>
          </div>
          <Button
            variant="curse"
            size="sm"
            onClick={() => setActiveTab('curse')}
            className="shrink-0"
          >
            Review Simulation
          </Button>
        </div>
      )}

      {/* Primary Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Items in Stock"
          value={`${metrics?.totalStockItems || 0}`}
          subtitle="Ingredient units available"
          icon={Boxes}
          variant="arcane"
          trend="+12% this week"
          trendPositive={true}
          onClick={() => setActiveTab('pantry')}
        />
        <StatCard
          title="Total Sales Revenue"
          value={`${metrics?.totalSalesRevenue || 0} ⟡`}
          subtitle={`${metrics?.transactionCount || 0} customer orders completed`}
          icon={Coins}
          variant="potion"
          trend="Treasury Active"
          trendPositive={true}
          onClick={() => setActiveTab('sales')}
        />
        <StatCard
          title="Low Stock Warnings"
          value={`${metrics?.lowStockCount || 0}`}
          subtitle={`${metrics?.criticalStockCount || 0} items critically low`}
          icon={AlertTriangle}
          variant={metrics?.lowStockCount > 0 ? 'curse' : 'enchanted'}
          trend={metrics?.lowStockCount > 0 ? 'Needs Reordering' : 'All Stock Healthy'}
          trendPositive={metrics?.lowStockCount === 0}
          onClick={() => setActiveTab('restock')}
        />
        <StatCard
          title="Unusual Activity Alerts"
          value={`${metrics?.activeAnomaliesCount || 0}`}
          subtitle="Consumption spikes or leaks"
          icon={AlertOctagon}
          variant={metrics?.activeAnomaliesCount > 0 ? 'curse' : 'arcane'}
          trend={metrics?.activeAnomaliesCount > 0 ? 'Requires Review' : 'No Active Issues'}
          trendPositive={metrics?.activeAnomaliesCount === 0}
          onClick={() => setActiveTab('happenings')}
        />
      </div>

      {/* HEALTH SCORE & DAILY QUESTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inventory Health Score (0 - 100) */}
        <Card
          title="Inventory Health Score"
          subtitle="Automated weighted index measuring availability, safety buffers, and anomaly risk"
          className="flex flex-col justify-between"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            {/* SVG Circular Progress Meter */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#17251D"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={healthMeta.stroke}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthScore / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-serif font-bold text-moonlight font-mono">
                  {healthScore}
                </span>
                <span className="text-[10px] text-moonlight-muted font-mono uppercase">/ 100</span>
              </div>
            </div>

            {/* Score Breakdown details */}
            <div className="space-y-2 text-xs w-full">
              <div className="flex items-center justify-between">
                <span className="text-moonlight font-semibold">{healthMeta.label}</span>
                <Badge variant={healthScore >= 80 ? 'enchanted' : healthScore >= 60 ? 'potion' : 'curse'} size="sm">
                  {healthScore >= 80 ? 'GRADE A' : healthScore >= 60 ? 'GRADE B' : 'GRADE C'}
                </Badge>
              </div>

              {/* Component breakdown */}
              <div className="space-y-1.5 pt-1 text-[11px] text-moonlight-muted">
                <div className="flex justify-between">
                  <span>Stock Availability:</span>
                  <span className="font-mono text-moonlight">{availabilityScore} / 40 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Safety Stock Buffers:</span>
                  <span className="font-mono text-moonlight">{bufferScore} / 30 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Anomaly Stability:</span>
                  <span className="font-mono text-moonlight">{anomalyScore} / 30 pts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-midnight-border/60 text-[11px] text-moonlight-muted flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-enchanted-light" />
              Dynamic Alchemical Health Model
            </span>
            <button
              onClick={() => setActiveTab('restock')}
              className="text-arcane-light hover:underline font-medium"
            >
              Optimize Score &rarr;
            </button>
          </div>
        </Card>

        {/* Daily Quests Card (Actionable Tasks) */}
        <div className="lg:col-span-2">
          <Card
            title="Daily Alchemical Quests"
            subtitle="Prioritized operational tasks to ensure uninterrupted potion production"
            action={
              <Badge variant="arcane" size="sm">
                {Object.values(completedQuests).filter(Boolean).length} / 3 Completed
              </Badge>
            }
          >
            <div className="space-y-3">
              {/* Quest 1 */}
              <div
                onClick={() => toggleQuest('quest1')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                  completedQuests.quest1
                    ? 'bg-enchanted/10 border-enchanted/30 text-enchanted-light line-through opacity-70'
                    : 'bg-midnight-card/60 border-midnight-border hover:border-arcane/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    completedQuests.quest1 ? 'bg-enchanted border-enchanted text-midnight' : 'border-midnight-border'
                  }`}>
                    {completedQuests.quest1 && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-moonlight">Reorder Critical Stock</p>
                    <p className="text-[11px] text-moonlight-muted">Approve suggested purchase orders for low-stock ingredients before lead-time expiry.</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setActiveTab('restock'); }}>
                  Restock
                </Button>
              </div>

              {/* Quest 2 */}
              <div
                onClick={() => toggleQuest('quest2')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                  completedQuests.quest2
                    ? 'bg-enchanted/10 border-enchanted/30 text-enchanted-light line-through opacity-70'
                    : 'bg-midnight-card/60 border-midnight-border hover:border-arcane/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    completedQuests.quest2 ? 'bg-enchanted border-enchanted text-midnight' : 'border-midnight-border'
                  }`}>
                    {completedQuests.quest2 && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-moonlight">Investigate Consumption Anomalies</p>
                    <p className="text-[11px] text-moonlight-muted">Audit unexpected ingredient drains to rule out physical leaks in Vault Room B.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setActiveTab('happenings'); }}>
                  Review
                </Button>
              </div>

              {/* Quest 3 */}
              <div
                onClick={() => toggleQuest('quest3')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                  completedQuests.quest3
                    ? 'bg-enchanted/10 border-enchanted/30 text-enchanted-light line-through opacity-70'
                    : 'bg-midnight-card/60 border-midnight-border hover:border-arcane/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    completedQuests.quest3 ? 'bg-enchanted border-enchanted text-midnight' : 'border-midnight-border'
                  }`}>
                    {completedQuests.quest3 && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-moonlight">Simulate Festival Demand Surge</p>
                    <p className="text-[11px] text-moonlight-muted">Test 7-day stock resilience under 40% increased potion consumption.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setActiveTab('curse'); }}>
                  Simulate
                </Button>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Grid: Low Stock Warnings & Stock Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Warnings Table */}
        <div className="lg:col-span-2">
          <Card
            title="Low-Stock Warnings & Daily Usage"
            subtitle="Ingredients that have dropped below their minimum safe stock level"
            action={
              <Button
                variant="primary"
                size="sm"
                icon={Wand2}
                onClick={onOpenRestock}
              >
                Restock Low Items
              </Button>
            }
          >
            {lowStockIngredients.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="All Ingredient Levels Are Plentiful"
                description="No items have breached the minimum safety threshold. Your inventory is well stocked."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-midnight-border/60 text-moonlight-muted font-mono uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Ingredient</th>
                      <th className="pb-3 font-semibold">Current / Min Threshold</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Daily Usage (Avg)</th>
                      <th className="pb-3 font-semibold">Stock Left</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-midnight-border/40">
                    {lowStockIngredients.map((ing) => (
                      <tr key={ing.id} className="hover:bg-midnight-card/40 transition-colors">
                        <td className="py-3 font-medium text-moonlight">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-midnight border border-midnight-border flex items-center justify-center p-1 shrink-0">
                              {getIngredientArtwork(ing.name, ing.category, 'w-6 h-6', ing.visualArchetype)}
                            </div>
                            <div>
                              <span className="text-sm font-semibold">{ing.name}</span>
                              <span className="block text-[10px] text-moonlight-muted font-mono">{ing.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 font-mono">
                          <span className={ing.currentStock <= ing.minThreshold * 0.5 ? 'text-curse font-bold' : 'text-potion-light font-bold'}>
                            {ing.currentStock}
                          </span>
                          <span className="text-moonlight-muted"> / {ing.minThreshold} {ing.unit}</span>
                        </td>
                        <td className="py-3">
                          <Badge variant={ing.stockStatus === 'CRITICAL' ? 'curse' : 'potion'} size="sm">
                            {ing.stockStatus === 'CRITICAL' ? 'CRITICAL LOW' : 'LOW STOCK'}
                          </Badge>
                        </td>
                        <td className="py-3 font-mono text-moonlight-muted">
                          {ing.effectiveDailyConsumption} {ing.unit}/day
                        </td>
                        <td className="py-3 font-mono">
                          <span className={ing.daysRemaining <= 3 ? 'text-curse-light font-bold' : 'text-moonlight'}>
                            {ing.daysRemaining} days left
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={onOpenRestock}
                            className="text-xs py-1"
                          >
                            Restock
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Stock Level Bar Chart Preview */}
        <div>
          <Card
            title="Stock vs Minimum Threshold"
            subtitle="Current available stock compared to minimum safety limit"
          >
            <StockLevelBarChart data={lowStockIngredients.length > 0 ? lowStockIngredients : []} height={260} />
          </Card>
        </div>
      </div>

      {/* Recent Activity: Transactions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card
          title="Recent Sales & Stock Deductions"
          subtitle="Potions sold and ingredients automatically deducted from inventory"
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              onClick={() => setActiveTab('sales')}
            >
              View All Sales
            </Button>
          }
        >
          {recentSales.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No Sales Recorded Yet"
              description="Record your first potion sale to begin tracking stock movements."
              actionLabel="Record Sale"
              onAction={onOpenRecordSale}
            />
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3.5 rounded-xl bg-midnight-card/50 border border-midnight-border/60 hover:border-arcane/40 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-potion/20 text-potion-light border border-potion/30 flex items-center justify-center font-bold">
                      {sale.quantity}x
                    </div>
                    <div>
                      <p className="font-semibold text-moonlight text-sm">{sale.potionName}</p>
                      <p className="text-moonlight-muted text-[11px]">
                        Customer: <span className="text-moonlight">{sale.customer}</span> • <span className="font-mono">{sale.guild}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-bold text-potion-light text-sm">
                      +{sale.totalGold} ⟡
                    </p>
                    <p className="text-[10px] text-moonlight-dark font-mono">
                      {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Alerts */}
        <Card
          title="Unusual Activity & Alerts"
          subtitle="Unexpected consumption spikes, leaks, and inventory shortages"
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              onClick={() => setActiveTab('happenings')}
            >
              View All Alerts
            </Button>
          }
        >
          {recentAnomalies.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="All Inventory Systems Normal"
              description="No unusual consumption spikes or discrepancies detected."
            />
          ) : (
            <div className="space-y-3">
              {recentAnomalies.map((anom) => (
                <div
                  key={anom.id}
                  className="p-3.5 rounded-xl bg-midnight-card/50 border border-midnight-border/60 hover:border-curse/40 transition-all flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-moonlight">{anom.title}</span>
                      <Badge variant={anom.severity === 'CRITICAL' ? 'curse' : 'potion'} size="sm">
                        {anom.severity} PRIORITY
                      </Badge>
                    </div>
                    <p className="text-moonlight-muted text-[11px] leading-relaxed">
                      {anom.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Report Generator Modal */}
      <ReportGeneratorModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        data={data}
      />
    </div>
  );
}
