import React from 'react';
import { Menu, Wand2, Receipt, Moon, RefreshCw, Radio } from 'lucide-react';
import Button from '../common/Button';
import { useInventory } from '../../context/InventoryContext';

export default function Header({ onMenuClick, onRecordSaleClick, onRestockClick }) {
  const { activeTab, globalCounts, triggerGlobalRefresh } = useInventory();

  const titles = {
    overview: { title: 'Imperial Command Overview', desc: 'Predict. Prepare. Prosper.' },
    pantry: { title: 'The Potion Pantry', desc: 'Manage vital reagents, stocks, thresholds & purity' },
    sales: { title: 'Sales & Transactions', desc: 'Record potion dispensations & track automated stock deductions' },
    prophecy: { title: 'Prophecy AI Demand Oracle', desc: 'Algorithmic forecasting, stockout hazard projection & spike simulations' },
    restock: { title: 'Restock Spell Incantations', desc: 'Targeted replenishment spells & automated reagent procurement' },
    happenings: { title: 'Strange Happenings', desc: 'Spectral leakage, thermal degradation & stockout anomaly logs' },
    analytics: { title: 'Crystal Ball Analytics', desc: 'Historical vs predicted demand curves, inventory turnover & revenue metrics' },
    curse: { title: 'Midnight Curse Crucible', desc: 'Simulate seasonal demand surges, astral storms & emergency warding' },
    settings: { title: 'Sanctum Alchemical Settings', desc: 'Configure threshold wards, shop identity & database rejuvenation' },
  };

  const current = titles[activeTab] || titles.overview;

  return (
    <header className="sticky top-0 z-30 bg-midnight-500/80 backdrop-blur-xl border-b border-midnight-border/70">
      {/* Active Curse Alert Marquee if active */}
      {globalCounts.curseActive && (
        <div className="bg-curse/15 border-b border-curse/30 px-4 py-1.5 flex items-center justify-between text-xs text-curse-light">
          <div className="flex items-center gap-2 truncate">
            <Moon className="w-3.5 h-3.5 shrink-0 animate-pulse text-curse" />
            <span className="font-semibold uppercase tracking-wider">ASTRAL DISTURBANCE:</span>
            <span className="truncate">{globalCounts.curseName} is accelerating consumption rates!</span>
          </div>
          <span className="text-[11px] font-mono shrink-0 hidden sm:inline-block">Multiplier: +75%</span>
        </div>
      )}

      <div className="px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 lg:hidden text-moonlight-muted hover:text-moonlight hover:bg-midnight-card rounded-xl border border-midnight-border/50"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-moonlight tracking-wide">
              {current.title}
            </h2>
            <p className="text-xs text-moonlight-muted hidden sm:block">
              {current.desc}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={triggerGlobalRefresh}
            title="Refresh Astral Data"
            className="p-2 text-moonlight-muted hover:text-moonlight hover:bg-midnight-card/80 rounded-xl border border-midnight-border/60 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Button
            variant="potion"
            size="sm"
            icon={Receipt}
            onClick={onRecordSaleClick}
            className="hidden sm:inline-flex"
          >
            Record Sale
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Wand2}
            onClick={onRestockClick}
          >
            Cast Restock
          </Button>

          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-midnight-border/60">
            <span className="w-2 h-2 rounded-full bg-enchanted shadow-enchanted-glow animate-pulse" />
            <span className="text-xs font-mono text-moonlight-muted">Core 5001 Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
