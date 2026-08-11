import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, Heart, Sparkles, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import type { UserProfile } from '../../types';
import { StorageService } from '../../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

type AuthTab = 'login' | 'register' | 'forgot' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const validateEmail = (mailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(mailStr.trim());
  };

  // LOGIN HANDLER (BACKEND API CALL)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast('Please enter your email and password 🎀');
      return;
    }

    if (!validateEmail(email)) {
      showToast('Please enter a valid email address (e.g. name@domain.com) 💌');
      return;
    }

    const res = await StorageService.loginUserAPI(email.trim(), password);

    if (!res.success || !res.user) {
      showToast(res.error || 'Login failed. Please check your credentials.');
      return;
    }

    onLoginSuccess(res.user);
    showToast('Logged in successfully! 💕');
    onClose();
  };

  // REGISTER HANDLER (BACKEND API CALL)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('Please fill in your name, email, and password 🌸');
      return;
    }

    if (!validateEmail(email)) {
      showToast('Please enter a valid email address (e.g. name@domain.com) 💌');
      return;
    }

    if (password.length < 4) {
      showToast('Password must be at least 4 characters long 🔑');
      return;
    }

    const res = await StorageService.registerUserAPI(
      name.trim(),
      username.trim() || email.split('@')[0],
      email.trim(),
      password
    );

    if (!res.success || !res.user) {
      showToast(res.error || 'Registration failed.');
      return;
    }

    onLoginSuccess(res.user);
    showToast('Account created & logged in successfully! 💕');
    onClose();
  };

  // FORGOT PASSWORD VERIFY EMAIL HANDLER (BACKEND SERVER & LOCAL SYNC CHECK)
  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast('Please enter your account email 💌');
      return;
    }

    if (!validateEmail(email)) {
      showToast('Please enter a valid email address (e.g. name@domain.com) 💌');
      return;
    }

    const res = await StorageService.verifyEmailAPI(email.trim());

    if (!res.success) {
      showToast(res.error || 'No account found with this email 💌');
      return;
    }

    showToast('Account verified! Enter your new password below 🔑');
    setTab('reset');
  };

  // RESET PASSWORD HANDLER
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      showToast('Please fill in both new password fields 🔑');
      return;
    }

    if (newPassword.length < 4) {
      showToast('Password must be at least 4 characters long 🔑');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match! Please check again 🔑');
      return;
    }

    const res = await StorageService.resetPasswordAPI(email.trim(), newPassword);
    if (res.success) {
      showToast('Password reset successfully! Log in with your new password 🎀');
      setPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setTab('login');
    } else {
      showToast(res.error || 'Failed to update password. Please check your email.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#FFFDF9] rounded-3xl border-4 border-pink-200 shadow-xl p-6 sm:p-8 pt-9 paper-lined"
        >
          {/* Decorative Washi Tape (Fully Visible, No Top Clipping) */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-36 h-7 washi-tape-pink transform rotate-1 rounded-sm flex items-center justify-center text-xs font-bold text-pink-800 tracking-wider shadow-sm z-10">
            MY LILY KEY 🎀
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-pink-100/80 hover:bg-pink-200 text-pink-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center mt-2 mb-6">
            <div className="inline-flex p-3 rounded-full bg-pink-100/80 border border-pink-200 text-3xl mb-2 shadow-inner">
              {tab === 'login' && '🎀'}
              {tab === 'register' && '🌸'}
              {tab === 'forgot' && '💌'}
              {tab === 'reset' && '🔑'}
            </div>
            <h2 className="font-['Caveat',cursive] text-3xl font-bold text-pink-600">
              {tab === 'login' && 'Welcome Back, Darling'}
              {tab === 'register' && 'Join the Lily Journal'}
              {tab === 'forgot' && 'Recover Your Password'}
              {tab === 'reset' && 'Set New Password'}
            </h2>
            <p className="text-xs text-pink-700/80 mt-1 font-medium">
              {tab === 'login' && 'Log in to access your private digital scrapbook'}
              {tab === 'register' && 'Create your account to start saving scrapbooks'}
              {tab === 'forgot' && 'Enter your registered account email'}
              {tab === 'reset' && 'Type a new password for ' + email}
            </p>
          </div>

          {/* Toast Alert */}
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-2xl bg-pink-100 border border-pink-300 text-pink-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{toastMessage}</span>
            </motion.div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-pink-50/60 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs text-pink-900 placeholder-pink-300"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-pink-900">Password</label>
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] font-semibold text-pink-500 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-2xl bg-pink-50/60 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs text-pink-900 placeholder-pink-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600 transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'View password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-pink-800 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-pink-500 focus:ring-pink-400"
                  />
                  <span>Remember me on this browser</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <span>Log In & Open App</span>
                <Heart className="w-4 h-4 fill-white" />
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-xs font-semibold text-pink-600 hover:text-pink-800 hover:underline"
                >
                  Don't have an account? Sign up 🌸
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-pink-50/60 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs text-pink-900 placeholder-pink-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-2.5 rounded-2xl bg-pink-50/60 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs text-pink-900 placeholder-pink-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-pink-50/60 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs text-pink-900 placeholder-pink-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    className="w-full pl-9 pr-10 py-2.5 rounded-2xl bg-pink-50/60 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs text-pink-900 placeholder-pink-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600 transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'View password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition-all"
              >
                <span>Create Account & Join</span>
                <Sparkles className="w-4 h-4" />
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-xs font-semibold text-pink-600 hover:underline"
                >
                  Already registered? Log in 💕
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1">Your Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-pink-50/60 border border-pink-200 text-xs text-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Verify Email Account</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-xs text-pink-500 hover:underline"
                >
                  Remembered your password? Log in
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {tab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-pink-50/60 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs text-pink-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-pink-50/60 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs text-pink-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Update Password & Log In</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-xs text-pink-500 hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
