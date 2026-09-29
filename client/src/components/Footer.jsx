import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Heart, Sparkles, Shield, Trophy, Zap, Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-cyan-400 flex items-center justify-center text-white shadow-neon-blue">
                <Brain className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                Brain<span className="text-primary-500">Rush</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Supercharge your neuroplasticity, memory retention, focus, and deductive logic with scientifically inspired daily brain workouts.
            </p>
            <div className="flex items-center gap-3 text-xs font-semibold text-primary-600 dark:text-primary-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-time Global Neural Network
            </div>
          </div>

          {/* Col 2: Games */}
          <div>
            <h4 className="font-heading font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4">
              Brain Arenas
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li><Link to="/games/memory-match" className="hover:text-primary-500 transition-colors">Memory Match</Link></li>
              <li><Link to="/games/reaction-time" className="hover:text-primary-500 transition-colors">Reaction Reflex</Link></li>
              <li><Link to="/games/number-challenge" className="hover:text-primary-500 transition-colors">Speed Arithmetic</Link></li>
              <li><Link to="/games/pattern-memory" className="hover:text-primary-500 transition-colors">Matrix Pattern</Link></li>
              <li><Link to="/games/logic-puzzle" className="hover:text-primary-500 transition-colors">Logic Teasers</Link></li>
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="font-heading font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li><Link to="/daily-challenge" className="hover:text-primary-500 transition-colors flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> Daily Challenge</Link></li>
              <li><Link to="/leaderboard" className="hover:text-primary-500 transition-colors flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-primary-500" /> Global Leaderboard</Link></li>
              <li><Link to="/achievements" className="hover:text-primary-500 transition-colors">Achievements Hub</Link></li>
              <li><Link to="/profile" className="hover:text-primary-500 transition-colors">Cognitive Profile</Link></li>
            </ul>
          </div>

          {/* Col 4: Daily Cognitive Tip */}
          <div className="glass-card bg-primary-50/50 dark:bg-slate-900/50 border border-primary-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" />
              Did You Know?
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              Engaging in 10 minutes of daily working-memory exercises enhances cognitive resilience, mental focus, and problem-solving speed.
            </p>
            <div className="text-[11px] text-slate-400">
              Updated daily • Powered by Neuro-Play
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} BrainRush Gaming Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for peak performance
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
