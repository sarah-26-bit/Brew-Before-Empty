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
} from 'lucide-react';

export default function OverviewPage({ onOpenRecordSale, onOpenRestock }) {
  const { setActiveTab, refreshKey } = useInventory();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getOverview();
      setData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to commune with the SPELLSTOCK backend server. Verify server is listening on port 5001.'
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

  return (
    <div className="space-y-6">
      {/* Curse Warning Banner if active */}
      {curseState?.active && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-curse/20 via-purple-950/40 to-curse/10 border border-curse/50 shadow-curse-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-curse/30 text-curse-light border border-curse/40 shrink-0">
              <Moon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-curse-light flex items-center gap-2">
                <span>{curseState.name} Active</span>
                <Badge variant="curse" size="sm">Phase {curseState.multiplier}x Surge</Badge>
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
            Inspect Curse Crucible
          </Button>
        </div>
      )}

      {/* Primary Alchemical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sanctum Vault Inventory"
          value={`${metrics?.totalStockItems || 0}`}
          subtitle="Reagent units cataloged"
          icon={Boxes}
          variant="arcane"
          trend="+12% vs last cycle"
          trendPositive={true}
          onClick={() => setActiveTab('pantry')}
        />
        <StatCard
          title="Gross Potion Revenue"
          value={`${metrics?.totalSalesRevenue || 0} ⟡`}
          subtitle={`${metrics?.transactionCount || 0} sales recorded`}
          icon={Coins}
          variant="potion"
          trend="Gold Treasury Active"
          trendPositive={true}
          onClick={() => setActiveTab('sales')}
        />
        <StatCard
          title="Low Stock Hazard"
          value={`${metrics?.lowStockCount || 0}`}
          subtitle={`${metrics?.criticalStockCount || 0} critically depleted`}
          icon={AlertTriangle}
          variant={metrics?.lowStockCount > 0 ? 'curse' : 'enchanted'}
          trend={metrics?.lowStockCount > 0 ? 'Requires Restock' : 'Supplies Balanced'}
          trendPositive={metrics?.lowStockCount === 0}
          onClick={() => setActiveTab('restock')}
        />
        <StatCard
          title="Strange Anomalies"
          value={`${metrics?.activeAnomaliesCount || 0}`}
          subtitle="Active spectral disturbances"
          icon={AlertOctagon}
          variant={metrics?.activeAnomaliesCount > 0 ? 'curse' : 'arcane'}
          trend={metrics?.activeAnomaliesCount > 0 ? 'Needs Attention' : 'Wards Intact'}
          trendPositive={metrics?.activeAnomaliesCount === 0}
          onClick={() => setActiveTab('happenings')}
        />
      </div>

      {/* Grid: Low Stock Warnings & Stock Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Warnings Table */}
        <div className="lg:col-span-2">
          <Card
            title="Low-Stock Warnings & Depletion Velocity"
            subtitle="Reagents that have breached their minimum magical preservation threshold"
            action={
              <Button
                variant="primary"
                size="sm"
                icon={Wand2}
                onClick={onOpenRestock}
              >
                Cast Restock Spell
              </Button>
            }
          >
            {lowStockIngredients.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="All Reagent Reserves Are Plentiful"
                description="No items have breached the minimum threshold. Your alchemical storage is fully saturated."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-midnight-border/60 text-moonlight-muted font-mono uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Reagent</th>
                      <th className="pb-3 font-semibold">Current / Min</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Burn Rate</th>
                      <th className="pb-3 font-semibold">Days Left</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-midnight-border/40">
                    {lowStockIngredients.map((ing) => (
                      <tr key={ing.id} className="hover:bg-midnight-card/40 transition-colors">
                        <td className="py-3 font-medium text-moonlight">
                          <div>
                            <span className="text-sm font-semibold">{ing.name}</span>
                            <span className="block text-[10px] text-moonlight-muted font-mono">{ing.category}</span>
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
                            {ing.stockStatus}
                          </Badge>
                        </td>
                        <td className="py-3 font-mono text-moonlight-muted">
                          {ing.effectiveDailyConsumption} {ing.unit}/day
                        </td>
                        <td className="py-3 font-mono">
                          <span className={ing.daysRemaining <= 3 ? 'text-curse-light font-bold' : 'text-moonlight'}>
                            {ing.daysRemaining} days
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
            title="Reserve Saturation"
            subtitle="Current stock levels vs threshold limit"
          >
            <StockLevelBarChart data={lowStockIngredients.length > 0 ? lowStockIngredients : []} height={260} />
          </Card>
        </div>
      </div>

      {/* Recent Activity: Transactions & Strange Happenings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card
          title="Recent Dispensations & Deductions"
          subtitle="Potions dispensed and automatic reagent deductions logged"
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              onClick={() => setActiveTab('sales')}
            >
              View All
            </Button>
          }
        >
          {recentSales.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No Sales Recorded"
              description="Record your first potion sale to initiate the transaction chronicle."
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
                        {sale.customer} • <span className="font-mono">{sale.guild}</span>
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

        {/* Recent Anomalies */}
        <Card
          title="Active Strange Disturbances"
          subtitle="Aetheric fluctuations, seal ruptures and stock decay"
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              onClick={() => setActiveTab('happenings')}
            >
              Examine Log
            </Button>
          }
        >
          {recentAnomalies.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Aetheric Balance Optimal"
              description="No strange happenings detected across the vaults."
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
                        {anom.severity}
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
    </div>
  );
}

