# 🧠 BrainRush — Full-Stack Interactive Brain-Training Gaming Platform

**BrainRush** is a full-stack interactive brain-training and puzzle gaming website engineered with a modern gaming UI/UX (Blue + White theme, dark/light mode toggle, glassmorphism, neon glows, and micro-animations).

---

## 🚀 Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, Web Audio API Synthesizer
- **Backend**: Node.js, Express.js, REST APIs, JSON Web Tokens (JWT), Bcrypt password hashing
- **Database**: MySQL (`mysql2/promise`) with automatic table migration & schema auto-initialization + seamless JSON/Storage mirror
- **Architecture**: Single unified monorepo repository containing both client and server

---

## 🎮 Included Interactive Brain Games

1. **🧠 Memory Match**
   - 3D perspective card flip animations, theme icon matching, move counter, stopwatch timer, combo streaks, and adaptive difficulty modes (Easy, Medium, Hard).
2. **⚡ Reaction Reflex**
   - Millisecond precision (`performance.now()`) reaction timer, random interval delays, false-start penalty, and tier rating (Neural God, Lightning, Swift, etc.).
3. **🔢 Number Challenge (Speed Arithmetic)**
   - Dynamic rapid-fire arithmetic (+, -, ×, ÷) under 45-second countdown pressure with multi-level combo multipliers.
4. **🔲 Pattern Memory (Simon Matrix)**
   - Progressive light-up matrix sequence recall with dynamic multi-pitch audio synthesis, hearts/lives system, and level escalation.
5. **🧩 Logic Puzzle & Deductions**
   - Interactive lateral thinking puzzles, deductive riddles, sequence analogies, hints system, and detailed explanations.

---

## 🌟 Key Features

- **🌓 Dark Mode & Light Mode**: Seamless animated theme switch with persistent memory.
- **🔊 Arcade Sound Effects**: Web Audio API low-latency sound synthesis for card flips, combos, ticks, errors, and fanfare.
- **🔐 Secure Authentication**: Register, Login, JWT session tokens, Bcrypt password hashing, and 1-Click Demo Guest Login.
- **📅 Daily Challenge**: Rotating daily puzzle missions with streak tracking (🔥), rewards, and countdown timer.
- **🏆 Global Leaderboards**: Daily, Weekly, Monthly, and All-Time rankings with 🥇 Gold, 🥈 Silver, 🥉 Bronze podiums.
- **🎖️ Achievements Hub**: Locked/Unlocked badges (First Game, Memory Master, Speed Demon, Math Wizard, 7-Day Streak, etc.) with animated celebratory popups.
- **👤 User Dashboard & Profile**: Custom avatar chooser, career stats, accuracy radar breakdown, and gameplay history logs.

---

## 🛠️ Project Structure

```
project1/
├── package.json           # Root scripts (dev, build, start, install-all)
├── .env                   # Server & MySQL environment variables
├── server/
│   ├── package.json       # Express backend dependencies
│   ├── index.js           # Server entrypoint and API routing
│   ├── config/
│   │   └── db.js          # MySQL connection pool and database abstraction
│   ├── middleware/
│   │   └── auth.js        # JWT verification middleware
│   ├── database/
│   │   └── schema.sql     # MySQL tables & default seeds
│   └── routes/
│       ├── auth.js        # /api/auth (register, login, me)
│       ├── users.js       # /api/users (profile, stats)
│       ├── games.js       # /api/games (catalog, best scores)
│       ├── scores.js      # /api/scores (submit score, auto-unlock)
│       ├── leaderboard.js # /api/leaderboard (periods & game filter)
│       ├── achievements.js# /api/achievements (unlocked state)
│       └── dailyChallenge.js # /api/daily-challenge (today's mission)
└── client/
    ├── package.json       # React, Vite, Tailwind CSS dependencies
    ├── vite.config.js     # Reverse proxy /api to backend
    ├── tailwind.config.js # Blue & White theme, neon glow, animations
    └── src/
        ├── main.jsx       # Client entrypoint
        ├── App.jsx        # Routing and global state providers
        ├── index.css      # Glassmorphism, 3D flips, custom styling
        ├── context/       # AuthContext, ThemeContext, SoundContext
        ├── services/      # api.js REST client
        ├── components/    # Navbar, Footer, Modal, Button, Card, Badges
        ├── pages/         # Home, Games, GamePlay, Daily, Leaderboard, Profile, Auth
        ├── games/         # 5 fully interactive game engines
        └── utils/         # sounds.js synth, helpers.js
```

---

## 🏃 Quick Start Instructions

### 1. Start Both Frontend & Backend (One Command)

From the project root directory:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

### 2. MySQL Database Setup (Optional / Automatic)

By default, the server is configured to connect to MySQL on `localhost:3306` with database `brainrush`. You can configure your credentials in `.env`:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=brainrush
```

*Note: If MySQL is not running on your machine, BrainRush automatically switches to its high-performance built-in storage engine with zero configuration required, allowing you to develop and play immediately.*

---

## 🎮 Demo Account Credentials

- **Email**: `demo@brainrush.com`
- **Password**: `Password123!`
- Or simply click **"1-Click Demo Login"** on the login page!
