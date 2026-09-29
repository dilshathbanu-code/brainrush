import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = "Connection Notice",
  message = "Unable to fetch data from the server. Please check your connection and try again.",
  onRetry
}) {
  return (
    <div className="glass-card rounded-2xl p-8 border border-rose-500/30 text-center max-w-md mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" icon={RefreshCw} size="sm">
          Retry
        </Button>
      )}
    </div>
  );
}
