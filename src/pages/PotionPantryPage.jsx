import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import EmptyState from '../components/common/EmptyState';
import IngredientModal from '../components/modals/IngredientModal';
import IngredientDetailsDrawer from '../components/pantry/IngredientDetailsDrawer';
import { getIngredientArtwork } from '../assets/illustrations/ingredients';
import { useInventory } from '../context/InventoryContext';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  LayoutGrid,
  List,
  Eye,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export default function PotionPantryPage() {
  const { showToast, refreshKey, triggerGlobalRefresh } = useInventory();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View Mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [drawerIngredient, setDrawerIngredient] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchIngredients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getIngredients();
      setIngredients(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to load ingredients from the Brew Before Empty backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [refreshKey]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name} from your inventory?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteIngredient(id);
      showToast(`${name} removed from inventory.`, 'info');
      triggerGlobalRefresh();
    } catch (err) {
      showToast('Failed to delete ingredient.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (ing) => {
    setEditingIngredient(ing);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingIngredient(null);
    setIsModalOpen(true);
  };

  const handleOpenDrawer = (ing) => {
    setDrawerIngredient(ing);
  };

  // Categories list
  const categories = ['ALL', ...new Set(ingredients.map((i) => i.category))];

  // Filtered ingredients
  const filtered = ingredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ing.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ing.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || ing.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'LOW' && ing.isLowStock) ||
      (selectedStatus === 'CRITICAL' && (ing.stockStatus === 'CRITICAL' || ing.stockStatus === 'OUT_OF_STOCK')) ||
      (selectedStatus === 'HEALTHY' && !ing.isLowStock);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar: Search, View Switcher, Add Ingredient */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-moonlight-muted" />
          <input
            type="text"
            placeholder="Search by ingredient name, supplier, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-midnight-surface border border-midnight-border rounded-xl text-sm text-moonlight placeholder-moonlight-dark focus:border-arcane focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Grid / Table Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-midnight-surface border border-midnight-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-midnight-card text-arcane-light shadow-sm'
                  : 'text-moonlight-muted hover:text-moonlight'
              }`}
              title="Gallery Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-midnight-card text-arcane-light shadow-sm'
                  : 'text-moonlight-muted hover:text-moonlight'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Ingredient Button */}
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleAddNew}
            className="shrink-0"
          >
            Add New Ingredient
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                selectedCategory === cat
                  ? 'bg-arcane text-white border-arcane shadow-arcane-sm font-semibold'
                  : 'bg-midnight-surface text-moonlight-muted border-midnight-border hover:border-arcane/40'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-midnight-surface p-1 rounded-xl border border-midnight-border">
          {[
            { id: 'ALL', label: 'All Status' },
            { id: 'LOW', label: 'Low Stock' },
            { id: 'CRITICAL', label: 'Critical' },
            { id: 'HEALTHY', label: 'Healthy' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-medium ${
                selectedStatus === st.id
                  ? 'bg-midnight-card text-moonlight border border-midnight-border/80 shadow-sm font-semibold'
                  : 'text-moonlight-muted hover:text-moonlight'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSkeleton type={viewMode === 'grid' ? 'cards' : 'table'} count={6} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={fetchIngredients} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No Ingredients Found"
          description={
            searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No ingredients match your current search and filter settings.'
              : 'Your inventory vault is currently empty. Click "Add New Ingredient" to get started.'
          }
          actionLabel={searchTerm ? 'Clear Search' : 'Add First Ingredient'}
          onAction={() => {
            if (searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') {
              setSearchTerm('');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
            } else {
              handleAddNew();
            }
          }}
        />
      ) : viewMode === 'grid' ? (
        /* GALLERY GRID VIEW (Pictorial rich presentation) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((ing) => {
            const stockRatio = Math.min(100, Math.round((ing.currentStock / (ing.minThreshold * 2)) * 100));
            const isCritical = ing.stockStatus === 'CRITICAL' || ing.stockStatus === 'OUT_OF_STOCK';

            return (
              <div
                key={ing.id}
                onClick={() => handleOpenDrawer(ing)}
                className="group relative rounded-2xl bg-midnight-card border border-midnight-border hover:border-arcane/60 p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Ambient Card Background Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-arcane/5 group-hover:bg-arcane/15 rounded-full blur-2xl transition-colors pointer-events-none" />

                {/* Top Bar: Category & Status */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="arcane" size="sm">
                      {ing.category}
                    </Badge>
                    <Badge
                      variant={
                        isCritical
                          ? 'curse'
                          : ing.isLowStock
                          ? 'potion'
                          : 'enchanted'
                      }
                      size="sm"
                    >
                      {isCritical ? 'CRITICAL' : ing.isLowStock ? 'LOW STOCK' : 'HEALTHY'}
                    </Badge>
                  </div>

                  {/* Realistic Illustration Centrepiece */}
                  <div className="w-full h-32 rounded-xl bg-midnight/70 border border-midnight-border/80 flex items-center justify-center p-2 mb-3 group-hover:border-arcane/30 transition-all">
                    {getIngredientArtwork(ing.name, ing.category, 'w-24 h-24 transition-transform duration-300 group-hover:scale-105', ing.visualArchetype)}
                  </div>

                  {/* Name and Supplier */}
                  <h3 className="text-base font-serif font-bold text-moonlight group-hover:text-arcane-light transition-colors line-clamp-1">
                    {ing.name}
                  </h3>
                  <p className="text-[11px] text-moonlight-muted mt-0.5 truncate">
                    Supplier: {ing.supplier}
                  </p>
                </div>

                {/* Stock Meter & Numbers */}
                <div className="mt-4 pt-3 border-t border-midnight-border/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-moonlight-muted">Quantity:</span>
                    <span className={`font-bold ${ing.isLowStock ? 'text-curse' : 'text-moonlight'}`}>
                      {ing.currentStock} {ing.unit}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-1.5 bg-midnight rounded-full overflow-hidden border border-midnight-border/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ing.currentStock <= ing.minThreshold * 0.5
                          ? 'bg-curse shadow-curse-glow'
                          : ing.isLowStock
                          ? 'bg-potion shadow-potion-glow'
                          : 'bg-enchanted shadow-enchanted-glow'
                      }`}
                      style={{ width: `${stockRatio}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-moonlight-muted pt-1">
                    <span>
                      {ing.daysRemaining !== undefined ? `${ing.daysRemaining} days left` : `Safe min: ${ing.minThreshold}`}
                    </span>
                    <span className="font-mono text-potion-light font-semibold">
                      {ing.costPerUnit} ⟡
                    </span>
                  </div>

                  {/* Hover Quick Actions */}
                  <div className="pt-2 flex items-center justify-between gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDrawer(ing);
                      }}
                      className="text-[11px] text-arcane-light hover:text-white flex items-center gap-1 font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Dossier
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(ing);
                        }}
                        className="p-1 text-moonlight-muted hover:text-arcane-light rounded"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(ing.id, ing.name);
                        }}
                        className="p-1 text-moonlight-muted hover:text-curse rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (Upgraded with illustration thumbnails) */
        <Card headerBorder={false} className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-midnight-card/80 border-b border-midnight-border text-moonlight-muted font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Ingredient</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Current Stock Level</th>
                  <th className="py-3.5 px-4 font-semibold">Stock Status</th>
                  <th className="py-3.5 px-4 font-semibold">Daily Usage (Avg)</th>
                  <th className="py-3.5 px-4 font-semibold">Runs Out In</th>
                  <th className="py-3.5 px-4 font-semibold">Unit Price</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-border/40">
                {filtered.map((ing) => {
                  const stockRatio = Math.min(100, Math.round((ing.currentStock / (ing.minThreshold * 2)) * 100));
                  return (
                    <tr
                      key={ing.id}
                      onClick={() => handleOpenDrawer(ing)}
                      className="hover:bg-midnight-card/40 transition-colors group cursor-pointer"
                    >
                      {/* Name & Artwork Thumbnail */}
                      <td className="py-3 px-4 font-medium text-moonlight">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-midnight border border-midnight-border/80 flex items-center justify-center p-1 shrink-0">
                            {getIngredientArtwork(ing.name, ing.category, 'w-8 h-8', ing.visualArchetype)}
                          </div>
                          <div>
                            <span className="text-sm font-semibold group-hover:text-arcane-light transition-colors">
                              {ing.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-moonlight-muted">
                              <span className="font-mono">Purity: {ing.purity}</span>
                              <span>•</span>
                              <span className="text-potion-light">{ing.rarity}</span>
                              <span>•</span>
                              <span>Supplier: {ing.supplier}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-mono text-moonlight-muted">
                        <span className="px-2 py-0.5 rounded-md bg-midnight-card border border-midnight-border text-[11px]">
                          {ing.category}
                        </span>
                      </td>

                      {/* Stock Level with Progress Bar */}
                      <td className="py-3 px-4 font-mono">
                        <div className="space-y-1.5 w-36">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={`font-bold ${ing.isLowStock ? 'text-curse' : 'text-moonlight'}`}>
                              {ing.currentStock} {ing.unit}
                            </span>
                            <span className="text-moonlight-muted text-[10px]">
                              min: {ing.minThreshold}
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-midnight-border rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                ing.currentStock <= ing.minThreshold * 0.5
                                  ? 'bg-curse shadow-curse-glow'
                                  : ing.isLowStock
                                  ? 'bg-potion shadow-potion-glow'
                                  : 'bg-enchanted shadow-enchanted-glow'
                              }`}
                              style={{ width: `${stockRatio}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Warning Badge */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            ing.stockStatus === 'CRITICAL' || ing.stockStatus === 'OUT_OF_STOCK'
                              ? 'curse'
                              : ing.stockStatus === 'LOW'
                              ? 'potion'
                              : 'enchanted'
                          }
                          size="sm"
                        >
                          {ing.stockStatus === 'CRITICAL' ? 'CRITICAL LOW' : ing.stockStatus === 'LOW' ? 'LOW STOCK' : 'HEALTHY'}
                        </Badge>
                      </td>

                      {/* Daily Consumption */}
                      <td className="py-3 px-4 font-mono text-moonlight-muted">
                        <span>{ing.effectiveDailyConsumption} {ing.unit}/day</span>
                      </td>

                      {/* Days Remaining & Stockout Date */}
                      <td className="py-3 px-4 font-mono">
                        <div className="text-[11px]">
                          <span
                            className={`font-semibold ${
                              ing.daysRemaining <= 3 ? 'text-curse-light' : 'text-moonlight'
                            }`}
                          >
                            {ing.daysRemaining} days left
                          </span>
                          <span className="block text-[10px] text-moonlight-muted">
                            Out on: {ing.stockoutDate}
                          </span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 font-mono text-moonlight">
                        <span className="font-semibold text-potion-light">
                          {ing.costPerUnit} ⟡
                        </span>
                        <span className="text-[10px] text-moonlight-muted block">
                          Total: {(ing.currentStock * ing.costPerUnit).toFixed(0)} ⟡
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEdit(ing)}
                            title="Edit Ingredient"
                            className="p-1.5 text-moonlight-muted hover:text-arcane-light hover:bg-midnight-border/50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ing.id, ing.name)}
                            disabled={deletingId === ing.id}
                            title="Delete Ingredient"
                            className="p-1.5 text-moonlight-muted hover:text-curse hover:bg-midnight-border/50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Ingredient Details Drawer */}
      <IngredientDetailsDrawer
        ingredient={drawerIngredient}
        isOpen={Boolean(drawerIngredient)}
        onClose={() => setDrawerIngredient(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Ingredient Add/Edit Modal */}
      <IngredientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ingredientToEdit={editingIngredient}
      />
    </div>
  );
}
