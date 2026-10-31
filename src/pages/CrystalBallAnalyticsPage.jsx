import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import DemandForecastChart from '../components/charts/DemandForecastChart';
import CategoryBreakdownChart from '../components/charts/CategoryBreakdownChart';
import { useInventory } from '../context/InventoryContext';
import {
  Sparkles,
  TrendingUp,
  PieChart as PieIcon,
  Award,
  Zap,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function CrystalBallAnalyticsPage() {
  const { refreshKey } = useInventory();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'The Crystal Ball is clouded. Failed to load analytics from backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Prophecy Accuracy"
          value={analytics?.accuracyRate || '94.2%'}
          subtitle="Aetheric confidence quotient"
          icon={Award}
          variant="arcane"
          trend="+2.1% this week"
          trendPositive={true}
        />
        <StatCard
          title="Turnover Velocity"
          value={analytics?.inventoryTurnoverRate || '4.8x'}
          subtitle="Vault replenishment cycle"
          icon={TrendingUp}
          variant="potion"
        />
        <StatCard
          title="Stockout Risk Index"
          value={analytics?.stockoutRiskIndex || '18.4%'}
          subtitle="Sanctum vulnerability metric"
          icon={Zap}
          variant="curse"
        />
        <StatCard
          title="Gross Alchemical Yield"
          value={`${analytics?.totalRevenue || 0} ⟡`}
          subtitle="Accumulated dispensary gold"
          icon={Sparkles}
          variant="enchanted"
        />
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={fetchAnalytics} />
      ) : (
        <>
          {/* Main Chart: Historical versus Predicted Demand */}
          <Card
            title="Historical versus Predicted Demand Horizon"
            subtitle="Evaluating actual historical dispenser consumption against algorithmic future curves"
          >
            <DemandForecastChart data={analytics?.historicalVsPredicted || []} height={320} />
          </Card>

          {/* Grid: Category Breakdown & Top Potions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card
              title="Vault Asset Distribution by Category"
              subtitle="Total gold valuation locked in reagent classifications"
            >
              <CategoryBreakdownChart data={analytics?.categoryBreakdown || []} height={280} />
            </Card>

            {/* Top Performing Potions */}
            <Card
              title="Top Performing Concoctions"
              subtitle="Potions generating highest treasury returns"
            >
              <div className="space-y-3">
                {analytics?.topPotions?.map((potion, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-midnight-card/50 border border-midnight-border/60 hover:border-arcane/40 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-arcane/20 text-arcane-light font-display font-bold text-sm flex items-center justify-center border border-arcane/30">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-moonlight text-sm">
                          {potion.name}
                        </h4>
                        <span className="text-[11px] text-moonlight-muted font-mono">
                          {potion.quantitySold} units dispensed
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-potion-light">
                        +{potion.revenue.toFixed(2)} ⟡
                      </span>
                      <span className="text-[10px] text-moonlight-muted block">
                        Net Revenue
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Historical vs Predicted Variance Breakdown Table */}
          <Card
            title="Forecast Variance Ledger"
            subtitle="Auditing divergence between divine projection and recorded consumption"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-midnight-border/70 text-moonlight-muted uppercase tracking-wider">
                  <tr>
                    <th className="pb-3 font-semibold font-sans">Observation Period</th>
                    <th className="pb-3 font-semibold font-sans">Recorded Demand</th>
                    <th className="pb-3 font-semibold font-sans">Prophesied Value</th>
                    <th className="pb-3 font-semibold font-sans">Aetheric Divergence</th>
                    <th className="pb-3 font-semibold font-sans">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-border/40">
                  {analytics?.historicalVsPredicted?.map((row, i) => (
                    <tr key={i} className="hover:bg-midnight-card/40">
                      <td className="py-2.5 font-sans font-medium text-moonlight">
                        {row.period}
                      </td>
                      <td className="py-2.5">
                        {row.historical !== null ? `${row.historical} units` : '— (Pending)'}
                      </td>
                      <td className="py-2.5 text-potion-light font-bold">
                        {row.predicted} units
                      </td>
                      <td className="py-2.5">
                        <span className="text-enchanted-light font-bold">{row.variance || '±5%'}</span>
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant={row.historical !== null ? 'enchanted' : 'arcane'}
                          size="sm"
                        >
                          {row.historical !== null ? 'VERIFIED' : 'PROJECTED'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

