import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle, 
  Check 
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { AVATAR_PRESETS } from '../utils/helpers';

export default function RegisterPage() {
  const { register } = useAuth();
  const { play } = useSound();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('brain_blue');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      play('error');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      play('error');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password, confirmPassword, avatar });
      play('match');
      navigate('/games', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      play('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8 animate-pop">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-cyan-400 flex items-center justify-center text-white shadow-neon-blue group-hover:scale-105 transition-transform">
              <Brain className="w-7 h-7 animate-pulse" />
            </div>
            <span className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white">
              Brain<span className="text-primary-500">Rush</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white pt-2">
            Create Your Challenger Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Join the cognitive arena to track progress, compete globally, and unlock badges.
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Avatar Preset Chooser */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
                Choose Brain Avatar
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((p) => {
                  const isSelected = avatar === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        play('click');
                        setAvatar(p.id);
                      }}
                      className={`p-2 rounded-xl border-2 flex items-center justify-center text-xl transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/20 shadow-neon-blue scale-110'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                      title={p.name}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${p.bg} flex items-center justify-center text-sm shadow-sm`}>
                        {p.icon}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
                Full Name / Handle
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:border-primary-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:border-primary-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:border-primary-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-type your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:border-primary-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              icon={Sparkles}
            >
              Create Account
            </Button>

          </form>

          {/* Login Link */}
          <div className="text-center pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary-500 hover:underline">
                Sign In
              </Link>
            </p>
          </div>

        </Card>

      </div>
    </div>
  );
}
