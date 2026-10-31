import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useInventory } from '../../context/InventoryContext';
import { FlaskConical, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function RecordSaleModal({ isOpen, onClose }) {
  const { showToast, triggerGlobalRefresh } = useInventory();
  const [potions, setPotions] = useState([]);
  const [selectedPotionId, setSelectedPotionId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customer, setCustomer] = useState('');
  const [guild, setGuild] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingPotions, setFetchingPotions] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFetchingPotions(true);
      api.getPotions()
        .then((res) => {
          setPotions(res.data);
          if (res.data.length > 0 && !selectedPotionId) {
            setSelectedPotionId(res.data[0].id);
          }
        })
        .catch(() => {
          setError('Failed to load potion recipes from the backend.');
        })
        .finally(() => {
          setFetchingPotions(false);
        });
    }
  }, [isOpen]);

  const selectedPotion = potions.find((p) => p.id === selectedPotionId);
  const totalCost = selectedPotion ? (selectedPotion.price * quantity).toFixed(2) : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPotionId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.recordSale({
        potionId: selectedPotionId,
        quantity: Number(quantity),
        customer: customer || 'Anonymous Customer',
        guild: guild || 'Direct Customer',
      });

      showToast(`Sale completed! Deducted ingredients for ${quantity}x ${selectedPotion.name}.`, 'success');
      triggerGlobalRefresh();
      onClose();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to record sale. Insufficient ingredients in stock.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Customer Sale"
      subtitle="Select a potion to sell. Required ingredients will be deducted from your inventory automatically."
    >
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-curse/15 border border-curse/40 text-curse-light text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Potion Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
            Select Potion to Sell
          </label>
          <select
            value={selectedPotionId}
            onChange={(e) => setSelectedPotionId(e.target.value)}
            disabled={fetchingPotions || loading}
            className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2.5 text-sm text-moonlight focus:border-arcane focus:outline-none"
          >
            {potions.map((potion) => (
              <option key={potion.id} value={potion.id}>
                {potion.name} — {potion.price} ⟡ (Can make: {potion.maxCraftable} bottles from current stock)
              </option>
            ))}
          </select>
        </div>

        {/* Selected Potion Recipe Breakdown */}
        {selectedPotion && (
          <div className="p-3.5 rounded-xl bg-midnight-card/80 border border-midnight-border/70 text-xs space-y-2">
            <div className="flex items-center justify-between text-moonlight font-medium">
              <span className="flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-potion" />
                Ingredients Required for this Order:
              </span>
              <Badge variant={selectedPotion.maxCraftable >= quantity ? 'enchanted' : 'curse'} size="sm">
                {selectedPotion.maxCraftable >= quantity ? 'In Stock' : 'Not Enough Stock'}
              </Badge>
            </div>
            <div className="space-y-1">
              {selectedPotion.recipe.map((rec, i) => (
                <div key={i} className="flex items-center justify-between text-moonlight-muted">
                  <span>{rec.ingredientName}</span>
                  <span className="font-mono text-moonlight">
                    {(rec.quantity * quantity)} {rec.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quantity and Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Quantity to Sell (Bottles)
            </label>
            <input
              type="number"
              min="1"
              max={selectedPotion ? Math.max(1, selectedPotion.maxCraftable) : 99}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              disabled={loading}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight font-mono focus:border-arcane focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Order Total Price
            </label>
            <div className="w-full bg-midnight-card/50 border border-midnight-border/50 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-potion-light flex items-center">
              {totalCost} ⟡
            </div>
          </div>
        </div>

        {/* Customer & Guild */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Customer Name
            </label>
            <input
              type="text"
              placeholder="e.g. Master Gerald"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              disabled={loading}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Guild / Customer Group
            </label>
            <input
              type="text"
              placeholder="e.g. Arcane Order"
              value={guild}
              onChange={(e) => setGuild(e.target.value)}
              disabled={loading}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-midnight-border/60 flex items-center justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="potion"
            size="md"
            isLoading={loading}
            icon={Sparkles}
            disabled={!selectedPotion || selectedPotion.maxCraftable < quantity}
          >
            Complete Sale & Deduct Stock
          </Button>
        </div>
      </form>
    </Modal>
  );
}
