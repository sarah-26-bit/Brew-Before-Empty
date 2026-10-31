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
    anomalyType: 'Spectral Leakage',
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
        'Failed to observe strange happenings from the backend telemetry.'
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
      await api.resolveAnomaly(id, 'Purification ward applied by the Grand Magister.');
      showToast(`Ward etched! Anomaly resolved: ${title}`, 'success');
      triggerGlobalRefresh();
    } catch (err) {
      showToast('Failed to resolve anomaly.', 'error');
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
      showToast(`Astral anomaly "${newAnomaly.title}" logged in Sanctum registry.`, 'warning');
      setIsModalOpen(false);
      setNewAnomaly({
        title: '',
        ingredientId: '',
        severity: 'MEDIUM',
        anomalyType: 'Spectral Leakage',
        description: '',
      });
      triggerGlobalRefresh();
    } catch (err) {
      showToast('Failed to report anomaly.', 'error');
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
            Astral & Vault Telemetry
          </h3>
          <p className="text-xs text-moonlight-muted mt-0.5">
            Detecting supernatural leakage, sudden consumption surges, and environmental decay
          </p>
        </div>

        <Button
          variant="curse"
          size="md"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
          className="shrink-0"
        >
          Report Strange Disturbance
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Disturbances"
          value={`${activeCount}`}
          subtitle="Requiring warding or restock"
          icon={AlertOctagon}
          variant={activeCount > 0 ? 'curse' : 'enchanted'}
        />
        <StatCard
          title="Critical Emergencies"
          value={`${criticalCount}`}
          subtitle="Severe vault integrity hazards"
          icon={AlertTriangle}
          variant="curse"
        />
        <StatCard
          title="Wards Applied"
          value={`${resolvedCount}`}
          subtitle="Resolved disturbances on record"
          icon={ShieldCheck}
          variant="enchanted"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-midnight-border pb-3">
        {[
          { id: 'ALL', label: 'All Disturbances', count: anomalies.length },
          { id: 'ACTIVE', label: 'Active Hazards', count: activeCount },
          { id: 'RESOLVED', label: 'Resolved Wards', count: resolvedCount },
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
          title="No Disturbances In Selected Realm"
          description="All storage runes and vault wards are holding firm against spectral decay."
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
                        {anom.severity}
                      </Badge>
                      <Badge variant="default" size="sm">
                        {anom.anomalyType}
                      </Badge>
                      <Badge
                        variant={isActive ? 'curse' : 'enchanted'}
                        size="sm"
                      >
                        {anom.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-moonlight-muted leading-relaxed max-w-3xl">
                      {anom.description}
                    </p>

                    <div className="p-3 rounded-xl bg-midnight-card/80 border border-midnight-border/60 text-xs flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-potion" />
                        <span className="font-semibold text-moonlight">Recommended Ward:</span>
                        <span className="text-moonlight-muted">{anom.recommendedAction}</span>
                      </div>
                      {anom.ingredientName && (
                        <span className="font-mono text-[11px] text-arcane-light">
                          Target Reagent: {anom.ingredientName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-moonlight-dark font-mono">
                      <span>Detected: {new Date(anom.detectedAt).toLocaleString()}</span>
                      {anom.resolvedAt && (
                        <span>• Resolved: {new Date(anom.resolvedAt).toLocaleString()}</span>
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
                        Apply Warding Charm
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-enchanted-light text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-enchanted" />
                        <span>Warded & Stabilized</span>
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
        title="Report Strange Astral Disturbance"
        subtitle="Log unexpected vault fluctuations or suspicious inventory shrinkage"
      >
        <form onSubmit={handleCreateAnomaly} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Disturbance Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Spectral Spoilage in Cabinet 4"
              value={newAnomaly.title}
              onChange={(e) => setNewAnomaly({ ...newAnomaly, title: e.target.value })}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
                Severity Level
              </label>
              <select
                value={newAnomaly.severity}
                onChange={(e) => setNewAnomaly({ ...newAnomaly, severity: e.target.value })}
                className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
                Anomaly Type
              </label>
              <select
                value={newAnomaly.anomalyType}
                onChange={(e) => setNewAnomaly({ ...newAnomaly, anomalyType: e.target.value })}
                className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
              >
                <option value="Spectral Leakage">Spectral Leakage</option>
                <option value="Stockout Risk">Stockout Risk</option>
                <option value="Thermal Degradation">Thermal Degradation</option>
                <option value="Aetheric Disturbance">Aetheric Disturbance</option>
                <option value="Ghostly Depletion">Ghostly Depletion</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Afflicted Reagent (Optional)
            </label>
            <select
              value={newAnomaly.ingredientId}
              onChange={(e) => setNewAnomaly({ ...newAnomaly, ingredientId: e.target.value })}
              className="w-full bg-midnight-card border border-midnight-border rounded-xl px-3.5 py-2 text-sm text-moonlight focus:border-arcane focus:outline-none"
            >
              <option value="">-- General Vault Environment --</option>
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.currentStock} {ing.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-moonlight-muted mb-1.5">
              Observations & Visual Symptoms
            </label>
            <textarea
              rows="3"
              placeholder="Describe frost formation, strange luminescence, rapid weight loss..."
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
              Submit Disturbance Log
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
