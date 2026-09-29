import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  RotateCcw, 
  Clock, 
  Flame, 
  Trophy, 
  Sparkles, 
  Check, 
  X, 
  Zap, 
  ArrowRight 
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useSound } from '../context/SoundContext';
import { fireBigConfetti } from '../utils/helpers';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const GAME_DURATION = 45; // 45 seconds per round

const DIFFICULTIES = [
  { id: 'easy', name: 'Casual', desc: 'Basic addition & subtraction', maxNum: 20 },
  { id: 'medium', name: 'Rapid', desc: 'Multiplication & 2-step math', maxNum: 50 },
  { id: 'hard', name: 'Blitz', desc: 'Mixed arithmetic with division', maxNum: 100 },
  { id: 'genius', name: 'Einstein', desc: 'Mental agility equations', maxNum: 250 }
];

export default function NumberChallengeGame({ onScoreSubmitted, onAchievementUnlocked }) {
  const { play } = useSound();
  const { isAuthenticated } = useAuth();

  const [difficulty, setDifficulty] = useState('medium');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef(null);

  // Generate dynamic math question based on difficulty
  const generateQuestion = (diff = difficulty) => {
    let num1, num2, operation, answer, questionText;

    if (diff === 'easy') {
      const ops = ['+', '-'];
      operation = ops[Math.floor(Math.random() * ops.length)];
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
      answer = operation === '+' ? num1 + num2 : num1 - num2;
      questionText = `${num1} ${operation} ${num2}`;
    } else if (diff === 'medium') {
      const ops = ['+', '-', '×'];
      operation = ops[Math.floor(Math.random() * ops.length)];
      if (operation === '×') {
        num1 = Math.floor(Math.random() * 12) + 2;
        num2 = Math.floor(Math.random() * 12) + 2;
        answer = num1 * num2;
      } else {
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 50) + 10;
        if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
        answer = operation === '+' ? num1 + num2 : num1 - num2;
      }
      questionText = `${num1} ${operation} ${num2}`;
    } else if (diff === 'hard') {
      const ops = ['+', '-', '×', '÷'];
      operation = ops[Math.floor(Math.random() * ops.length)];
      if (operation === '÷') {
        num2 = Math.floor(Math.random() * 9) + 2;
        const multiplier = Math.floor(Math.random() * 12) + 2;
        num1 = num2 * multiplier;
        answer = multiplier;
      } else if (operation === '×') {
        num1 = Math.floor(Math.random() * 15) + 3;
        num2 = Math.floor(Math.random() * 15) + 3;
        answer = num1 * num2;
      } else {
        num1 = Math.floor(Math.random() * 100) + 20;
        num2 = Math.floor(Math.random() * 100) + 20;
        if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
        answer = operation === '+' ? num1 + num2 : num1 - num2;
      }
      questionText = `${num1} ${operation} ${num2}`;
    } else {
      // Einstein: 3 operand equations e.g. (A * B) - C
      const op1 = Math.random() > 0.5 ? '×' : '+';
      const a = Math.floor(Math.random() * 12) + 3;
      const b = Math.floor(Math.random() * 8) + 2;
      const c = Math.floor(Math.random() * 20) + 1;
      const intermediate = op1 === '×' ? a * b : a + b;
      answer = intermediate - c;
      questionText = `(${a} ${op1} ${b}) - ${c}`;
    }

    // Generate 3 clever incorrect decoy options
    const options = new Set([answer]);
    while (options.size < 4) {
      const offset = (Math.floor(Math.random() * 9) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const decoy = answer + offset;
      if (decoy >= 0 && decoy !== answer) {
        options.add(decoy);
      }
    }

    const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

    return {
      question: questionText,
      answer,
      options: shuffledOptions
    };
  };

  const startGame = (diff = difficulty) => {
    setIsPlaying(true);
    setIsGameOver(false);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setTotalAnswered(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setCurrentQuestion(generateQuestion(diff));
  };

  // Countdown timer
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

  const handleAnswer = (option) => {
    if (!isPlaying || selectedAnswer !== null) return;

    setSelectedAnswer(option);
    setTotalAnswered(prev => prev + 1);

    const isCorrect = option === currentQuestion.answer;
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      play('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setCorrectCount(prev => prev + 1);

      // Multiplier bonus based on streak
      const multiplier = newStreak >= 8 ? 3.0 : newStreak >= 4 ? 2.0 : newStreak >= 2 ? 1.5 : 1.0;
      const basePoints = difficulty === 'genius' ? 300 : difficulty === 'hard' ? 200 : difficulty === 'medium' ? 150 : 100;
      const earned = Math.round(basePoints * multiplier);
      setScore(prev => prev + earned);
    } else {
      play('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
      setCurrentQuestion(generateQuestion(difficulty));
    }, 400);
  };

  const handleGameOver = async () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setIsGameOver(true);

    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    play('victory');
    if (score >= 2000) fireBigConfetti();

    if (isAuthenticated) {
      setIsSubmitting(true);
      try {
        const res = await api.scores.submit({
          gameSlug: 'number-challenge',
          score,
          accuracy,
          timeTakenSeconds: GAME_DURATION,
          levelReached: difficulty === 'genius' ? 5 : difficulty === 'hard' ? 4 : difficulty === 'medium' ? 3 : 2,
          metadata: { streak: maxStreak, correctCount, totalAnswered, difficulty }
        });
        if (onScoreSubmitted) onScoreSubmitted(res);
        if (res.unlockedAchievements?.length > 0 && onAchievementUnlocked) {
          res.unlockedAchievements.forEach(ach => onAchievementUnlocked(ach));
        }
      } catch (err) {
        console.error('Error submitting math score:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header Metrics */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
        
        {/* Difficulty buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              disabled={isPlaying}
              onClick={() => {
                play('click');
                setDifficulty(d.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                difficulty === d.id
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
            <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-primary-500'}`} />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Timer</span>
              <p className={`font-mono text-base font-bold ${timeLeft <= 10 ? 'text-rose-500 animate-bounce' : 'text-slate-900 dark:text-white'}`}>
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
            <Trophy className="w-5 h-5 text-emerald-500" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score</span>
              <p className="font-mono text-base font-bold text-slate-900 dark:text-white">{score}</p>
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => startGame(difficulty)}
          icon={RotateCcw}
        >
          {isPlaying ? 'Restart' : 'Start'}
        </Button>
      </div>

      {/* Main Arena Box */}
      <div className="glass-card rounded-3xl p-6 sm:p-12 relative min-h-[380px] flex flex-col items-center justify-center text-center">
        {!isPlaying && !isGameOver ? (
          <div className="space-y-6 animate-pop max-w-md">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary-600 to-cyan-400 flex items-center justify-center mx-auto text-white shadow-neon-blue">
              <Calculator className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white mb-2">
                Speed Arithmetic
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Solve as many rapid math operations as you can in 45 seconds. Build combos for massive score multipliers!
              </p>
            </div>
            <Button size="lg" variant="primary" onClick={() => startGame(difficulty)} icon={Zap}>
              Start Challenge
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-lg mx-auto space-y-8 animate-pop">
            
            {/* Streak Combo Pill */}
            {streak >= 3 && (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold animate-pulse">
                <Flame className="w-4 h-4 fill-amber-400" />
                {streak >= 8 ? '3.0x MAX ULTRA COMBO!' : streak >= 4 ? '2.0x SUPER COMBO!' : '1.5x COMBO!'}
              </div>
            )}

            {/* Arithmetic Equation Display */}
            <div className="py-6 px-8 rounded-3xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-inner">
              <h2 className="text-4xl sm:text-6xl font-black font-mono tracking-wider text-slate-900 dark:text-white">
                {currentQuestion?.question} = ?
              </h2>
            </div>

            {/* 4 Choices Grid */}
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion?.options.map((opt, idx) => {
                const isSelected = selectedAnswer === opt;
                let btnStyle = 'bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700/80 hover:border-primary-500';

                if (isSelected) {
                  if (isAnswerCorrect) {
                    btnStyle = 'bg-emerald-500 text-white border-2 border-emerald-400 shadow-emerald-500/40 animate-pop';
                  } else {
                    btnStyle = 'bg-rose-500 text-white border-2 border-rose-400 shadow-rose-500/40 animate-shake';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(opt)}
                    className={`py-5 px-6 rounded-2xl font-mono text-2xl font-extrabold transition-all duration-150 active:scale-95 shadow-md flex items-center justify-center gap-2 ${btnStyle}`}
                  >
                    {opt}
                    {isSelected && isAnswerCorrect && <Check className="w-6 h-6 text-white" />}
                    {isSelected && !isAnswerCorrect && <X className="w-6 h-6 text-white" />}
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
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 flex items-center justify-center mx-auto text-slate-950 shadow-xl shadow-amber-500/30 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mb-1">
              Time's Up! ⏰
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Incredible mental agility workout!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Score</span>
              <p className="text-lg font-extrabold text-primary-600 dark:text-primary-400 font-mono">+{score}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Solved</span>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">{correctCount} / {totalAnswered}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Best Streak</span>
              <p className="text-lg font-bold text-amber-500 font-mono">{maxStreak}x</p>
            </div>
          </div>

          <Button variant="primary" className="w-full" onClick={() => startGame(difficulty)} icon={RotateCcw}>
            Play Again
          </Button>
        </div>
      </Modal>

    </div>
  );
}
