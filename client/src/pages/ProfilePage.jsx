import React, { useState, useEffect } from 'react';
import { 
  User, 
  Trophy, 
  Flame, 
  Activity, 
  Target, 
  Calendar, 
  Edit3, 
  Check, 
  Clock, 
  Sparkles, 
  Brain, 
  Zap, 
  Calculator, 
  Grid, 
  Puzzle 
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import LoadingState from '../components/UI/LoadingState';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { api } from '../services/api';
import { AVATAR_PRESETS, getAvatarInfo, formatScore, formatTime } from '../utils/helpers';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { play } = useSound();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('brain_blue');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.users.getProfile();
        if (res.profile) {
          setProfileData(res.profile);
          setEditName(res.profile.name);
          setEditAvatar(res.profile.avatar);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.users.updateProfile({ name: editName, avatar: editAvatar });
      if (res.user) {
        updateUser(res.user);
        setProfileData(prev => ({ ...prev, name: res.user.name, avatar: res.user.avatar }));
        setSaveSuccess(true);
        play('match');
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSaveSuccess(false);
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Compiling neural cognitive metrics..." />;
  }

  const avatarInfo = getAvatarInfo(profileData?.avatar || user?.avatar);
  const stats = profileData?.stats || {
    totalGames: 0,
    totalScore: 0,
    highestScore: 0,
    averageScore: 0,
    categoryStats: {},
    recentHistory: []
  };

  const categorySkills = [
    { name: 'Memory', key: 'Memory', icon: Brain, color: 'from-blue-500 to-cyan-400' },
    { name: 'Reaction', key: 'Reaction', icon: Zap, color: 'from-amber-500 to-orange-400' },
    { name: 'Mathematics', key: 'Mathematics', icon: Calculator, color: 'from-emerald-500 to-teal-400' },
    { name: 'Pattern', key: 'Pattern', icon: Grid, color: 'from-purple-500 to-indigo-400' },
    { name: 'Logic', key: 'Logic', icon: Puzzle, color: 'from-rose-500 to-pink-400' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Profile Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr ${avatarInfo.bg} flex items-center justify-center text-5xl shadow-neon-blue ring-4 ring-white dark:ring-slate-800`}>
              {avatarInfo.icon}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                  {profileData?.name || user?.name}
                </h1>
                <Badge variant="blue" size="sm">Active Challenger</Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {profileData?.email || user?.email}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1.5 text-amber-500">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  {profileData?.streak_count || user?.streak_count || 0} Day Streak
                </span>
                <span>•</span>
                <span>Joined {new Date(profileData?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              play('click');
              setIsEditModalOpen(true);
            }}
            icon={Edit3}
          >
            Edit Profile
          </Button>

        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <Card className="p-5 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center mx-auto">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-bold text-slate-400 block">Total Games</span>
          <p className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white font-mono">
            {stats.totalGames}
          </p>
        </Card>

        <Card className="p-5 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-bold text-slate-400 block">Total Score</span>
          <p className="font-heading font-black text-2xl sm:text-3xl text-primary-600 dark:text-primary-400 font-mono">
            {formatScore(stats.totalScore)}
          </p>
        </Card>

        <Card className="p-5 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-bold text-slate-400 block">Highest Score</span>
          <p className="font-heading font-black text-2xl sm:text-3xl text-emerald-500 font-mono">
            {formatScore(stats.highestScore)}
          </p>
        </Card>

        <Card className="p-5 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto">
            <Target className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-bold text-slate-400 block">Average Score</span>
          <p className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white font-mono">
            {formatScore(stats.averageScore)}
          </p>
        </Card>

      </div>

      {/* Category Cognitive Breakdown */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
            Cognitive Arena Mastery
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Performance assessment across each brain-training discipline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categorySkills.map(skill => {
            const data = stats.categoryStats?.[skill.key] || { gamesPlayed: 0, bestScore: 0, avgAccuracy: 0 };
            const Icon = skill.icon;

            return (
              <div
                key={skill.key}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-primary-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{skill.name}</h4>
                      <span className="text-xs text-slate-400">{data.gamesPlayed} sessions played</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Best</span>
                    <span className="font-mono text-sm font-bold text-primary-600 dark:text-primary-400">
                      {formatScore(data.bestScore)} pts
                    </span>
                  </div>
                </div>

                {/* Progress bar accuracy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>Accuracy Rating</span>
                    <span>{data.avgAccuracy}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(5, data.avgAccuracy)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent History Table */}
      <Card className="p-6 sm:p-8 space-y-6">
        <h3 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
          Recent Arena Sessions
        </h3>

        {stats.recentHistory?.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No games played yet. Jump into an arena to start recording your history!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-400">
                  <th className="py-3 px-4">Arena</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {stats.recentHistory.map((game, idx) => (
                  <tr key={game.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {game.game_name}
                    </td>
                    <td className="py-3 px-4 font-mono font-extrabold text-primary-600 dark:text-primary-400">
                      +{formatScore(game.score)}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-500 font-bold">
                      {game.accuracy}%
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                      {formatTime(game.time_taken_seconds)}
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-400">
                      {new Date(game.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile & Avatar">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* Avatar selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
              Select Brain Avatar
            </label>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = editAvatar === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      play('click');
                      setEditAvatar(preset.id);
                    }}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10 shadow-neon-blue scale-105'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${preset.bg} flex items-center justify-center text-2xl shadow-sm`}>
                      {preset.icon}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
              Player Name
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500 text-slate-900 dark:text-white"
            />
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2 animate-pop">
              <Check className="w-4 h-4" /> Profile updated successfully!
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={saving}>
              Save Changes
            </Button>
          </div>

        </form>
      </Modal>

    </div>
  );
}
