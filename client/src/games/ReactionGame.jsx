import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Trophy, 
  Clock, 
  AlertCircle, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  Flame 
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useSound } from '../context/SoundContext';
import { fireBigConfetti } from '../utils/helpers';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TOTAL_ROUNDS = 5;

export default function ReactionGame({ onScoreSubmitted, onAchievementUnlocked }) {
  const { play } = useSound();
  const { isAuthenticated } = useAuth();

  // States: 'idle' | 'waiting' | 'ready' | 'early' | 'roundResult' | 'finished'
  const [gameState, setGameState] = useState('idle');
  const [currentRound, setCurrentRound] = useState(1);
  const [roundTimes, setRoundTimes] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [lastReaction, setLastReaction] = useState(null);
  const [finalScore, setFinalScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeoutRef = useRef(null);

  const startRound = () => {
    setGameState('waiting');
    play('tone');

    // Random delay between 1.5s and 4.5s
    const randomDelay = Math.floor(Math.random() * 3000) + 1500;

    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      setStartTime(performance.now());
      play('countdown');
    }, randomDelay);
  };

  const handleBoxClick = () => {
    if (gameState === 'idle') {
      startRound();
    } else if (gameState === 'waiting') {
      // Clicked too early!
      clearTimeout(timeoutRef.current);
      play('error');
      setGameState('early');
    } else if (gameState === 'ready') {
      // Successful reaction click
      const endTime = performance.now();
      const reactionTime = Math.round(endTime - startTime);
      play('correct');
      setLastReaction(reactionTime);

      const updatedTimes = [...roundTimes, reactionTime];
      setRoundTimes(updatedTimes);

      if (updatedTimes.length >= TOTAL_ROUNDS) {
        finishGame(updatedTimes);
      } else {
        setGameState('roundResult');
      }
    } else if (gameState === 'early' || gameState === 'roundResult') {
      if (currentRound < TOTAL_ROUNDS) {
        setCurrentRound(prev => prev + 1);
        startRound();
      } else {
        finishGame(roundTimes);
      }
    }
  };

  const finishGame = async (times) => {
    setGameState('finished');
    const validTimes = times.length ? times : [500];
    const avg = Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length);
    const best = Math.min(...validTimes);

    // Score formula: Higher points for faster response
    // E.g., 200ms -> ~3000 pts; 350ms -> ~1500 pts
    const computedScore = Math.max(100, Math.round(4000 - avg * 6.5));
    setFinalScore(computedScore);

    if (best <= 250) {
      fireBigConfetti();
      play('victory');
    } else {
      play('victory');
    }

    if (isAuthenticated) {
      setIsSubmitting(true);
      try {
        const res = await api.scores.submit({
          gameSlug: 'reaction-time',
          score: computedScore,
          accuracy: Math.min(100, Math.max(50, Math.round((280 / avg) * 100))),
          timeTakenSeconds: Math.round(avg / 100),
          levelReached: avg <= 220 ? 5 : avg <= 280 ? 4 : avg <= 350 ? 3 : 2,
          metadata: { avgReactionMs: avg, bestReactionMs: best, rounds: times }
        });
        if (onScoreSubmitted) onScoreSubmitted(res);
        if (res.unlockedAchievements?.length > 0 && onAchievementUnlocked) {
          res.unlockedAchievements.forEach(ach => onAchievementUnlocked(ach));
        }
      } catch (err) {
        console.error('Error submitting reaction score:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetGame = () => {
    clearTimeout(timeoutRef.current);
    setGameState('idle');
    setCurrentRound(1);
    setRoundTimes([]);
    setLastReaction(null);
    setFinalScore(0);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // Compute live averages
  const avgTime = roundTimes.length
    ? Math.round(roundTimes.reduce((a, b) => a + b, 0) / roundTimes.length)
    : 0;
  const bestTime = roundTimes.length ? Math.min(...roundTimes) : 0;

  // Tier classification
  const getTier = (ms) => {
    if (!ms) return { name: 'Untested', color: 'text-slate-400' };
    if (ms <= 210) return { name: 'Neural God ⚡', color: 'text-cyan-400 font-extrabold' };
    if (ms <= 250) return { name: 'Lightning Reflex 🚀', color: 'text-emerald-400 font-bold' };
    if (ms <= 300) return { name: 'Swift Mind 🎯', color: 'text-blue-400 font-bold' };
    if (ms <= 380) return { name: 'Average Human 🧠', color: 'text-amber-400 font-medium' };
    return { name: 'Sluggish 🐢', color: 'text-rose-400 font-medium' };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header Metrics */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
        
        {/* Round tracker */}
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-500" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Round</span>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {Math.min(currentRound, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}
            </p>
          </div>
        </div>

        {/* Best Time */}
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Best Reaction</span>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {bestTime ? `${bestTime} ms` : '--'}
            </p>
          </div>
        </div>

        {/* Avg Time */}
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-500" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Average</span>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {avgTime ? `${avgTime} ms` : '--'}
            </p>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={resetGame} icon={RotateCcw}>
          Restart
        </Button>
      </div>

      {/* Main Interactive Reaction Surface */}
      <div
        onClick={handleBoxClick}
        className={`w-full min-h-[420px] rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-200 relative overflow-hidden shadow-2xl ${
          gameState === 'idle'
            ? 'bg-gradient-to-tr from-primary-900 to-indigo-950 text-white border-2 border-primary-500/50 hover:border-primary-400 hover:shadow-neon-hover'
            : gameState === 'waiting'
            ? 'bg-gradient-to-tr from-rose-900 to-red-950 text-white border-2 border-rose-500 shadow-rose-500/30'
            : gameState === 'ready'
            ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 border-4 border-white shadow-emerald-400/50 animate-pulse'
            : gameState === 'early'
            ? 'bg-gradient-to-tr from-amber-900 to-orange-950 text-white border-2 border-amber-500'
            : 'bg-gradient-to-tr from-slate-900 to-slate-950 text-white border-2 border-primary-500/60'
        }`}
      >
        {gameState === 'idle' && (
          <div className="space-y-4 animate-pop">
            <div className="w-20 h-20 rounded-3xl bg-primary-500/20 border border-primary-400/30 flex items-center justify-center mx-auto text-primary-400">
              <Zap className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-heading">
              Test Your Reflexes
            </h3>
            <p className="text-sm sm:text-base text-blue-200/80 max-w-md mx-auto">
              When the box turns <span className="text-emerald-400 font-bold">GREEN</span>, click as lightning-fast as you can!
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-bold text-sm shadow-neon-blue">
                Click anywhere to Start
              </span>
            </div>
          </div>
        )}

        {gameState === 'waiting' && (
          <div className="space-y-4 animate-pulse">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto text-rose-300">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-black font-heading text-rose-200">
              Wait for Green...
            </h3>
            <p className="text-xs text-rose-300/80 uppercase tracking-widest font-bold">
              Stay focused, do not click yet!
            </p>
          </div>
        )}

        {gameState === 'ready' && (
          <div className="space-y-2 animate-pop">
            <h2 className="text-5xl sm:text-6xl font-black font-heading tracking-tight text-slate-950">
              CLICK NOW!
            </h2>
            <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">
              TAP AS FAST AS POSSIBLE!
            </p>
          </div>
        )}

        {gameState === 'early' && (
          <div className="space-y-4 animate-shake">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto text-amber-300">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-amber-300">
              Too Early!
            </h3>
            <p className="text-sm text-amber-200/80">
              You clicked before it turned green. Take a breath!
            </p>
            <span className="inline-block text-xs font-bold bg-amber-500/20 text-amber-200 px-4 py-2 rounded-xl border border-amber-500/40">
              Click to try again
            </span>
          </div>
        )}

        {gameState === 'roundResult' && (
          <div className="space-y-4 animate-pop">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">Round {currentRound} Result</span>
            <h2 className="text-5xl font-black font-heading font-mono text-white">
              {lastReaction} <span className="text-2xl text-slate-400">ms</span>
            </h2>
            <p className={`text-sm ${getTier(lastReaction).color}`}>
              {getTier(lastReaction).name}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-md">
                Click for Next Round <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Trial History Bar */}
      {roundTimes.length > 0 && (
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between gap-2 overflow-x-auto">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
            const timeVal = roundTimes[i];
            return (
              <div
                key={i}
                className={`flex-1 min-w-[70px] p-2.5 rounded-xl border text-center transition-all ${
                  timeVal
                    ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                    : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-bold uppercase">R{i + 1}</div>
                <div className="font-mono text-sm font-bold mt-0.5">
                  {timeVal ? `${timeVal}ms` : '--'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Final Victory / Results Modal */}
      <Modal isOpen={gameState === 'finished'} onClose={resetGame} maxWidth="max-w-md" showClose={false}>
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-400 via-primary-500 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-primary-500/30 animate-bounce">
            <Zap className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mb-1">
              Reaction Test Complete! ⚡
            </h3>
            <p className={`text-base ${getTier(avgTime).color}`}>
              {getTier(avgTime).name}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Score</span>
              <p className="text-lg font-extrabold text-primary-600 dark:text-primary-400 font-mono">+{finalScore}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Reaction</span>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">{avgTime}ms</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Best Click</span>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">{bestTime}ms</p>
            </div>
          </div>

          <Button variant="primary" className="w-full" onClick={resetGame} icon={RotateCcw}>
            Try for Higher Speed
          </Button>
        </div>
      </Modal>

    </div>
  );
}
