import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import EmptyState from '../components/common/EmptyState';
import RecordSaleModal from '../components/modals/RecordSaleModal';
import { useInventory } from '../context/InventoryContext';
import {
  Receipt,
  Plus,
  Search,
  Sparkles,
  Coins,
  Shield,
  Layers,
  ArrowDownRight,
  User,
} from 'lucide-react';

export default function SalesTransactionsPage({ isRecordModalOpen, setIsRecordModalOpen }) {
  const { refreshKey } = useInventory();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSales();
      setSales(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to commune with the transaction registers on the backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [refreshKey]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalGold, 0);
  const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);
  const avgOrderValue = sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : 0;

  const filteredSales = sales.filter((s) => {
    return (
      s.potionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.guild.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Gold Earned"
          value={`${totalRevenue.toFixed(2)} ⟡`}
          subtitle="Gross alchemical revenue"
          icon={Coins}
          variant="potion"
        />
        <StatCard
          title="Transactions Logged"
          value={`${sales.length}`}
          subtitle={`${totalQuantity} total vials dispensed`}
          icon={Receipt}
          variant="arcane"
        />
        <StatCard
          title="Average Order Value"
          value={`${avgOrderValue} ⟡`}
          subtitle="Per guild transaction"
          icon={Shield}
          variant="enchanted"
        />
      </div>

      {/* Action Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-moonlight-muted" />
          <input
            type="text"
            placeholder="Search transactions by potion, mage, guild, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-midnight-surface border border-midnight-border rounded-xl text-sm text-moonlight placeholder-moonlight-dark focus:border-arcane focus:outline-none transition-colors"
          />
        </div>

        <Button
          variant="potion"
          size="md"
          icon={Plus}
          onClick={() => setIsRecordModalOpen(true)}
          className="shrink-0"
        >
          Record Potion Dispensation
        </Button>
      </div>

      {/* Transactions List */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={fetchSales} />
      ) : filteredSales.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Transactions Logged"
          description={
            searchTerm
              ? 'No sales records match your search criteria.'
              : 'The dispensary ledgers are clear. Record your first sale to activate automatic ingredient deduction.'
          }
          actionLabel="Record New Dispensation"
          onAction={() => setIsRecordModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <Card
              key={sale.id}
              className="p-5 hover:border-potion/40 transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Transaction Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-potion/15 border border-potion/30 flex items-center justify-center text-potion-light shrink-0">
                    <span className="font-mono font-bold text-sm">{sale.quantity}x</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display font-bold text-base text-moonlight group-hover:text-potion-light transition-colors">
                        {sale.potionName}
                      </h4>
                      <Badge variant="potion" size="sm">
                        {sale.id}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-moonlight-muted flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-moonlight-dark" />
                        <strong className="text-moonlight font-medium">{sale.customer}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-arcane-light font-mono">{sale.guild}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">
                        {new Date(sale.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Revenue & Valuation */}
                <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-midnight-border/50">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-moonlight-muted block">
                      Dispensation Total
                    </span>
                    <span className="font-display font-bold text-xl text-potion-light font-mono">
                      +{sale.totalGold.toFixed(2)} ⟡
                    </span>
                  </div>
                </div>
              </div>

              {/* AUTOMATIC STOCK DEDUCTIONS REPORT */}
              <div className="mt-4 pt-3 border-t border-midnight-border/60 bg-midnight-card/40 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
                <div className="flex items-center gap-2 text-xs text-moonlight-muted mb-2">
                  <ArrowDownRight className="w-3.5 h-3.5 text-enchanted-light shrink-0" />
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-enchanted-light">
                    Automated Reagent Stock Deductions:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sale.ingredientsDeducted && sale.ingredientsDeducted.length > 0 ? (
                    sale.ingredientsDeducted.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-midnight-surface border border-midnight-border text-xs font-mono"
                      >
                        <span className="text-curse-light font-bold">-{item.amount} {item.unit}</span>
                        <span className="text-moonlight-muted">{item.ingredientName}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-moonlight-muted italic">
                      Direct inventory balance adjusted.
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Record Sale Modal */}
      <RecordSaleModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
      />
    </div>
  );
}
