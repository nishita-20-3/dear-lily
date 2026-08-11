import React, { useState } from 'react';
import { Settings as SettingsIcon, Sparkles, Download } from 'lucide-react';
import type { AppSettings, UserProfile } from '../../types';
import { StorageService } from '../../services/storage';

interface SettingsViewProps {
  user: UserProfile;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout }) => {
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    StorageService.saveSettings(updated);
    window.dispatchEvent(new Event('dear_lily_settings_updated'));
    showToast('Setting updated! 🎀');
  };

  // Data Export (JSON Backup file download)
  const handleExportData = () => {
    const backupData = {
      user: StorageService.getUser(),
      strips: StorageService.getPhotoStrips(),
      diary: StorageService.getDiaryEntries(),
      albums: StorageService.getAlbums(),
      exportDate: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DearLily_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported backup file! 📁');
  };

  // Reset Data
  const handleClearData = () => {
    if (confirm('Are you sure you want to reset all saved photo strips and diary entries? This action cannot be undone.')) {
      localStorage.clear();
      showToast('Cache cleared!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-full bg-pink-600 text-white text-xs font-bold shadow-xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-pink-900 flex items-center gap-2">
          <span>App Settings</span>
          <SettingsIcon className="w-7 h-7 text-pink-500 animate-spin" style={{ animationDuration: '12s' }} />
        </h1>
        <p className="text-xs text-pink-700/80 mt-1 font-medium">
          Customize cursor sparkle effects, sound preferences, data export, and privacy settings.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* SECTION 1: APPEARANCE & PARTICLES */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border-4 border-pink-100 shadow-xl paper-lined">
          <h3 className="font-['Caveat',cursive] text-2xl font-bold text-pink-800 mb-4 flex items-center gap-2">
            <span>Visual Effects & Cursor Magic</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-pink-50/60 border border-pink-100">
              <div>
                <h4 className="font-bold text-xs text-pink-950">Cursor Sparkle Trail</h4>
                <p className="text-[11px] text-pink-700/70">Sparkling stars follow mouse movement across the screen</p>
              </div>
              <button
                onClick={() => updateSetting('cursorSparkles', !settings.cursorSparkles)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  settings.cursorSparkles ? 'bg-pink-500' : 'bg-pink-200'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.cursorSparkles ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-pink-50/60 border border-pink-100">
              <div>
                <h4 className="font-bold text-xs text-pink-950">Click Burst Particle Effects</h4>
                <p className="text-[11px] text-pink-700/70">Flowers and hearts burst when clicking anywhere</p>
              </div>
              <button
                onClick={() => updateSetting('clickEffects', !settings.clickEffects)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  settings.clickEffects ? 'bg-pink-500' : 'bg-pink-200'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.clickEffects ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: DATA & PRIVACY */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border-4 border-pink-100 shadow-xl paper-lined">
          <h3 className="font-['Caveat',cursive] text-2xl font-bold text-pink-800 mb-4 flex items-center gap-2">
            <span>Data Export & Backup</span>
            <Download className="w-5 h-5 text-pink-500" />
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleExportData}
              className="p-4 rounded-2xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-100 text-left font-bold transition-all group"
            >
              <div className="text-xl mb-1">📦 Export Scrapbook JSON</div>
              <p className="text-[11px] text-pink-700 font-normal">Download a full backup of photo strips & diary entries</p>
            </button>

            <button
              onClick={handleClearData}
              className="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50 hover:bg-rose-100 text-left font-bold transition-all text-rose-800"
            >
              <div className="text-xl mb-1">🗑️ Clear Local Cache</div>
              <p className="text-[11px] text-rose-700 font-normal">Reset local storage and restore default sample data</p>
            </button>
          </div>
        </div>

        {/* SECTION 3: ACCOUNT ACTIONS */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border-4 border-pink-100 shadow-xl paper-lined flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-pink-900">Signed in as {user.email}</h4>
            <p className="text-xs text-pink-600 font-medium">Session ID: {user.id}</p>
          </div>

          <button
            onClick={onLogout}
            className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md transition-all"
          >
            Log Out Account
          </button>
        </div>

      </div>
    </div>
  );
};
