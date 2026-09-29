import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, 
  RotateCcw, 
  Clock, 
  Flame, 
  Trophy, 
  Sparkles, 
  Search, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useSound } from '../context/SoundContext';
import { fireBigConfetti } from '../utils/helpers';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const THEMES = [
  { common: '🐱', impostor: '🐶', name: 'Cat vs Secret Dog' },
  { common: '🍎', impostor: '🍓', name: 'Apple vs Sneaky Berry' },
  { common: '📚', impostor: '🎮', name: 'Books vs Gamer Impostor' },
  { common: '👻', impostor: '🎃', name: 'Ghost vs Spooky Pumpkin' },
  { common: '🍕', impostor: '🍔', name: 'Pizza vs Spy Burger' },
  { common: '🚀', impostor: '🛸', name: 'Rocket vs Alien UFO' },
  { common: '🚗', impostor: '🏎️', name: 'Car vs Speed Racer' },
  { common: '🥑', impostor: '🍐', name: 'Avocado vs Disguised Pear' },
  { common: '🍩', impostor: '🍪', name: 'Donut vs Cookie Thief' },
  { common: '⚽', impostor: '🏀', name: 'Soccer vs Basketball' }
];

const GAME_TIME = 30; // 30 seconds

export default function SpeedSpotterGame({ onScoreSubmitted, onAchievementUnlocked }) {
  const { play } = useSound();
  const { isAuthenticated } = useAuth();

  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [gridItems, setGridItems] = useState([]);
  const [impostorIndex, setImpostorIndex] = useState(-1);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);

  const timerRef = useRef(null);

  // Generate grid based on current level
  const generateLevel = (currentLvl = 1) => {
    const gridSize = currentLvl <= 2 ? 9 : currentLvl <= 5 ? 16 : currentLvl <= 8 ? 25 : 36;
    const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
    setCurrentTheme(theme);

    const randomImpostorIdx = Math.floor(Math.random() * gridSize);
    setImpostorIndex(randomImpostorIdx);

    const items = Array.from({ length: gridSize }).map((_, i) => ({
      id: i,
      emoji: i === randomImpostorIdx ? theme.impostor : theme.common,
      isImpostor: i === randomImpostorIdx
    }));

    setGridItems(items);
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setTimeLeft(GAME_TIME);
    setLevel(1);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSolvedCount(0);
    generateLevel(1);
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, timeLeft]);

  const handleItemClick = (item) => {
    if (!isPlaying) return;

    if (item.isImpostor) {
      play('match');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setSolvedCount(prev => prev + 1);

      const levelBonus = level * 50;
      const streakBonus = newStreak * 40;
      setScore(prev => prev + 150 + levelBonus + streakBonus);

      const nextLevel = level + 1;
      setLevel(nextLevel);
      generateLevel(nextLevel);
    } else {
      play('wrong');
      setStreak(0);
    }
  };

  const handleGameOver = async () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setIsGameOver(true);
    play('victory');
    if (solvedCount >= 10) fireBigConfetti();

    if (isAuthenticated) {
      try {
        const res = await api.scores.submit({
          gameSlug: 'speed-spotter',
          score,
          accuracy: Math.min(100, Math.max(50, Math.round((solvedCount / (solvedCount + 2)) * 100))),
          timeTakenSeconds: GAME_TIME,
          levelReached: level,
          metadata: { solvedCount, maxStreak, finalLevel: level }
        });
        if (onScoreSubmitted) onScoreSubmitted(res);
        if (res.unlockedAchievements?.length > 0 && onAchievementUnlocked) {
          res.unlockedAchievements.forEach(ach => onAchievementUnlocked(ach));
        }
      } catch (err) {
        console.error('Error submitting speed spotter score:', err);
      }
    }
  };

  const getGridColsClass = () => {
    const len = gridItems.length;
    if (len <= 9) return 'grid-cols-3 max-w-[280px]';
    if (len <= 16) return 'grid-cols-4 max-w-[340px]';
    if (len <= 25) return 'grid-cols-5 max-w-[380px]';
    return 'grid-cols-6 max-w-[420px]';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 shadow-lg">
        
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-500" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Level</span>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">{level}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${timeLeft <= 8 ? 'text-rose-500 animate-pulse' : 'text-cyan-500'}`} />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Timer</span>
            <p className={`font-mono text-base font-bold ${timeLeft <= 8 ? 'text-rose-500 animate-bounce' : 'text-slate-900 dark:text-white'}`}>
              {timeLeft}s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Flame className={`w-5 h-5 ${streak >= 3 ? 'text-amber-500 fill-amber-500 animate-bounce' : 'text-slate-400'}`} />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Streak</span>
            <p className="font-mono text-base font-bold text-amber-500">{streak}x</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score</span>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">{score}</p>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={startGame} icon={RotateCcw}>
          {isPlaying ? 'Restart' : 'Start'}
        </Button>
      </div>

      {/* Main Spotting Grid Box */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 relative min-h-[420px] flex flex-col items-center justify-center text-center border-2 border-emerald-500/20 shadow-neon-hover">
        {!isPlaying && !isGameOver ? (
          <div className="space-y-6 animate-pop max-w-md">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-emerald-500/30 animate-bounce">
              🔍🎯
            </div>
            <div>
              <h3 className="text-3xl font-black font-heading text-slate-900 dark:text-white mb-2">
                Speed Spotter (Find Impostor) 🕵️
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                One sneaky impostor is hiding in the crowd! Tap the odd emoji before the timer expires to level up.
              </p>
            </div>
            <Button size="lg" variant="primary" onClick={startGame} icon={Search} className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30">
              Start Spotting 🚀
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-pop flex flex-col items-center">
            
            <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {currentTheme?.name} • Level {level}
            </span>

            {/* Dynamic Grid */}
            <div className={`grid gap-2 sm:gap-3 w-full mx-auto ${getGridColsClass()}`}>
              {gridItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="aspect-square p-2 sm:p-3 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 active:scale-90 transition-all duration-150 flex items-center justify-center text-2xl sm:text-3xl shadow-sm select-none"
                >
                  {item.emoji}
                </button>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* Results Modal */}
      <Modal isOpen={isGameOver} onClose={() => setIsGameOver(false)} maxWidth="max-w-md" showClose={false}>
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-emerald-500/30 animate-bounce">
            🎯
          </div>

          <div>
            <h3 className="text-2xl font-black font-heading text-slate-900 dark:text-white mb-1">
              {solvedCount >= 12 ? "Eagle Eye Vision! 🦅✨" : solvedCount >= 6 ? "Sharp Detective! 🕵️" : "Times Up, Rookie! 🔍"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You spotted {solvedCount} sneaky impostors and reached Level {level}!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Score</span>
              <p className="text-xl font-extrabold text-emerald-500 font-mono">+{score}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Max Level</span>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-200 font-mono">Level {level}</p>
            </div>
          </div>

          <Button variant="primary" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600" onClick={startGame} icon={RotateCcw}>
            Play Another Run! 🕵️‍♂️
          </Button>
        </div>
      </Modal>

    </div>
  );
}
