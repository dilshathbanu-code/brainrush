import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Clock, 
  Trophy, 
  Lightbulb, 
  Check, 
  X, 
  ArrowRight, 
  Smile, 
  Flame 
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useSound } from '../context/SoundContext';
import { fireBigConfetti } from '../utils/helpers';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EMOJI_PUZZLES = [
  {
    id: 1,
    emojis: "😴 ⏰ 🏃💨",
    question: "What student situation is this?",
    options: ["Late for Morning Class! 🏃‍♂️", "Power Nap Champion 💤", "Track & Field Practice 👟", "Morning Coffee Run ☕"],
    correctIndex: 0,
    hint: "The alarm went off 10 minutes ago...",
    funnyReaction: "Running to class like an Olympic sprinter with one shoe on! 👟🤣"
  },
  {
    id: 2,
    emojis: "🍕 🎮 🥤 🌙",
    question: "What is this classic vibe?",
    options: ["Gamer Late Night! 🎮", "Healthy Diet Plan 🥗", "Studying Chemistry 🧪", "Early Bedtime 🛌"],
    correctIndex: 0,
    hint: "'Just one more match and I swear I'll sleep'...",
    funnyReaction: "It's 3 AM, your squad needs you, and the pizza is warm! 🍕🔥"
  },
  {
    id: 3,
    emojis: "🌧️ 🐱 🐶",
    question: "Decode this famous idiom:",
    options: ["Pet Bath Day 🛁", "Raining Cats & Dogs 🌧️", "Animal Shelter 🐾", "Cat & Dog Fight 🥊"],
    correctIndex: 1,
    hint: "When heavy storm clouds pour down outside...",
    funnyReaction: "Don't forget your umbrella, watch out for flying poodles! 🐶☔"
  },
  {
    id: 4,
    emojis: "🧠 🔥 📚 ☕",
    question: "What is this high-stress event?",
    options: ["Exam Night Cramming! 😭", "Casual Book Club 📖", "Coffee Tasting Session ☕", "Brain Surgery 👨‍⚕️"],
    correctIndex: 0,
    hint: "Attempting to learn 4 months of syllabus in 4 hours...",
    funnyReaction: "Loading 1,000 pages of knowledge with 3 cups of espresso! ☕🤯"
  },
  {
    id: 5,
    emojis: "📱 🔋 🔴 😱",
    question: "What modern panic is this?",
    options: ["1% Battery Nightmare! ⚡", "Buying New iPhone 📱", "Do Not Disturb Mode 🔕", "Screen Time Winner 🏆"],
    correctIndex: 0,
    hint: "The dreaded red battery icon when you forgot your charger...",
    funnyReaction: "The ultimate survival horror game: 1% battery and no charger in sight! 😱🔌"
  },
  {
    id: 6,
    emojis: "🍿 🎬 🥤 🕶️",
    question: "What fun activity is this?",
    options: ["Movie Night / Cinema 🎥", "Cooking Popcorn 🌽", "Optometrist Visit 👓", "Grocery Shopping 🛒"],
    correctIndex: 0,
    hint: "Big screen, surround sound, and oversized butter popcorn...",
    funnyReaction: "Eating 90% of the popcorn before the movie trailers even finish! 🍿🎬"
  },
  {
    id: 7,
    emojis: "👑 🐝",
    question: "Decode this pop culture nickname:",
    options: ["Queen Bee 🐝", "Honey Factory 🍯", "Insect Royalty 🐜", "Yellow Jacket 🧥"],
    correctIndex: 0,
    hint: "Leader of the hive (and Beyoncé's nickname!)...",
    funnyReaction: "All hail the Queen Bee! Slay! 👑✨"
  },
  {
    id: 8,
    emojis: "🏖️ ☀️ 🍦 🌊",
    question: "What season/vibe is this?",
    options: ["Summer Vacation! 🌴", "Winter Snowstorm ❄️", "Office Workday 💼", "Library Study Session 📚"],
    correctIndex: 0,
    hint: "No homework, sunshine, and melting ice cream...",
    funnyReaction: "Sun, surf, sand, and zero math homework in sight! 🏖️☀️"
  }
];

const QUESTIONS_PER_ROUND = 5;

export default function EmojiRiddleGame({ onScoreSubmitted, onAchievementUnlocked }) {
  const { play } = useSound();
  const { isAuthenticated } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const timerRef = useRef(null);

  const startGame = () => {
    const shuffled = [...EMOJI_PUZZLES].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_ROUND);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectAnswers(0);
    setSelectedOption(null);
    setShowResult(false);
    setShowHint(false);
    setTimeLeft(30);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && !showResult && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, showResult, timeLeft]);

  const handleTimeExpiry = () => {
    play('wrong');
    setShowResult(true);
    setSelectedOption(-1);
    setStreak(0);
  };

  const handleSelectOption = (index) => {
    if (selectedOption !== null || showResult) return;

    setSelectedOption(index);
    setShowResult(true);
    const curr = questions[currentIndex];
    const isCorrect = index === curr.correctIndex;

    if (isCorrect) {
      play('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      const timeBonus = Math.max(20, timeLeft * 10);
      const streakBonus = newStreak * 50;
      setScore(prev => prev + 250 + timeBonus + streakBonus);
      setCorrectAnswers(prev => prev + 1);
    } else {
      play('wrong');
      setStreak(0);
    }
  };

  const handleNext = () => {
    play('click');
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setShowHint(false);
      setTimeLeft(30);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setIsGameOver(true);
    play('victory');
    if (correctAnswers >= 4) fireBigConfetti();

    if (isAuthenticated) {
      try {
        const res = await api.scores.submit({
          gameSlug: 'emoji-riddle',
          score,
          accuracy: Math.round((correctAnswers / QUESTIONS_PER_ROUND) * 100),
          timeTakenSeconds: QUESTIONS_PER_ROUND * 30 - timeLeft,
          levelReached: correctAnswers >= 4 ? 4 : 2,
          metadata: { correctAnswers, streak }
        });
        if (onScoreSubmitted) onScoreSubmitted(res);
        if (res.unlockedAchievements?.length > 0 && onAchievementUnlocked) {
          res.unlockedAchievements.forEach(ach => onAchievementUnlocked(ach));
        }
      } catch (err) {
        console.error('Error submitting emoji riddle score:', err);
      }
    }
  };

  const curr = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border border-pink-500/30 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 shadow-lg">
        
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Riddle</span>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {isPlaying ? `${currentIndex + 1} / ${questions.length}` : '--'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-cyan-500'}`} />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Timer</span>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">{timeLeft}s</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Flame className={`w-5 h-5 ${streak >= 2 ? 'text-amber-500 fill-amber-500 animate-bounce' : 'text-slate-400'}`} />
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

      {/* Main Interactive Box */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 relative min-h-[420px] flex flex-col justify-center border-2 border-pink-500/20 shadow-neon-hover">
        {!isPlaying && !isGameOver ? (
          <div className="text-center space-y-6 animate-pop max-w-md mx-auto">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-pink-500/30 animate-bounce">
              🎭✨
            </div>
            <div>
              <h3 className="text-3xl font-black font-heading text-slate-900 dark:text-white mb-2">
                Emoji Riddle Master 🎉
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Decode funny emoji combos, student memes, famous idioms, and pop culture riddles before the clock ticks out!
              </p>
            </div>
            <Button size="lg" variant="primary" onClick={startGame} icon={Smile} className="bg-gradient-to-r from-pink-600 to-purple-600 shadow-pink-500/30">
              Start Emoji Quest 🚀
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-pop">
            
            {/* Big Emoji Card */}
            <div className="py-8 px-6 rounded-3xl bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-cyan-900/30 border-2 border-pink-400/40 text-center shadow-inner space-y-3">
              <span className="text-5xl sm:text-7xl filter drop-shadow-lg tracking-widest inline-block animate-pulse">
                {curr?.emojis}
              </span>
              <h4 className="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-white">
                {curr?.question}
              </h4>
            </div>

            {/* Hint Button */}
            {!showResult && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    play('click');
                    setShowHint(!showHint);
                  }}
                  className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1.5"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  {showHint ? 'Hide Hint' : 'Need a hint? 💡'}
                </button>
              </div>
            )}

            {showHint && !showResult && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 animate-pop font-medium">
                💡 <span className="font-bold">Hint:</span> {curr?.hint}
              </div>
            )}

            {/* 4 Choices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {curr?.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === curr.correctIndex;

                let btnClass = 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-pink-400';

                if (showResult) {
                  if (isCorrect) {
                    btnClass = 'bg-emerald-500 text-white border-2 border-emerald-400 shadow-emerald-500/40 animate-pop';
                  } else if (isSelected) {
                    btnClass = 'bg-rose-500 text-white border-2 border-rose-400 shadow-rose-500/40 animate-shake';
                  } else {
                    btnClass = 'opacity-40 bg-slate-100 dark:bg-slate-800/40 text-slate-400 border border-slate-200 dark:border-slate-800';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showResult}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-2xl text-left font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-between gap-3 shadow-md ${btnClass}`}
                  >
                    <span>{opt}</span>
                    {showResult && isCorrect && <Check className="w-5 h-5 text-white shrink-0" />}
                    {showResult && isSelected && !isCorrect && <X className="w-5 h-5 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Funny Explanation */}
            {showResult && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-pink-400/30 animate-pop space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Funny Insight
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                  {curr?.funnyReaction}
                </p>
                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="md" onClick={handleNext} icon={ArrowRight} className="bg-gradient-to-r from-pink-600 to-purple-600">
                    {currentIndex + 1 < questions.length ? 'Next Riddle ➡️' : 'See Score 🏆'}
                  </Button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Game Over Modal */}
      <Modal isOpen={isGameOver} onClose={() => setIsGameOver(false)} maxWidth="max-w-md" showClose={false}>
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-pink-500/30 animate-bounce">
            {correctAnswers >= 4 ? '👑' : '🎉'}
          </div>

          <div>
            <h3 className="text-2xl font-black font-heading text-slate-900 dark:text-white mb-1">
              {correctAnswers >= 4 ? "Emoji Genius Master! 🌟" : "Great Job, Meme Explorer! 😂"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You decoded {correctAnswers} out of {QUESTIONS_PER_ROUND} funny emoji riddles!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Score</span>
              <p className="text-xl font-extrabold text-pink-500 font-mono">+{score}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Accuracy</span>
              <p className="text-xl font-bold text-emerald-500 font-mono">
                {Math.round((correctAnswers / QUESTIONS_PER_ROUND) * 100)}%
              </p>
            </div>
          </div>

          <Button variant="primary" className="w-full bg-gradient-to-r from-pink-600 to-purple-600" onClick={startGame} icon={RotateCcw}>
            Play Another Round! 🎮
          </Button>
        </div>
      </Modal>

    </div>
  );
}
