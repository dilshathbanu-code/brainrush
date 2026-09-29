import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Brain, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';

export default function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const { play } = useSound();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const from = location.state?.from?.pathname || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      play('match');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      play('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await loginAsDemo();
      play('match');
      navigate(from, { replace: true });
    } catch (err) {
      setError('Demo login failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-pop">
        
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
            Welcome Back, Challenger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Enter your credentials to continue your brain training.
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
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:border-primary-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-primary-500 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
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

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                Remember this device for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              icon={LogIn}
            >
              Sign In
            </Button>

            {/* Demo 1-Click Login Button */}
            <div className="pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full"
                loading={demoLoading}
                onClick={handleDemoLogin}
                icon={Sparkles}
              >
                1-Click Demo Login
              </Button>
            </div>

          </form>

          {/* Register Redirect */}
          <div className="text-center pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have a BrainRush account?{' '}
              <Link to="/register" className="font-bold text-primary-500 hover:underline">
                Create Free Account
              </Link>
            </p>
          </div>

        </Card>

      </div>

      {/* Forgot Password Modal */}
      <Modal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} title="Reset Password">
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>
            For password resets in development or demo mode, please use your registered credentials or log in with the instant 1-Click Demo account!
          </p>
          <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs text-primary-600 dark:text-primary-400 font-mono">
            Demo Email: demo@brainrush.com<br />
            Password: Password123!
          </div>
          <Button variant="primary" className="w-full" onClick={() => setShowForgotModal(false)}>
            Understood
          </Button>
        </div>
      </Modal>

    </div>
  );
}
