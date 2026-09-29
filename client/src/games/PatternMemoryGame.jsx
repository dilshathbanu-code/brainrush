import React, { useState, useEffect, useRef } from 'react';
import { 
  Grid, 
  RotateCcw, 
  Heart, 
  Trophy, 
  Sparkles, 
  Layers, 
  Play, 
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

const TILE_FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];
const GRID_SIZE = 9; // 3x3 matrix

export default function PatternMemoryGame({ onScoreSubmitted, onAchievementUnlocked }) {
  const { play } = useSound();
  const { isAuthenticated } = useAuth();

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [sequence, setSequence] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [activeTile, setActiveTile] = useState(null);
  const [isDisplayingPattern, setIsDisplayingPattern] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const startGame = () => {
    clearAllTimeouts();
    setLevel(1);
    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setIsPlaying(true);
    generateNextLevel(1, []);
  };

  const generateNextLevel = (nextLevel, currentSeq) => {
    // Generate new step
    const randomTile = Math.floor(Math.random() * GRID_SIZE);
    const newSeq = [...currentSeq, randomTile];
    setSequence(newSeq);
    setUserStep(0);
    playPatternSequence(newSeq);
  };

  const playPatternSequence = (seq) => {
    setIsDisplayingPattern(true);
    clearAllTimeouts();

    seq.forEach((tileIndex, i) => {
      // Light up tile
      const t1 = setTimeout(() => {
        setActiveTile(tileIndex);
        play('patternNote', TILE_FREQUENCIES[tileIndex]);
      }, (i + 1) * 650);

      // Turn off tile
      const t2 = setTimeout(() => {
        setActiveTile(null);
      }, (i + 1) * 650 + 380);

      timeoutsRef.current.push(t1, t2);
    });

    // Finished displaying
    const tEnd = setTimeout(() => {
      setIsDisplayingPattern(false);
    }, (seq.length + 1) * 650);
    timeoutsRef.current.push(tEnd);
  };

  const handleTileClick = (index) => {
    if (!isPlaying || isDisplayingPattern || isGameOver) return;

    setActiveTile(index);
    play('patternNote', TILE_FREQUENCIES[index]);
    setTimeout(() => setActiveTile(null), 200);

    // Check if match
    if (index === sequence[userStep]) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      // Level completed!
      if (nextStep === sequence.length) {
        const levelScore = nextLevelScore(level);
        setScore(prev => prev + levelScore);
        play('correct');

        const nextLvl = level + 1;
        setLevel(nextLvl);

        const t = setTimeout(() => {
          generateNextLevel(nextLvl, sequence);
        }, 1000);
        timeoutsRef.current.push(t);
      }
    } else {
      // Wrong tile pressed
      play('wrong');
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        handleGameOver();
      } else {
        // Replay current pattern
        setUserStep(0);
        const t = setTimeout(() => {
          playPatternSequence(sequence);
        }, 1000);
        timeoutsRef.current.push(t);
      }
    }
  };

  const nextLevelScore = (lvl) => {
    return Math.round(lvl * 150 + 100);
  };

  const handleGameOver = async () => {
    clearAllTimeouts();
    setIsPlaying(false);
    setIsGameOver(true);
    play('victory');
    if (level >= 7) fireBigConfetti();

    if (isAuthenticated) {
      setIsSubmitting(true);
      try {
        const res = await api.scores.submit({
          gameSlug: 'pattern-memory',
          score,
          accuracy: Math.min(100, Math.max(50, Math.round((level / (level + (3 - lives))) * 100))),
          timeTakenSeconds: level * 5,
          levelReached: level,
          metadata: { maxLevel: level, livesRemaining: lives }
        });
        if (onScoreSubmitted) onScoreSubmitted(res);
        if (res.unlockedAchievements?.length > 0 && onAchievementUnlocked) {
          res.unlockedAchievements.forEach(ach => onAchievementUnlocked(ach));
        }
      } catch (err) {
        console.error('Error submitting pattern score:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header Metrics */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
        
        {/* Level */}
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary-500" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Level</span>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">{level}</p>
          </div>
        </div>

        {/* Lives */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition-all ${
                  i < lives ? 'text-rose-500 fill-rose-500 scale-110' : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="ml-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Lives</span>
            <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{lives}/3</p>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score</span>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">{score}</p>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={startGame} icon={RotateCcw}>
          {isPlaying ? 'Restart' : 'Start'}
        </Button>
      </div>

      {/* Main Pattern Matrix Arena */}
      <div className="glass-card rounded-3xl p-6 sm:p-12 relative min-h-[420px] flex flex-col items-center justify-center text-center">
        {!isPlaying && !isGameOver ? (
          <div className="space-y-6 animate-pop max-w-md">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-neon-blue">
              <Grid className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white mb-2">
                Pattern Memory
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Memorize the evolving sequence of glowing nodes and replicate it without making a mistake.
              </p>
            </div>
            <Button size="lg" variant="primary" onClick={startGame} icon={Play}>
              Begin Sequence
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-pop flex flex-col items-center">
            
            {/* Status Indicator */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all">
              {isDisplayingPattern ? (
                <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4" /> Watch Pattern Closely...
                </span>
              ) : (
                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Your Turn ({userStep}/{sequence.length})
                </span>
              )}
            </div>

            {/* 3x3 Tile Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-72 sm:w-80 aspect-square">
              {Array.from({ length: GRID_SIZE }).map((_, idx) => {
                const isActive = activeTile === idx;
                
                const tileColors = [
                  'from-blue-500 to-cyan-400',
                  'from-purple-500 to-indigo-400',
                  'from-emerald-500 to-teal-400',
                  'from-amber-500 to-yellow-400',
                  'from-rose-500 to-pink-400',
                  'from-indigo-500 to-blue-400',
                  'from-teal-500 to-emerald-400',
                  'from-fuchsia-500 to-purple-400',
                  'from-cyan-500 to-blue-400'
                ];

                return (
                  <button
                    key={idx}
                    disabled={isDisplayingPattern}
                    onClick={() => handleTileClick(idx)}
                    className={`rounded-2xl transition-all duration-200 aspect-square flex items-center justify-center font-bold text-xl relative overflow-hidden select-none active:scale-95 disabled:cursor-not-allowed ${
                      isActive
                        ? `bg-gradient-to-tr ${tileColors[idx]} text-white shadow-neon-hover scale-105 ring-4 ring-white/60 dark:ring-white/40`
                        : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700/80 hover:border-primary-400 hover:shadow-neon-blue'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full transition-all ${isActive ? 'bg-white scale-150 shadow-lg' : 'bg-slate-400/40'}`} />
                  </button>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* Game Over Modal */}
      <Modal isOpen={isGameOver} onClose={() => setIsGameOver(false)} maxWidth="max-w-md" showClose={false}>
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-blue-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-purple-500/30 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mb-1">
              Pattern Run Complete! 🌟
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You reached <span className="font-bold text-primary-500">Level {level}</span> with great visual memory recall.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Score</span>
              <p className="text-xl font-extrabold text-primary-600 dark:text-primary-400 font-mono">+{score}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Max Level</span>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-200 font-mono">Level {level}</p>
            </div>
          </div>

          <Button variant="primary" className="w-full" onClick={startGame} icon={RotateCcw}>
            Play Again
          </Button>
        </div>
      </Modal>

    </div>
  );
}
