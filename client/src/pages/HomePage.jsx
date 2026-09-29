import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Zap, 
  Calculator, 
  Grid, 
  Puzzle, 
  Trophy, 
  Sparkles, 
  Flame, 
  Calendar, 
  ArrowRight, 
  Play, 
  ShieldCheck, 
  Target, 
  Award, 
  Activity, 
  CheckCircle2, 
  Users 
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { api } from '../services/api';
import { formatScore, getAvatarInfo } from '../utils/helpers';

export default function HomePage() {
  const { isAuthenticated, user, loginAsDemo } = useAuth();
  const { play } = useSound();
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [gamesRes, dailyRes, leaderRes] = await Promise.all([
          api.games.getAll().catch(() => ({ games: [] })),
          api.dailyChallenge.get().catch(() => ({ challenge: null })),
          api.leaderboard.get('all-time').catch(() => ({ leaderboard: [] }))
        ]);

        if (gamesRes.games) setGames(gamesRes.games);
        if (dailyRes.challenge) setDailyChallenge(dailyRes.challenge);
        if (leaderRes.leaderboard) setTopPlayers(leaderRes.leaderboard.slice(0, 3));
      } catch (err) {
        console.error('Home data error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const getGameIcon = (slug) => {
    switch (slug) {
      case 'memory-match': return Brain;
      case 'reaction-time': return Zap;
      case 'number-challenge': return Calculator;
      case 'pattern-memory': return Grid;
      case 'logic-puzzle': return Puzzle;
      default: return Brain;
    }
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-16 overflow-hidden">
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-primary-500/15 dark:bg-primary-500/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-cyan-400/10 dark:bg-cyan-400/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary-500/30 text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 shadow-sm animate-pop">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Next-Generation Brain-Training Arena</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Train Your Brain. <br />
                <span className="text-gradient">Beat Your Best.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Challenge your memory, logic, speed and reaction with fun interactive brain games. Track cognitive growth and compete on global leaderboards.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => {
                    play('click');
                    navigate('/games');
                  }}
                  icon={Play}
                >
                  Play Now
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    play('click');
                    navigate('/games');
                  }}
                  icon={Brain}
                >
                  Explore Games
                </Button>

                {!isAuthenticated && (
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={async () => {
                      play('click');
                      await loginAsDemo();
                      navigate('/profile');
                    }}
                    className="border border-slate-300 dark:border-slate-700"
                  >
                    ⚡ Demo Guest Login
                  </Button>
                )}
              </div>

              {/* Trust & Live Metric Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/80 max-w-md mx-auto lg:mx-0">
                <div>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white font-mono">5+</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Brain Arenas</p>
                </div>
                <div>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-primary-600 dark:text-primary-400 font-mono">100%</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Interactive</p>
                </div>
                <div>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-500 font-mono">24/7</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Daily Quests</p>
                </div>
              </div>

            </div>

            {/* Hero Right Visual Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-md relative animate-float">
                
                {/* Glow ring */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-primary-500 via-cyan-400 to-indigo-500 rounded-3xl blur-xl opacity-70"></div>
                
                {/* Visual Glass Deck */}
                <div className="relative glass-card bg-white/90 dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-white/20 dark:border-slate-700 shadow-2xl space-y-6">
                  
                  {/* Top card header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-cyan-400 flex items-center justify-center text-white shadow-neon-blue">
                        <Brain className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">Neural Synapse</h4>
                        <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Cortex Sync
                        </span>
                      </div>
                    </div>
                    <Badge variant="blue" size="sm">v2.0 Active</Badge>
                  </div>

                  {/* Dynamic Interactive Mini Visual Matrix */}
                  <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    {['🧠 Memory', '⚡ Reflex', '🔢 Math', '🧩 Logic', '🔲 Pattern', '🏆 Rank'].map((item, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 text-center font-bold text-xs text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-primary-500 hover:text-primary-500 transition-all cursor-pointer"
                        onClick={() => play('click')}
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* Live Stat Preview */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-500/10 to-indigo-500/10 border border-primary-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
                      <div>
                        <p className="text-xs text-slate-400 font-bold">Daily Streak</p>
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white">5 Consecutive Days</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary-500">+250 XP</span>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Daily Challenge Spotlight Banner */}
      {dailyChallenge && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 border-2 border-primary-500/40 p-6 sm:p-10 shadow-neon-blue text-white">
            
            <div className="absolute right-0 top-0 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  Today's Special Mission
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-heading">
                  {dailyChallenge.title}
                </h3>
                <p className="text-sm sm:text-base text-blue-200/80 max-w-xl">
                  {dailyChallenge.description}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                  <span className="text-[10px] uppercase font-bold text-amber-300 block">Target Score</span>
                  <span className="font-mono text-xl font-black text-white">{dailyChallenge.target_score}+ pts</span>
                </div>

                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => {
                    play('click');
                    navigate(`/games/${dailyChallenge.game_slug || 'memory-match'}`);
                  }}
                  icon={Play}
                >
                  Accept Mission
                </Button>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Featured Games Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest block mb-1">
              Interactive Arenas
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
              Featured Brain Games
            </h2>
          </div>
          <Link
            to="/games"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
          >
            View All Games <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.slice(0, 3).map((game) => {
            const Icon = getGameIcon(game.slug);
            return (
              <Card
                key={game.id}
                className="flex flex-col justify-between group hover:border-primary-500 relative overflow-hidden"
              >
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-cyan-400 flex items-center justify-center text-white shadow-neon-blue group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <Badge variant="blue" size="sm">{game.category}</Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-semibold block text-[10px] uppercase text-slate-400">Difficulty</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{game.difficulty}</span>
                    </div>
                    {game.userBestScore > 0 && (
                      <div>
                        <span className="font-semibold block text-[10px] uppercase text-slate-400">Your Best</span>
                        <span className="font-bold text-emerald-500 font-mono">{formatScore(game.userBestScore)} pts</span>
                      </div>
                    )}
                  </div>

                </div>

                <div className="pt-6">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      play('click');
                      navigate(`/games/${game.slug}`);
                    }}
                    icon={Play}
                  >
                    Play {game.name}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

      </section>

      {/* Leaderboard Preview & Top Players */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest block mb-1">
              Hall of Fame
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
              Top Brain Challengers
            </h2>
          </div>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
          >
            Full Leaderboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPlayers.map((player, idx) => {
            const avatarInfo = getAvatarInfo(player.player_avatar);
            const rankMedals = ['🥇 Rank 1', '🥈 Rank 2', '🥉 Rank 3'];
            const rankGradients = [
              'from-amber-400/20 to-yellow-500/20 border-amber-400/50',
              'from-slate-300/20 to-slate-400/20 border-slate-300/50',
              'from-amber-700/20 to-orange-800/20 border-amber-700/50'
            ];

            return (
              <Card
                key={player.user_id || idx}
                className={`bg-gradient-to-tr ${rankGradients[idx] || 'from-slate-900 to-slate-950'} border-2 text-center p-6 space-y-4`}
              >
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
                  {rankMedals[idx] || `#${idx + 1}`}
                </span>

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${avatarInfo.bg} flex items-center justify-center text-2xl mx-auto shadow-md`}>
                  {avatarInfo.icon}
                </div>

                <div>
                  <h4 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                    {player.player_name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {player.games_played} games played
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Score</span>
                  <span className="font-mono text-xl font-black text-primary-600 dark:text-primary-400">
                    {formatScore(player.total_score)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

      </section>

      {/* Why BrainRush Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">
            Cognitive Science
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
            Why Train with BrainRush?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            Engineered with neuroplasticity principles to strengthen working memory, reflex speed, focus, and deductive reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Brain, title: "Working Memory", desc: "Enhance spatial recall, card pattern matching, and rapid information retention.", color: "text-blue-500" },
            { icon: Zap, title: "Speed Reflexes", desc: "Accelerate visual response times down to sub-200 millisecond neural reactions.", color: "text-amber-500" },
            { icon: Calculator, title: "Mental Math", desc: "Boost arithmetic speed, numerical agility, and decision making under time limits.", color: "text-emerald-500" },
            { icon: ShieldCheck, title: "Streak Habits", desc: "Cultivate disciplined daily cognitive workouts with rotating daily quests.", color: "text-purple-500" }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="space-y-4 p-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-6 border-2 border-primary-500/30 shadow-neon-blue relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
              Ready to Test Your Cognitive Limits?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              Join thousands of players sharpening their mind every day. It's free, fun, and competitive.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => {
                play('click');
                navigate('/games');
              }}
              icon={Play}
            >
              Start Playing Now
            </Button>
            {!isAuthenticated && (
              <Button
                size="lg"
                variant="secondary"
                onClick={() => {
                  play('click');
                  navigate('/register');
                }}
              >
                Create Free Account
              </Button>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
