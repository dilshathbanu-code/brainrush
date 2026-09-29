import React, { useEffect } from 'react';
import { Trophy, Award, Zap, Sparkles, X } from 'lucide-react';
import { useSound } from '../context/SoundContext';

export default function AchievementPopup({ achievement, onClose }) {
  const { play } = useSound();

  useEffect(() => {
    if (achievement) {
      play('victory');
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose, play]);

  if (!achievement) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 animate-pop max-w-sm w-full">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/90 to-indigo-900/90 backdrop-blur-xl border-2 border-primary-400 p-4 rounded-2xl shadow-neon-hover text-white flex items-center gap-4">
        {/* Glowing aura */}
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary-500/30 rounded-full blur-xl pointer-events-none"></div>

        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-lg shadow-amber-500/30">
          <Trophy className="w-6 h-6 animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 tracking-wider uppercase mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            Achievement Unlocked!
          </div>
          <h4 className="font-bold text-sm text-white truncate">{achievement.name}</h4>
          <p className="text-xs text-blue-200/80 truncate">{achievement.description}</p>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-blue-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
