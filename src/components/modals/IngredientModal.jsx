import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useInventory } from '../../context/InventoryContext';
import { Sparkles, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Mineral & Scales',
  'Celestial Liquids',
  'Ethereal Ash',
  'Botanical Extracts',
  'Necrotic Essence',
  'General Reagents',
];

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythic'];

export default function IngredientModal({ isOpen, onClose, ingredientToEdit = null }) {
  const { showToast, triggerGlobalRefresh } = useInventory();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Mineral & Scales',
    currentStock: 50,
    unit: 'drams',
    minThreshold: 30,
    costPerUnit: 25.0,
    supplier: 'Alchemical Guild',
    purity: '98.0%',
    rarity: 'Common',
    dailyConsumption: 4.0,
    leadTimeDays: 3,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ingredientToEdit) {
      setFormData({
        name: ingredientToEdit.name || '',
        category: ingredientToEdit.category || 'Mineral & Scales',
        currentStock: ingredientToEdit.currentStock ?? 50,
        unit: ingredientToEdit.unit || 'drams',
        minThreshold: ingredientToEdit.minThreshold ?? 30,
        costPerUnit: ingredientToEdit.costPerUnit ?? 25.0,
        supplier: ingredientToEdit.supplier || 'Alchemical Guild',
        purity: ingredientToEdit.purity || '98.0%',
        rarity: ingredientToEdit.rarity || 'Common',
        dailyConsumption: ingredientToEdit.dailyConsumption ?? 4.0,
        leadTimeDays: ingredientToEdit.leadTimeDays ?? 3,
      });
    } else {
      setFormData({
        name: '',
        category: 'Mineral & Scales',
        currentStock: 50,
        unit: 'drams',
        minThreshold: 30,
        costPerUnit: 25.0,
        supplier: 'Alchemical Guild',
        purity: '98.0%',
        rarity: 'Common',
        dailyConsumption: 4.0,
        leadTimeDays: 3,
      });
    }
    setError(null);
  }, [ingredientToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide a name for the reagent.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (ingredientToEdit) {
        await api.updateIngredient(ingredientToEdit.id, formData);
        showToast(`Reagent ${formData.name} updated successfully!`, 'success');
      } else {
        await api.addIngredient(formData);
        showToast(`New reagent ${formData.name} inscribed into the Pantry!`, 'success');
      }
      triggerGlobalRefresh();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save reagent to the database.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ingredientToEdit ? 'Refine Reagent Inscription' : 'Inscribe New Reagent'}
      subtitle={ingredientToEdit ? `Updating properties for ${ingredientToEdit.name}` : 'Add a new element to the SPELLSTOCK inventory'}
      maxWidth="max-w-2xl"
    >
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-curse/15 border border-curse/40 text-curse-light text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Reagent Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Spectral Lotus Petals"
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Reagent Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Stock, Unit, Minimum Safety Threshold */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Current Stock
            </label>
            <input
              type="number"
              name="currentStock"
              min="0"
              value={formData.currentStock}
              onChange={handleChange}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight font-mono focus:border-arcane focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Unit Measure
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="drams, vials, grams"
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Min Threshold
            </label>
            <input
              type="number"
              name="minThreshold"
              min="1"
              value={formData.minThreshold}
              onChange={handleChange}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight font-mono focus:border-arcane focus:outline-none"
            />
          </div>
        </div>

        {/* Cost per unit, Daily Consumption, Lead Time */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Cost / Unit (⟡)
            </label>
            <input
              type="number"
              step="0.1"
              name="costPerUnit"
              min="0"
              value={formData.costPerUnit}
              onChange={handleChange}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight font-mono focus:border-arcane focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Daily Burn Rate
            </label>
            <input
              type="number"
              step="0.1"
              name="dailyConsumption"
              min="0.1"
              value={formData.dailyConsumption}
              onChange={handleChange}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight font-mono focus:border-arcane focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Lead Time (Days)
            </label>
            <input
              type="number"
              name="leadTimeDays"
              min="1"
              value={formData.leadTimeDays}
              onChange={handleChange}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight font-mono focus:border-arcane focus:outline-none"
            />
          </div>
        </div>

        {/* Supplier, Purity, Rarity */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Guild / Supplier
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Purity Grade
            </label>
            <input
              type="text"
              name="purity"
              value={formData.purity}
              onChange={handleChange}
              placeholder="99.5%"
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight font-mono focus:border-arcane focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Arcane Rarity
            </label>
            <select
              name="rarity"
              value={formData.rarity}
              onChange={handleChange}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            >
              {RARITIES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-midnight-border/60 flex items-center justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            icon={Sparkles}
          >
            {ingredientToEdit ? 'Save Inscription' : 'Inscribe Reagent'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
