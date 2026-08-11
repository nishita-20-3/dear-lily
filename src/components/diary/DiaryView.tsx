import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toJpeg } from 'html-to-image';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Star,
  Lock,
  Unlock,
  Sparkles,
  Save,
  Trash2,
  Download,
  Folder,
  KeyRound,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import type { DiaryEntry, DiaryTheme, PaperStyle, UserProfile, StickerItem } from '../../types';
import { StorageService } from '../../services/storage';
import { GRAPHIC_STICKERS } from './diaryStickers';
import type { GraphicSticker } from './diaryStickers';

interface DiaryViewProps {
  user: UserProfile;
}

const THEMES: { id: DiaryTheme; name: string; bg: string; text: string; tab: string }[] = [
  { id: 'Floral Journal', name: 'Floral Journal 🌸', bg: 'bg-[#FFF5F7] border-pink-200', text: 'text-pink-900', tab: 'washi-tape-pink' },
  { id: 'Vintage Notebook', name: 'Vintage Notebook 📜', bg: 'bg-[#F4EAD3] border-amber-200', text: 'text-[#3D2B1F]', tab: 'washi-tape-yellow' },
  { id: 'Cottagecore', name: 'Cottagecore 🌿', bg: 'bg-[#F2F7F2] border-emerald-200', text: 'text-emerald-950', tab: 'washi-tape-sage' },
  { id: 'Cloud Theme', name: 'Cloud Theme ☁️', bg: 'bg-[#F0F9FF] border-sky-200', text: 'text-sky-950', tab: 'washi-tape-blue' },
  { id: 'Coffee Journal', name: 'Coffee Journal ☕', bg: 'bg-[#FAF0E6] border-stone-300', text: 'text-stone-900', tab: 'washi-tape-yellow' },
  { id: 'Fairy', name: 'Fairy Sparkles 🧚‍♀️', bg: 'bg-[#F9F5FF] border-purple-200', text: 'text-purple-950', tab: 'washi-tape-pink' },
  { id: 'Korean Journal', name: 'Korean Journal 🎀', bg: 'bg-[#FFF0F5] border-rose-200', text: 'text-rose-950', tab: 'washi-tape-pink' },
  { id: 'Minimal', name: 'Minimal Cream 🤍', bg: 'bg-[#FAFAFA] border-neutral-200', text: 'text-neutral-900', tab: 'washi-tape-blue' },
  { id: 'Galaxy', name: 'Galaxy Night ✨', bg: 'bg-[#1E1B2E] border-purple-900 text-white', text: 'text-purple-100', tab: 'washi-tape-blue' },
  { id: 'Autumn', name: 'Autumn Woods 🍂', bg: 'bg-[#FFF8F0] border-amber-300', text: 'text-amber-950', tab: 'washi-tape-yellow' },
  { id: 'Spring', name: 'Spring Blossom 🌷', bg: 'bg-[#FFF0F3] border-pink-300', text: 'text-pink-950', tab: 'washi-tape-pink' },
  { id: 'Summer', name: 'Summer Sunset ☀️', bg: 'bg-[#FFFBEB] border-amber-200', text: 'text-amber-900', tab: 'washi-tape-yellow' },
  { id: 'Winter', name: 'Winter Frost ❄️', bg: 'bg-[#F0FDF4] border-teal-200', text: 'text-teal-950', tab: 'washi-tape-sage' },
  { id: 'Scrapbook', name: 'Pastel Scrapbook 🎨', bg: 'bg-[#FFF7ED] border-orange-200', text: 'text-orange-950', tab: 'washi-tape-pink' },
];

const PAPER_STYLES: { id: PaperStyle; name: string; class: string }[] = [
  { id: 'lined', name: 'Lined Notebook', class: 'paper-lined' },
  { id: 'dot', name: 'Dot Grid', class: 'paper-dot' },
  { id: 'grid', name: 'Square Grid', class: 'paper-grid' },
  { id: 'blank', name: 'Plain Blank', class: 'bg-[#FFFDF9]' },
  { id: 'vintage', name: 'Vintage Paper', class: 'paper-vintage' },
  { id: 'kraft', name: 'Kraft Paper', class: 'paper-kraft' },
  { id: 'floral', name: 'Floral Watermark', class: 'paper-floral' },
  { id: 'pastel', name: 'Pastel Wash', class: 'paper-pastel' },
];

export const DiaryView: React.FC<DiaryViewProps> = ({ user }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => StorageService.getDiaryEntries(user.id));
  const [activeEntryId, setActiveEntryId] = useState<string | null>(entries[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('All');
  const [showCalendarView, setShowCalendarView] = useState(false);

  // Custom Folders State
  const [customFolders, setCustomFolders] = useState<string[]>(() => {
    const saved = localStorage.getItem(`dear_lily_custom_folders_${user.id}`);
    return saved
      ? JSON.parse(saved)
      : ['Daily Moments', 'Ideas & Inspirations', 'Travel & Picnics', 'Personal Thoughts', 'Scrapbook Notes'];
  });

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('📁');

  // Session unlocked entry IDs
  const [unlockedSessionEntryIds, setUnlockedSessionEntryIds] = useState<string[]>([]);

  // PIN Lock Modal States
  const [isSetPinModalOpen, setIsSetPinModalOpen] = useState(false);
  const [pinCodeInput, setPinCodeInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinModalError, setPinModalError] = useState('');

  // Keypad PIN unlock input for active entry
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [unlockError, setUnlockError] = useState('');

  const pageRef = useRef<HTMLDivElement | null>(null);
  const innerPaperRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const draggingStickerRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    pointerStartX: number;
    pointerStartY: number;
  } | null>(null);

  // Active Entry Details
  const activeEntry = entries.find((e) => e.id === activeEntryId);

  // Editor State
  const [title, setTitle] = useState(activeEntry?.title || '');
  const [content, setContent] = useState(activeEntry?.content || '');
  const [folder, setFolder] = useState(activeEntry?.folder || 'Daily Moments');
  const [theme, setTheme] = useState<DiaryTheme>(activeEntry?.theme || 'Floral Journal');
  const [paperStyle, setPaperStyle] = useState<PaperStyle>((activeEntry?.paperStyle as PaperStyle) || 'lined');

  // Distinct Heading vs Paragraph Fonts, Sizes & Color Palette State
  const [titleFont, setTitleFont] = useState<string>(activeEntry?.titleFont || activeEntry?.font || 'Caveat');
  const [contentFont, setContentFont] = useState<string>(activeEntry?.contentFont || activeEntry?.font || 'Caveat');
  const [titleColor, setTitleColor] = useState<string>(activeEntry?.titleColor || '#831843');
  const [contentColor, setContentColor] = useState<string>(activeEntry?.contentColor || '#4c0519');
  const [titleFontSize, setTitleFontSize] = useState<string>(activeEntry?.titleSize || '28px');
  const [contentFontSize, setContentFontSize] = useState<string>(activeEntry?.contentSize || '18px');

  // Graphic & Emoji Stickers State
  const [stickers, setStickers] = useState<StickerItem[]>(activeEntry?.stickers || []);
  const [showStickerPalette, setShowStickerPalette] = useState(false);
  const [stickerTab, setStickerTab] = useState<'graphic' | 'kawaii' | 'hearts' | 'nature' | 'magic'>('graphic');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Toast alert
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const EMOJI_CATEGORIES: Record<string, string[]> = {
    kawaii: ['🎀', '🧸', '☁️', '🍓', '☕', '🧋', '🧁', '🍩', '🍦', '🎨', '🐰', '🐱', '🐣', '🌸', '🍭', '🍉', '🎈'],
    hearts: ['💖', '💗', '💓', '💞', '💌', '💘', '🎀', '🤍', '🌸', '👑', '🌹', '💍', '💝', '✨', '💐'],
    nature: ['🌸', '🌷', '🌹', '🌻', '🌺', '🌿', '🍀', '🍂', '🍁', '🦋', '🐝', '🌼', '🌱', '🍄', '🌱'],
    magic: ['✨', '⭐', '🌟', '💫', '🌙', '☀️', '🔮', '🕊️', '📜', '📮', '🕯️', '🪄', '💎', '🌈', '🔥'],
  };

  const handleAddGraphicSticker = (gSticker: GraphicSticker) => {
    if (!activeEntry) return;
    const newStk: StickerItem = {
      id: 'stk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      content: gSticker.name,
      stickerType: 'image',
      imageSrc: gSticker.svgSrc,
      x: 80 + Math.random() * 80,
      y: 80 + Math.random() * 100,
      scale: gSticker.defaultScale || 1.2,
      rotation: 0,
    };
    const updated = [...stickers, newStk];
    setStickers(updated);
    saveEntryWithStickers(updated);
    showToast(`Added ${gSticker.name}! ✨`);
  };

  const handleAddEmojiSticker = (emojiStr: string) => {
    if (!activeEntry) return;
    const newStk: StickerItem = {
      id: 'stk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      content: emojiStr,
      stickerType: 'emoji',
      x: 80 + Math.random() * 80,
      y: 80 + Math.random() * 100,
      scale: 1.4,
      rotation: 0,
    };
    const updated = [...stickers, newStk];
    setStickers(updated);
    saveEntryWithStickers(updated);
    showToast(`Added ${emojiStr} sticker! 🌸`);
  };

  const handleClearAllStickers = () => {
    if (stickers.length === 0) return;
    setStickers([]);
    saveEntryWithStickers([]);
    setSelectedStickerId(null);
    showToast('Cleared all stickers from page! 🧹');
  };

  const handleRemoveSticker = (id: string) => {
    const updated = stickers.filter((s) => s.id !== id);
    setStickers(updated);
    saveEntryWithStickers(updated);
  };

  const handleScaleSticker = (id: string, delta: number) => {
    const updated = stickers.map((s) =>
      s.id === id ? { ...s, scale: Math.max(0.4, Math.min(3.5, Number((s.scale + delta).toFixed(2)))) } : s
    );
    setStickers(updated);
    saveEntryWithStickers(updated);
  };

  const handleRotateSticker = (id: string) => {
    const updated = stickers.map((s) =>
      s.id === id ? { ...s, rotation: (s.rotation + 15) % 360 } : s
    );
    setStickers(updated);
    saveEntryWithStickers(updated);
  };

  const handleStickerPointerDown = (e: React.PointerEvent, sticker: StickerItem) => {
    if ((e.target as HTMLElement).closest('.sticker-control-bar')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    setSelectedStickerId(sticker.id);

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    draggingStickerRef.current = {
      id: sticker.id,
      startX: sticker.x,
      startY: sticker.y,
      pointerStartX: e.clientX,
      pointerStartY: e.clientY,
    };
  };

  const handleStickerPointerMove = (e: React.PointerEvent, sticker: StickerItem) => {
    if (!draggingStickerRef.current || draggingStickerRef.current.id !== sticker.id) return;
    e.preventDefault();
    e.stopPropagation();

    const paper = innerPaperRef.current;
    if (!paper) return;
    const rect = paper.getBoundingClientRect();

    const deltaX = e.clientX - draggingStickerRef.current.pointerStartX;
    const deltaY = e.clientY - draggingStickerRef.current.pointerStartY;

    const estimatedSize = 90 * (sticker.scale || 1.2);
    const maxX = Math.max(0, rect.width - estimatedSize);
    const maxY = Math.max(0, rect.height - estimatedSize);

    const rawX = draggingStickerRef.current.startX + deltaX;
    const rawY = draggingStickerRef.current.startY + deltaY;

    const clampedX = Math.max(0, Math.min(maxX, rawX));
    const clampedY = Math.max(0, Math.min(maxY, rawY));

    setStickers((prev) =>
      prev.map((stk) => (stk.id === sticker.id ? { ...stk, x: clampedX, y: clampedY } : stk))
    );
  };

  const handleStickerPointerUp = (e: React.PointerEvent, sticker: StickerItem) => {
    if (draggingStickerRef.current && draggingStickerRef.current.id === sticker.id) {
      draggingStickerRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}

      setStickers((currentStickers) => {
        saveEntryWithStickers(currentStickers);
        return currentStickers;
      });
    }
  };

  const saveEntryWithStickers = (updatedStickers: StickerItem[]) => {
    if (!activeEntryId || !activeEntry) return;
    const updated = entries.map((e) =>
      e.id === activeEntryId
        ? {
            ...e,
            title,
            content,
            folder,
            theme,
            paperStyle,
            font: titleFont,
            titleFont,
            contentFont,
            titleColor,
            contentColor,
            titleSize: titleFontSize,
            contentSize: contentFontSize,
            stickers: updatedStickers,
          }
        : e
    );
    setEntries(updated);
    StorageService.saveDiaryEntries(updated, user.id);
  };

  // Keyboard navigation for Title <-> Content
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      contentRef.current?.focus();
    }
  };

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace' && contentRef.current) {
      if (contentRef.current.selectionStart === 0 && contentRef.current.selectionEnd === 0) {
        if (titleRef.current) {
          titleRef.current.focus();
          const len = titleRef.current.value.length;
          titleRef.current.setSelectionRange(len, len);
        }
      }
    }
  };

  // Create Custom Folder
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const folderTitle = `${newFolderIcon} ${newFolderName.trim()}`;
    if (customFolders.includes(folderTitle)) {
      showToast(`Folder "${newFolderName}" already exists!`);
      return;
    }
    const updated = [...customFolders, folderTitle];
    setCustomFolders(updated);
    localStorage.setItem(`dear_lily_custom_folders_${user.id}`, JSON.stringify(updated));
    setFolder(folderTitle);
    setSelectedFolderFilter(folderTitle);
    setNewFolderName('');
    setIsCreatingFolder(false);
    showToast(`Created folder "${folderTitle}"! 📁`);
  };

  // Delete Custom Folder
  const handleDeleteFolder = (folderName: string) => {
    if (!customFolders.includes(folderName)) return;
    const updatedCustom = customFolders.filter((f) => f !== folderName);
    setCustomFolders(updatedCustom);
    localStorage.setItem(`dear_lily_custom_folders_${user.id}`, JSON.stringify(updatedCustom));

    // Reassign any entries in this deleted folder back to 'Daily Moments'
    const updatedEntries = entries.map((e) =>
      e.folder === folderName ? { ...e, folder: 'Daily Moments' } : e
    );
    setEntries(updatedEntries);
    StorageService.saveDiaryEntries(updatedEntries, user.id);

    if (selectedFolderFilter === folderName) {
      setSelectedFolderFilter('All');
    }
    if (folder === folderName) {
      setFolder('Daily Moments');
    }
    showToast(`Deleted folder "${folderName}" 🗑️`);
  };

  // Check if active entry is PIN locked and not yet unlocked in current session
  const isEntryLockedForSession = (entry: DiaryEntry) => {
    return entry.pinLocked && !unlockedSessionEntryIds.includes(entry.id);
  };

  // Sync state when active entry changes
  const selectEntry = (entry: DiaryEntry) => {
    setActiveEntryId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setFolder(entry.folder || 'Daily Moments');
    setTheme(entry.theme || 'Floral Journal');
    setPaperStyle((entry.paperStyle as PaperStyle) || 'lined');
    setTitleFont(entry.titleFont || entry.font || 'Caveat');
    setContentFont(entry.contentFont || entry.font || 'Caveat');
    setTitleColor(entry.titleColor || '#831843');
    setContentColor(entry.contentColor || '#4c0519');
    setTitleFontSize(entry.titleSize || '28px');
    setContentFontSize(entry.contentSize || '18px');
    setStickers(entry.stickers || []);
    setSelectedStickerId(null);
    setUnlockPinInput('');
    setUnlockError('');
    setUnlockedSessionEntryIds([]);
  };

  // Create New Entry
  const handleCreateNew = () => {
    const newEntry: DiaryEntry = {
      id: 'entry_' + Date.now(),
      userId: user.id,
      title: 'New Diary Entry ✨',
      content: 'Write your thoughts, memories, and dreams here...',
      date: new Date().toISOString().split('T')[0],
      folder: selectedFolderFilter !== 'All' && selectedFolderFilter !== 'Favorites' ? selectedFolderFilter : 'Daily Moments',
      mood: '🌸',
      weather: 'sunny',
      tags: ['diary'],
      theme: 'Floral Journal',
      paperStyle: 'lined',
      isFavorite: false,
      isDraft: false,
      pinLocked: false,
      stickers: [],
      font: 'Caveat',
      titleFont: 'Caveat',
      contentFont: 'Caveat',
      titleColor: '#831843',
      contentColor: '#4c0519',
      titleSize: '28px',
      contentSize: '18px',
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    StorageService.saveDiaryEntries(updated, user.id);
    selectEntry(newEntry);
    showToast('Created new diary page 📖');
  };

  // Save Active Entry
  const handleSaveEntry = () => {
    if (!activeEntryId || !activeEntry) return;
    const updated = entries.map((e) =>
      e.id === activeEntryId
        ? {
            ...e,
            title,
            content,
            folder,
            theme,
            paperStyle,
            font: titleFont,
            titleFont,
            contentFont,
            titleColor,
            contentColor,
            titleSize: titleFontSize,
            contentSize: contentFontSize,
          }
        : e
    );
    setEntries(updated);
    StorageService.saveDiaryEntries(updated, user.id);
    showToast('Saved diary page! 🌸');
  };

  // Delete Active Entry
  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    StorageService.saveDiaryEntries(updated, user.id);
    if (updated.length > 0) {
      selectEntry(updated[0]);
    } else {
      setActiveEntryId(null);
    }
    showToast('Deleted page 🗑️');
  };

  // Toggle PIN Lock Protection on active entry
  const handleTogglePinLockClick = () => {
    if (!activeEntry) return;
    if (activeEntry.pinLocked) {
      // Remove PIN Lock
      const updated = entries.map((e) => (e.id === activeEntry.id ? { ...e, pinLocked: false, pinCode: undefined } : e));
      setEntries(updated);
      StorageService.saveDiaryEntries(updated, user.id);
      showToast('PIN Lock removed 🔓');
    } else {
      // Open PIN Setup Modal
      setPinCodeInput('');
      setConfirmPinInput('');
      setPinModalError('');
      setIsSetPinModalOpen(true);
    }
  };

  // Save New 4-Digit PIN Code
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pinCodeInput)) {
      setPinModalError('PIN must be a 4-digit number (e.g. 1234)');
      return;
    }
    if (pinCodeInput !== confirmPinInput) {
      setPinModalError('PIN codes do not match!');
      return;
    }

    if (!activeEntryId) return;

    const updated = entries.map((entry) =>
      entry.id === activeEntryId
        ? {
            ...entry,
            pinLocked: true,
            pinCode: pinCodeInput,
          }
        : entry
    );

    setEntries(updated);
    StorageService.saveDiaryEntries(updated, user.id);
    setUnlockedSessionEntryIds((prev) => [...prev, activeEntryId]);
    setIsSetPinModalOpen(false);
    showToast('4-Digit PIN Lock Enabled! 🔒');
  };

  // Submit Unlock PIN Code
  const handleVerifyUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEntry) return;
    const requiredPin = activeEntry.pinCode || '1234';
    if (unlockPinInput === requiredPin) {
      setUnlockedSessionEntryIds((prev) => [...prev, activeEntry.id]);
      setUnlockPinInput('');
      setUnlockError('');
      showToast('Chapter Unlocked! 🔑');
    } else {
      setUnlockError('Incorrect PIN code! Access Denied 🔒');
    }
  };

  // Toggle Favorite State
  const toggleFavorite = (id: string) => {
    const updated = entries.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e));
    setEntries(updated);
    StorageService.saveDiaryEntries(updated, user.id);
  };

  // Pixel-Perfect High-Res Notebook Page Export using html-to-image
  const handleDownloadPageJPG = async () => {
    if (!pageRef.current) return;
    showToast('Rendering pixel-perfect diary page image... 🌸');

    try {
      const dataUrl = await toJpeg(pageRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
        quality: 0.98,
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DearLily_Journal_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
      showToast('Downloaded diary page as JPG image! 💖');
    } catch (err) {
      console.error('Failed to export page to JPG:', err);
      showToast('Export failed. Please try again!');
    }
  };

  // Folders list
  const foldersList = ['All', 'Favorites', ...customFolders];

  const filteredEntries = entries.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.content.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedFolderFilter === 'All') return matchesSearch;
    if (selectedFolderFilter === 'Favorites') return e.isFavorite && matchesSearch;
    return e.folder === selectedFolderFilter && matchesSearch;
  });

  const activeThemeObj = THEMES.find((t) => t.id === theme) || THEMES[0];
  const activePaperObj = PAPER_STYLES.find((p) => p.id === paperStyle) || PAPER_STYLES[0];

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

      {/* Diary Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-pink-900 flex items-center gap-2">
            <span>Digital Notebook Diary</span>
            <BookOpen className="w-7 h-7 text-pink-500" />
          </h1>
          <p className="text-xs text-pink-700/80 mt-1 font-medium">
            Write your thoughts, create custom folders, customize paper textures & add cute doodles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalendarView(!showCalendarView)}
            className={`px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all ${
              showCalendarView ? 'bg-pink-500 text-white border-pink-500 shadow-md' : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar View</span>
          </button>

          <button
            onClick={() => setIsCreatingFolder(true)}
            className="px-4 py-2 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-800 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-pink-600" />
            <span>New Folder</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-pink-200 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Page</span>
          </button>
        </div>
      </div>

      {/* Calendar View Modal */}
      {showCalendarView && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-8 p-6 bg-white/90 backdrop-blur-md rounded-3xl border-4 border-pink-100 shadow-xl paper-lined"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Caveat',cursive] text-2xl font-bold text-pink-800">
              Diary Calendar & Memories 📅
            </h3>
            <button
              onClick={() => setShowCalendarView(false)}
              className="text-xs text-pink-500 hover:underline font-bold"
            >
              Close Calendar
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {entries.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  selectEntry(e);
                  setShowCalendarView(false);
                }}
                className="p-3 rounded-2xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-pink-500">
                  <span>{e.date}</span>
                  {e.pinLocked && <Lock className="w-3 h-3 text-pink-500" />}
                </div>
                <div className="font-bold text-xs text-pink-900 truncate mt-1 group-hover:text-pink-600">
                  {e.title}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* MAIN NOTEBOOK TWO-COLUMN SHELL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDEBAR: ENTRY LIST & FOLDERS */}
        <div className="lg:col-span-4 bg-white/90 backdrop-blur-md rounded-3xl p-5 border-4 border-pink-100 shadow-xl paper-lined">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diary entries..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-pink-50/60 border border-pink-200 text-xs text-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Folder Pills List with 1-Click Delete for Custom Folders */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
            {foldersList.map((f) => {
              const isCustom = customFolders.includes(f);
              return (
                <div key={f} className="inline-flex items-center">
                  <button
                    onClick={() => setSelectedFolderFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                      selectedFolderFilter === f
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                    }`}
                  >
                    <span>{f}</span>
                    {isCustom && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(f);
                        }}
                        className="ml-1 px-1 py-0.5 hover:bg-rose-200 hover:text-rose-900 rounded-full transition-colors cursor-pointer text-[10px] leading-none"
                        title={`Delete folder "${f}"`}
                      >
                        ✕
                      </span>
                    )}
                  </button>
                </div>
              );
            })}

            <button
              onClick={() => setIsCreatingFolder(true)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-pink-100 text-pink-800 hover:bg-pink-200 border border-pink-300 flex items-center gap-1 transition-all"
            >
              <Plus className="w-3 h-3 text-pink-600" />
              <span>Add Folder</span>
            </button>
          </div>

          {/* Entries Cards List */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-xs text-pink-400 font-medium">
                No entries found in this folder 🌸
              </div>
            ) : (
              filteredEntries.map((e) => {
                const isSel = e.id === activeEntryId;
                const isLocked = isEntryLockedForSession(e);

                return (
                  <motion.div
                    key={e.id}
                    onClick={() => selectEntry(e)}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                      isSel
                        ? 'border-pink-400 bg-pink-50/90 shadow-md'
                        : 'border-pink-100 bg-white/80 hover:bg-pink-50/50'
                    }`}
                  >
                    {/* Washi Tape Corner */}
                    {isSel && (
                      <div className="absolute top-0 right-0 w-16 h-4 washi-tape-pink rounded-bl-sm" />
                    )}

                    <div className="flex items-center justify-between text-[11px] font-semibold text-pink-600 mb-1">
                      <span>{e.date}</span>
                      <button
                        onClick={(evt) => {
                          evt.stopPropagation();
                          toggleFavorite(e.id);
                        }}
                      >
                        <Star className={`w-3.5 h-3.5 ${e.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-pink-300'}`} />
                      </button>
                    </div>

                    <h4 className="font-['Caveat',cursive] text-2xl font-bold text-pink-900 leading-tight truncate flex items-center gap-1.5">
                      {isLocked && <Lock className="w-4 h-4 text-pink-500 shrink-0" />}
                      <span>{e.title}</span>
                    </h4>

                    <p className="text-[11px] text-pink-800/70 mt-1 line-clamp-2 font-medium">
                      {isLocked ? '🔒 PIN Protected Entry. Click to unlock with 4-digit PIN...' : e.content}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-pink-500 font-bold">
                      <span className="px-2 py-0.5 rounded-full bg-white border border-pink-200">
                        {e.folder || '📁 Daily Moments'}
                      </span>
                      {e.pinLocked && (
                        <span className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5">
                          <Lock className="w-3 h-3" />
                          <span>PIN Locked</span>
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT NOTEBOOK WRITING PAGE OR PIN UNLOCK CARD */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {activeEntry ? (
            isEntryLockedForSession(activeEntry) ? (
              /* PIN UNLOCK CARD WHEN ENTRY IS LOCKED */
              <div className="w-full p-8 sm:p-12 rounded-3xl bg-white/90 backdrop-blur-md border-4 border-pink-200 shadow-2xl text-center paper-lined max-w-md mx-auto my-8">
                <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner border border-pink-300">
                  <Lock className="w-8 h-8 text-pink-600" />
                </div>

                <h3 className="font-['Caveat',cursive] text-3xl font-bold text-pink-900 mb-1">
                  Chapter PIN Protected 🔒
                </h3>
                <p className="text-xs text-pink-600 font-medium mb-6">
                  Enter your 4-digit PIN code to unlock and read this personal diary entry.
                </p>

                <form onSubmit={handleVerifyUnlockPin} className="space-y-4">
                  <div className="relative max-w-xs mx-auto">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                    <input
                      type="password"
                      maxLength={4}
                      value={unlockPinInput}
                      onChange={(e) => setUnlockPinInput(e.target.value)}
                      placeholder="Enter 4-Digit PIN (e.g. 1234)"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-pink-50/80 border border-pink-300 text-center font-mono font-bold text-lg text-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-pink-300 tracking-widest"
                      autoFocus
                    />
                  </div>

                  {unlockError && (
                    <div className="text-xs font-bold text-rose-500 bg-rose-50 p-2 rounded-xl border border-rose-200">
                      {unlockError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full max-w-xs py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-md shadow-pink-200 transition-all active:scale-95"
                  >
                    Unlock Chapter Now 🔑
                  </button>
                </form>
              </div>
            ) : (
              /* UNLOCKED NOTEBOOK PAGE EDITOR */
              <div className="w-full flex flex-col gap-4">
                {/* TOP TOOLBAR & CONTROLS (OUTSIDE EXPORT TARGET) */}
                <div className="flex flex-col gap-3 p-4 rounded-3xl bg-white/90 border-2 border-pink-200 shadow-md">
                  {/* Row 1: Folder, Theme, Paper & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* FOLDER ASSIGNMENT DROP-DOWN */}
                      <div className="flex items-center gap-1 bg-pink-100/90 px-2.5 py-1.5 rounded-xl border border-pink-300 text-xs font-bold text-pink-900 shadow-xs">
                        <Folder className="w-3.5 h-3.5 text-pink-600" />
                        <select
                          value={folder}
                          onChange={(e) => {
                            if (e.target.value === 'CREATE_NEW_FOLDER_OPTION') {
                              setIsCreatingFolder(true);
                            } else {
                              setFolder(e.target.value);
                            }
                          }}
                          className="bg-transparent text-xs font-bold text-pink-900 focus:outline-none cursor-pointer"
                        >
                          {customFolders.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                          <option value="CREATE_NEW_FOLDER_OPTION">➕ Create Custom Folder...</option>
                        </select>
                      </div>

                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as DiaryTheme)}
                        className="px-3 py-1.5 rounded-xl bg-white/80 border border-pink-200 text-xs font-bold text-pink-900 cursor-pointer"
                      >
                        {THEMES.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>

                      <select
                        value={paperStyle}
                        onChange={(e) => setPaperStyle(e.target.value as PaperStyle)}
                        className="px-3 py-1.5 rounded-xl bg-white/80 border border-pink-200 text-xs font-bold text-pink-900 cursor-pointer"
                      >
                        {PAPER_STYLES.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTogglePinLockClick}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          activeEntry.pinLocked
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-white/80 text-pink-700 border border-pink-200 hover:bg-pink-50'
                        }`}
                        title={activeEntry.pinLocked ? 'PIN Lock Enabled (Click to remove)' : 'Enable 4-Digit PIN Protection'}
                      >
                        {activeEntry.pinLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        <span>{activeEntry.pinLocked ? 'PIN Protected' : 'Set PIN Lock'}</span>
                      </button>

                      <button
                        onClick={() => setShowStickerPalette(!showStickerPalette)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                          showStickerPalette
                            ? 'bg-pink-500 text-white shadow-xs'
                            : 'bg-white/90 text-pink-800 border border-pink-200 hover:bg-pink-50'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Stickers ({stickers.length})</span>
                      </button>

                      <button
                        onClick={handleSaveEntry}
                        className="px-4 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Page</span>
                      </button>

                      <button
                        onClick={handleDownloadPageJPG}
                        className="px-4 py-2 rounded-full bg-rose-400 hover:bg-rose-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download JPG</span>
                      </button>
                    </div>
                  </div>

                  {/* AESTHETIC GRAPHIC & EMOJI STICKERS PALETTE */}
                  {showStickerPalette && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-pink-50/90 rounded-2xl border-2 border-pink-200 shadow-md space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                          <button
                            onClick={() => setStickerTab('graphic')}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              stickerTab === 'graphic'
                                ? 'bg-pink-500 text-white shadow-2xs'
                                : 'bg-white text-pink-700 hover:bg-pink-100 border border-pink-200'
                            }`}
                          >
                            🎀 Graphic SVG Stickers ({GRAPHIC_STICKERS.length})
                          </button>
                          <button
                            onClick={() => setStickerTab('kawaii')}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              stickerTab === 'kawaii'
                                ? 'bg-pink-500 text-white shadow-2xs'
                                : 'bg-white text-pink-700 hover:bg-pink-100 border border-pink-200'
                            }`}
                          >
                            🌸 Cute & Kawaii
                          </button>
                          <button
                            onClick={() => setStickerTab('hearts')}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              stickerTab === 'hearts'
                                ? 'bg-pink-500 text-white shadow-2xs'
                                : 'bg-white text-pink-700 hover:bg-pink-100 border border-pink-200'
                            }`}
                          >
                            💖 Hearts & Love
                          </button>
                          <button
                            onClick={() => setStickerTab('nature')}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              stickerTab === 'nature'
                                ? 'bg-pink-500 text-white shadow-2xs'
                                : 'bg-white text-pink-700 hover:bg-pink-100 border border-pink-200'
                            }`}
                          >
                            🌿 Nature & Flowers
                          </button>
                          <button
                            onClick={() => setStickerTab('magic')}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              stickerTab === 'magic'
                                ? 'bg-pink-500 text-white shadow-2xs'
                                : 'bg-white text-pink-700 hover:bg-pink-100 border border-pink-200'
                            }`}
                          >
                            ✨ Magic & Sparkles
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {stickers.length > 0 && (
                            <button
                              onClick={handleClearAllStickers}
                              className="px-3 py-1 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold border border-rose-300 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Clear All ({stickers.length})</span>
                            </button>
                          )}
                          <button
                            onClick={() => setShowStickerPalette(false)}
                            className="text-xs text-pink-500 hover:underline font-bold"
                          >
                            Close
                          </button>
                        </div>
                      </div>

                      {stickerTab === 'graphic' ? (
                        <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-10 gap-2.5 max-h-52 overflow-y-auto p-1 scrollbar-none">
                          {GRAPHIC_STICKERS.map((g) => (
                            <button
                              key={g.id}
                              onClick={() => handleAddGraphicSticker(g)}
                              className="p-2 rounded-xl bg-white hover:bg-pink-100 border border-pink-200 flex flex-col items-center justify-center transition-all group hover:scale-105 shadow-2xs cursor-pointer"
                              title={g.name}
                            >
                              <img src={g.svgSrc} alt={g.name} className="w-11 h-11 object-contain pointer-events-none" />
                              <span className="text-[9px] font-bold text-pink-800 truncate w-full text-center mt-1">
                                {g.name.split(' ')[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 scrollbar-none">
                          {(EMOJI_CATEGORIES[stickerTab] || EMOJI_CATEGORIES.kawaii).map((emojiStr) => (
                            <button
                              key={emojiStr}
                              onClick={() => handleAddEmojiSticker(emojiStr)}
                              className="w-10 h-10 rounded-xl bg-white hover:bg-pink-100 border border-pink-200 flex items-center justify-center text-xl transition-all hover:scale-110 shadow-2xs cursor-pointer"
                            >
                              {emojiStr}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Row 2: Typography & Color Customization Toolbar */}
                  <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-2xl bg-pink-50/70 border border-pink-200 text-xs">
                    {/* HEADING FONT, COLOR & SIZE */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-pink-900">Heading:</span>
                      <select
                        value={titleFont}
                        onChange={(e) => setTitleFont(e.target.value)}
                        className="px-2 py-1 rounded-lg bg-white border border-pink-200 font-bold text-pink-900 focus:outline-none"
                      >
                        <option value="Caveat">Handwriting (Caveat)</option>
                        <option value="Dancing Script">Calligraphy</option>
                        <option value="Playfair Display">Serif Classic</option>
                        <option value="Courier Prime">Typewriter</option>
                        <option value="Quicksand">Rounded Modern</option>
                      </select>

                      <select
                        value={titleFontSize}
                        onChange={(e) => setTitleFontSize(e.target.value)}
                        className="px-2 py-1 rounded-lg bg-white border border-pink-200 font-bold text-pink-900 focus:outline-none"
                        title="Heading Font Size"
                      >
                        <option value="24px">Small (24px)</option>
                        <option value="28px">Normal (28px)</option>
                        <option value="34px">Large (34px)</option>
                        <option value="40px">X-Large (40px)</option>
                      </select>

                      <input
                        type="color"
                        value={titleColor}
                        onChange={(e) => setTitleColor(e.target.value)}
                        className="w-6 h-6 rounded-md border border-pink-200 cursor-pointer p-0 bg-transparent"
                        title="Heading Color"
                      />
                    </div>

                    <div className="h-4 w-px bg-pink-200 hidden sm:block" />

                    {/* PARAGRAPH FONT, COLOR & SIZE */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-pink-900">Body Text:</span>
                      <select
                        value={contentFont}
                        onChange={(e) => setContentFont(e.target.value)}
                        className="px-2 py-1 rounded-lg bg-white border border-pink-200 font-bold text-pink-900 focus:outline-none"
                      >
                        <option value="Caveat">Handwriting (Caveat)</option>
                        <option value="Dancing Script">Calligraphy</option>
                        <option value="Playfair Display">Serif Classic</option>
                        <option value="Courier Prime">Typewriter</option>
                        <option value="Quicksand">Rounded Modern</option>
                      </select>

                      <select
                        value={contentFontSize}
                        onChange={(e) => setContentFontSize(e.target.value)}
                        className="px-2 py-1 rounded-lg bg-white border border-pink-200 font-bold text-pink-900 focus:outline-none"
                        title="Body Text Size"
                      >
                        <option value="14px">Small (14px)</option>
                        <option value="16px">Normal (16px)</option>
                        <option value="18px">Medium (18px)</option>
                        <option value="22px">Large (22px)</option>
                        <option value="26px">X-Large (26px)</option>
                      </select>

                      <input
                        type="color"
                        value={contentColor}
                        onChange={(e) => setContentColor(e.target.value)}
                        className="w-6 h-6 rounded-md border border-pink-200 cursor-pointer p-0 bg-transparent"
                        title="Body Color"
                      />
                    </div>
                  </div>
                </div>

                {/* EXPORTABLE JOURNAL NOTE CARD (Target for Download JPG: Captures both outer journal theme & inner paper sheet) */}
                <div
                  ref={pageRef}
                  className={`relative w-full rounded-3xl p-6 sm:p-10 border-4 border-pink-200/80 shadow-2xl transition-all duration-300 ${activeThemeObj.bg} min-h-[560px] cursor-text overflow-hidden`}
                >
                  {/* Notebook Spiral Left Holes Decor */}
                  <div className="absolute left-3 top-0 bottom-0 hidden sm:flex flex-col justify-around py-6 pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner" />
                    ))}
                  </div>

                  {/* INNER PAPER SHEET CONTAINER */}
                  <div
                    ref={innerPaperRef}
                    onClick={() => setSelectedStickerId(null)}
                    className={`p-6 sm:p-8 rounded-2xl border border-pink-200 shadow-inner relative min-h-[440px] overflow-hidden ${activePaperObj.class}`}
                  >
                    {/* Paper Note Top Right Date ONLY */}
                    <div className="flex items-center justify-end border-b border-pink-200/40 pb-2 mb-3">
                      <div className="text-xs font-bold text-pink-800/80 font-['Caveat',cursive] tracking-wider">
                        {activeEntry.date}
                      </div>
                    </div>

                    {/* Multiline Page Title Textarea */}
                    <textarea
                      ref={titleRef}
                      rows={1}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      placeholder="Entry Title..."
                      className="w-full bg-transparent font-bold focus:outline-none mb-3 border-b border-pink-200/40 pb-2 resize-none overflow-hidden leading-tight"
                      style={{ fontFamily: titleFont, color: titleColor, fontSize: titleFontSize }}
                    />

                    {/* Text Content Area */}
                    <textarea
                      ref={contentRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={handleContentKeyDown}
                      rows={12}
                      className="w-full bg-transparent focus:outline-none resize-none leading-relaxed"
                      style={{ fontFamily: contentFont, color: contentColor, fontSize: contentFontSize }}
                    />

                    {/* Paper Bottom Left Bookmark Stamp ONLY */}
                    <div className="mt-4 pt-2 border-t border-pink-200/40 flex items-center justify-between text-xs font-['Caveat',cursive] font-bold text-pink-800/80">
                      <span>dear lily 🌸</span>
                    </div>

                    {/* RENDER DRAGGABLE & ROTATABLE GRAPHIC / EMOJI STICKERS */}
                    {stickers.map((s) => {
                      const isSelected = selectedStickerId === s.id;
                      const scaleFactor = s.scale || 1.2;
                      return (
                        <div
                          key={s.id}
                          onPointerDown={(e) => handleStickerPointerDown(e, s)}
                          onPointerMove={(e) => handleStickerPointerMove(e, s)}
                          onPointerUp={(e) => handleStickerPointerUp(e, s)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStickerId(s.id);
                          }}
                          style={{
                            position: 'absolute',
                            left: `${s.x}px`,
                            top: `${s.y}px`,
                            transform: `scale(${scaleFactor}) rotate(${s.rotation}deg)`,
                            transformOrigin: 'center center',
                            zIndex: isSelected ? 50 : 20,
                            touchAction: 'none',
                          }}
                          className={`group cursor-grab active:cursor-grabbing select-none p-1 rounded-2xl transition-shadow ${
                            isSelected ? 'ring-2 ring-pink-400 ring-dashed bg-pink-100/30 shadow-lg' : ''
                          }`}
                        >
                          {s.stickerType === 'image' && s.imageSrc ? (
                            <img
                              src={s.imageSrc}
                              alt={s.content}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-contain pointer-events-none filter drop-shadow-md"
                            />
                          ) : (
                            <span className="text-4xl sm:text-5xl filter drop-shadow-xs pointer-events-none block p-1">
                              {s.content}
                            </span>
                          )}

                          {/* Floating Control Bar for Selected Sticker */}
                          {isSelected && (
                            <div
                              onPointerDown={(e) => e.stopPropagation()}
                              onPointerUp={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                              className="sticker-control-bar absolute -top-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-pink-300 shadow-xl flex items-center gap-1.5 text-xs font-bold text-pink-900 pointer-events-auto z-50 whitespace-nowrap"
                              style={{ transform: `scale(${1 / Math.max(0.6, scaleFactor)})` }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleScaleSticker(s.id, 0.2);
                                }}
                                className="w-6 h-6 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-800 flex items-center justify-center font-bold text-xs shadow-xs active:scale-90 cursor-pointer"
                                title="Increase size (+)"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleScaleSticker(s.id, -0.2);
                                }}
                                className="w-6 h-6 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-800 flex items-center justify-center font-bold text-xs shadow-xs active:scale-90 cursor-pointer"
                                title="Decrease size (-)"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRotateSticker(s.id);
                                }}
                                className="w-6 h-6 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-800 flex items-center justify-center text-xs shadow-xs active:scale-90 cursor-pointer"
                                title="Rotate 15°"
                              >
                                🔄
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSticker(s.id);
                                }}
                                className="w-6 h-6 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-600 flex items-center justify-center text-xs shadow-xs active:scale-90 cursor-pointer"
                                title="Remove Sticker"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Page Delete Action */}
                <div className="mt-4 pt-2 flex justify-end">
                  <button
                    onClick={() => handleDeleteEntry(activeEntry.id)}
                    className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Diary Page</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="w-full p-12 bg-white rounded-3xl text-center border-4 border-pink-100">
              <span className="text-4xl">📖</span>
              <h3 className="font-['Caveat',cursive] text-3xl font-bold text-pink-800 mt-2">
                No Diary Page Selected
              </h3>
              <p className="text-xs text-pink-600 mt-1">Select an entry from the left list or create a new page.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE CUSTOM FOLDER MODAL */}
      <AnimatePresence>
        {isCreatingFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border-4 border-pink-200 shadow-2xl paper-lined"
            >
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner border border-pink-300">
                <Folder className="w-6 h-6 text-pink-600" />
              </div>

              <h3 className="font-['Caveat',cursive] text-3xl font-bold text-pink-900 text-center mb-1">
                Create Custom Folder 📁
              </h3>
              <p className="text-xs text-pink-600 text-center mb-4 font-medium">
                Create a new folder to organize your private diary chapters.
              </p>

              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-pink-900 mb-1">Folder Name</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g. Paris Trip 🥐"
                    className="w-full px-4 py-2.5 rounded-2xl bg-pink-50/70 border border-pink-200 text-xs text-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-pink-300 font-bold"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-pink-900 mb-1 font-bold">Pick Folder Icon Emoji</label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-pink-50/50 border border-pink-200 justify-center">
                    {['📁', '🌸', '✈️', '💡', '🎨', '💌', '☕', '⭐', '🎀', '🍓', '📚', '🧸', '🥐', '🏋️', '🍳'].map((icon) => (
                      <button
                        type="button"
                        key={icon}
                        onClick={() => setNewFolderIcon(icon)}
                        className={`text-xl p-1 rounded-xl transition-transform ${
                          newFolderIcon === icon ? 'bg-pink-300 scale-125 shadow-xs' : 'hover:scale-110'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Folder</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SET 4-DIGIT PIN LOCK MODAL */}
      <AnimatePresence>
        {isSetPinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border-4 border-pink-200 shadow-2xl paper-lined"
            >
              <button
                onClick={() => setIsSetPinModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-pink-100 text-pink-600"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner border border-pink-300">
                <ShieldCheck className="w-6 h-6 text-pink-600" />
              </div>

              <h3 className="font-['Caveat',cursive] text-3xl font-bold text-pink-900 text-center mb-1">
                Set 4-Digit Security PIN 🔒
              </h3>
              <p className="text-xs text-pink-600 text-center mb-4 font-medium">
                Protect this private diary chapter with a 4-digit secret PIN code.
              </p>

              <form onSubmit={handleSaveNewPin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-pink-900 mb-1">Enter 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinCodeInput}
                    onChange={(e) => setPinCodeInput(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full px-4 py-2.5 rounded-2xl bg-pink-50/70 border border-pink-200 text-center font-mono font-bold text-lg text-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-pink-300 tracking-widest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-pink-900 mb-1">Confirm 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="Re-enter 4-digit PIN"
                    className="w-full px-4 py-2.5 rounded-2xl bg-pink-50/70 border border-pink-200 text-center font-mono font-bold text-lg text-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-pink-300 tracking-widest"
                  />
                </div>

                {pinModalError && (
                  <div className="text-xs font-bold text-rose-500 bg-rose-50 p-2 rounded-xl border border-rose-200 text-center">
                    {pinModalError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Lock Chapter with PIN</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
