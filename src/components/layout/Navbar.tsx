import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Camera, BookOpen, Image, Settings, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../../types';

export type NavTab = 'home' | 'photobooth' | 'diary' | 'gallery' | 'profile' | 'settings' | 'admin';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  user: UserProfile;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const isAdmin = user.isAuth && (user.isAdmin === true || user.role === 'admin' || user.email.trim().toLowerCase() === 'admin@dearlily.com' || user.email.trim().toLowerCase() === 'aarohii.n.2021@gmail.com');

  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { id: 'photobooth', label: 'Photo Booth', icon: <Camera className="w-4 h-4 text-pink-500" /> },
    { id: 'diary', label: 'Digital Diary', icon: <BookOpen className="w-4 h-4 text-emerald-500" /> },
    { id: 'gallery', label: 'Gallery', icon: <Image className="w-4 h-4 text-purple-500" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4 text-rose-500" /> },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', label: 'Admin DB', icon: <ShieldCheck className="w-4 h-4 text-purple-600" /> });
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FFF5F7]/80 backdrop-blur-md border-b border-pink-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2 text-left group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-300 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:rotate-6 transition-transform">
            🌸
          </div>
          <div>
            <span className="font-['Playfair_Display',serif] font-bold text-2xl text-pink-900 leading-none block">
              Dear Lily
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-pink-700 uppercase block mt-0.5">
              Scrapbook & Photo Booth 🌟
            </span>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-white/80 border border-pink-200 shadow-inner">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-pink-900'
                    : 'text-pink-800/80 hover:text-pink-900 hover:bg-pink-50/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-pink-100/90 rounded-full border border-pink-300 shadow-xs"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Auth User Status & Actions */}
        <div className="flex items-center gap-3">
          {user.isAuth ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onTabChange('profile')}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/90 border border-pink-200 hover:bg-pink-50 transition-colors shadow-xs"
              >
                <div className="w-7 h-7 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center font-bold text-xs shadow-inner">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase() || '🌸'
                  )}
                </div>
                <span className="text-xs font-bold text-pink-900 max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-full bg-pink-100 text-pink-700 hover:bg-rose-500 hover:text-white transition-all shadow-xs"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-pink-200 flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Login / Join</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around py-2 px-2 bg-white/90 border-t border-pink-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex flex-col items-center gap-0.5 whitespace-nowrap ${
              currentTab === tab.id ? 'bg-pink-100 text-pink-900' : 'text-pink-700'
            }`}
          >
            {tab.icon}
            <span className="text-[10px]">{tab.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
