import React from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  Receipt,
  Eye,
  Brain,
  Wand2,
  AlertOctagon,
  Sparkles,
  Moon,
  Settings,
  Flame,
  ChevronRight,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'pantry', label: 'Potion Pantry', icon: FlaskConical, badgeKey: 'lowStock', badgeType: 'potion' },
  { id: 'sales', label: 'Sales & Transactions', icon: Receipt },
  { id: 'prophecy', label: 'Prophecy AI', icon: Eye, highlight: true },
  { id: 'intelligence', label: 'Intelligence Centre', icon: Brain, highlight: true },
  { id: 'restock', label: 'Restock Spell', icon: Wand2, magic: true },
  { id: 'happenings', label: 'Strange Happenings', icon: AlertOctagon, badgeKey: 'anomalies', badgeType: 'curse' },
  { id: 'analytics', label: 'Crystal Ball Analytics', icon: Sparkles },
  { id: 'curse', label: 'Midnight Curse', icon: Moon, curseIndicator: true },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { activeTab, setActiveTab, globalCounts } = useInventory();
  const { user, profile, logout, devGuestMode } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-midnight-surface/95 border-r border-midnight-border backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-midnight-border/70 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arcane via-deep-forest to-potion p-0.5 shadow-arcane-sm flex items-center justify-center">
              <div className="w-full h-full bg-midnight rounded-[10px] flex items-center justify-center text-arcane-light">
                <Flame className="w-5 h-5 text-potion animate-pulse-subtle" />
              </div>
            </div>
            <div>
              <h1 className="font-serif font-extrabold text-base tracking-wider text-moonlight flex flex-col leading-tight">
                <span>BREW BEFORE</span>
                <span className="text-arcane-light">EMPTY</span>
              </h1>
              <p className="text-[10px] tracking-widest uppercase font-mono text-potion-light mt-0.5">
                Predict. Prepare. Prosper.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-moonlight-dark italic mt-2 font-serif">
            The Magic of Intelligent Inventory
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badgeCount = item.badgeKey ? globalCounts[item.badgeKey] : 0;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-arcane/20 via-deep-forest/40 to-transparent text-white border-l-4 border-arcane shadow-sm shadow-arcane/10 font-semibold'
                    : 'text-moonlight-muted hover:text-moonlight hover:bg-midnight-card/50'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'text-arcane-light'
                        : item.magic
                        ? 'text-enchanted-light'
                        : item.highlight
                        ? 'text-potion-light'
                        : 'text-moonlight-muted group-hover:text-moonlight'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {badgeCount > 0 && (
                    <span
                      title={item.badgeType === 'curse' ? `${badgeCount} active alerts` : `${badgeCount} low stock items`}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.badgeType === 'curse'
                          ? 'bg-curse/20 text-curse-light border-curse/40 animate-pulse'
                          : 'bg-potion/20 text-potion-light border-potion/40'
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}

                  {item.curseIndicator && globalCounts.curseActive && (
                    <span className="w-2 h-2 rounded-full bg-curse shadow-curse-glow animate-ping" />
                  )}

                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-arcane-light shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Demand Season Footer Card */}
        <div className="p-4 border-t border-midnight-border/70 space-y-2">
          <div
            onClick={() => setActiveTab('curse')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              globalCounts.curseActive
                ? 'bg-curse/10 border-curse/40 hover:border-curse shadow-curse-glow'
                : 'bg-midnight-card/60 border-midnight-border/60 hover:border-arcane/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-moonlight-muted">
                Demand Season
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  globalCounts.curseActive
                    ? 'bg-curse text-white'
                    : 'bg-enchanted/20 text-enchanted-light'
                }`}
              >
                {globalCounts.curseActive ? 'HIGH DEMAND' : 'NORMAL'}
              </span>
            </div>
            <p className="text-xs font-semibold text-moonlight mt-1 truncate">
              {globalCounts.curseActive ? globalCounts.curseName : 'Standard Operation'}
            </p>
          </div>

          {/* User Profile & Sign Out Bar */}
          <div className="p-2.5 rounded-xl bg-midnight/80 border border-emerald-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate pr-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5 text-antique-gold" />
              </div>
              <div className="truncate">
                <p className="text-xs font-serif font-bold text-warm-ivory leading-tight truncate">
                  {profile?.full_name || user?.user_metadata?.full_name || (devGuestMode ? 'Guest Alchemist' : 'Alchemist')}
                </p>
                <p className="text-[9px] text-sage-green font-mono truncate">
                  {profile?.role || (devGuestMode ? 'Demo Access' : 'Master')}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-moonlight-muted hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
