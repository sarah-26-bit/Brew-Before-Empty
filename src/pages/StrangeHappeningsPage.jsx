import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { useInventory } from '../context/InventoryContext';
import {
  AlertOctagon,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Flame,
  Moon,
  Clock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export default function StrangeHappeningsPage() {
  const { showToast, refreshKey, triggerGlobalRefresh } = useInventory();
  const [anomalies, setAnomalies] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'ACTIVE', 'RESOLVED'

  // New Anomaly Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAnomaly, setNewAnomaly] = useState({
    title: '',
    ingredientId: '',
    severity: 'MEDIUM',
    anomalyType: 'Unexpected Loss / Leak',
    description: '',
  });
  const [resolvingId, setResolvingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [anomRes, ingRes] = await Promise.all([
        api.getAnomalies(),
        api.getIngredients(),
      ]);
      setAnomalies(anomRes.data);
      setIngredients(ingRes.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to load inventory alerts from the backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleResolve = async (id, title) => {
    setResolvingId(id);
    try {
      await api.resolveAnomaly(id, 'Issue inspected and marked resolved by store manager.');
      showToast(`Alert marked as resolved: ${title}`, 'success');
      triggerGlobalRefresh();
    } catch (err) {
      showToast('Failed to resolve alert.', 'error');
    } finally {
      setResolvingId(null);
    }
  };

  const handleCreateAnomaly = async (e) => {
    e.preventDefault();
    if (!newAnomaly.title.trim()) return;

    setSubmitting(true);
    try {
      await api.addAnomaly(newAnomaly);
      showToast(`Inventory alert "${newAnomaly.title}" reported successfully.`, 'warning');
      setIsModalOpen(false);
      setNewAnomaly({
        title: '',
        ingredientId: '',
        severity: 'MEDIUM',
        anomalyType: 'Unexpected Loss / Leak',
        description: '',
      });
      triggerGlobalRefresh();
    } catch (err) {
      showToast('Failed to report inventory issue.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = anomalies.filter((a) => a.status === 'ACTIVE').length;
  const criticalCount = anomalies.filter((a) => a.status === 'ACTIVE' && a.severity === 'CRITICAL').length;
  const resolvedCount = anomalies.filter((a) => a.status === 'RESOLVED').length;

  const filtered = anomalies.filter((a) => {
    if (filterStatus === 'ACTIVE') return a.status === 'ACTIVE';
    if (filterStatus === 'RESOLVED') return a.status === 'RESOLVED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-lg text-moonlight">
            Inventory Alerts & Unusual Activity
          </h3>
          <p className="text-xs text-moonlight-muted mt-0.5">
            Monitors your stock for unexpected consumption spikes, unexplained drops, or spoilage leaks
          </p>
        </div>

        <Button
          variant="curse"
          size="md"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
          className="shrink-0"
        >
          Report Inventory Issue
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Alerts"
          value={`${activeCount}`}
          subtitle="Issues needing review or restocking"
          icon={AlertOctagon}
          variant={activeCount > 0 ? 'curse' : 'enchanted'}
        />
        <StatCard
          title="High Priority Alerts"
          value={`${criticalCount}`}
          subtitle="Severe shortages or massive spikes"
          icon={AlertTriangle}
          variant="curse"
        />
        <StatCard
          title="Resolved Alerts"
          value={`${resolvedCount}`}
          subtitle="Fixed issues in historical record"
          icon={ShieldCheck}
          variant="enchanted"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-midnight-border pb-3">
        {[
          { id: 'ALL', label: 'All Alerts', count: anomalies.length },
          { id: 'ACTIVE', label: 'Active Alerts', count: activeCount },
          { id: 'RESOLVED', label: 'Resolved Alerts', count: resolvedCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              filterStatus === tab.id
                ? 'bg-arcane text-white font-semibold shadow-arcane-sm'
                : 'text-moonlight-muted hover:text-moonlight hover:bg-midnight-surface'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-midnight/40">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Anomalies List */}
      {loading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={fetchData} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Alerts Found"
          description="All ingredient usage and inventory levels are completely normal with no discrepancies."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((anom) => {
            const isActive = anom.status === 'ACTIVE';
            return (
              <Card
                key={anom.id}
                glow={isActive}
                glowColor={anom.severity === 'CRITICAL' ? 'curse' : 'potion'}
                className={`p-5 transition-all ${
                  !isActive ? 'opacity-70 border-midnight-border/40' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Anomaly Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-display font-bold text-base text-moonlight">
                        {anom.title}
                      </h4>
                      <Badge
                        variant={
                          anom.severity === 'CRITICAL'
                            ? 'curse'
                            : anom.severity === 'HIGH'
                            ? 'potion'
                            : 'arcane'
                        }
                        size="sm"
                      >
                        {anom.severity} PRIORITY
                      </Badge>
                      <Badge variant="default" size="sm">
                        {anom.anomalyType}
                      </Badge>
                      <Badge
                        variant={isActive ? 'curse' : 'enchanted'}
                        size="sm"
                      >
                        {isActive ? 'UNRESOLVED' : 'RESOLVED'}
                      </Badge>
                    </div>

                    <p className="text-xs text-moonlight-muted leading-relaxed max-w-3xl">
                      {anom.description}
                    </p>

                    <div className="p-3 rounded-xl bg-midnight-card/80 border border-midnight-border/60 text-xs flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-potion" />
                        <span className="font-semibold text-moonlight">Recommended Action:</span>
                        <span className="text-moonlight-muted">{anom.recommendedAction}</span>
                      </div>
                      {anom.ingredientName && (
                        <span className="font-mono text-[11px] text-arcane-light">
                          Affected Ingredient: {anom.ingredientName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-moonlight-dark font-mono">
                      <span>Detected on: {new Date(anom.detectedAt).toLocaleString()}</span>
                      {anom.resolvedAt && (
                        <span>• Resolved on: {new Date(anom.resolvedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Resolve Button */}
                  <div className="shrink-0 self-start lg:self-center">
                    {isActive ? (
                      <Button
                        variant="enchanted"
                        size="sm"
                        icon={ShieldCheck}
                        isLoading={resolvingId === anom.id}
                        onClick={() => handleResolve(anom.id, anom.title)}
                      >
                        Mark as Resolved
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-enchanted-light text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-enchanted" />
                        <span>Issue Resolved</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Anomaly Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report Inventory Issue or Alert"
        subtitle="Log unexpected stock shortages, leakage, damage, or usage spikes"
      >
        <form onSubmit={handleCreateAnomaly} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Issue Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Spoilage or damaged container in storage room"
              value={newAnomaly.title}
              onChange={(e) => setNewAnomaly({ ...newAnomaly, title: e.target.value })}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
                Priority Level
              </label>
              <select
                value={newAnomaly.severity}
                onChange={(e) => setNewAnomaly({ ...newAnomaly, severity: e.target.value })}
                className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical (Immediate Attention)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
                Issue Category
              </label>
              <select
                value={newAnomaly.anomalyType}
                onChange={(e) => setNewAnomaly({ ...newAnomaly, anomalyType: e.target.value })}
                className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
              >
                <option value="Unexpected Loss / Leak">Unexpected Loss / Leak</option>
                <option value="Stockout Risk">Stockout Risk</option>
                <option value="Storage Temperature / Spoilage">Storage Temperature / Spoilage</option>
                <option value="Usage Spike">Sudden Usage Spike</option>
                <option value="Inventory Discrepancy">Inventory Count Discrepancy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Affected Ingredient (Optional)
            </label>
            <select
              value={newAnomaly.ingredientId}
              onChange={(e) => setNewAnomaly({ ...newAnomaly, ingredientId: e.target.value })}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            >
              <option value="">-- General Storage Area --</option>
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.currentStock} {ing.unit} in stock)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Description & Details
            </label>
            <textarea
              rows="3"
              placeholder="Describe what happened: container broken, unexpected drop in stock, unrecorded usage..."
              value={newAnomaly.description}
              onChange={(e) => setNewAnomaly({ ...newAnomaly, description: e.target.value })}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-midnight-border/60 flex items-center justify-end gap-3">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="curse"
              size="md"
              isLoading={submitting}
            >
              Submit Issue Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
