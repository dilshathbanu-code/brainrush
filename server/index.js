const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { initDb } = require('./config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const gamesRoutes = require('./routes/games');
const scoresRoutes = require('./routes/scores');
const leaderboardRoutes = require('./routes/leaderboard');
const achievementsRoutes = require('./routes/achievements');
const dailyChallengeRoutes = require('./routes/dailyChallenge');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in dev
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BrainRush API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/daily-challenge', dailyChallengeRoutes);

// In production, serve static frontend files if built
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) next();
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.'
  });
});

// Start Server & Connect Database
async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🧠 BrainRush Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
