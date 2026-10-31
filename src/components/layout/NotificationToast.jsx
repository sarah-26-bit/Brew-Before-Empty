import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function NotificationToast() {
  const { notification, setNotification } = useInventory();

  if (!notification) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      border: 'border-enchanted/50 bg-midnight-surface/95 text-enchanted-light',
      shadow: 'shadow-enchanted-glow',
    },
    warning: {
      icon: AlertTriangle,
      border: 'border-potion/50 bg-midnight-surface/95 text-potion-light',
      shadow: 'shadow-potion-glow',
    },
    error: {
      icon: XCircle,
      border: 'border-curse/50 bg-midnight-surface/95 text-curse-light',
      shadow: 'shadow-curse-glow',
    },
    info: {
      icon: Info,
      border: 'border-arcane/50 bg-midnight-surface/95 text-arcane-light',
      shadow: 'shadow-arcane-sm',
    },
  };

  const current = typeConfig[notification.type] || typeConfig.info;
  const Icon = current.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${current.border} ${current.shadow} backdrop-blur-xl shadow-2xl max-w-md`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium text-moonlight flex-1">
          {notification.message}
        </span>
        <button
          onClick={() => setNotification(null)}
          className="p-1 text-moonlight-muted hover:text-moonlight rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

