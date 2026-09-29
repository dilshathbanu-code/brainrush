import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  Zap, 
  Calculator, 
  Grid, 
  Puzzle, 
  HelpCircle, 
  Info, 
  Trophy, 
  Sparkles 
} from 'lucide-react';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import LoadingState from '../components/UI/LoadingState';
import AchievementPopup from '../components/AchievementPopup';

import MemoryMatchGame from '../games/MemoryMatchGame';
import ReactionGame from '../games/ReactionGame';
import NumberChallengeGame from '../games/NumberChallengeGame';
import PatternMemoryGame from '../games/PatternMemoryGame';
import LogicPuzzleGame from '../games/LogicPuzzleGame';
import EmojiRiddleGame from '../games/EmojiRiddleGame';
import ColorClashGame from '../games/ColorClashGame';
import SpeedSpotterGame from '../games/SpeedSpotterGame';

import { api } from '../services/api';
import { useSound } from '../context/SoundContext';

export default function GamePlayPage() {
  const { slug } = useParams();
  const { play } = useSound();
  const navigate = useNavigate();

  const [gameInfo, setGameInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState(null);

  useEffect(() => {
    async function loadGame() {
      try {
        const res = await api.games.getBySlug(slug);
        if (res.game) {
          setGameInfo(res.game);
        }
      } catch (err) {
        console.error('Error fetching game info:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGame();
  }, [slug]);

  const handleScoreSubmitted = (scoreRes) => {
    // Score submitted successfully
  };

  const handleAchievementUnlocked = (ach) => {
    setUnlockedAchievement(ach);
  };

  const renderActiveGame = () => {
    switch (slug) {
      case 'memory-match':
        return <MemoryMatchGame onScoreSubmitted={handleScoreSubmitted} onAchievementUnlocked={handleAchievementUnlocked} />;
      case 'reaction-time':
        return <ReactionGame onScoreSubmitted={handleScoreSubmitted} onAchievementUnlocked={handleAchievementUnlocked} />;
      case 'number-challenge':
        return <NumberChallengeGame onScoreSubmitted={handleScoreSubmitted} onAchievementUnlocked={handleAchievementUnlocked} />;
      case 'pattern-memory':
        return <PatternMemoryGame onScoreSubmitted={handleScoreSubmitted} onAchievementUnlocked={handleAchievementUnlocked} />;
      case 'logic-puzzle':
        return <LogicPuzzleGame onScoreSubmitted={handleScoreSubmitted} onAchievementUnlocked={handleAchievementUnlocked} />;
      case 'emoji-riddle':
        return <EmojiRiddleGame onScoreSubmitted={handleScoreSubmitted} onAchievementUnlocked={handleAchievementUnlocked} />;
      case 'color-clash':
        return <ColorClashGame onScoreSubmitted={handleScoreSubmitted} onAchievementUnlocked={handleAchievementUnlocked} />;
      case 'speed-spotter':
        return <SpeedSpotterGame onScoreSubmitted={handleScoreSubmitted} onAchievementUnlocked={handleAchievementUnlocked} />;
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold">Arena not found</h3>
            <Button onClick={() => navigate('/games')} className="mt-4">Back to Games</Button>
          </div>
        );
    }
  };

  if (loading) {
    return <LoadingState message="Connecting to neural arena..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumb & Arena Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              play('click');
              navigate('/games');
            }}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                {gameInfo?.name || 'Brain Arena'}
              </h1>
              {gameInfo?.category && <Badge variant="blue" size="sm">{gameInfo.category}</Badge>}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {gameInfo?.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              play('click');
              setShowRules(true);
            }}
            icon={HelpCircle}
          >
            How to Play
          </Button>
        </div>

      </div>

      {/* Interactive Game Render Zone */}
      <div className="pt-2">
        {renderActiveGame()}
      </div>

      {/* Rules Modal */}
      <Modal isOpen={showRules} onClose={() => setShowRules(false)} title={`How to Play: ${gameInfo?.name}`}>
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            {gameInfo?.slug === 'memory-match' && "Flip pairs of cards to reveal symbols. Match all identical pairs in the shortest time and with the fewest flips possible to maximize your score rating."}
            {gameInfo?.slug === 'reaction-time' && "Wait until the screen turns bright GREEN, then tap or click instantly. Beware of false starts—clicking before green causes a penalty! Your score reflects your microsecond reaction speed."}
            {gameInfo?.slug === 'number-challenge' && "Solve as many mental arithmetic equations as you can in 45 seconds. Consecutive correct answers trigger combo streak multipliers (up to 3.0x bonus points!)."}
            {gameInfo?.slug === 'pattern-memory' && "Watch the sequence of glowing neon matrix tiles and repeat the exact order. Each round adds an additional step and accelerates the pace. You have 3 lives."}
            {gameInfo?.slug === 'logic-puzzle' && "Outsmart 5 hilarious trick riddles and deductive lateral thinking teasers. Think outside the box and don't get fooled!"}
            {gameInfo?.slug === 'emoji-riddle' && "Decode funny emoji combinations, student memes, and popular idioms before the 30-second timer runs out. Build streak multipliers for massive points!"}
            {gameInfo?.slug === 'color-clash' && "A high-speed Stroop brain twister! Tap the INK COLOR of the word, NOT what the word spells out. Keep your eyes sharp!"}
            {gameInfo?.slug === 'speed-spotter' && "Find and tap the funny impostor emoji hidden in the crowd as fast as possible. Levels get progressively faster with larger grids!"}
          </p>
          <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs font-semibold text-primary-600 dark:text-primary-400">
            🏆 All scores earned in this arena are automatically saved to your profile and the global leaderboard.
          </div>
          <Button variant="primary" className="w-full mt-4" onClick={() => setShowRules(false)}>
            Got It, Let's Play!
          </Button>
        </div>
      </Modal>

      {/* Achievement Toast */}
      {unlockedAchievement && (
        <AchievementPopup
          achievement={unlockedAchievement}
          onClose={() => setUnlockedAchievement(null)}
        />
      )}

    </div>
  );
}
