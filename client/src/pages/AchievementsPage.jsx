import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Brain, 
  Zap, 
  Flame, 
  Layers, 
  Target, 
  Calendar, 
  Compass 
} from 'lucide-react';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import LoadingState from '../components/UI/LoadingState';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';

export default function AchievementsPage() {
  const { isAuthenticated } = useAuth();
  const { play } = useSound();

  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ total: 0, unlocked: 0, completionPercentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      try {
        const res = await api.achievements.getAll();
        if (res.achievements) {
          setAchievements(res.achievements);
          setStats(res.stats || { total: 0, unlocked: 0, completionPercentage: 0 });
        }
      } catch (err) {
        console.error('Error fetching achievements:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  const getAchievementIcon = (iconName) => {
    switch (iconName) {
      case 'Brain': return Brain;
      case 'Zap': return Zap;
      case 'Flame': return Flame;
      case 'Layers': return Layers;
      case 'Target': return Target;
      case 'Trophy': return Trophy;
      case 'Calendar': return Calendar;
      case 'Compass': return Compass;
      default: return Award;
    }
  };

  if (loading) {
    return <LoadingState message="Synchronizing achievement milestones..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Milestones & Badges</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-slate-900 dark:text-white">
          BrainRush Achievements
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Unlock prestigious cognitive badges, accumulate XP rewards, and showcase your brainpower mastery.
        </p>
      </div>

      {/* Progress Showcase Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs uppercase font-bold text-slate-400">Total Completion</span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              {stats.unlocked} of {stats.total} Unlocked ({stats.completionPercentage}%)
            </h3>
          </div>
          <Badge variant="amber" size="lg" icon={Trophy}>
            +{achievements.filter(a => a.unlocked).reduce((acc, a) => acc + (a.xp_reward || 0), 0)} XP Earned
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-primary-500 to-cyan-400 rounded-full transition-all duration-700 shadow-neon-blue"
            style={{ width: `${Math.max(5, stats.completionPercentage)}%` }}
          />
        </div>
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((ach) => {
          const Icon = getAchievementIcon(ach.icon);
          const isUnlocked = ach.unlocked;

          return (
            <Card
              key={ach.id}
              className={`p-6 border-2 transition-all ${
                isUnlocked
                  ? 'border-amber-400/50 bg-gradient-to-tr from-amber-500/10 via-primary-500/5 to-slate-900/40 shadow-neon-blue'
                  : 'border-slate-200 dark:border-slate-800/80 opacity-75 grayscale hover:grayscale-0'
              }`}
            >
              <div className="flex items-start gap-4">
                
                {/* Icon Box */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  isUnlocked
                    ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-bold shadow-amber-500/30 ring-2 ring-amber-400/40'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {isUnlocked ? <Icon className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white truncate">
                      {ach.name}
                    </h4>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isUnlocked ? 'bg-amber-400/20 text-amber-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      +{ach.xp_reward} XP
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {ach.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <Badge variant={isUnlocked ? 'emerald' : 'slate'} size="sm">
                      {isUnlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                    {isUnlocked && ach.unlocked_at && (
                      <span className="text-slate-400 text-[11px]">
                        {new Date(ach.unlocked_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
}
