import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Gamepad2, 
  Calendar, 
  Trophy, 
  User, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Menu, 
  X, 
  Flame, 
  LogOut, 
  LogIn, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../context/SoundContext';
import { getAvatarInfo } from '../utils/helpers';
import Button from './UI/Button';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { soundEnabled, toggleSound, play } = useSound();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: Brain },
    { name: 'Games', path: '/games', icon: Gamepad2 },
    { name: 'Daily Challenge', path: '/daily-challenge', icon: Calendar, highlight: true },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Achievements', path: '/achievements', icon: Sparkles }
  ];

  const handleNavClick = (path) => {
    play('click');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const avatarInfo = user ? getAvatarInfo(user.avatar) : null;

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group focus:outline-none"
            onClick={() => play('click')}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-cyan-400 flex items-center justify-center text-white shadow-neon-blue group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Brain<span className="text-primary-500">Rush</span>
              </span>
              <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 tracking-wider uppercase -mt-1">
                Cognitive Arena
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-white dark:bg-primary-600 text-primary-600 dark:text-white shadow-sm dark:shadow-neon-blue'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary-500 dark:text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.name}</span>
                  {item.highlight && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Audio Toggle */}
            <button
              onClick={() => {
                toggleSound();
                play('click');
              }}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={soundEnabled ? 'Mute Game Sounds' : 'Enable Game Sounds'}
              aria-label="Sound toggle"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-primary-500" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => {
                toggleTheme();
                play('click');
              }}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Theme toggle"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* User Profile / Auth Area */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl glass-card hover:border-primary-500 transition-all"
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${avatarInfo?.bg || 'from-blue-600 to-cyan-400'} flex items-center justify-center text-sm shadow-sm`}>
                    <span>{avatarInfo?.icon || '🧠'}</span>
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-primary-600 dark:text-primary-400 flex items-center gap-1 font-semibold">
                      <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {user.streak_count || 0}d streak
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass-card bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-pop">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleNavClick('/profile')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors mt-1"
                    >
                      <User className="w-4 h-4 text-primary-500" />
                      <span>My Profile & Stats</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('/achievements')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Achievements</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavClick('/login')}
                  icon={LogIn}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleNavClick('/register')}
                >
                  Register
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-pop">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.highlight && (
                  <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                    DAILY
                  </span>
                )}
              </button>
            );
          })}

          {isAuthenticated ? (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                onClick={() => handleNavClick('/profile')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="w-5 h-5 text-primary-500" />
                <span>My Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => handleNavClick('/login')}>
                Log In
              </Button>
              <Button variant="primary" onClick={() => handleNavClick('/register')}>
                Register
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
