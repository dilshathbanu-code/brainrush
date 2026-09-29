import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Zap, 
  Calculator, 
  Grid, 
  Puzzle, 
  Search, 
  Filter, 
  Play, 
  Sparkles, 
  Trophy, 
  Flame 
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingState from '../components/UI/LoadingState';
import EmptyState from '../components/UI/EmptyState';
import { api } from '../services/api';
import { useSound } from '../context/SoundContext';
import { formatScore } from '../utils/helpers';

const CATEGORIES = [
  'All',
  'Memory',
  'Reaction',
  'Mathematics',
  'Pattern',
  'Logic',
  'Puzzle',
  'Speed'
];

export default function GamesPage() {
  const { play } = useSound();
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await api.games.getAll();
        if (res.games) setGames(res.games);
      } catch (err) {
        console.error('Failed to load games:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  const getGameTheme = (slug) => {
    switch (slug) {
      case 'memory-match':
        return { icon: Brain, gradient: 'from-blue-500 to-cyan-400', tag: '🧠 Brain Booster', badgeCol: 'blue' };
      case 'reaction-time':
        return { icon: Zap, gradient: 'from-amber-500 to-orange-500', tag: '⚡ Speed Reflex', badgeCol: 'amber' };
      case 'number-challenge':
        return { icon: Calculator, gradient: 'from-emerald-500 to-teal-400', tag: '🔢 Math Agility', badgeCol: 'emerald' };
      case 'pattern-memory':
        return { icon: Grid, gradient: 'from-purple-500 to-indigo-500', tag: '🔲 Simon Memory', badgeCol: 'purple' };
      case 'logic-puzzle':
        return { icon: Puzzle, gradient: 'from-rose-500 to-pink-500', tag: '🤪 Funny Riddles', badgeCol: 'rose' };
      case 'emoji-riddle':
        return { icon: Sparkles, gradient: 'from-pink-500 via-purple-500 to-cyan-400', tag: '🍕 Meme Decoder', badgeCol: 'purple' };
      case 'color-clash':
        return { icon: Zap, gradient: 'from-cyan-400 via-blue-500 to-pink-500', tag: '🎨 Stroop Clash', badgeCol: 'blue' };
      case 'speed-spotter':
        return { icon: Trophy, gradient: 'from-emerald-400 via-teal-500 to-cyan-500', tag: '🕵️ Find Impostor', badgeCol: 'emerald' };
      default:
        return { icon: Brain, gradient: 'from-blue-600 to-cyan-400', tag: '🎮 Arena', badgeCol: 'blue' };
    }
  };

  const filteredGames = games.filter(game => {
    const matchesCategory = selectedCategory === 'All' || game.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 border border-primary-500/30 text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>8 Fully Interactive Brain Arenas</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black font-heading text-slate-900 dark:text-white">
          BrainRush <span className="text-gradient">Gaming Arcade</span> 🎮
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Power up your memory, test lightning reflexes, crack hilarious riddles, and crush high scores!
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 dark:border-slate-800 shadow-lg">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => {
                play('click');
                setSelectedCategory(cat);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-primary-600 to-cyan-500 text-white shadow-neon-blue'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-primary-500 text-slate-900 dark:text-white placeholder-slate-400 font-medium"
          />
        </div>

      </div>

      {/* Games Catalog Grid */}
      {loading ? (
        <LoadingState message="Loading Brain Arenas..." />
      ) : filteredGames.length === 0 ? (
        <EmptyState
          title="No games matched"
          description="Try selecting another category or clear your search keyword."
          actionText="Reset Filter"
          onAction={() => {
            setSelectedCategory('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map(game => {
            const theme = getGameTheme(game.slug);
            const Icon = theme.icon;

            return (
              <Card
                key={game.id}
                className="flex flex-col justify-between group hover:border-primary-500 hover:shadow-neon-hover transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle colorful top highlight bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.gradient}`}></div>

                <div className="space-y-4 pt-1">
                  
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${theme.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <Badge variant={theme.badgeCol} size="sm">{game.category}</Badge>
                  </div>

                  <div>
                    <span className="text-[11px] font-extrabold text-primary-500 uppercase tracking-wider block mb-1">
                      {theme.tag}
                    </span>
                    <h3 className="text-xl font-black font-heading text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                      {game.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Difficulty</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{game.difficulty}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Your Best</span>
                      <span className="font-bold text-primary-500 font-mono">
                        {game.userBestScore ? `${formatScore(game.userBestScore)} pts` : 'Ready'}
                      </span>
                    </div>
                  </div>

                </div>

                <div className="pt-6">
                  <Button
                    variant="primary"
                    className={`w-full bg-gradient-to-r ${theme.gradient} border-0 shadow-md hover:shadow-lg`}
                    onClick={() => {
                      play('click');
                      navigate(`/games/${game.slug}`);
                    }}
                    icon={Play}
                  >
                    Play Now 🚀
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
