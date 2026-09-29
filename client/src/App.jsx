import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SoundProvider } from './context/SoundContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import GamePlayPage from './pages/GamePlayPage';
import DailyChallengePage from './pages/DailyChallengePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AchievementsPage from './pages/AchievementsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SoundProvider>
          <Router>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 transition-colors duration-300">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/games" element={<GamesPage />} />
                  <Route path="/games/:slug" element={<GamePlayPage />} />
                  <Route path="/daily-challenge" element={<DailyChallengePage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/achievements" element={<AchievementsPage />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </SoundProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
