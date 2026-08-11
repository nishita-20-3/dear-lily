import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import type { NavTab } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomeView } from './components/home/HomeView';
import { PhotoboothView } from './components/photobooth/PhotoboothView';
import { DiaryView } from './components/diary/DiaryView';
import { GalleryView } from './components/gallery/GalleryView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminView } from './components/admin/AdminView';
import { AuthModal } from './components/auth/AuthModal';
import { CursorTrail } from './components/common/CursorTrail';
import { LoadingNotebook } from './components/common/LoadingNotebook';
import { StorageService } from './services/storage';
import type { UserProfile, PhotoStrip } from './types';
import { Lock, LogIn, Sparkles } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [user, setUser] = useState<UserProfile>(() => StorageService.getUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  const isAdminUser = user.isAuth && (user.isAdmin === true || user.role === 'admin' || user.email.trim().toLowerCase() === 'admin@dearlily.com' || user.email.trim().toLowerCase() === 'aarohii.n.2021@gmail.com' || adminUnlocked);

  // Initial Notebook Loading sequence & IndexedDB initialization
  useEffect(() => {
    StorageService.initIndexedDB().catch(() => {});
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!user.isAuth) {
        setIsAuthOpen(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: NavTab) => {
    setIsLoading(true);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsLoading(false), 400);
  };

  const handleSaveStrip = (newStrip: PhotoStrip) => {
    const targetUserId = user.id || newStrip.userId || '';
    const currentStrips = StorageService.getPhotoStrips(targetUserId);
    const updated = [newStrip, ...currentStrips.filter((s) => s.id !== newStrip.id)];
    StorageService.savePhotoStrips(updated, targetUserId);
  };

  const handleLogout = () => {
    StorageService.clearUserSession();
    const unauthUser: UserProfile = {
      id: '',
      name: '',
      username: '',
      email: '',
      avatar: '',
      coverImage: '',
      bio: '',
      birthday: '',
      joinDate: '',
      favoriteTheme: 'Floral Journal',
      isAuth: false,
    };
    setUser(unauthUser);
    setAdminUnlocked(false);
    setCurrentTab('home');
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setIsAuthOpen(false);
  };

  // Check if current view is protected
  const isProtectedView = ['photobooth', 'diary', 'gallery', 'profile', 'settings'].includes(currentTab);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9FA] text-slate-800 relative selection:bg-pink-200 selection:text-pink-900 font-sans">
      <CursorTrail />

      {/* Loading Animation */}
      {isLoading && <LoadingNotebook message="Opening Dear Lily Scrapbook..." />}

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {currentTab === 'home' && (
          <HomeView
            onNavigate={(tab) => {
              if (!user.isAuth) {
                setIsAuthOpen(true);
              } else {
                handleTabChange(tab);
              }
            }}
          />
        )}

        {/* ADMIN DATABASE ACCESS GUARD (STRICTLY FOR VERIFIED ADMINS ONLY) */}
        {currentTab === 'admin' && (
          isAdminUser ? (
            <AdminView />
          ) : (
            <HomeView onNavigate={(tab) => handleTabChange(tab)} />
          )
        )}

        {/* STRICT PROTECTED VIEW GUARD WHEN LOGGED OUT */}
        {isProtectedView && !user.isAuth ? (
          <div className="max-w-xl mx-auto my-16 p-8 sm:p-12 rounded-3xl bg-white/90 backdrop-blur-md border-4 border-pink-200 shadow-2xl text-center paper-lined">
            <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner border border-pink-300">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="font-['Caveat',cursive] text-3xl sm:text-4xl font-bold text-pink-900 mb-2">
              Authentication Required 🔒
            </h2>
            <p className="text-xs sm:text-sm text-pink-700 font-medium mb-6 leading-relaxed">
              You are currently logged out. Log in or create an account to view your private digital diary, custom photo booth, personal profile, and saved memories.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-pink-200 inline-flex items-center gap-2 transition-all transform active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In / Create Account Now</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {currentTab === 'photobooth' && (
              <PhotoboothView user={user} onSaveStrip={handleSaveStrip} />
            )}

            {currentTab === 'diary' && <DiaryView user={user} />}

            {currentTab === 'gallery' && <GalleryView user={user} />}

            {currentTab === 'profile' && (
              <ProfileView
                user={user}
                onUpdateUser={(updated) => {
                  setUser(updated);
                  StorageService.saveUser(updated);
                }}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView user={user} onLogout={handleLogout} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
