import React from 'react';

export default function LoadingSkeleton({ count = 3, type = 'card' }) {
  if (type === 'table') {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-10 bg-midnight-card/80 rounded-xl border border-midnight-border/50" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-14 bg-midnight-card/40 rounded-xl border border-midnight-border/30 flex items-center px-4 gap-4">
            <div className="w-8 h-8 rounded-lg bg-midnight-border/60" />
            <div className="h-4 bg-midnight-border/60 rounded w-1/4" />
            <div className="h-4 bg-midnight-border/40 rounded w-1/6 ml-auto" />
            <div className="h-4 bg-midnight-border/40 rounded w-1/6" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-6 rounded-2xl bg-midnight-surface/60 border border-midnight-border/50 h-32 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-midnight-border/60 rounded w-1/3" />
              <div className="w-8 h-8 rounded-xl bg-midnight-border/60" />
            </div>
            <div className="h-8 bg-midnight-border/80 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-midnight-surface/60 border border-midnight-border/50 flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-midnight-border/60" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-midnight-border/70 rounded w-1/3" />
              <div className="h-3 bg-midnight-border/40 rounded w-1/4" />
            </div>
          </div>
          <div className="h-3 bg-midnight-border/30 rounded w-full mt-2" />
          <div className="h-3 bg-midnight-border/30 rounded w-4/5" />
        </div>
      ))}
    </div>
  );
}

