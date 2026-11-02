import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { FileText, Printer, Download, Sparkles, CheckCircle2, ShieldCheck, Warehouse, AlertTriangle } from 'lucide-react';

export default function ReportGeneratorModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const { metrics, lowStockIngredients = [], recentSales = [], recentAnomalies = [] } = data;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      title: 'Brew Before Empty Alchemical Inventory Audit Report',
      generatedDate: new Date().toISOString(),
      metrics,
      lowStockIngredients,
      recentSales,
      recentAnomalies
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brew-before-empty-inventory-audit-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Alchemical Inventory Audit & Status Report"
      subtitle={`Generated for Grand Master Apothecary • ${today}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 text-moonlight text-xs print:text-black">
        {/* Report Header Card */}
        <div className="p-4 rounded-xl bg-midnight-card border border-arcane/30 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-arcane-light">Official Audit</span>
            <h3 className="text-base font-serif font-bold text-moonlight">Brew Before Empty Core Inventory Ledger</h3>
            <p className="text-moonlight-muted text-[11px] mt-0.5">Verification status: Authenticated alchemical reserves</p>
          </div>
          <Badge variant="enchanted" size="md">
            Audit Passed
          </Badge>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-midnight border border-midnight-border text-center">
            <span className="text-[10px] text-moonlight-muted uppercase font-mono">Stock Items</span>
            <p className="text-lg font-bold font-mono text-moonlight mt-1">{metrics?.totalStockItems || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-midnight border border-midnight-border text-center">
            <span className="text-[10px] text-moonlight-muted uppercase font-mono">Total Revenue</span>
            <p className="text-lg font-bold font-mono text-potion-light mt-1">{metrics?.totalSalesRevenue || 0} ⟡</p>
          </div>
          <div className="p-3 rounded-xl bg-midnight border border-midnight-border text-center">
            <span className="text-[10px] text-moonlight-muted uppercase font-mono">Low Stock Items</span>
            <p className={`text-lg font-bold font-mono mt-1 ${metrics?.lowStockCount > 0 ? 'text-curse' : 'text-enchanted'}`}>
              {metrics?.lowStockCount || 0}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-midnight border border-midnight-border text-center">
            <span className="text-[10px] text-moonlight-muted uppercase font-mono">Active Anomalies</span>
            <p className={`text-lg font-bold font-mono mt-1 ${metrics?.activeAnomaliesCount > 0 ? 'text-curse' : 'text-enchanted'}`}>
              {metrics?.activeAnomaliesCount || 0}
            </p>
          </div>
        </div>

        {/* Urgent Action Items */}
        <div className="space-y-2">
          <h4 className="font-semibold text-moonlight text-xs font-mono uppercase tracking-wider">
            Critical Attention Required:
          </h4>
          {lowStockIngredients.length === 0 ? (
            <p className="text-enchanted-light italic">No critical shortages. All ingredient reserves exceed safety parameters.</p>
          ) : (
            <div className="divide-y divide-midnight-border border border-midnight-border rounded-xl bg-midnight overflow-hidden">
              {lowStockIngredients.map((item) => (
                <div key={item.id} className="p-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-moonlight">{item.name}</span>
                    <span className="text-moonlight-muted ml-2 font-mono">({item.category})</span>
                  </div>
                  <div className="font-mono text-right">
                    <span className="text-curse font-bold">{item.currentStock} {item.unit}</span>
                    <span className="text-moonlight-muted"> (Min: {item.minThreshold})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-midnight-border flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleDownloadJSON}
            >
              Export JSON
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Printer}
              onClick={handlePrint}
            >
              Print / Save PDF
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

