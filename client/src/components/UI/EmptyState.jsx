import React from 'react';
import { Gamepad2 } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Gamepad2,
  title = "No records found",
  description = "Start your first game to record your statistics and earn badges!",
  actionText,
  onAction
}) {
  return (
    <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-primary-500 mb-4 border border-slate-200 dark:border-slate-700">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
}
