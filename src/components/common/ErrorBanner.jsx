import React from 'react';
import { AlertTriangle, RefreshCw, ServerCrash } from 'lucide-react';
import Button from './Button';

export default function ErrorBanner({
  title = 'Arcane Connection Disrupted',
  message = 'Failed to commune with the SPELLSTOCK Node.js backend. Please ensure the server is active on port 5001.',
  onRetry,
  isRetrying = false,
  className = '',
}) {
  return (
    <div
      className={`p-6 rounded-2xl border border-curse/40 bg-curse/10 shadow-curse-glow backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-curse/20 text-curse-light border border-curse/30 shrink-0">
          <ServerCrash className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h4 className="font-display font-semibold text-base text-curse-light flex items-center gap-2">
            <span>{title}</span>
          </h4>
          <p className="text-xs text-moonlight-muted mt-1 max-w-xl leading-relaxed">
            {message}
          </p>
          <div className="mt-2 text-[11px] text-moonlight-dark font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-curse"></span>
            <span>Target URI: <code className="text-arcane-light">http://localhost:5001/api</code></span>
          </div>
        </div>
      </div>

      {onRetry && (
        <Button
          variant="curse"
          size="sm"
          onClick={onRetry}
          isLoading={isRetrying}
          icon={RefreshCw}
          className="shrink-0 whitespace-nowrap self-end sm:self-center"
        >
          Re-attune Core
        </Button>
      )}
    </div>
  );
}
