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
        'Unable to connect to the SPELLSTOCK backend server. Please verify the server is running on port 5001.'
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
      {/* Seasonal Surge Warning Banner if active */}
      {curseState?.active && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-curse/20 via-purple-950/40 to-curse/10 border border-curse/50 shadow-curse-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-curse/30 text-curse-light border border-curse/40 shrink-0">
              <Moon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-curse-light flex items-center gap-2">
                <span>{curseState.name} (High Demand Event Active)</span>
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
            View Demand Multipliers
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
    </div>
  );
}
