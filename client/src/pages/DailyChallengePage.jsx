import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Flame, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Play, 
  Zap, 
  Award, 
  ShieldCheck 
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingState from '../components/UI/LoadingState';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';

export default function DailyChallengePage() {
  const { isAuthenticated, user } = useAuth();
  const { play } = useSound();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [userStreak, setUserStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    async function loadDaily() {
      try {
        const res = await api.dailyChallenge.get();
        if (res.challenge) {
          setChallenge(res.challenge);
          setUserStreak(res.userStreak || 0);
        }
      } catch (err) {
        console.error('Failed to load daily challenge:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDaily();
  }, []);

  // Time until midnight reset
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow - now;

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilReset(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const isCompleted = challenge?.userStatus?.completed;
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (loading) {
    return <LoadingState message="Fetching today's neural protocol..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          <span>{todayFormatted}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-slate-900 dark:text-white">
          Daily Synapse Challenge
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Complete today's curated cognitive protocol to earn bonus XP points and level up your daily habit streak.
        </p>
      </div>

      {/* Streak Dashboard Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Streak Counter */}
        <Card className="flex items-center gap-4 p-6 border border-amber-500/30 bg-gradient-to-tr from-amber-500/10 to-orange-500/10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-extrabold text-2xl shadow-lg shadow-amber-500/30 shrink-0">
            <Flame className="w-9 h-9 fill-slate-950" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">Current Streak</span>
            <h3 className="font-heading font-black text-3xl text-slate-900 dark:text-white font-mono">
              {userStreak} <span className="text-sm font-semibold text-amber-500">Days</span>
            </h3>
          </div>
        </Card>

        {/* Reset Countdown */}
        <Card className="flex items-center gap-4 p-6 border border-primary-500/30 bg-gradient-to-tr from-primary-500/10 to-cyan-500/10">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white shrink-0 shadow-neon-blue">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">Resets In</span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white font-mono">
              {timeUntilReset}
            </h3>
          </div>
        </Card>

        {/* Status */}
        <Card className={`flex items-center gap-4 p-6 border ${
          isCompleted ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
            isCompleted ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
          }`}>
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">Today's Status</span>
            <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
              {isCompleted ? 'Completed 🎉' : 'Pending'}
            </h3>
          </div>
        </Card>

      </div>

      {/* Main Today's Mission Card */}
      {challenge && (
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border-2 border-primary-500/50 shadow-neon-blue relative overflow-hidden space-y-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="blue" size="md">{challenge.game_category}</Badge>
                <Badge variant="amber" size="md">+{challenge.reward_xp} XP</Badge>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-heading text-slate-900 dark:text-white">
                {challenge.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base max-w-2xl leading-relaxed">
                {challenge.description}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center shrink-0 min-w-[160px]">
              <span className="text-xs uppercase font-bold text-slate-400 block">Required Goal</span>
              <span className="font-mono text-3xl font-black text-primary-600 dark:text-primary-400">
                {challenge.target_score} <span className="text-xs font-semibold">pts</span>
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Progress automatically syncs and awards daily streak badges.
            </div>

            <Button
              size="lg"
              variant="primary"
              onClick={() => {
                play('click');
                navigate(`/games/${challenge.game_slug}`);
              }}
              icon={Play}
            >
              {isCompleted ? 'Play Again' : 'Start Daily Challenge'}
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}
