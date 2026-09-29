import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  Flame, 
  Medal, 
  Sparkles, 
  Filter, 
  Calendar, 
  User, 
  Check 
} from 'lucide-react';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import LoadingState from '../components/UI/LoadingState';
import EmptyState from '../components/UI/EmptyState';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { formatScore, getAvatarInfo } from '../utils/helpers';

const PERIODS = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'all-time', label: 'All Time' }
];

const GAME_FILTERS = [
  { id: '', name: 'All Arenas' },
  { id: 'memory-match', name: 'Memory Match' },
  { id: 'reaction-time', name: 'Reaction Game' },
  { id: 'number-challenge', name: 'Number Challenge' },
  { id: 'pattern-memory', name: 'Pattern Memory' },
  { id: 'logic-puzzle', name: 'Logic Puzzle' }
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { play } = useSound();

  const [period, setPeriod] = useState('all-time');
  const [gameFilter, setGameFilter] = useState('');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await api.leaderboard.get(period, gameFilter);
        if (res.leaderboard) {
          setRankings(res.leaderboard);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [period, gameFilter]);

  const topThree = rankings.slice(0, 3);
  const remainingRankings = rankings.slice(3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-500 border border-primary-500/30 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-4 h-4" />
          <span>Global Ranking Matrix</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-slate-900 dark:text-white">
          BrainRush Leaderboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Track high scorers, compare cognitive performance, and claim your place among the sharpest minds.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
        
        {/* Time Periods */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto overflow-x-auto">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => {
                play('click');
                setPeriod(p.id);
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                period === p.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Game Filter dropdown */}
        <div className="w-full sm:w-60">
          <select
            value={gameFilter}
            onChange={(e) => {
              play('click');
              setGameFilter(e.target.value);
            }}
            className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary-500 text-slate-900 dark:text-white"
          >
            {GAME_FILTERS.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

      </div>

      {loading ? (
        <LoadingState message="Recalculating global leaderboards..." />
      ) : rankings.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No scores recorded yet"
          description="Be the first challenger to complete a game in this time period!"
          actionText="Play a Game"
          onAction={() => window.location.href = '/games'}
        />
      ) : (
        <div className="space-y-10">
          
          {/* Top 3 Podium Cards */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
              
              {/* 2nd Place (Silver) */}
              {topThree[1] && (
                <div className="order-2 md:order-1">
                  <Card className="bg-gradient-to-tr from-slate-200/50 to-slate-300/30 dark:from-slate-800/80 dark:to-slate-900/80 border-2 border-slate-300 dark:border-slate-600 text-center p-6 space-y-4 shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-center mx-auto text-lg shadow">
                      🥈 2
                    </div>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${getAvatarInfo(topThree[1].player_avatar).bg} flex items-center justify-center text-3xl mx-auto shadow-md`}>
                      {getAvatarInfo(topThree[1].player_avatar).icon}
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                        {topThree[1].player_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        {topThree[1].games_played} games played
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Score</span>
                      <span className="font-mono text-2xl font-black text-primary-600 dark:text-primary-400">
                        {formatScore(topThree[1].total_score)}
                      </span>
                    </div>
                  </Card>
                </div>
              )}

              {/* 1st Place (Gold Winner - Elevated) */}
              {topThree[0] && (
                <div className="order-1 md:order-2 md:-translate-y-4">
                  <Card className="bg-gradient-to-tr from-amber-400/20 via-yellow-500/20 to-orange-500/20 border-2 border-amber-400 shadow-neon-hover text-center p-8 space-y-4 relative overflow-hidden">
                    <div className="absolute top-2 right-2">
                      <Crown className="w-6 h-6 text-amber-400 animate-bounce" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 font-black text-slate-950 flex items-center justify-center mx-auto text-xl shadow-lg shadow-amber-500/40">
                      👑 1
                    </div>
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${getAvatarInfo(topThree[0].player_avatar).bg} flex items-center justify-center text-4xl mx-auto shadow-xl ring-4 ring-amber-400/40`}>
                      {getAvatarInfo(topThree[0].player_avatar).icon}
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                        {topThree[0].player_name}
                      </h3>
                      <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mt-0.5">
                        {topThree[0].streak_count}d Streak Master
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-950/80 border border-amber-400/40 shadow-inner">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Champion Score</span>
                      <span className="font-mono text-3xl font-black text-amber-500">
                        {formatScore(topThree[0].total_score)}
                      </span>
                    </div>
                  </Card>
                </div>
              )}

              {/* 3rd Place (Bronze) */}
              {topThree[2] && (
                <div className="order-3">
                  <Card className="bg-gradient-to-tr from-amber-700/20 to-orange-800/10 dark:from-slate-800/80 dark:to-slate-900/80 border-2 border-amber-700/40 text-center p-6 space-y-4 shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-amber-700/30 text-amber-500 font-extrabold flex items-center justify-center mx-auto text-lg shadow">
                      🥉 3
                    </div>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${getAvatarInfo(topThree[2].player_avatar).bg} flex items-center justify-center text-3xl mx-auto shadow-md`}>
                      {getAvatarInfo(topThree[2].player_avatar).icon}
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                        {topThree[2].player_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        {topThree[2].games_played} games played
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Score</span>
                      <span className="font-mono text-2xl font-black text-primary-600 dark:text-primary-400">
                        {formatScore(topThree[2].total_score)}
                      </span>
                    </div>
                  </Card>
                </div>
              )}

            </div>
          )}

          {/* Leaderboard Table for all ranking positions */}
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 text-xs font-bold uppercase text-slate-400 tracking-wider">
                    <th className="py-4 px-6">Rank</th>
                    <th className="py-4 px-6">Player</th>
                    <th className="py-4 px-6">Streak</th>
                    <th className="py-4 px-6">Games</th>
                    <th className="py-4 px-6">Best Score</th>
                    <th className="py-4 px-6 text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                  {rankings.map((player) => {
                    const isCurrentUser = user && Number(user.id) === Number(player.user_id);
                    const avatar = getAvatarInfo(player.player_avatar);

                    return (
                      <tr
                        key={player.user_id}
                        className={`transition-colors ${
                          isCurrentUser
                            ? 'bg-primary-500/15 dark:bg-primary-500/20 font-bold border-l-4 border-primary-500'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                            player.rank === 1 ? 'bg-amber-400 text-slate-950' :
                            player.rank === 2 ? 'bg-slate-300 text-slate-900' :
                            player.rank === 3 ? 'bg-amber-700 text-white' :
                            'text-slate-500 dark:text-slate-400 font-mono'
                          }`}>
                            {player.rank}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${avatar.bg} flex items-center justify-center text-base shrink-0 shadow-sm`}>
                              {avatar.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {player.player_name}
                                {isCurrentUser && (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-primary-500 text-white font-extrabold uppercase">
                                    YOU
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-slate-400">
                                {player.avg_accuracy}% Accuracy
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                            <Flame className="w-4 h-4 fill-amber-500" />
                            {player.streak_count || 0}d
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono text-slate-600 dark:text-slate-300">
                          {player.games_played}
                        </td>

                        <td className="py-4 px-6 font-mono text-slate-600 dark:text-slate-300">
                          {formatScore(player.best_score)}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <span className="font-mono text-base font-extrabold text-primary-600 dark:text-primary-400">
                            {formatScore(player.total_score)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
