import React, { useState } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { getIngredientArtwork } from '../../assets/illustrations/ingredients';
import { api } from '../../services/api';
import { useInventory } from '../../context/InventoryContext';
import {
  X,
  Plus,
  Minus,
  AlertTriangle,
  Calendar,
  Clock,
  Coins,
  TrendingDown,
  Warehouse,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Edit,
  Trash2
} from 'lucide-react';

export default function IngredientDetailsDrawer({
  ingredient,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) {
  const { showToast, triggerGlobalRefresh } = useInventory();
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('ADD'); // 'ADD' or 'DEDUCT'
  const [adjustReason, setAdjustReason] = useState('Restock Shipment');
  const [adjusting, setAdjusting] = useState(false);

  if (!isOpen || !ingredient) return null;

  const stockRatio = Math.min(100, Math.round((ingredient.currentStock / (ingredient.minThreshold * 2)) * 100));

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    const qty = parseFloat(adjustAmount);
    if (isNaN(qty) || qty <= 0) {
      showToast('Please enter a valid quantity greater than zero.', 'error');
      return;
    }

    const newStock = adjustType === 'ADD' 
      ? ingredient.currentStock + qty 
      : ingredient.currentStock - qty;

    if (newStock < 0) {
      showToast('Cannot reduce stock below zero.', 'error');
      return;
    }

    setAdjusting(true);
    try {
      await api.updateIngredient(ingredient.id, {
        currentStock: newStock,
        notes: `Manual adjustment (${adjustType}): ${qty} ${ingredient.unit} - ${adjustReason}`
      });

      showToast(`Stock updated to ${newStock} ${ingredient.unit}.`, 'success');
      setAdjustAmount('');
      triggerGlobalRefresh();
    } catch (err) {
      showToast('Failed to adjust stock level.', 'error');
    } finally {
      setAdjusting(false);
    }
  };

  // Mock movement timeline based on ingredient attributes
  const recentMovements = [
    {
      id: 'mov-1',
      date: 'Today, 2:15 PM',
      type: 'Consumption',
      qty: `-4 ${ingredient.unit}`,
      reason: 'Potion Brewing Batch',
      balance: `${ingredient.currentStock} ${ingredient.unit}`
    },
    {
      id: 'mov-2',
      date: 'Yesterday, 5:40 PM',
      type: 'Inflow',
      qty: `+20 ${ingredient.unit}`,
      reason: 'Supplier Delivery Approved',
      balance: `${ingredient.currentStock + 4} ${ingredient.unit}`
    },
    {
      id: 'mov-3',
      date: '3 days ago',
      type: 'Audit',
      qty: `0 ${ingredient.unit}`,
      reason: 'Scheduled Inventory Verification',
      balance: `${ingredient.currentStock + 4} ${ingredient.unit}`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity flex justify-end">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="w-full max-w-xl bg-midnight border-l border-midnight-border shadow-2xl flex flex-col h-full overflow-y-auto animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 bg-midnight-card/90 backdrop-blur-md border-b border-midnight-border p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-arcane animate-pulse" />
            <h2 className="text-lg font-serif font-bold text-moonlight">
              Ingredient Dossier
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-moonlight-muted hover:text-moonlight hover:bg-midnight-border/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Main Visual & Key Details Card */}
          <div className="relative rounded-2xl bg-midnight-card border border-midnight-border p-6 overflow-hidden flex flex-col sm:flex-row items-center gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-arcane/10 rounded-full blur-2xl pointer-events-none" />

            {/* Illustration */}
            <div className="w-28 h-28 shrink-0 rounded-2xl bg-midnight border border-arcane/20 flex items-center justify-center p-2 shadow-inner">
              {getIngredientArtwork(ingredient.name, ingredient.category, 'w-24 h-24', ingredient.visualArchetype)}
            </div>

            {/* Name & Metadata */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge variant="arcane" size="sm">
                  {ingredient.category}
                </Badge>
                <Badge
                  variant={
                    ingredient.stockStatus === 'CRITICAL' || ingredient.stockStatus === 'OUT_OF_STOCK'
                      ? 'curse'
                      : ingredient.isLowStock
                      ? 'potion'
                      : 'enchanted'
                  }
                  size="sm"
                >
                  {ingredient.stockStatus === 'CRITICAL' ? 'CRITICAL LEVEL' : ingredient.isLowStock ? 'LOW STOCK' : 'HEALTHY'}
                </Badge>
              </div>

              <h3 className="text-xl font-serif font-bold text-moonlight">
                {ingredient.name}
              </h3>

              <div className="text-xs text-moonlight-muted space-y-1">
                <p>
                  <span className="text-moonlight-dark">Supplier:</span> {ingredient.supplier}
                </p>
                <p>
                  <span className="text-moonlight-dark">Purity Rating:</span> {ingredient.purity || '98.5% Grade A'} • <span className="text-potion-light">{ingredient.rarity || 'Apothecary Essential'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Stock Meter */}
          <div className="p-4 rounded-xl bg-midnight-surface border border-midnight-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-moonlight-muted font-mono uppercase tracking-wider">Inventory Health</span>
              <span className="font-bold text-moonlight font-mono">
                {ingredient.currentStock} / {ingredient.minThreshold * 2} {ingredient.unit} ({stockRatio}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-midnight rounded-full overflow-hidden border border-midnight-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  ingredient.currentStock <= ingredient.minThreshold * 0.5
                    ? 'bg-curse shadow-curse-glow'
                    : ingredient.isLowStock
                    ? 'bg-potion shadow-potion-glow'
                    : 'bg-enchanted shadow-enchanted-glow'
                }`}
                style={{ width: `${stockRatio}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-moonlight-muted">
              <span>Minimum Threshold: {ingredient.minThreshold} {ingredient.unit}</span>
              <span>Daily Usage: ~{ingredient.effectiveDailyConsumption || ingredient.dailyUsageRate || 2} {ingredient.unit}/day</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-midnight-card border border-midnight-border">
              <div className="flex items-center gap-1.5 text-[11px] text-moonlight-muted mb-1">
                <Warehouse className="w-3.5 h-3.5 text-arcane-light" />
                <span>Current Stock</span>
              </div>
              <div className="text-sm font-bold text-moonlight font-mono">
                {ingredient.currentStock} <span className="text-xs font-normal text-moonlight-muted">{ingredient.unit}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-midnight-card border border-midnight-border">
              <div className="flex items-center gap-1.5 text-[11px] text-moonlight-muted mb-1">
                <Clock className="w-3.5 h-3.5 text-potion-light" />
                <span>Days Left</span>
              </div>
              <div className={`text-sm font-bold font-mono ${ingredient.daysRemaining <= 3 ? 'text-curse' : 'text-moonlight'}`}>
                {ingredient.daysRemaining || 12} days
              </div>
            </div>

            <div className="p-3 rounded-xl bg-midnight-card border border-midnight-border">
              <div className="flex items-center gap-1.5 text-[11px] text-moonlight-muted mb-1">
                <Calendar className="w-3.5 h-3.5 text-sage" />
                <span>Stockout Date</span>
              </div>
              <div className="text-xs font-bold text-moonlight font-mono truncate">
                {ingredient.stockoutDate || 'Nov 12, 2026'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-midnight-card border border-midnight-border">
              <div className="flex items-center gap-1.5 text-[11px] text-moonlight-muted mb-1">
                <Coins className="w-3.5 h-3.5 text-potion-light" />
                <span>Unit Cost</span>
              </div>
              <div className="text-sm font-bold text-potion-light font-mono">
                {ingredient.costPerUnit} ⟡
              </div>
            </div>
          </div>

          {/* Quick Adjust Stock Form */}
          <div className="p-4 rounded-xl bg-midnight-card border border-arcane/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-arcane-light" />
                <h4 className="text-sm font-semibold text-moonlight">Quick Stock Adjustment</h4>
              </div>
              <span className="text-[10px] text-moonlight-muted">Updates inventory instantly</span>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3">
              <div className="flex items-center gap-2">
                {/* Add / Deduct Toggle */}
                <div className="flex rounded-lg bg-midnight p-0.5 border border-midnight-border shrink-0">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADD')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                      adjustType === 'ADD'
                        ? 'bg-enchanted/20 text-enchanted-light border border-enchanted/40'
                        : 'text-moonlight-muted hover:text-moonlight'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('DEDUCT')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                      adjustType === 'DEDUCT'
                        ? 'bg-curse/20 text-curse-light border border-curse/40'
                        : 'text-moonlight-muted hover:text-moonlight'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    Deduct
                  </button>
                </div>

                {/* Amount */}
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  placeholder={`Amount (${ingredient.unit})`}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-midnight border border-midnight-border rounded-lg text-sm text-moonlight placeholder-moonlight-dark focus:border-arcane focus:outline-none font-mono"
                  required
                />
              </div>

              {/* Reason */}
              <div className="flex items-center gap-2">
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-midnight border border-midnight-border rounded-lg text-xs text-moonlight focus:border-arcane focus:outline-none"
                >
                  <option value="Restock Shipment">Restock Shipment Received</option>
                  <option value="Customer Sale">Direct Customer Sale</option>
                  <option value="Damage / Spoilage">Spillage or Spoilage</option>
                  <option value="Audit Correction">Physical Inventory Audit</option>
                  <option value="Festival Reserve">Festival Reserve Allocation</option>
                </select>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={adjusting}
                  className="shrink-0"
                >
                  Apply
                </Button>
              </div>
            </form>
          </div>

          {/* Stock Movement Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-moonlight-muted">
              Recent Inventory Activity
            </h4>
            <div className="divide-y divide-midnight-border/50 border border-midnight-border rounded-xl bg-midnight-card/50 overflow-hidden text-xs">
              {recentMovements.map((mov) => (
                <div key={mov.id} className="p-3 flex items-center justify-between hover:bg-midnight/30 transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-moonlight">{mov.reason}</p>
                    <p className="text-[11px] text-moonlight-muted">{mov.date} • Balance: {mov.balance}</p>
                  </div>
                  <span className={`font-mono font-bold ${mov.qty.startsWith('+') ? 'text-enchanted-light' : mov.qty.startsWith('-') ? 'text-curse-light' : 'text-moonlight-muted'}`}>
                    {mov.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="sticky bottom-0 z-20 bg-midnight-card/95 backdrop-blur-md border-t border-midnight-border p-4 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onDelete(ingredient.id, ingredient.name);
            }}
            className="px-3 py-2 text-xs font-semibold text-curse hover:bg-curse/10 border border-curse/20 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(ingredient);
              }}
              icon={Edit}
            >
              Edit Details
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

