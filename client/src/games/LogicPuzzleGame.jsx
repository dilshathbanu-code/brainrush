import React, { useState, useEffect, useRef } from 'react';
import { 
  Puzzle, 
  RotateCcw, 
  Clock, 
  HelpCircle, 
  Check, 
  X, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  Lightbulb, 
  Brain 
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useSound } from '../context/SoundContext';
import { fireBigConfetti } from '../utils/helpers';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PUZZLE_BANK = [
  {
    id: 1,
    question: "If a plane crashes exactly on the border of the United States and Canada, where do they bury the survivors?",
    options: ["In the United States 🇺🇸", "In Canada 🇨🇦", "Half in each country", "You don't bury survivors! 🤦‍♂️"],
    correctIndex: 3,
    hint: "Read the word 'survivors' very carefully...",
    explanation: "Why would you bury living people?! They survived! Call the ambulance instead! 🚑😂"
  },
  {
    id: 2,
    question: "A farmer has 17 sheep, and all but 9 of them die. How many sheep are left alive?",
    options: ["8 sheep", "9 sheep 🐑", "0 sheep", "17 ghost sheep 👻"],
    correctIndex: 1,
    hint: "Listen to the phrasing: 'all BUT nine die'...",
    explanation: "'All but 9 die' literally means 9 survived! Don't overcomplicate it! 🤣"
  },
  {
    id: 3,
    question: "What gets wetter and wetter the more it dries?",
    options: ["A Sponge", "A Towel 🧖‍♂️", "A Water Balloon", "My tears while studying 😭"],
    correctIndex: 1,
    hint: "You use it right after stepping out of the shower...",
    explanation: "A towel dries you off while absorbing moisture and getting wet in the process! 🧖‍♀️"
  },
  {
    id: 4,
    question: "How many months in a calendar year have 28 days?",
    options: ["Only February", "Just 1 month", "2 leap months", "All 12 of them! 📅"],
    correctIndex: 3,
    hint: "Does January reach the 28th day? What about March or August?",
    explanation: "Every single month has at least 28 days! February just gives up early! 🤣🗓️"
  },
  {
    id: 5,
    question: "You're running a race and you sprint past the runner in 2nd place. What place are you in now?",
    options: ["1st place 🥇", "2nd place 🥈", "3rd place 🥉", "Disqualified for pushing 🏃‍♂️"],
    correctIndex: 1,
    hint: "You passed the runner who was right behind the leader...",
    explanation: "If you pass the 2nd place runner, you take their spot in 2nd place! The leader in 1st is still ahead of you! 🏃💨"
  },
  {
    id: 6,
    question: "A rooster sits on the peak of a barn roof. If it lays an egg, which direction will it roll?",
    options: ["To the sunny left side", "To the windy right side", "Straight down the chimney", "Roosters don't lay eggs! 🐔"],
    correctIndex: 3,
    hint: "Think about chicken biology for a second...",
    explanation: "Roosters are male chickens! Only hens lay eggs! 🥚🤣"
  },
  {
    id: 7,
    question: "What has 88 keys, but cannot open a single locked door?",
    options: ["A Piano 🎹", "A Locksmith with amnesia", "A Broken Keychain", "A Keytar"],
    correctIndex: 0,
    hint: "Mozart and Beethoven played with these keys every day...",
    explanation: "A standard piano has 88 musical keys, but none of them will open your front door! 🎶🎹"
  },
  {
    id: 8,
    question: "Before Mount Everest was discovered, what was the highest mountain on Earth?",
    options: ["Mount K2", "Mount Kilimanjaro", "Mount Everest (it was still there!) 🏔️", "Mount Olympus"],
    correctIndex: 2,
    hint: "Did the mountain pop into existence only after people noticed it?",
    explanation: "It was still Mount Everest! It didn't wait around for humans with maps to become the highest mountain! 🏔️😎"
  },
  {
    id: 9,
    question: "A monkey, a squirrel, and a bird race up a coconut tree. Who gets the banana first?",
    options: ["The Monkey 🐒", "The Squirrel 🐿️", "The Bird 🦅", "None! Coconut trees don't grow bananas! 🥥"],
    correctIndex: 3,
    hint: "What fruit grows on a coconut palm tree?",
    explanation: "You won't find bananas on a coconut tree! Nice try, tropical detective! 🍌🌴🤣"
  },
  {
    id: 10,
    question: "A man pushed his car to a hotel and immediately told the owner he was bankrupt. Why?",
    options: ["His Ferrari engine exploded", "He was playing Monopoly 🎲", "Crazy high gas prices ⛽", "The valet parking fee"],
    correctIndex: 1,
    hint: "Think of famous family board games with hotels and tokens...",
    explanation: "He landed his car game piece on someone's hotel in Monopoly and had to pay rent! 🏠💸🎲"
  },
  {
    id: 11,
    question: "What can you easily hold in your left hand, but can NEVER hold in your right hand?",
    options: ["A hot cup of coffee", "Your Right Hand ✋", "A heavy dumbbell", "Your Left Elbow"],
    correctIndex: 1,
    hint: "Try physically grasping your right hand with your right hand right now...",
    explanation: "You can't hold your right hand inside your right hand! Geometry wins! ✋😄"
  },
  {
    id: 12,
    question: "What goes up relentlessly year after year, but NEVER comes back down?",
    options: ["A Helium Balloon 🎈", "Your Age 🎂", "An Airplane ✈️", "My daily Screen Time 📱"],
    correctIndex: 1,
    hint: "It increases by one on every single birthday...",
    explanation: "No matter what skincare routine you follow, your age only goes up! 🎂🎉"
  }
];

const QUESTIONS_PER_GAME = 5;

export default function LogicPuzzleGame({ onScoreSubmitted, onAchievementUnlocked }) {
  const { play } = useSound();
  const { isAuthenticated } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef(null);

  const startGame = () => {
    // Shuffle and pick 5 questions
    const shuffled = [...PUZZLE_BANK].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_GAME);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setShowHint(false);
    setTimeLeft(45);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  // Question timer
  useEffect(() => {
    if (isPlaying && !showExplanation && timeLeft > 0) {
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
  }, [isPlaying, showExplanation, timeLeft]);

  const handleTimeExpiry = () => {
    play('wrong');
    setShowExplanation(true);
    setSelectedOption(-1); // Timeout
  };

  const handleSelectOption = (index) => {
    if (selectedOption !== null || showExplanation) return;

    setSelectedOption(index);
    setShowExplanation(true);
    const currQ = questions[currentIndex];
    const isCorrect = index === currQ.correctIndex;

    if (isCorrect) {
      play('correct');
      const timeBonus = Math.max(50, timeLeft * 8);
      const hintPenalty = showHint ? 50 : 0;
      const earned = 300 + timeBonus - hintPenalty;
      setScore(prev => prev + earned);
      setCorrectAnswers(prev => prev + 1);
    } else {
      play('wrong');
    }
  };

  const handleNextQuestion = () => {
    play('click');
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setShowHint(false);
      setTimeLeft(45);
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

    const accuracy = Math.round((correctAnswers / QUESTIONS_PER_GAME) * 100);

    if (isAuthenticated) {
      setIsSubmitting(true);
      try {
        const res = await api.scores.submit({
          gameSlug: 'logic-puzzle',
          score,
          accuracy,
          timeTakenSeconds: QUESTIONS_PER_GAME * 45 - timeLeft,
          levelReached: correctAnswers >= 4 ? 5 : correctAnswers >= 3 ? 3 : 2,
          metadata: { correctAnswers, totalQuestions: QUESTIONS_PER_GAME }
        });
        if (onScoreSubmitted) onScoreSubmitted(res);
        if (res.unlockedAchievements?.length > 0 && onAchievementUnlocked) {
          res.unlockedAchievements.forEach(ach => onAchievementUnlocked(ach));
        }
      } catch (err) {
        console.error('Error submitting logic score:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const currQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
        
        {/* Question Counter */}
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary-500" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Question</span>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {isPlaying ? `${currentIndex + 1} / ${questions.length}` : '--'}
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-cyan-500'}`} />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Time Left</span>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">{timeLeft}s</p>
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

      {/* Main Puzzle Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 relative min-h-[420px] flex flex-col justify-center">
        {!isPlaying && !isGameOver ? (
          <div className="text-center space-y-6 animate-pop max-w-md mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-primary-600 flex items-center justify-center mx-auto text-white shadow-neon-blue">
              <Puzzle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white mb-2">
                Funny Trick & Logic Riddles 🤪
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Think outside the box! Hilarious trick questions, witty wordplay, and sneaky lateral thinking riddles. Don't get fooled!
              </p>
            </div>
            <Button size="lg" variant="primary" onClick={startGame} icon={Sparkles}>
              Start Funny Quest 🚀
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-pop">
            
            {/* Question Text */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <span className="text-xs font-bold text-primary-500 uppercase tracking-wider block mb-2">
                Puzzle #{currentIndex + 1}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white leading-snug">
                {currQ?.question}
              </h3>
            </div>

            {/* Hint Trigger */}
            {!showExplanation && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    play('click');
                    setShowHint(!showHint);
                  }}
                  className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1.5"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  {showHint ? 'Hide Hint' : 'Need a hint?'}
                </button>
              </div>
            )}

            {/* Hint Box */}
            {showHint && !showExplanation && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 animate-pop">
                💡 <span className="font-bold">Hint:</span> {currQ?.hint}
              </div>
            )}

            {/* Choices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currQ?.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currQ.correctIndex;

                let btnClass = 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-primary-400';

                if (showExplanation) {
                  if (isCorrect) {
                    btnClass = 'bg-emerald-500 text-white border-2 border-emerald-400 shadow-emerald-500/30';
                  } else if (isSelected) {
                    btnClass = 'bg-rose-500 text-white border-2 border-rose-400 shadow-rose-500/30';
                  } else {
                    btnClass = 'opacity-40 bg-slate-100 dark:bg-slate-800/40 text-slate-400 border border-slate-200 dark:border-slate-800';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={showExplanation}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-2xl text-left font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-between gap-3 shadow-sm ${btnClass}`}
                  >
                    <span>{option}</span>
                    {showExplanation && isCorrect && <Check className="w-5 h-5 text-white shrink-0" />}
                    {showExplanation && isSelected && !isCorrect && <X className="w-5 h-5 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next Step */}
            {showExplanation && (
              <div className="p-5 rounded-2xl bg-primary-500/10 border border-primary-500/30 animate-pop space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Explanation
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {currQ?.explanation}
                </p>
                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="md" onClick={handleNextQuestion} icon={ArrowRight}>
                    {currentIndex + 1 < questions.length ? 'Next Puzzle' : 'See Final Results'}
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
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center mx-auto text-slate-950 shadow-xl shadow-amber-500/30 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mb-1">
              {correctAnswers >= 4 ? "Big Brain Mastermind! 🧠✨" : correctAnswers >= 2 ? "Good Laugh & Good Effort! 😂" : "You Got Tricked! 🤪"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You outsmarted {correctAnswers} out of {QUESTIONS_PER_GAME} funny trick riddles!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Score</span>
              <p className="text-xl font-extrabold text-primary-600 dark:text-primary-400 font-mono">+{score}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Accuracy</span>
              <p className="text-xl font-bold text-emerald-500 font-mono">
                {Math.round((correctAnswers / QUESTIONS_PER_GAME) * 100)}%
              </p>
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
