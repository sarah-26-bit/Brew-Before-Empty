import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { getIngredientArtwork, detectArchetype } from '../../assets/illustrations/ingredients';
import { useInventory } from '../../context/InventoryContext';
import { Sparkles, AlertCircle, Palette } from 'lucide-react';

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
    visualArchetype: 'auto',
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
        visualArchetype: ingredientToEdit.visualArchetype || 'auto',
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
        visualArchetype: 'auto',
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
      setError('Please provide a name for this ingredient.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (ingredientToEdit) {
        await api.updateIngredient(ingredientToEdit.id, formData);
        showToast(`Ingredient "${formData.name}" updated successfully!`, 'success');
      } else {
        await api.addIngredient(formData);
        showToast(`Ingredient "${formData.name}" added with custom generated artwork!`, 'success');
      }
      triggerGlobalRefresh();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save ingredient to database.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentArchetype = formData.visualArchetype && formData.visualArchetype !== 'auto'
    ? formData.visualArchetype
    : detectArchetype(formData.name || 'New Ingredient', formData.category);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ingredientToEdit ? 'Edit Ingredient' : 'Add New Ingredient'}
      subtitle={ingredientToEdit ? `Updating stock levels and details for ${ingredientToEdit.name}` : 'Enter the ingredient details below to generate its unique artwork and add it to your inventory'}
      maxWidth="max-w-2xl"
    >
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-curse/15 border border-curse/40 text-curse-light text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* LIVE GENERATED VISUAL PREVIEW CARD */}
        <div className="p-4 rounded-2xl bg-midnight border border-arcane/40 flex items-center gap-4 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-arcane/10 rounded-full blur-2xl pointer-events-none" />

          {/* Real-time artwork preview */}
          <div className="w-16 h-16 rounded-xl bg-midnight-card border border-arcane/50 flex items-center justify-center p-1.5 shrink-0 shadow-lg">
            {getIngredientArtwork(formData.name || 'New Item', formData.category, 'w-14 h-14', formData.visualArchetype)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] uppercase tracking-wider text-arcane-light font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-arcane-light animate-spin" style={{ animationDuration: '8s' }} />
                Unique Generated Artwork
              </span>
              <Badge variant="arcane" size="sm">
                {currentArchetype.toUpperCase()}
              </Badge>
            </div>
            <h4 className="font-serif font-bold text-moonlight text-sm truncate mt-0.5">
              {formData.name || 'Name your ingredient to see its custom illustration'}
            </h4>
            <p className="text-[11px] text-moonlight-muted mt-0.5">
              Unique deterministic illustration generated specifically for this item's identity.
            </p>
          </div>
        </div>

        {/* Name & Visual Archetype */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Ingredient Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Silver Lotus, Obsidian Shard"
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5 flex items-center justify-between">
              <span>Visual Illustration Style</span>
              <span className="text-[10px] text-arcane-light lowercase">procedural SVG</span>
            </label>
            <select
              name="visualArchetype"
              value={formData.visualArchetype}
              onChange={handleChange}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            >
              <option value="auto">Auto-Detect from Name (Recommended)</option>
              <option value="flower">Botanical Flower / Blossom</option>
              <option value="crystal">Crystalline Gem / Mineral</option>
              <option value="flask">Apothecary Flask / Fluid</option>
              <option value="root">Sacred Gnarled Root</option>
              <option value="mushroom">Bioluminescent Mushroom</option>
              <option value="creature">Mythic Creature Relic / Scale</option>
              <option value="celestial">Celestial Starburst / Astral</option>
              <option value="dust">Essence Urn / Incense Dust</option>
              <option value="herb">Botanical Herb Sprig</option>
              <option value="berry">Botanical Berry Cluster</option>
            </select>
          </div>
        </div>

        {/* Category & Item Rarity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Category
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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Item Rarity
            </label>
            <select
              name="rarity"
              value={formData.rarity}
              onChange={handleChange}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            >
              {RARITIES.map((r) => (
                <option key={r} value={r}>
                  {r}
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
              Unit of Measure
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="drams, vials, grams, fl. oz"
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Min Stock (Reorder Point)
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
              Cost per Unit (⟡)
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
              Daily Usage (Avg/Day)
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
              Delivery Time (Days)
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

        {/* Supplier & Purity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Supplier Name
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
              placeholder="e.g. 98.5%"
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight font-mono focus:border-arcane focus:outline-none"
            />
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
            {ingredientToEdit ? 'Save Changes' : 'Add Ingredient & Generate Art'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
