import React from 'react';
import { Menu, Wand2, Receipt, Moon, RefreshCw, LogOut, User } from 'lucide-react';
import Button from '../common/Button';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onMenuClick, onRecordSaleClick, onRestockClick }) {
  const { activeTab, globalCounts, triggerGlobalRefresh } = useInventory();
  const { user, profile, logout, devGuestMode } = useAuth();

  const titles = {
    overview: {
      title: 'Store Overview & Dashboard',
      desc: 'Predict demand. Prepare inventory. Prosper effortlessly.',
    },
    pantry: {
      title: 'Potion Pantry (Ingredients)',
      desc: 'View, add, edit, and track ingredient stock levels and reorder alerts.',
    },
    sales: {
      title: 'Sales & Transactions',
      desc: 'Record customer purchases and watch ingredient stock deduct automatically.',
    },
    prophecy: {
      title: 'Prophecy AI Demand Forecasting',
      desc: 'Smart 7 to 14-day forecasts, stockout dates, and seasonal spike simulation.',
    },
    intelligence: {
      title: 'Apothecary Intelligence Centre',
      desc: 'Predictive forecasting, statistical consumption anomalies, and procurement advice.',
    },
    restock: {
      title: 'Smart Restock Recommendations',
      desc: 'Calculate exact order amounts based on daily usage and supplier delivery time.',
    },
    happenings: {
      title: 'Unusual Activity & Alerts (Strange Happenings)',
      desc: 'Automatic detection of sudden usage spikes, stock leaks, and shortages.',
    },
    analytics: {
      title: 'Analytics & Trends (Crystal Ball)',
      desc: 'Historical usage vs predicted demand, top-selling potions, and turnover rates.',
    },
    curse: {
      title: 'Seasonal Demand Spikes (Midnight Curse)',
      desc: 'Simulate festival rushes and peak seasons to see which items run out first.',
    },
    settings: {
      title: 'Store Settings & Data',
      desc: 'Customize your shop name, currency, reorder thresholds, or reset demo data.',
    },
  };

  const current = titles[activeTab] || titles.overview;

  return (
    <header className="sticky top-0 z-30 bg-midnight-500/80 backdrop-blur-xl border-b border-midnight-border/70">
      {/* Active Seasonal Surge Banner if active */}
      {globalCounts.curseActive && (
        <div className="bg-curse/15 border-b border-curse/30 px-4 py-1.5 flex items-center justify-between text-xs text-curse-light">
          <div className="flex items-center gap-2 truncate">
            <Moon className="w-3.5 h-3.5 shrink-0 animate-pulse text-curse" />
            <span className="font-semibold uppercase tracking-wider">SEASONAL DEMAND SURGE ACTIVE:</span>
            <span className="truncate">{globalCounts.curseName} is accelerating customer demand (+75%).</span>
          </div>
          <span className="text-[11px] font-mono shrink-0 hidden sm:inline-block">Multiplier: 1.75x</span>
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
            title="Refresh Inventory Data"
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
            Restock Items
          </Button>

          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-midnight-border/60">
            <span className="w-2 h-2 rounded-full bg-enchanted shadow-enchanted-glow animate-pulse" />
            <span className="text-xs font-mono text-moonlight-muted">System Connected</span>
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-midnight-border/60">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-serif font-bold text-warm-ivory leading-tight truncate max-w-[130px]">
                {profile?.full_name || user?.user_metadata?.full_name || (devGuestMode ? 'Guest Alchemist' : 'Alchemist')}
              </span>
              <span className="text-[10px] text-sage-green font-mono">
                {profile?.role || (devGuestMode ? 'Demo Access' : 'Master')}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out of Sanctum"
              className="p-2 text-moonlight-muted hover:text-red-400 hover:bg-red-950/30 rounded-xl border border-midnight-border/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
