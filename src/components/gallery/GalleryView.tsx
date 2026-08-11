import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { Images, Grid, LayoutGrid, Star, Plus, Trash2, X, Folder, Sparkles, Download } from 'lucide-react';
import type { PhotoStrip, Album, UserProfile } from '../../types';
import { StorageService } from '../../services/storage';

interface GalleryViewProps {
  user: UserProfile;
}

const FILTERS: Record<string, string> = {
  none: 'none',
  vintage: 'sepia(0.4) contrast(1.1) brightness(0.95) saturate(1.2)',
  film: 'contrast(1.25) saturate(0.85) hue-rotate(-10deg)',
  dreamy: 'saturate(1.4) brightness(1.08) opacity(0.95)',
  pastel: 'brightness(1.1) saturate(1.3) contrast(0.9) hue-rotate(10deg)',
  polaroid: 'sepia(0.15) contrast(1.2) saturate(1.1) brightness(1.05)',
  disposable: 'contrast(1.3) saturate(1.5) hue-rotate(-5deg)',
  warm: 'sepia(0.25) saturate(1.4) hue-rotate(-15deg)',
  cool: 'hue-rotate(20deg) saturate(1.1) brightness(1.05)',
  bw: 'grayscale(1) contrast(1.2)',
  sepia: 'sepia(0.8) contrast(1.1)',
  y2k: 'contrast(1.2) saturate(1.8) hue-rotate(45deg)',
  'soft-glow': 'brightness(1.15) contrast(0.95) saturate(1.1)',
  'golden-hour': 'sepia(0.35) saturate(1.6) brightness(1.05)',
  matte: 'contrast(0.9) brightness(1.1) saturate(0.9)',
};

const FRAMES: Record<string, { name: string; bgColor: string; borderColor: string; patternEmoji?: string; textColor?: string; frameType?: string }> = {
  bows: { name: 'Coquette Bows 🎀', bgColor: '#FFF0F5', borderColor: '#F48FB1', patternEmoji: '🎀' },
  hearts: { name: 'Pink Hearts 💖', bgColor: '#FFF5F7', borderColor: '#F8BBD0', patternEmoji: '💖' },
  flowers: { name: 'Floral Garden 🌸', bgColor: '#FFF9FB', borderColor: '#F48FB1', patternEmoji: '🌸' },
  butterflies: { name: 'Butterflies 🦋', bgColor: '#F8F0FC', borderColor: '#CE93D8', patternEmoji: '🦋' },
  stars: { name: 'Sparkling Stars ⭐', bgColor: '#FFFDF0', borderColor: '#FBC02D', patternEmoji: '⭐' },
  clouds: { name: 'Soft Clouds ☁️', bgColor: '#F0FBFC', borderColor: '#81D4FA', patternEmoji: '☁️' },
  polaroid: { name: 'Vintage Polaroid 📷', bgColor: '#FAF7F2', borderColor: '#E8E2D5', frameType: 'polaroid' },
  film: { name: '35mm Film Roll 🎞️', bgColor: '#18181B', borderColor: '#3F3F46', textColor: '#FFFFFF', frameType: 'film' },
  kraft: { name: 'Kraft Scrapbook 📜', bgColor: '#EFE3C3', borderColor: '#C4A482' },
  clean: { name: 'Clean White 🤍', bgColor: '#FFFFFF', borderColor: '#E5E7EB' },
  none: { name: 'Clean White 🤍', bgColor: '#FFFFFF', borderColor: '#E5E7EB' },
};

export const GalleryView: React.FC<GalleryViewProps> = ({ user }) => {
  const [strips, setStrips] = useState<PhotoStrip[]>(() => StorageService.getPhotoStrips(user.id));
  const [albums, setAlbums] = useState<Album[]>(() => StorageService.getAlbums(user.id));
  const [activeAlbumId, setActiveAlbumId] = useState<string>('all');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'masonry'>('masonry');
  const [selectedStrip, setSelectedStrip] = useState<PhotoStrip | null>(null);

  const modalStripRef = React.useRef<HTMLDivElement | null>(null);

  // New Album Modal State
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [selectedStripsForNewAlbum, setSelectedStripsForNewAlbum] = useState<string[]>([]);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Re-sync saved photo strips and albums whenever user or view changes
  React.useEffect(() => {
    const syncData = () => {
      setStrips(StorageService.getPhotoStrips(user.id));
      setAlbums(StorageService.getAlbums(user.id));
    };
    syncData();
    window.addEventListener('storage', syncData);
    return () => window.removeEventListener('storage', syncData);
  }, [user.id]);

  // Assign strip to album
  const handleAssignAlbum = (stripId: string, albumId: string) => {
    const targetAlbumId = albumId === 'none' ? undefined : albumId;
    const updated = strips.map((s) => (s.id === stripId ? { ...s, albumId: targetAlbumId } : s));
    setStrips(updated);
    StorageService.savePhotoStrips(updated, user.id);
    const albObj = albums.find((a) => a.id === targetAlbumId);
    showToast(targetAlbumId ? `Moved photo strip to "${albObj?.name}" 📂` : 'Removed photo strip from album 📁');
  };

  // Delete Custom Album
  const handleDeleteAlbum = (albumId: string) => {
    const albObj = albums.find((a) => a.id === albumId);
    const updatedAlbums = albums.filter((a) => a.id !== albumId);
    setAlbums(updatedAlbums);
    StorageService.saveAlbums(updatedAlbums, user.id);

    // Reassign strips in this deleted album back to unassigned
    const updatedStrips = strips.map((s) => (s.albumId === albumId ? { ...s, albumId: undefined } : s));
    setStrips(updatedStrips);
    StorageService.savePhotoStrips(updatedStrips, user.id);

    if (activeAlbumId === albumId) {
      setActiveAlbumId('all');
    }
    showToast(`Deleted album "${albObj?.name || ''}" 🗑️`);
  };

  // Toggle Favorite
  const toggleFavorite = (id: string) => {
    const updated = strips.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
    setStrips(updated);
    StorageService.savePhotoStrips(updated, user.id);
  };

  // Delete Photo Strip
  const handleDeleteStrip = (id: string) => {
    const updated = strips.filter((s) => s.id !== id);
    setStrips(updated);
    StorageService.savePhotoStrips(updated, user.id);
    if (selectedStrip?.id === id) setSelectedStrip(null);
    showToast('Deleted photo strip 🗑️');
  };

  // Create Album
  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    const newAlbId = 'alb_' + Date.now();
    const albumObj: Album = {
      id: newAlbId,
      userId: user.id,
      name: newAlbumName.trim(),
      description: newAlbumDesc || 'My aesthetic scrapbook album',
      coverImage: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80',
    };
    const updatedAlbums = [...albums, albumObj];
    setAlbums(updatedAlbums);
    StorageService.saveAlbums(updatedAlbums, user.id);

    // Assign selected strips to this new album
    if (selectedStripsForNewAlbum.length > 0) {
      const updatedStrips = strips.map((s) =>
        selectedStripsForNewAlbum.includes(s.id) ? { ...s, albumId: newAlbId } : s
      );
      setStrips(updatedStrips);
      StorageService.savePhotoStrips(updatedStrips, user.id);
    }

    setNewAlbumName('');
    setNewAlbumDesc('');
    setSelectedStripsForNewAlbum([]);
    setIsCreatingAlbum(false);
    setActiveAlbumId(newAlbId);
    showToast(`Created album "${albumObj.name}"! 🎀`);
  };

  // Download Strip PNG from Modal
  const handleDownloadModalPNG = async () => {
    if (!modalStripRef.current || !selectedStrip) return;
    showToast('Downloading saved photo strip... 📸');

    try {
      const dataUrl = await toPng(modalStripRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        quality: 1.0,
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DearLily_Gallery_Strip_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
      showToast('Downloaded photo strip PNG! 💖');
    } catch (err) {
      console.error('Failed to download strip from gallery modal:', err);
      showToast('Download error occurred');
    }
  };

  const filteredStrips = strips.filter((s) => {
    if (activeAlbumId === 'all') return true;
    if (activeAlbumId === 'favorites') return s.isFavorite;
    return s.albumId === activeAlbumId;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 select-none">
      {/* Toast Alert */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-full bg-pink-600 text-white text-xs font-bold shadow-xl flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toast}</span>
        </motion.div>
      )}

      {/* Gallery Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-pink-900 flex items-center gap-2">
            <span>Memory Gallery</span>
            <Images className="w-7 h-7 text-pink-500" />
          </h1>
          <p className="text-xs text-pink-700/80 mt-1 font-medium">
            Your saved photo booth strips & aesthetic scrapbooks organized by albums.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid / Masonry Toggle */}
          <div className="flex items-center bg-white p-1 rounded-full border border-pink-200 shadow-xs">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-2 rounded-full transition-all ${
                layoutMode === 'grid' ? 'bg-pink-500 text-white shadow-xs' : 'text-pink-600 hover:bg-pink-50'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('masonry')}
              className={`p-2 rounded-full transition-all ${
                layoutMode === 'masonry' ? 'bg-pink-500 text-white shadow-xs' : 'text-pink-600 hover:bg-pink-50'
              }`}
              title="Masonry Scrapbook Layout"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCreatingAlbum(true)}
            className="px-4 py-2.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-800 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-pink-600" />
            <span>New Album</span>
          </button>
        </div>
      </div>

      {/* ALBUMS SCROLL BAR */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 scrollbar-none">
        <button
          onClick={() => setActiveAlbumId('all')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeAlbumId === 'all'
              ? 'bg-pink-500 text-white shadow-md'
              : 'bg-white text-pink-800 border border-pink-200 hover:bg-pink-50'
          }`}
        >
          All Memories ({strips.length})
        </button>

        <button
          onClick={() => setActiveAlbumId('favorites')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeAlbumId === 'favorites'
              ? 'bg-pink-500 text-white shadow-md'
              : 'bg-white text-pink-800 border border-pink-200 hover:bg-pink-50'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>Favorites ({strips.filter((s) => s.isFavorite).length})</span>
        </button>

        {albums.map((alb) => {
          const albStripsCount = strips.filter((s) => s.albumId === alb.id).length;
          return (
            <div key={alb.id} className="inline-flex items-center">
              <button
                onClick={() => setActiveAlbumId(alb.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  activeAlbumId === alb.id
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-white text-pink-800 border border-pink-200 hover:bg-pink-50'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-pink-400" />
                <span>{alb.name} ({albStripsCount})</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAlbum(alb.id);
                  }}
                  className="ml-1 px-1 py-0.5 hover:bg-rose-200 hover:text-rose-900 rounded-full transition-colors cursor-pointer text-[10px] leading-none"
                  title={`Delete album "${alb.name}"`}
                >
                  ✕
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* GALLERY STRIPS DISPLAY */}
      {filteredStrips.length === 0 ? (
        <div className="text-center py-16 bg-white/80 rounded-3xl border-4 border-pink-100 p-8">
          <span className="text-4xl">🖼️</span>
          <h3 className="font-['Caveat',cursive] text-3xl font-bold text-pink-800 mt-2">
            No Saved Photo Strips Here Yet
          </h3>
          <p className="text-xs text-pink-600 mt-1">Visit the Photo Booth to snap & save your first aesthetic strip!</p>
        </div>
      ) : (
        <div
          className={
            layoutMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
              : 'columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6'
          }
        >
          {filteredStrips.map((strip) => {
            const frameObj = FRAMES[strip.frame] || FRAMES['bows'];
            const filterCss = FILTERS[strip.filter] || 'none';

            return (
              <motion.div
                key={strip.id}
                whileHover={{ y: -6, rotate: -1 }}
                className="relative rounded-3xl p-4 shadow-xl overflow-hidden group break-inside-avoid cursor-pointer flex flex-col items-center border-4"
                style={{
                  backgroundColor: frameObj.bgColor,
                  borderColor: frameObj.borderColor,
                  color: frameObj.textColor || '#881337',
                }}
                onClick={() => setSelectedStrip(strip)}
              >
                {/* Washi Tape Decor */}
                <div className="mx-auto w-20 h-4 washi-tape-pink transform rotate-1 rounded-xs flex items-center justify-center text-[8px] font-bold text-pink-800 shadow-xs mb-2">
                  DEAR LILY 🌸
                </div>

                {/* Strip Header Title & Date */}
                <div className="text-center mb-2">
                  <h4 className="font-['Caveat',cursive] text-2xl font-bold leading-none truncate max-w-[180px]">
                    {strip.title}
                  </h4>
                  <span className="text-[9px] opacity-70 font-semibold uppercase tracking-wider block mt-1">
                    {strip.createdAt}
                  </span>
                </div>

                {/* Pattern Frame Border Decorator */}
                {frameObj.patternEmoji && (
                  <div className="w-full flex items-center justify-between text-[10px] px-1 mb-1 opacity-90 select-none">
                    <span>{frameObj.patternEmoji}</span>
                    <span>{frameObj.patternEmoji}</span>
                    <span>{frameObj.patternEmoji}</span>
                    <span>{frameObj.patternEmoji}</span>
                  </div>
                )}

                {/* Photo Strip Grid Thumbnail with Applied Filters */}
                <div className="relative w-full flex flex-col items-center gap-2 my-2">
                  {strip.photos.map((p, i) => (
                    <div
                      key={i}
                      className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-white shadow-xs bg-pink-50"
                    >
                      <img
                        src={p}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ filter: filterCss }}
                      />
                    </div>
                  ))}

                  {/* Stickers Layer */}
                  {strip.stickers?.map((st) => (
                    <div
                      key={st.id}
                      className="absolute text-base select-none pointer-events-none filter drop-shadow-xs"
                      style={{
                        left: `${st.x}%`,
                        top: `${st.y}%`,
                        transform: `scale(${st.scale * 0.8}) rotate(${st.rotation}deg)`,
                      }}
                    >
                      {st.content}
                    </div>
                  ))}

                  {/* Text Overlays Layer */}
                  {strip.textOverlays?.map((txt) => (
                    <div
                      key={txt.id}
                      className="absolute text-center select-none pointer-events-none font-bold"
                      style={{
                        left: `${txt.x}%`,
                        top: `${txt.y}%`,
                        fontFamily: txt.font,
                        color: txt.color,
                        fontSize: `${txt.size * 0.6}px`,
                      }}
                    >
                      {txt.text}
                    </div>
                  ))}
                </div>

                {/* Card Footer Stamp & Actions */}
                <div className="w-full mt-2 pt-2 border-t border-pink-200/50 flex flex-col gap-2">
                  {/* Album Selector Dropdown on Strip Card */}
                  <div className="flex items-center justify-between bg-white/70 px-2.5 py-1 rounded-xl border border-pink-200/80 shadow-2xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Folder className="w-3 h-3 text-pink-500 shrink-0" />
                      <select
                        value={strip.albumId || 'none'}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleAssignAlbum(strip.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent text-[10px] font-bold text-pink-900 focus:outline-none cursor-pointer truncate max-w-[120px]"
                      >
                        <option value="none">📁 No Album (All)</option>
                        {albums.map((alb) => (
                          <option key={alb.id} value={alb.id}>
                            📂 {alb.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(strip.id);
                        }}
                        className="p-1 rounded-full hover:bg-pink-100"
                        title={strip.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-3.5 h-3.5 ${strip.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-pink-300'}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStrip(strip.id);
                        }}
                        className="p-1 rounded-full hover:bg-rose-100 text-rose-400"
                        title="Delete photo strip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedStrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border-4 border-pink-200 shadow-2xl overflow-hidden flex flex-col items-center max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedStrip(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 z-30"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-2">
                <h3 className="font-['Caveat',cursive] text-3xl font-bold text-pink-900 leading-tight">
                  {selectedStrip.title}
                </h3>
                <span className="text-xs text-pink-500 font-semibold">{selectedStrip.createdAt}</span>
              </div>

              {/* Album Selection inside Lightbox */}
              <div className="w-full my-2 flex items-center justify-between px-3 py-1.5 rounded-2xl bg-pink-50 border border-pink-200">
                <span className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-pink-600" />
                  <span>Album:</span>
                </span>
                <select
                  value={selectedStrip.albumId || 'none'}
                  onChange={(e) => {
                    handleAssignAlbum(selectedStrip.id, e.target.value);
                    setSelectedStrip((prev) => (prev ? { ...prev, albumId: e.target.value === 'none' ? undefined : e.target.value } : null));
                  }}
                  className="bg-white border border-pink-300 rounded-xl px-2.5 py-1 text-xs font-bold text-pink-900 focus:outline-none cursor-pointer shadow-xs"
                >
                  <option value="none">No Album (All Memories)</option>
                  {albums.map((alb) => (
                    <option key={alb.id} value={alb.id}>
                      📂 {alb.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Styled Photo Strip in Lightbox */}
              <div className="flex-1 overflow-y-auto w-full flex items-center justify-center p-2 scrollbar-none">
                <div
                  ref={modalStripRef}
                  className="relative w-full max-w-[230px] p-4 rounded-2xl shadow-xl flex flex-col items-center justify-between border-4"
                  style={{
                    backgroundColor: (FRAMES[selectedStrip.frame] || FRAMES['bows']).bgColor,
                    borderColor: (FRAMES[selectedStrip.frame] || FRAMES['bows']).borderColor,
                    color: (FRAMES[selectedStrip.frame] || FRAMES['bows']).textColor || '#881337',
                  }}
                >
                  <div className="mx-auto w-24 h-4 washi-tape-pink transform rotate-1 rounded-xs flex items-center justify-center text-[8px] font-bold text-pink-800 mb-2 shadow-xs">
                    DEAR LILY 🌸
                  </div>

                  <div className="text-center mb-2">
                    <h4 className="font-['Caveat',cursive] text-xl font-bold leading-none truncate max-w-[180px]">
                      {selectedStrip.title}
                    </h4>
                  </div>

                  <div className="relative w-full flex flex-col items-center gap-2 my-2">
                    {selectedStrip.photos.map((p, i) => (
                      <div
                        key={i}
                        className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-white shadow-xs bg-pink-50"
                      >
                        <img
                          src={p}
                          alt=""
                          className="w-full h-full object-cover"
                          style={{ filter: FILTERS[selectedStrip.filter] || 'none' }}
                        />
                      </div>
                    ))}

                    {/* Stickers */}
                    {selectedStrip.stickers?.map((st) => (
                      <div
                        key={st.id}
                        className="absolute text-xl select-none pointer-events-none filter drop-shadow-xs"
                        style={{
                          left: `${st.x}%`,
                          top: `${st.y}%`,
                          transform: `scale(${st.scale}) rotate(${st.rotation}deg)`,
                        }}
                      >
                        {st.content}
                      </div>
                    ))}

                    {/* Text Overlays */}
                    {selectedStrip.textOverlays?.map((txt) => (
                      <div
                        key={txt.id}
                        className="absolute text-center select-none pointer-events-none font-bold"
                        style={{
                          left: `${txt.x}%`,
                          top: `${txt.y}%`,
                          fontFamily: txt.font,
                          color: txt.color,
                          fontSize: `${txt.size * 0.75}px`,
                        }}
                      >
                        {txt.text}
                      </div>
                    ))}
                  </div>

                  <div className="text-center text-[9px] font-['Caveat',cursive] font-bold mt-2">
                    dear lily photo booth 🎀
                  </div>
                </div>
              </div>

              {/* Lightbox Actions */}
              <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-pink-100">
                <button
                  onClick={() => handleDeleteStrip(selectedStrip.id)}
                  className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={handleDownloadModalPNG}
                  className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE ALBUM MODAL */}
      <AnimatePresence>
        {isCreatingAlbum && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-[#FFFDF9] rounded-3xl p-6 max-w-md w-full border-4 border-pink-200 shadow-2xl paper-lined"
            >
              <button
                onClick={() => setIsCreatingAlbum(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-pink-100 text-pink-600"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-['Caveat',cursive] text-3xl font-bold text-pink-800 mb-4">
                Create New Memory Album 🎀
              </h3>

              <form onSubmit={handleCreateAlbum} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-pink-900 mb-1">Album Title</label>
                  <input
                    type="text"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    placeholder="e.g. Summer Vacation '26 ☀️"
                    className="w-full px-4 py-2.5 rounded-2xl bg-pink-50/60 border border-pink-200 text-xs text-pink-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-pink-900 mb-1">Description</label>
                  <input
                    type="text"
                    value={newAlbumDesc}
                    onChange={(e) => setNewAlbumDesc(e.target.value)}
                    placeholder="Brief description of your album memories..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-pink-50/60 border border-pink-200 text-xs text-pink-900"
                  />
                </div>

                {/* Strip Checklist for New Album */}
                <div>
                  <label className="block text-xs font-bold text-pink-900 mb-1">Select Photo Strips to Include</label>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-pink-50/60 rounded-2xl border border-pink-200">
                    {strips.length === 0 ? (
                      <div className="text-[11px] text-pink-500 font-medium p-1">No saved photo strips yet.</div>
                    ) : (
                      strips.map((s) => {
                        const isChecked = selectedStripsForNewAlbum.includes(s.id);
                        return (
                          <label key={s.id} className="flex items-center justify-between p-1.5 rounded-xl hover:bg-pink-100/60 cursor-pointer text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStripsForNewAlbum((prev) => [...prev, s.id]);
                                  } else {
                                    setSelectedStripsForNewAlbum((prev) => prev.filter((id) => id !== s.id));
                                  }
                                }}
                                className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                              />
                              <span className="font-bold text-pink-900 truncate">{s.title}</span>
                            </div>
                            <span className="text-[10px] text-pink-500 shrink-0">{s.createdAt}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-pink-500 text-white text-xs font-bold shadow-md"
                >
                  Create Album
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
