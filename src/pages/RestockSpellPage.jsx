import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import EmptyState from '../components/common/EmptyState';
import { getIngredientArtwork } from '../assets/illustrations/ingredients';
import { useInventory } from '../context/InventoryContext';
import {
  Wand2,
  Sparkles,
  Coins,
  CheckCircle2,
  PackageCheck,
  Truck,
  ShieldCheck,
  Flame,
  ArrowRight,
} from 'lucide-react';

export default function RestockSpellPage() {
  const { showToast, refreshKey, triggerGlobalRefresh } = useInventory();
  const [restockData, setRestockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected items & custom quantities
  const [selectedIds, setSelectedIds] = useState([]);
  const [customQuantities, setCustomQuantities] = useState({});
  const [casting, setCasting] = useState(false);
  const [restockSuccessData, setRestockSuccessData] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRestockRecommendations();
      setRestockData(res.data);
      // Default: select all recommended items
      const allIds = res.data.recommendations.map((r) => r.id);
      setSelectedIds(allIds);

      // Prepopulate quantities
      const initialQty = {};
      res.data.recommendations.forEach((r) => {
        initialQty[r.id] = r.suggestedRestockQty;
      });
      setCustomQuantities(initialQty);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to load restock recommendations from the backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [refreshKey]);

  const toggleSelectAll = () => {
    if (!restockData?.recommendations) return;
    if (selectedIds.length === restockData.recommendations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(restockData.recommendations.map((r) => r.id));
    }
  };

  const toggleSelectItem = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleQuantityChange = (id, val) => {
    setCustomQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, Number(val)),
    }));
  };

  const calculateTotalCost = () => {
    if (!restockData?.recommendations) return 0;
    return restockData.recommendations
      .filter((r) => selectedIds.includes(r.id))
      .reduce((sum, r) => {
        const qty = customQuantities[r.id] !== undefined ? customQuantities[r.id] : r.suggestedRestockQty;
        return sum + (qty * r.costPerUnit);
      }, 0);
  };

  const handleCastRestockSpell = async () => {
    if (selectedIds.length === 0) {
      showToast('Please select at least one ingredient to restock.', 'warning');
      return;
    }

    setCasting(true);
    try {
      const res = await api.executeRestock({
        ingredientIds: selectedIds,
        customAmounts: customQuantities,
      });

      setRestockSuccessData(res.data);
      showToast(`Restock successful! Replenished ${res.data.itemsRestocked} ingredients.`, 'success');

      // Trigger celebratory magical confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#FF8A32', '#78D66B', '#F3EBDD'],
        });
      } catch (e) {
        // Confetti optional
      }

      triggerGlobalRefresh();
    } catch (err) {
      showToast('Restock failed to execute. Check backend connection.', 'error');
    } finally {
      setCasting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Restock Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-midnight-surface to-enchanted/15 border border-arcane/40 shadow-arcane-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-arcane to-enchanted p-0.5 shadow-arcane-sm flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-midnight rounded-[14px] flex items-center justify-center text-enchanted-light">
              <Wand2 className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-moonlight flex items-center gap-2">
              <span>Smart Inventory Restocking</span>
              <Badge variant="enchanted" size="sm">Ready to Restock</Badge>
            </h3>
            <p className="text-xs text-moonlight-muted mt-1 max-w-xl">
              Calculates recommended order amounts based on daily customer demand and supplier delivery times. Click "Restock Selected Items" to add them directly to your inventory.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={Wand2}
          isLoading={casting}
          disabled={selectedIds.length === 0}
          onClick={handleCastRestockSpell}
          className="shrink-0"
        >
          Restock Selected Items
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Items Needing Reorder"
          value={`${restockData?.totalRecommendations || 0}`}
          subtitle="Stock below minimum safe buffer"
          icon={PackageCheck}
          variant="potion"
        />
        <StatCard
          title="Items Selected"
          value={`${selectedIds.length} ingredients`}
          subtitle="Ready to be added to inventory"
          icon={Truck}
          variant="arcane"
        />
        <StatCard
          title="Total Estimated Cost"
          value={`${calculateTotalCost().toFixed(2)} ⟡`}
          subtitle="Estimated supplier payment"
          icon={Coins}
          variant="enchanted"
        />
      </div>

      {/* Successful Restock Report Banner */}
      {restockSuccessData && (
        <div className="p-4 rounded-2xl bg-enchanted/15 border border-enchanted/40 text-enchanted-light shadow-enchanted-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-enchanted" />
            <div>
              <p className="font-semibold text-sm text-moonlight">
                Restock Complete!
              </p>
              <p className="text-xs text-moonlight-muted mt-0.5">
                Successfully added stock for {restockSuccessData.itemsRestocked} ingredients totaling {restockSuccessData.totalCost} ⟡. All corresponding low-stock warnings have been resolved.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRestockSuccessData(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Recommendations Table */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={fetchRecommendations} />
      ) : !restockData?.recommendations || restockData.recommendations.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="All Stock Levels Are Sufficient"
          description="None of your ingredients need restocking right now. All items safely exceed their minimum threshold."
        />
      ) : (
        <Card
          title="Restocking Recommendations"
          subtitle="Calculated from average daily usage, supplier delivery lead times, and required buffer stock"
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleSelectAll}
            >
              {selectedIds.length === restockData.recommendations.length ? 'Deselect All' : 'Select All'}
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-midnight-border/70 text-moonlight-muted font-mono uppercase tracking-wider">
                <tr>
                  <th className="pb-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === restockData.recommendations.length}
                      onChange={toggleSelectAll}
                      className="accent-arcane rounded"
                    />
                  </th>
                  <th className="pb-3 font-semibold">Ingredient</th>
                  <th className="pb-3 font-semibold">Current / Min Threshold</th>
                  <th className="pb-3 font-semibold">Priority</th>
                  <th className="pb-3 font-semibold">Supplier Delivery Time</th>
                  <th className="pb-3 font-semibold">Suggested Order Amount</th>
                  <th className="pb-3 font-semibold">Price / Unit</th>
                  <th className="pb-3 font-semibold">Estimated Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-border/40 font-mono">
                {restockData.recommendations.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const currentQty = customQuantities[item.id] !== undefined ? customQuantities[item.id] : item.suggestedRestockQty;
                  const itemCost = (currentQty * item.costPerUnit).toFixed(2);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-midnight-card/40 transition-colors ${
                        isSelected ? 'bg-midnight-card/25' : 'opacity-60'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectItem(item.id)}
                          className="accent-arcane rounded"
                        />
                      </td>

                      {/* Name & Supplier with Artwork */}
                      <td className="py-3.5 font-sans font-medium text-moonlight">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-midnight border border-midnight-border flex items-center justify-center p-1 shrink-0">
                            {getIngredientArtwork(item.name, item.category, 'w-8 h-8', item.visualArchetype)}
                          </div>
                          <div>
                            <span className="font-semibold text-sm">{item.name}</span>
                            <span className="block text-[10px] text-moonlight-muted font-mono">
                              Supplier: {item.supplier}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Current vs Min */}
                      <td className="py-3.5">
                        <span className="text-curse font-bold">{item.currentStock}</span>
                        <span className="text-moonlight-muted"> / {item.minThreshold} {item.unit}</span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5">
                        <Badge
                          variant={
                            item.urgency === 'CRITICAL'
                              ? 'curse'
                              : item.urgency === 'HIGH'
                              ? 'potion'
                              : 'arcane'
                          }
                          size="sm"
                        >
                          {item.urgency} PRIORITY
                        </Badge>
                      </td>

                      {/* Lead Time */}
                      <td className="py-3.5 text-moonlight-muted">
                        {item.leadTimeDays} days delivery
                      </td>

                      {/* Quantity Input */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5 w-28">
                          <input
                            type="number"
                            min="1"
                            value={currentQty}
                            disabled={!isSelected}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-16 px-2 py-1 bg-midnight-surface border border-midnight-border rounded-lg text-xs font-mono text-moonlight focus:border-arcane focus:outline-none"
                          />
                          <span className="text-[10px] text-moonlight-muted">{item.unit}</span>
                        </div>
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3.5 text-moonlight-muted">
                        {item.costPerUnit} ⟡
                      </td>

                      {/* Estimated Total */}
                      <td className="py-3.5 font-bold text-potion-light">
                        {itemCost} ⟡
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
