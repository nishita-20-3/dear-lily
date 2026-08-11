import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Award, Calendar, Image as ImageIcon, Upload, User as UserIcon, Lock, CheckCircle2 } from 'lucide-react';
import type { UserProfile } from '../../types';
import { StorageService } from '../../services/storage';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

const compressProfileImage = (dataUrl: string, maxDim = 350, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [coverImage, setCoverImage] = useState(user.coverImage || '');
  const [birthday, setBirthday] = useState(user.birthday || '');

  React.useEffect(() => {
    if (!isEditing) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setCoverImage(user.coverImage || '');
      setBirthday(user.birthday || '');
    }
  }, [user, isEditing]);

  // Live Stats
  const photoStrips = StorageService.getPhotoStrips(user.id);
  const diaryEntries = StorageService.getDiaryEntries(user.id);
  const albums = StorageService.getAlbums();

  const stripsCount = photoStrips.length;
  const entriesCount = diaryEntries.length;
  const albumsCount = albums.length;

  // DYNAMIC ACHIEVEMENTS CALCULATION
  const hasStickerStrip = photoStrips.some((s) => (s.stickers && s.stickers.length > 0) || (s.textOverlays && s.textOverlays.length > 0)) || diaryEntries.some((d) => d.stickers && d.stickers.length > 0);
  const hasPinLocked = diaryEntries.some((d) => d.pinLocked);
  const hasCustomProfile = Boolean(user.avatar || user.bio || user.coverImage || user.birthday);

  const achievements = [
    {
      id: 'a1',
      title: 'First Photo Strip 📸',
      desc: 'Captured your first polaroid photo booth memory',
      icon: '🎞️',
      color: 'bg-pink-100/90 border-pink-300 text-pink-900',
      unlocked: stripsCount > 0,
    },
    {
      id: 'a2',
      title: 'Coquette Queen 🎀',
      desc: 'Decorated photo strips or diary pages with cute stickers',
      icon: '🎀',
      color: 'bg-rose-100/90 border-rose-300 text-rose-900',
      unlocked: hasStickerStrip,
    },
    {
      id: 'a3',
      title: 'Diary Master 📖',
      desc: 'Wrote notebook chapters in soft paper styles',
      icon: '📜',
      color: 'bg-emerald-100/90 border-emerald-300 text-emerald-900',
      unlocked: entriesCount > 0,
    },
    {
      id: 'a4',
      title: 'PIN Lock Guardian 🔒',
      desc: 'Protected a personal diary entry with a 4-digit PIN',
      icon: '🔐',
      color: 'bg-sky-100/90 border-sky-300 text-sky-900',
      unlocked: hasPinLocked,
    },
    {
      id: 'a5',
      title: 'Scrapbook Collector 🎨',
      desc: 'Created custom albums in memory gallery',
      icon: '🖼️',
      color: 'bg-amber-100/90 border-amber-300 text-amber-900',
      unlocked: albumsCount > 0,
    },
    {
      id: 'a6',
      title: 'Profile Stylist 🌸',
      desc: 'Customized your profile picture, cover photo or bio',
      icon: '👑',
      color: 'bg-purple-100/90 border-purple-300 text-purple-900',
      unlocked: hasCustomProfile,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        if (evt.target?.result) {
          const rawAvatar = evt.target.result as string;
          const compressedAvatar = await compressProfileImage(rawAvatar, 350, 0.8);
          setAvatar(compressedAvatar);
          const updated = { ...user, avatar: compressedAvatar };
          StorageService.saveUser(updated);
          StorageService.updateRegisteredUserProfile(user.id, { avatar: compressedAvatar });
          onUpdateUser(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        if (evt.target?.result) {
          const rawCover = evt.target.result as string;
          const compressedCover = await compressProfileImage(rawCover, 800, 0.8);
          setCoverImage(compressedCover);
          const updated = { ...user, coverImage: compressedCover };
          StorageService.saveUser(updated);
          StorageService.updateRegisteredUserProfile(user.id, { coverImage: compressedCover });
          onUpdateUser(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalAvatar = avatar;
    if (avatar && avatar.length > 300000) {
      finalAvatar = await compressProfileImage(avatar, 350, 0.8);
    }
    let finalCover = coverImage;
    if (coverImage && coverImage.length > 300000) {
      finalCover = await compressProfileImage(coverImage, 800, 0.8);
    }

    const updatedUser: UserProfile = {
      ...user,
      name,
      bio,
      avatar: finalAvatar,
      coverImage: finalCover,
      birthday,
    };
    StorageService.saveUser(updatedUser);
    StorageService.updateRegisteredUserProfile(user.id, {
      name,
      bio,
      avatar: finalAvatar,
      coverImage: finalCover,
      birthday,
    });
    onUpdateUser(updatedUser);
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      {/* Cover Banner Card (Pastel Gradient Fallback if no photo uploaded) */}
      <div className="relative w-full h-56 sm:h-72 rounded-3xl overflow-hidden shadow-xl border-4 border-pink-100 bg-gradient-to-r from-pink-300 via-rose-200 to-purple-300">
        {coverImage ? (
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-pink-800/80 font-['Caveat',cursive] text-3xl">
            <span>Welcome to Dear Lily 🌸</span>
            <span className="text-xs font-['Outfit',sans-serif] font-bold text-pink-700 mt-1">Upload a custom cover photo below</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-pink-950/40 via-transparent to-transparent pointer-events-none" />

        {/* Upload Cover Button */}
        <label className="absolute top-4 right-4 px-3.5 py-2 rounded-full bg-white/90 hover:bg-white text-xs font-bold text-pink-900 backdrop-blur-md shadow-md flex items-center gap-1.5 cursor-pointer transition-all">
          <ImageIcon className="w-3.5 h-3.5 text-pink-600" />
          <span>Upload Cover Photo</span>
          <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
        </label>
      </div>

      {/* Profile Header Info */}
      <div className="relative z-10 -mt-16 max-w-5xl mx-auto px-4 sm:px-8">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border-4 border-pink-100 shadow-2xl paper-lined flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          
          {/* Avatar Picture with Hover File Upload */}
          <div className="relative -mt-16 sm:-mt-20 group">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-tr from-pink-200 to-rose-100 flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-pink-600 flex flex-col items-center justify-center">
                  <UserIcon className="w-12 h-12 text-pink-400" />
                  <span className="text-[10px] font-bold mt-1 text-pink-500">Upload Photo</span>
                </div>
              )}
            </div>

            <label className="absolute inset-0 rounded-full bg-pink-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer">
              <Upload className="w-5 h-5 mb-1" />
              <span>Upload Photo</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>

            <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm shadow-md border-2 border-white">
              🌸
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-['Playfair_Display',serif] text-3xl font-bold text-pink-950">
                  {user.name || 'Lily Member'}
                </h2>
                <span className="text-xs font-bold text-pink-500">@{user.username || 'member'} • Joined {user.joinDate}</span>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-5 py-2 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-800 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 self-center sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
            </div>

            {/* Bio content directly displayed without "bio:..." prefix */}
            {user.bio && (
              <p className="mt-2.5 text-xs sm:text-sm text-pink-900 font-medium leading-relaxed">
                {user.bio}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-semibold text-pink-700">
              <span className="flex items-center gap-1.5 bg-pink-50/80 px-3.5 py-1.5 rounded-full border border-pink-200 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-pink-500" />
                <span>Birthday: {user.birthday ? user.birthday : 'Not set'}</span>
              </span>
            </div>
          </div>

        </div>

        {/* EDIT PROFILE FORM MODAL */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-pink-50/90 rounded-3xl p-6 border-2 border-pink-200 shadow-md"
          >
            <h3 className="font-['Caveat',cursive] text-2xl font-bold text-pink-800 mb-4">
              Update Profile Details 🎀
            </h3>
            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 rounded-2xl bg-white border border-pink-200 text-xs text-pink-900 placeholder-pink-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1">Upload Profile Picture from PC</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="w-full text-xs text-pink-900 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-900 mb-1">Birthday</label>
                <input
                  type="text"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  placeholder="e.g. May 14"
                  className="w-full px-4 py-2 rounded-2xl bg-white border border-pink-200 text-xs text-pink-900 placeholder-pink-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-pink-900 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a brief bio about yourself..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-2xl bg-white border border-pink-200 text-xs text-pink-900 placeholder-pink-300 resize-none"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-pink-500 text-white text-xs font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STATISTICS CARDS GRID */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white/90 border-2 border-pink-100 shadow-lg text-center paper-lined">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-2xl mx-auto mb-2 shadow-inner">
              🎞️
            </div>
            <div className="font-['Caveat',cursive] text-4xl font-bold text-pink-700">{stripsCount}</div>
            <div className="text-xs text-pink-800 font-bold uppercase tracking-wider mt-1">Photo Booth Strips</div>
          </div>

          <div className="p-6 rounded-3xl bg-white/90 border-2 border-pink-100 shadow-lg text-center paper-lined">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-2 shadow-inner">
              📖
            </div>
            <div className="font-['Caveat',cursive] text-4xl font-bold text-emerald-700">{entriesCount}</div>
            <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider mt-1">Diary Chapters</div>
          </div>

          {/* DYNAMIC ACHIEVEMENTS COUNTER */}
          <div className="p-6 rounded-3xl bg-white/90 border-2 border-pink-100 shadow-lg text-center paper-lined">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl mx-auto mb-2 shadow-inner">
              🏆
            </div>
            <div className="font-['Caveat',cursive] text-4xl font-bold text-purple-700">
              {unlockedCount} / {achievements.length}
            </div>
            <div className="text-xs text-purple-800 font-bold uppercase tracking-wider mt-1">Achievements Unlocked</div>
          </div>
        </div>

        {/* ACHIEVEMENTS BADGES */}
        <div className="mt-10 bg-white/90 rounded-3xl p-6 sm:p-8 border-4 border-pink-100 shadow-xl paper-lined">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Caveat',cursive] text-3xl font-bold text-pink-900 flex items-center gap-2">
              <span>Scrapbook Badges & Trophies</span>
              <Award className="w-6 h-6 text-amber-500" />
            </h3>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
              {unlockedCount} of {achievements.length} Unlocked ✨
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 transition-all relative overflow-hidden ${
                  ach.unlocked
                    ? `${ach.color} shadow-sm border-2`
                    : 'bg-gray-50/80 border-gray-200 text-gray-400 opacity-60'
                }`}
              >
                <span className="text-3xl shrink-0">{ach.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-sm leading-tight text-pink-950 truncate">{ach.title}</h4>
                    {ach.unlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] mt-1 opacity-85 leading-snug">{ach.desc}</p>

                  <div className="mt-2.5">
                    {ach.unlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>ACHIEVED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full">
                        <Lock className="w-3 h-3 text-gray-400" />
                        <span>LOCKED</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
