import React from 'react';
import { Brain } from 'lucide-react';

export default function LoadingState({ message = 'Synapsing brain nodes...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-cyan-400 flex items-center justify-center animate-bounce shadow-neon-blue">
          <Brain className="w-9 h-9 text-white animate-pulse" />
        </div>
        <div className="absolute -inset-2 bg-primary-500/20 rounded-3xl blur-md -z-10 animate-pulse"></div>
      </div>
      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">{message}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400">Please hold on while we prepare your arena</p>
    </div>
  );
}
