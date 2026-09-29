import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Pause, 
  Trophy, 
  Clock, 
  Target, 
  Sparkles, 
  Zap, 
  Award,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useSound } from '../context/SoundContext';
import { fireConfetti, fireBigConfetti, formatTime } from '../utils/helpers';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CARD_ICONS = [
  { id: 'brain', emoji: '🧠', name: 'Brain' },
  { id: 'zap', emoji: '⚡', name: 'Lightning' },
  { id: 'fire', emoji: '🔥', name: 'Flame' },
  { id: 'gem', emoji: '💎', name: 'Diamond' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket' },
  { id: 'star', emoji: '⭐', name: 'Star' },
  { id: 'target', emoji: '🎯', name: 'Target' },
  { id: 'crown', emoji: '👑', name: 'Crown' },
  { id: 'atom', emoji: '⚛️', name: 'Atom' },
  { id: 'compass', emoji: '🧭', name: 'Compass' },
  { id: 'eye', emoji: '👁️', name: 'Focus' },
  { id: 'infinity', emoji: '♾️', name: 'Infinite' }
];

const DIFFICULTIES = [
  { level: 'easy', name: 'Easy', pairs: 6, gridCols: 'grid-cols-3 sm:grid-cols-4', baseScore: 1000 },
  { level: 'medium', name: 'Medium', pairs: 8, gridCols: 'grid-cols-4', baseScore: 1600 },
  { level: 'hard', name: 'Hard', pairs: 12, gridCols: 'grid-cols-4 sm:grid-cols-6', baseScore: 2400 }
];

export default function MemoryMatchGame({ onScoreSubmitted, onAchievementUnlocked }) {
  const { play } = useSound();
  const { isAuthenticated } = useAuth();
  
  const [difficulty, setDifficulty] = useState('medium');
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streak, setStreak] = useState(0);

  const timerRef = useRef(null);
  const currentDiff = DIFFICULTIES.find(d => d.level === difficulty) || DIFFICULTIES[1];

  // Initialize Cards
  const initGame = (selectedDiff = difficulty) => {
    const diff = DIFFICULTIES.find(d => d.level === selectedDiff) || DIFFICULTIES[1];
    const selectedIcons = CARD_ICONS.slice(0, diff.pairs);
    const deck = [...selectedIcons, ...selectedIcons].map((item, idx) => ({
      uniqueId: idx,
      pairId: item.id,
      emoji: item.emoji,
      name: item.name
    }));

    // Fisher-Yates Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMatchedIds([]);
    setMoves(0);
    setTime(0);
    setStreak(0);
    setGameWon(false);
    setIsPaused(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    initGame(difficulty);
    return () => clearInterval(timerRef.current);
  }, [difficulty]);

  // Timer Interval
  useEffect(() => {
    if (isPlaying && !isPaused && !gameWon) {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, isPaused, gameWon]);

  // Check Game Won
  useEffect(() => {
    if (cards.length > 0 && matchedIds.length === currentDiff.pairs) {
      handleVictory();
    }
  }, [matchedIds, cards]);

  const handleCardClick = (index) => {
    if (!isPlaying || isPaused || flippedIndices.length >= 2 || flippedIndices.includes(index) || matchedIds.includes(cards[index].pairId)) {
      return;
    }

    play('flip');
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        setTimeout(() => {
          play('match');
          setMatchedIds(prev => [...prev, firstCard.pairId]);
          setFlippedIndices([]);
          setStreak(prev => prev + 1);
        }, 400);
      } else {
        // Not Matched
        setTimeout(() => {
          play('wrong');
          setFlippedIndices([]);
          setStreak(0);
        }, 900);
      }
    }
  };

  const handleVictory = async () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setGameWon(true);
    fireBigConfetti();
    play('victory');

    // Score Calculation Formula
    const timeBonus = Math.max(0, 1200 - time * 18);
    const moveBonus = Math.max(0, 1000 - moves * 25);
    const difficultyMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1.0;
    const computedScore = Math.round((currentDiff.baseScore + timeBonus + moveBonus) * difficultyMultiplier);
    
    // Accuracy %
    const accuracy = moves > 0 ? Math.min(100, Math.round((currentDiff.pairs / moves) * 100)) : 100;
    setFinalScore(computedScore);

    // Auto submit score to API
    if (isAuthenticated) {
      setIsSubmitting(true);
      try {
        const res = await api.scores.submit({
          gameSlug: 'memory-match',
          score: computedScore,
          accuracy,
          timeTakenSeconds: time,
          levelReached: difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1,
          metadata: { moves, difficulty, pairs: currentDiff.pairs }
        });
        if (onScoreSubmitted) onScoreSubmitted(res);
        if (res.unlockedAchievements?.length > 0 && onAchievementUnlocked) {
          res.unlockedAchievements.forEach(ach => onAchievementUnlocked(ach));
        }
      } catch (err) {
        console.error('Failed to submit score:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const togglePause = () => {
    play('click');
    setIsPaused(prev => !prev);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header Dashboard */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
        
        {/* Difficulty Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          {DIFFICULTIES.map(d => (
            <button
              key={d.level}
              onClick={() => {
                play('click');
                setDifficulty(d.level);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                difficulty === d.level
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time</span>
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white">{formatTime(time)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Moves</span>
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white">{moves}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Matches</span>
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white">{matchedIds.length} / {currentDiff.pairs}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePause}
            icon={Pause}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => initGame(difficulty)}
            icon={RotateCcw}
          >
            Restart
          </Button>
        </div>
      </div>

      {/* Game Board */}
      <div className="glass-card rounded-3xl p-4 sm:p-8 relative min-h-[380px] flex items-center justify-center">
        
        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md rounded-3xl z-20 flex flex-col items-center justify-center text-white">
            <h3 className="text-2xl font-bold font-heading mb-4">Game Paused</h3>
            <Button variant="primary" size="lg" onClick={togglePause} icon={Play}>
              Resume Game
            </Button>
          </div>
        )}

        {/* Grid of Cards */}
        <div className={`grid ${currentDiff.gridCols} gap-3 sm:gap-4 w-full max-w-2xl mx-auto perspective-1000`}>
          {cards.map((card, idx) => {
            const isFlipped = flippedIndices.includes(idx) || matchedIds.includes(card.pairId);
            const isMatched = matchedIds.includes(card.pairId);

            return (
              <div
                key={card.uniqueId}
                onClick={() => handleCardClick(idx)}
                className={`relative aspect-square cursor-pointer transition-all duration-300 transform-style-3d select-none ${
                  isFlipped ? 'rotate-y-180' : 'hover:scale-105 active:scale-95'
                }`}
              >
                {/* Front Side (Face Down) */}
                <div className={`absolute inset-0 rounded-2xl flex items-center justify-center backface-hidden shadow-md transition-all ${
                  'bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700/80 hover:border-primary-500/80 hover:shadow-neon-blue'
                }`}>
                  <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                    <Zap className="w-4 h-4 opacity-70" />
                  </div>
                </div>

                {/* Back Side (Face Up / Revealed) */}
                <div className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center rotate-y-180 backface-hidden shadow-lg transition-all ${
                  isMatched
                    ? 'bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-tr from-primary-500/20 to-cyan-500/20 border-2 border-primary-500 text-white shadow-neon-blue'
                }`}>
                  <span className="text-3xl sm:text-4xl filter drop-shadow-md animate-pop">
                    {card.emoji}
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1 opacity-80">
                    {card.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Victory Modal */}
      <Modal isOpen={gameWon} onClose={() => setGameWon(false)} maxWidth="max-w-md" showClose={false}>
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center mx-auto text-slate-950 shadow-xl shadow-amber-500/30 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mb-1">
              Memory Master! 🎉
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You matched all {currentDiff.pairs} pairs with razor-sharp precision.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Score</span>
              <p className="text-lg font-extrabold text-primary-600 dark:text-primary-400 font-mono">+{finalScore}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Time</span>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">{formatTime(time)}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Moves</span>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">{moves}</p>
            </div>
          </div>

          {!isAuthenticated && (
            <p className="text-xs text-amber-500 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 font-medium">
              💡 Log in or register to save your scores to the global leaderboard!
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setGameWon(false);
                initGame(difficulty);
              }}
              icon={RotateCcw}
            >
              Play Again
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                setGameWon(false);
                const nextDiff = difficulty === 'easy' ? 'medium' : 'hard';
                setDifficulty(nextDiff);
              }}
              icon={ArrowRight}
            >
              Next Level
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
