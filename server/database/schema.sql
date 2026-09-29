-- BrainRush MySQL Database Schema

CREATE DATABASE IF NOT EXISTS brainrush;
USE brainrush;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT 'brain_blue',
  streak_count INT DEFAULT 0,
  last_played_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Games Table
CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category ENUM('Memory', 'Reaction', 'Mathematics', 'Pattern', 'Logic', 'Speed', 'Puzzle') NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'Medium',
  icon VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game Scores Table
CREATE TABLE IF NOT EXISTS game_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game_id INT NOT NULL,
  score INT NOT NULL,
  accuracy DECIMAL(5,2) DEFAULT 100.00,
  time_taken_seconds INT DEFAULT 0,
  level_reached INT DEFAULT 1,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  INDEX idx_user_score (user_id, score),
  INDEX idx_game_score (game_id, score),
  INDEX idx_created (created_at)
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'General',
  icon VARCHAR(50) NOT NULL,
  target_value INT DEFAULT 1,
  xp_reward INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  progress INT DEFAULT 0,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- Daily Challenges Table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  challenge_date DATE NOT NULL UNIQUE,
  game_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  target_score INT NOT NULL DEFAULT 1000,
  reward_xp INT DEFAULT 250,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- User Daily Challenge Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  challenge_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score_achieved INT DEFAULT 0,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_daily (user_id, challenge_date)
);

-- Seed Default Games
INSERT IGNORE INTO games (id, slug, name, category, description, difficulty, icon) VALUES
(1, 'memory-match', 'Memory Match', 'Memory', 'Flip and match pairs of cards as fast as possible with minimal moves.', 'Adaptive', 'Brain'),
(2, 'reaction-time', 'Reaction Game', 'Reaction', 'Test your visual reflexes. Click instantly when the screen turns green.', 'High Speed', 'Zap'),
(3, 'number-challenge', 'Number Challenge', 'Mathematics', 'Solve quick arithmetic problems under rapid time pressure.', 'Medium to Hard', 'Calculator'),
(4, 'pattern-memory', 'Pattern Memory', 'Pattern', 'Memorize and replicate evolving light-up matrix sequences.', 'Progressive', 'Grid'),
(5, 'logic-puzzle', 'Logic Puzzle', 'Logic', 'Solve witty brain teasers, deductive riddles, and spatial problems.', 'Brain Buster', 'Puzzle');

-- Seed Achievements
INSERT IGNORE INTO achievements (id, code, name, description, category, icon, target_value, xp_reward) VALUES
(1, 'FIRST_GAME', 'First Step', 'Play your very first brain game on BrainRush.', 'General', 'Award', 1, 50),
(2, 'BRAIN_BEGINNER', 'Brain Beginner', 'Score over 500 points in any game mode.', 'General', 'Sparkles', 500, 100),
(3, 'MEMORY_MASTER', 'Memory Master', 'Complete a Memory Match game in under 30 seconds.', 'Memory', 'Brain', 1, 200),
(4, 'SPEED_DEMON', 'Speed Master', 'Achieve a sub-220ms average reaction time.', 'Reaction', 'Zap', 1, 250),
(5, 'MATH_WIZARD', 'Math Wizard', 'Reach a 10-answer streak in Number Challenge.', 'Mathematics', 'Flame', 10, 200),
(6, 'PATTERN_PRO', 'Pattern Master', 'Reach Level 7 in Pattern Memory without losing a life.', 'Pattern', 'Layers', 7, 250),
(7, 'LOGIC_GENIUS', 'Logic Master', 'Solve 5 logic puzzles with 100% accuracy.', 'Logic', 'Target', 5, 200),
(8, 'HIGH_SCORER', 'High Scorer', 'Accumulate 10,000 total score points.', 'General', 'Trophy', 10000, 500),
(9, 'STREAK_7_DAYS', '7 Day Streak', 'Train your brain every day for 7 consecutive days.', 'Daily', 'Calendar', 7, 750),
(10, 'PUZZLE_EXPERT', 'Puzzle Expert', 'Play all 5 different game types.', 'General', 'Compass', 5, 300);
