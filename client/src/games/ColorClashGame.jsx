import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Clock, 
  Flame, 
  Trophy, 
  Sparkles, 
  Check, 
  X, 
  Palette 
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useSound } from '../context/SoundContext';
import { fireBigConfetti } from '../utils/helpers';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLOR_PALETTE = [
  { name: 'RED', hex: '#EF4444', textClass: 'text-red-500', bgClass: 'bg-red-500', borderClass: 'border-red-500' },
  { name: 'BLUE', hex: '#3B82F6', textClass: 'text-blue-500', bgClass: 'bg-blue-500', borderClass: 'border-blue-500' },
  { name: 'GREEN', hex: '#10B981', textClass: 'text-emerald-500', bgClass: 'bg-emerald-500', borderClass: 'border-emerald-500' },
  { name: 'YELLOW', hex: '#F59E0B', textClass: 'text-amber-400', bgClass: 'bg-amber-400', borderClass: 'border-amber-400' },
  { name: 'PURPLE', hex: '#A855F7', textClass: 'text-purple-500', bgClass: 'bg-purple-500', borderClass: 'border-purple-500' },
  { name: 'PINK', hex: '#EC4899', textClass: 'text-pink-500', bgClass: 'bg-pink-500', borderClass: 'border-pink-500' }
];

const GAME_TIME = 35; // 35 seconds of speed clash

export default function ColorClashGame({ onScoreSubmitted, onAchievementUnlocked }) {
  const { play } = useSound();
  const { isAuthenticated } = useAuth();

  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'

  const timerRef = useRef(null);

  // Generate next Stroop conflict
  const generateConflict = () => {
    // Word text name
    const wordColorObj = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    // Ink color (can be different or same)
    const inkColorObj = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

    // Target is the INK COLOR!
    const correctAnswerName = inkColorObj.name;

    // Pick 4 options including correct answer
    const options = new Set([inkColorObj]);
    while (options.size < 4) {
      const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
      options.add(randomColor);
    }

    const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

    return {
      word: wordColorObj.name,
      ink: inkColorObj,
      correctAnswer: correctAnswerName,
      options: shuffledOptions
    };
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setTimeLeft(GAME_TIME);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setTotalCount(0);
    setFeedback(null);
    setCurrentChallenge(generateConflict());
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

  const handleChoice = (colorObj) => {
    if (!isPlaying) return;

    setTotalCount(prev => prev + 1);
    const isCorrect = colorObj.name === currentChallenge.correctAnswer;

    if (isCorrect) {
      play('correct');
      setFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setCorrectCount(prev => prev + 1);

      // Streak multiplier bonus
      const multiplier = newStreak >= 8 ? 3.0 : newStreak >= 4 ? 2.0 : newStreak >= 2 ? 1.5 : 1.0;
      const earned = Math.round(150 * multiplier);
      setScore(prev => prev + earned);
    } else {
      play('wrong');
      setFeedback('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentChallenge(generateConflict());
    }, 200);
  };

  const handleGameOver = async () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setIsGameOver(true);
    play('victory');
    if (score >= 2500) fireBigConfetti();

    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    if (isAuthenticated) {
      try {
        const res = await api.scores.submit({
          gameSlug: 'color-clash',
          score,
          accuracy,
          timeTakenSeconds: GAME_TIME,
          levelReached: maxStreak >= 10 ? 5 : maxStreak >= 5 ? 3 : 2,
          metadata: { streak: maxStreak, correctCount, totalCount }
        });
        if (onScoreSubmitted) onScoreSubmitted(res);
        if (res.unlockedAchievements?.length > 0 && onAchievementUnlocked) {
          res.unlockedAchievements.forEach(ach => onAchievementUnlocked(ach));
        }
      } catch (err) {
        console.error('Error submitting color clash score:', err);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 shadow-lg">
        
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
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Combo</span>
            <p className="font-mono text-base font-bold text-amber-500">{streak}x</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-emerald-500" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score</span>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">{score}</p>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={startGame} icon={RotateCcw}>
          {isPlaying ? 'Restart' : 'Start'}
        </Button>
      </div>

      {/* Main Arena */}
      <div className="glass-card rounded-3xl p-6 sm:p-12 relative min-h-[400px] flex flex-col items-center justify-center text-center border-2 border-cyan-500/20 shadow-neon-blue">
        {!isPlaying && !isGameOver ? (
          <div className="space-y-6 animate-pop max-w-md">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-cyan-500/30 animate-float">
              🎨⚡
            </div>
            <div>
              <h3 className="text-3xl font-black font-heading text-slate-900 dark:text-white mb-2">
                Color Clash (Stroop) 🧠💥
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                The ultimate visual reflex challenge! <br />
                <span className="text-pink-500 font-bold">Rule:</span> Tap the <span className="underline font-black">INK COLOR</span> of the word, NOT what the text spells!
              </p>
            </div>
            <Button size="lg" variant="primary" onClick={startGame} icon={Zap} className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-cyan-500/30">
              Start Color Clash 🚀
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto space-y-8 animate-pop">
            
            {/* Combo Bar */}
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-pink-500 rounded-full transition-all duration-200"
                style={{ width: `${Math.min(100, streak * 10)}%` }}
              />
            </div>

            {/* Conflicting Word Display */}
            <div className="py-8 px-6 rounded-3xl bg-slate-100 dark:bg-slate-950/80 border-2 border-slate-200 dark:border-slate-800 shadow-inner relative overflow-hidden">
              <span
                className="text-5xl sm:text-7xl font-black font-heading tracking-widest block transition-all select-none animate-pop"
                style={{ color: currentChallenge?.ink.hex }}
              >
                {currentChallenge?.word}
              </span>
              <span className="text-xs uppercase font-bold text-slate-400 block mt-3">
                TAP THE INK COLOR! 👇
              </span>
            </div>

            {/* 4 Choices Palette Grid */}
            <div className="grid grid-cols-2 gap-4">
              {currentChallenge?.options.map((col, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(col)}
                  className={`py-4 px-6 rounded-2xl font-black text-lg text-white shadow-lg transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 ${col.bgClass} hover:opacity-90 hover:scale-105`}
                >
                  {col.name}
                </button>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* Results Modal */}
      <Modal isOpen={isGameOver} onClose={() => setIsGameOver(false)} maxWidth="max-w-md" showClose={false}>
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-cyan-500/30 animate-bounce">
            🎨
          </div>

          <div>
            <h3 className="text-2xl font-black font-heading text-slate-900 dark:text-white mb-1">
              {score >= 2500 ? "Brain Reflex God! ⚡" : score >= 1200 ? "Sharp Vision! 👁️✨" : "Brain Melted! 🫠"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You correctly identified {correctCount} out of {totalCount} ink clashes!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Score</span>
              <p className="text-lg font-extrabold text-cyan-500 font-mono">+{score}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Solved</span>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">{correctCount}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Max Combo</span>
              <p className="text-lg font-bold text-amber-500 font-mono">{maxStreak}x</p>
            </div>
          </div>

          <Button variant="primary" className="w-full bg-gradient-to-r from-cyan-500 to-purple-600" onClick={startGame} icon={RotateCcw}>
            Play Again! 🚀
          </Button>
        </div>
      </Modal>

    </div>
  );
}
