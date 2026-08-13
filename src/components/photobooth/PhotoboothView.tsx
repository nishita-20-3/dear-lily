import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import {
  Camera,
  Upload,
  Download,
  Save,
  Sparkles,
  Sliders,
  Palette,
  Frame as FrameIcon,
  Type,
  Smile,
  Layers,
  Trash2,
  RotateCw,
  FlipHorizontal,
  X,
  Plus,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import type { PhotoStrip, StickerItem, TextOverlayItem, UserProfile } from '../../types';
import { StorageService } from '../../services/storage';

interface PhotoboothViewProps {
  user: UserProfile;
  onSaveStrip: (strip: PhotoStrip) => void;
}

export type PhotoShape = 'square' | 'portrait' | 'tall' | 'landscape' | 'rounded';

const PHOTO_SHAPES: { id: PhotoShape; name: string; icon: string; aspectRatio: string; label: string }[] = [
  { id: 'square', name: 'Square (1:1)', icon: '🟩', aspectRatio: '1 / 1', label: 'Classic 1:1 photobooth cuts' },
  { id: 'portrait', name: 'Portrait (3:4)', icon: '📱', aspectRatio: '3 / 4', label: 'Tall 3:4 portrait photo slots' },
  { id: 'tall', name: 'Aesthetic Tall (4:5)', icon: '🖼️', aspectRatio: '4 / 5', label: '4:5 modern aesthetic cut' },
  { id: 'landscape', name: 'Landscape (4:3)', icon: '🎞️', aspectRatio: '4 / 3', label: 'Wide 4:3 movie film cut' },
  { id: 'rounded', name: 'Soft Oval', icon: '🌸', aspectRatio: '1 / 1', label: 'Cute circular coquette cuts' },
];

export interface FrameStyle {
  id: string;
  name: string;
  bgColor: string;
  borderColor: string;
  patternEmoji?: string;
  frameType: 'pattern' | 'film' | 'polaroid' | 'normal';
  textColor?: string;
}

const FRAMES: FrameStyle[] = [
  { id: 'bows', name: 'Coquette Bows 🎀', bgColor: '#FFF0F5', borderColor: '#F48FB1', patternEmoji: '🎀', frameType: 'pattern' },
  { id: 'hearts', name: 'Pink Hearts 💖', bgColor: '#FFF5F7', borderColor: '#F8BBD0', patternEmoji: '💖', frameType: 'pattern' },
  { id: 'flowers', name: 'Floral Garden 🌸', bgColor: '#FFF9FB', borderColor: '#F48FB1', patternEmoji: '🌸', frameType: 'pattern' },
  { id: 'butterflies', name: 'Butterflies 🦋', bgColor: '#F8F0FC', borderColor: '#CE93D8', patternEmoji: '🦋', frameType: 'pattern' },
  { id: 'stars', name: 'Sparkling Stars ⭐', bgColor: '#FFFDF0', borderColor: '#FBC02D', patternEmoji: '⭐', frameType: 'pattern' },
  { id: 'clouds', name: 'Soft Clouds ☁️', bgColor: '#F0FBFC', borderColor: '#81D4FA', patternEmoji: '☁️', frameType: 'pattern' },
  { id: 'polaroid', name: 'Vintage Polaroid 📷', bgColor: '#FAF7F2', borderColor: '#E8E2D5', frameType: 'polaroid' },
  { id: 'film', name: '35mm Film Roll 🎞️', bgColor: '#18181B', borderColor: '#3F3F46', textColor: '#FFFFFF', frameType: 'film' },
  { id: 'kraft', name: 'Kraft Scrapbook 📜', bgColor: '#EFE3C3', borderColor: '#C4A482', frameType: 'normal' },
  { id: 'clean', name: 'Clean White 🤍', bgColor: '#FFFFFF', borderColor: '#E5E7EB', frameType: 'normal' },
];

const FILTERS = [
  { id: 'none', name: 'Normal', style: 'none', swatch: 'from-pink-100 to-purple-100', icon: '✨' },
  { id: 'vintage', name: 'Vintage', style: 'sepia(0.4) contrast(1.1) brightness(0.95) saturate(1.2)', swatch: 'from-amber-100 to-yellow-200', icon: '📜' },
  { id: 'film', name: 'Film', style: 'contrast(1.25) saturate(0.85) hue-rotate(-10deg)', swatch: 'from-[#E2D4C9] to-[#D4C3B5]', icon: '🎞️' },
  { id: 'dreamy', name: 'Dreamy', style: 'saturate(1.4) brightness(1.08) opacity(0.95)', swatch: 'from-pink-200 to-rose-100', icon: '🌸' },
  { id: 'pastel', name: 'Pastel', style: 'brightness(1.1) saturate(1.3) contrast(0.9) hue-rotate(10deg)', swatch: 'from-purple-100 to-pink-100', icon: '🎨' },
  { id: 'polaroid', name: 'Polaroid', style: 'sepia(0.15) contrast(1.2) saturate(1.1) brightness(1.05)', swatch: 'from-orange-100 to-amber-100', icon: '📷' },
  { id: 'disposable', name: 'Disposable', style: 'contrast(1.3) saturate(1.5) hue-rotate(-5deg)', swatch: 'from-teal-100 to-emerald-100', icon: '📸' },
  { id: 'warm', name: 'Warm', style: 'sepia(0.25) saturate(1.4) hue-rotate(-15deg)', swatch: 'from-amber-200 to-orange-200', icon: '☀️' },
  { id: 'cool', name: 'Cool', style: 'hue-rotate(20deg) saturate(1.1) brightness(1.05)', swatch: 'from-sky-100 to-blue-200', icon: '❄️' },
  { id: 'bw', name: 'B & W', style: 'grayscale(1) contrast(1.2)', swatch: 'from-neutral-200 to-neutral-400', icon: '🖤' },
  { id: 'sepia', name: 'Sepia', style: 'sepia(0.8) contrast(1.1)', swatch: 'from-yellow-200 to-amber-300', icon: '☕' },
  { id: 'y2k', name: 'Y2K Glow', style: 'contrast(1.2) saturate(1.8) hue-rotate(45deg)', swatch: 'from-fuchsia-200 to-pink-300', icon: '💖' },
  { id: 'soft-glow', name: 'Soft Glow', style: 'brightness(1.15) contrast(0.95) saturate(1.1)', swatch: 'from-rose-100 to-pink-200', icon: '🌷' },
  { id: 'golden-hour', name: 'Golden Hour', style: 'sepia(0.35) saturate(1.6) brightness(1.05)', swatch: 'from-amber-300 to-rose-300', icon: '🌅' },
  { id: 'matte', name: 'Matte Retro', style: 'contrast(0.9) brightness(1.1) saturate(0.9)', swatch: 'from-stone-200 to-amber-100', icon: '🧸' },
];

const STICKER_LIST = [
  '🌸', '🎀', '🐱', '🐰', '☕', '📚', '🦋', '🍓', '⭐', '☁️', '💖', '🌿', '🎵', '🌷', '✨', '🤍', '🍰', '🧸', '🍦', '🍒'
];

const FONTS = [
  { id: 'Caveat', name: 'Handwriting (Caveat)' },
  { id: 'Playfair Display', name: 'Elegant Serif' },
  { id: 'Dancing Script', name: 'Calligraphy' },
  { id: 'Sacramento', name: 'Cute Script' },
  { id: 'Courier Prime', name: 'Typewriter' },
  { id: 'Quicksand', name: 'Cute Rounded' },
];

export const PhotoboothView: React.FC<PhotoboothViewProps> = ({ user, onSaveStrip }) => {
  const [layout, setLayout] = useState<'3-strip' | '4-strip'>('3-strip');
  const [photoShape, setPhotoShape] = useState<PhotoShape>('square');
  const [photos, setPhotos] = useState<string[]>([]);

  const [selectedFilter, setSelectedFilter] = useState('dreamy');
  const [selectedFrame, setSelectedFrame] = useState('bows');
  const [title, setTitle] = useState('Dear Lily Memories 🌸');

  // Photo Edit Sliders
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isMirrored, setIsMirrored] = useState(false);

  // Drag Overlay Elements
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlayItem[]>([]);

  // Webcam & Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showCurtains, setShowCurtains] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashEffect, setFlashEffect] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);

  // Active Tool Panel Tab
  const [activeTab, setActiveTab] = useState<'frames' | 'shape' | 'filters' | 'stickers' | 'text' | 'adjust'>('frames');

  // Text Editor State
  const [newText, setNewText] = useState('');
  const [newTextFont, setNewTextFont] = useState('Caveat');
  const [newTextColor, setNewTextColor] = useState('#E91E63');

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);

  const maxPhotosNeeded = layout === '3-strip' ? 3 : 4;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const triggerCurtainsReveal = () => {
    setShowCurtains(true);
    setTimeout(() => setShowCurtains(false), 3400);
  };

  // Start Webcam Stream (Mobile & Desktop Resilient)
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('Camera API not available. Please use Upload Photos or HTTPS! 📷');
        return;
      }

      let stream: MediaStream | null = null;
      try {
        // Mobile-friendly front camera constraint with ideal dimensions
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
      } catch {
        try {
          // Fallback: Any available video stream
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (err2) {
          console.error('Camera fallback error:', err2);
        }
      }

      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play warning:', playErr);
        }
        setIsCameraActive(true);
        triggerCurtainsReveal();
      } else {
        showToast('Could not access camera. Please check permissions or use Upload Photos! 📷');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      showToast('Camera permission error. You can also Upload Photos! 📷');
    }
  };

  // Stop Webcam Stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const isSavingRef = useRef(false);
  const currentStripIdRef = useRef<string | null>(null);

  // Helper function to compress images to small JPEG data URLs (~25-40KB) preventing localStorage quota errors
  const compressImageDataUrl = (dataUrl: string, maxDim = 500, quality = 0.8): Promise<string> => {
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

  // Save Strip Helper
  const handleSaveWithPhotos = async (customPhotos?: string[]) => {
    if (isSavingRef.current) return;
    const savePhotos = customPhotos || photos;
    if (savePhotos.length === 0) {
      showToast('Please snap or upload photos for your strip! 📸');
      return;
    }
    isSavingRef.current = true;
    showToast('Saving to Memory Gallery... 🎀');

    try {
      // Compress photos before saving
      const compressedPhotos = await Promise.all(
        savePhotos.slice(0, maxPhotosNeeded).map((p) => compressImageDataUrl(p, 450, 0.75))
      );

      // Reuse active session strip ID if present to update in-place, or generate a new ID
      const stripId = currentStripIdRef.current || ('strip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
      currentStripIdRef.current = stripId;

      const newStrip: PhotoStrip = {
        id: stripId,
        userId: user.id || '',
        userEmail: user.email ? user.email.trim().toLowerCase() : '',
        createdAt: new Date().toISOString().split('T')[0],
        title: title || 'Dear Lily Memories 🌸',
        layout,
        photos: compressedPhotos,
        filter: selectedFilter,
        frame: selectedFrame,
        paperBg: 'floral',
        stickers,
        textOverlays,
      };
      
      // Save to StorageService immediately so gallery loads it instantly
      const targetUserId = user.id || '';
      const currentStrips = StorageService.getPhotoStrips(targetUserId);
      const updatedStrips = [newStrip, ...currentStrips.filter((s) => s.id !== newStrip.id)];
      StorageService.savePhotoStrips(updatedStrips, targetUserId);

      if (onSaveStrip) {
        onSaveStrip(newStrip);
      }
      showToast('Saved to your Memory Gallery! 🎀');
    } catch (err) {
      console.error('Error saving photo strip:', err);
      showToast('Error saving strip to gallery.');
    } finally {
      setTimeout(() => {
        isSavingRef.current = false;
      }, 500);
    }
  };

  const handleSave = () => handleSaveWithPhotos();

  // Snap Photo from Webcam with countdown
  const capturePhotoSequence = () => {
    if (!isCameraActive) {
      startCamera();
      return;
    }

    if (photos.length >= maxPhotosNeeded) {
      showToast(`Strip is full (${maxPhotosNeeded}/${maxPhotosNeeded}). Remove a photo slot to snap more! 📸`);
      return;
    }

    let count = 3;
    setCountdown(count);

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timer);
        setCountdown(null);
        setFlashEffect(true);
        setTimeout(() => setFlashEffect(false), 300);

        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;

          const vW = video.videoWidth > 0 ? video.videoWidth : 640;
          const vH = video.videoHeight > 0 ? video.videoHeight : 480;
          canvas.width = vW;
          canvas.height = vH;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, vW, vH);
            if (isMirrored) {
              ctx.translate(vW, 0);
              ctx.scale(-1, 1);
            }
            ctx.drawImage(video, 0, 0, vW, vH);

            const dataUrl = canvas.toDataURL('image/png', 0.95);

            setPhotos((prev) => {
              const updated = [...prev, dataUrl].slice(0, maxPhotosNeeded);
              if (updated.length >= maxPhotosNeeded) {
                stopCamera();
                handleSaveWithPhotos(updated);
              } else {
                showToast(`Snapped photo ${updated.length}/${maxPhotosNeeded}! 🌸`);
              }
              return updated;
            });
          }
        }
      }
    }, 1000);
  };

  // Photo Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (isCameraActive) stopCamera();

    const fileList = Array.from(files);
    let loadedCount = 0;
    const newPhotosList: string[] = new Array(fileList.length);

    fileList.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPhotosList[index] = event.target.result as string;
          loadedCount++;
          if (loadedCount === fileList.length) {
            const validPhotos = newPhotosList.filter(Boolean);
            setPhotos((prev) => {
              const updated = [...prev, ...validPhotos].slice(0, maxPhotosNeeded);
              if (updated.length >= maxPhotosNeeded) {
                handleSaveWithPhotos(updated);
              } else {
                showToast(`Added ${validPhotos.length} photo(s) to strip! 🌸`);
              }
              return updated;
            });
          }
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Add Sample Aesthetic Photo for quick 1-click test
  const addSamplePhoto = () => {
    if (photos.length >= maxPhotosNeeded) {
      showToast(`Strip is full (${maxPhotosNeeded}/${maxPhotosNeeded}). Remove a photo slot first! 📸`);
      return;
    }
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 400;
    sampleCanvas.height = 400;
    const ctx = sampleCanvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 400, 400);
      gradient.addColorStop(0, '#FFD1DC');
      gradient.addColorStop(0.5, '#FFB7B2');
      gradient.addColorStop(1, '#E2F0CB');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 400);

      ctx.fillStyle = '#C2185B';
      ctx.font = 'bold 36px "Caveat", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Dear Lily Photo #${photos.length + 1} 🌸`, 200, 190);
      ctx.fillText('✨ Pure Cute Memories ✨', 200, 240);

      const sampleUrl = sampleCanvas.toDataURL('image/png');
      setPhotos((prev) => {
        const updated = [...prev, sampleUrl].slice(0, maxPhotosNeeded);
        if (updated.length >= maxPhotosNeeded) {
          handleSaveWithPhotos(updated);
        } else {
          showToast(`Added Photo #${updated.length}! 🌸`);
        }
        return updated;
      });
    }
  };

  // Delete individual photo slot
  const removePhotoAt = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    showToast(`Removed photo ${index + 1} 🗑️`);
  };

  // Add Sticker
  const addSticker = (emoji: string) => {
    const newSticker: StickerItem = {
      id: 'st_' + Date.now(),
      content: emoji,
      x: 35 + (Math.random() - 0.5) * 30,
      y: 35 + (Math.random() - 0.5) * 30,
      scale: 1.2,
      rotation: (Math.random() - 0.5) * 30,
    };
    setStickers((prev) => [...prev, newSticker]);
    showToast(`Added ${emoji} sticker ✨`);
  };

  // Add Custom Text Overlay
  const addTextOverlay = () => {
    if (!newText.trim()) return;
    const txtItem: TextOverlayItem = {
      id: 'txt_' + Date.now(),
      text: newText,
      x: 50,
      y: 40 + Math.random() * 20,
      font: newTextFont,
      color: newTextColor,
      size: 20,
      curved: false,
      shadow: true,
    };
    setTextOverlays((prev) => [...prev, txtItem]);
    setNewText('');
    showToast('Added text overlay! ✨');
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays((prev) => prev.filter((t) => t.id !== id));
    showToast('Removed text overlay 🗑️');
  };

  // Helper for reliable Blob download into PC
  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  // Direct PNG Exporter using html-to-image (preserves background colors & decorative borders)
  const handleDownloadFullStripPNG = async () => {
    if (!stripRef.current) return;
    showToast('Exporting high-res photo strip... 📸');

    // Auto-save strip to Memory Gallery if photos exist
    if (photos.length > 0) {
      await handleSaveWithPhotos();
    }

    try {
      const dataUrl = await toPng(stripRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        quality: 1.0,
        style: {
          maxHeight: 'none',
          height: 'auto',
          overflow: 'visible',
        },
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const filename = `DearLily_${layout}_Strip_${Date.now()}.png`;
      triggerBlobDownload(blob, filename);
      showToast('Downloaded PNG & Saved to Memory Gallery! 💖');
    } catch (err) {
      console.error('PNG export failed:', err);
      showToast('Download failed. Trying fallback...');
    }
  };

  const getCombinedFilterStyle = () => {
    const activeFilterObj = FILTERS.find((f) => f.id === selectedFilter);
    const baseStyle = activeFilterObj ? activeFilterObj.style : 'none';
    const sliderFilters = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    return baseStyle === 'none' ? sliderFilters : `${baseStyle} ${sliderFilters}`;
  };

  const getStripMaxWidthClass = (shape: PhotoShape) => {
    switch (shape) {
      case 'portrait':
      case 'tall':
        return 'max-w-[255px]';
      case 'landscape':
        return 'max-w-[260px]';
      case 'rounded':
        return 'max-w-[230px]';
      case 'square':
      default:
        return 'max-w-[225px]';
    }
  };

  const currentShapeObj = PHOTO_SHAPES.find((s) => s.id === photoShape) || PHOTO_SHAPES[0];
  const activeFrame = FRAMES.find((f) => f.id === selectedFrame) || FRAMES[0];

  return (
    <div className="h-[calc(100vh-4.25rem)] max-h-screen flex flex-col bg-[#FFF9FA] overflow-hidden px-3 py-2 select-none">
      {/* Toast Alert */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2 rounded-full bg-pink-600 text-white text-xs font-bold shadow-xl flex items-center gap-2 pointer-events-none"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toast}</span>
        </motion.div>
      )}

      {/* TOP SINGLE-LINE CONTROL HEADER */}
      <div className="flex-none flex flex-wrap items-center justify-between bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2 border border-pink-200 shadow-xs mb-2 gap-2">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center text-base shadow-xs">
            🌸
          </div>
          <div>
            <h1 className="font-['Playfair_Display',serif] text-base sm:text-lg font-bold text-pink-900 leading-none">
              Dear Lily Photo Studio
            </h1>
            <p className="text-[10px] text-pink-600 font-medium">
              Aesthetic Photo Booth • Single-screen studio dashboard
            </p>
          </div>
        </div>

        {/* Layout & Frame Aspect Ratio Switcher */}
        <div className="flex items-center gap-2">
          {/* Strip Mode */}
          <div className="flex items-center bg-pink-50 p-1 rounded-xl border border-pink-200">
            <button
              onClick={() => {
                setLayout('3-strip');
                currentStripIdRef.current = null;
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                layout === '3-strip' ? 'bg-pink-500 text-white shadow-xs' : 'text-pink-700 hover:bg-pink-100'
              }`}
            >
              3-Photo Strip
            </button>
            <button
              onClick={() => {
                setLayout('4-strip');
                currentStripIdRef.current = null;
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                layout === '4-strip' ? 'bg-pink-500 text-white shadow-xs' : 'text-pink-700 hover:bg-pink-100'
              }`}
            >
              4-Photo Strip
            </button>
          </div>

          {/* Quick Photo Shape Selector */}
          <div className="hidden md:flex items-center bg-pink-50 p-1 rounded-xl border border-pink-200">
            {PHOTO_SHAPES.map((shape) => (
              <button
                key={shape.id}
                onClick={() => {
                  setPhotoShape(shape.id);
                  showToast(`Frame shape: ${shape.name}`);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  photoShape === shape.id ? 'bg-pink-500 text-white shadow-xs' : 'text-pink-700 hover:bg-pink-100'
                }`}
                title={shape.name}
              >
                <span>{shape.icon}</span>
                <span className="text-[10px] hidden lg:inline">{shape.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-pink-100 text-pink-900 border border-pink-200">
            {photos.length}/{maxPhotosNeeded} Photos
          </span>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          {photos.length > 0 && (
            <button
              onClick={() => {
                setPhotos([]);
                currentStripIdRef.current = null;
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-all"
              title="Clear all photos"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
          <button
            onClick={handleDownloadFullStripPNG}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>

      {/* MAIN SINGLE-SCREEN WORKSPACE GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* COLUMN 1: CAMERA & PHOTO SLOTS (Left - 4 Cols) */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-0 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-pink-200 p-3 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="flex-none flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-pink-500" />
              <span>Camera & Snapped Photos</span>
            </span>
            <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
              Step 1
            </span>
          </div>

          {/* Camera Viewport Box */}
          <div className="flex-none relative w-full aspect-video rounded-xl bg-pink-950/90 border border-pink-200 overflow-hidden flex flex-col items-center justify-center shadow-inner mb-2">
            {flashEffect && <div className="absolute inset-0 z-40 bg-white animate-ping" />}

            {/* CURTAIN REVEAL ANIMATION OVERLAY (SLOW PLAIN WHITE WAVY CURTAINS) */}
            <AnimatePresence>
              {showCurtains && (
                <motion.div
                  key="curtains"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 2.7 }}
                  className="absolute inset-0 z-30 pointer-events-none flex overflow-hidden"
                >
                  {/* Top Scalloped Plain White Valance Header */}
                  <div className="absolute top-0 inset-x-0 h-5 bg-gradient-to-b from-slate-200 via-slate-100 to-transparent border-b border-slate-300 z-40 flex items-center justify-around shadow-sm">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-8 h-4 rounded-b-full bg-white border-b border-slate-200 shadow-xs" />
                    ))}
                  </div>

                  {/* Left Plain White Wavy Curtain */}
                  <motion.div
                    initial={{ x: '0%', skewY: 0 }}
                    animate={{ x: '-105%', skewY: [0, -3, 1, 0] }}
                    transition={{ duration: 2.8, ease: [0.25, 1, 0.5, 1] }}
                    className="w-1/2 h-full border-r-4 border-slate-200 shadow-xl relative flex flex-col justify-between p-2 overflow-hidden"
                    style={{
                      backgroundColor: '#FFFFFF',
                      backgroundImage: `
                        repeating-linear-gradient(
                          90deg,
                          #FFFFFF 0px,
                          #FAFAFA 10px,
                          #F0F0F0 20px,
                          #FFFFFF 30px,
                          #F5F5F5 40px,
                          #FFFFFF 50px
                        )
                      `,
                      boxShadow: 'inset -15px 0 25px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <div className="w-full h-2.5 bg-slate-200/90 rounded-full shadow-inner mt-4" />
                    <div className="text-2xl self-end filter drop-shadow-sm animate-bounce">🤍</div>
                  </motion.div>

                  {/* Right Plain White Wavy Curtain */}
                  <motion.div
                    initial={{ x: '0%', skewY: 0 }}
                    animate={{ x: '105%', skewY: [0, 3, -1, 0] }}
                    transition={{ duration: 2.8, ease: [0.25, 1, 0.5, 1] }}
                    className="w-1/2 h-full border-l-4 border-slate-200 shadow-xl relative flex flex-col justify-between p-2 overflow-hidden"
                    style={{
                      backgroundColor: '#FFFFFF',
                      backgroundImage: `
                        repeating-linear-gradient(
                          90deg,
                          #FFFFFF 0px,
                          #F5F5F5 10px,
                          #F0F0F0 20px,
                          #FFFFFF 30px,
                          #FAFAFA 40px,
                          #FFFFFF 50px
                        )
                      `,
                      boxShadow: 'inset 15px 0 25px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <div className="w-full h-2.5 bg-slate-200/90 rounded-full shadow-inner mt-4" />
                    <div className="text-2xl self-start filter drop-shadow-sm animate-bounce">🤍</div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {countdown !== null && (
              <div className="absolute inset-0 z-30 bg-pink-900/60 backdrop-blur-xs flex items-center justify-center">
                <span className="font-['Caveat',cursive] text-6xl font-bold text-white drop-shadow-lg animate-bounce">
                  {countdown}
                </span>
              </div>
            )}

            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''} ${!isCameraActive ? 'hidden' : ''}`}
              style={{ filter: getCombinedFilterStyle() }}
              autoPlay
              playsInline
              muted
            />

            {!isCameraActive && (
              <div className="p-3 text-center">
                <div className="w-10 h-10 rounded-full bg-pink-100/90 text-pink-600 flex items-center justify-center text-xl mx-auto mb-1.5 shadow-inner">
                  🎀
                </div>
                <p className="text-xs font-bold text-pink-200">Camera Lens Ready</p>
                <p className="text-[10px] text-pink-300/80 mt-0.5">Start webcam, upload, or click Sample</p>
              </div>
            )}
          </div>

          {/* Hidden Canvas for Snapshots */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Action Buttons */}
          <div className="flex-none flex flex-wrap items-center gap-1.5 mb-2">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="flex-1 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Start Webcam</span>
              </button>
            ) : (
              <>
                <button
                  onClick={capturePhotoSequence}
                  className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snap Photo (3s)</span>
                </button>

                <button
                  onClick={stopCamera}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold transition-all"
                  title="Turn off camera"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Mobile Native Camera Capture */}
            <label className="px-2.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-all">
              <Camera className="w-3.5 h-3.5 text-purple-600" />
              <span>📱 Take Selfie</span>
              <input type="file" accept="image/*" capture="user" onChange={handleFileUpload} className="hidden" />
            </label>

            <label className="px-2.5 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-800 text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-pink-600" />
              <span>Upload</span>
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={addSamplePhoto}
              className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold shadow-xs flex items-center gap-1 transition-all"
              title="Add sample photo to test strip"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Sample</span>
            </button>

            {isCameraActive && (
              <button
                onClick={() => setIsMirrored(!isMirrored)}
                className={`p-1.5 rounded-xl text-xs font-bold transition-colors ${
                  isMirrored ? 'bg-pink-300 text-pink-900' : 'bg-pink-100 text-pink-700'
                }`}
                title="Mirror Camera"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Snapped Photos Tray */}
          <div className="flex-1 min-h-0 flex flex-col">
            <span className="text-[11px] font-bold text-pink-900 mb-1 flex items-center justify-between">
              <span>Photo Tray ({photos.length}/{maxPhotosNeeded})</span>
              <span className="text-[10px] text-pink-600 font-normal">Click trash to remove</span>
            </span>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2.5 auto-rows-max content-start pr-1">
              {Array.from({ length: maxPhotosNeeded }).map((_, idx) => {
                const photoSrc = photos[idx];
                return (
                  <div
                    key={idx}
                    className="relative w-full min-h-[85px] border-2 border-dashed border-pink-300 bg-pink-50/70 overflow-hidden flex flex-col items-center justify-center p-1 group shadow-xs rounded-xl transition-all"
                    style={{ aspectRatio: currentShapeObj.aspectRatio }}
                  >
                    {photoSrc ? (
                      <>
                        <img
                          src={photoSrc}
                          alt={`Slot ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                          style={{
                            filter: getCombinedFilterStyle(),
                            transform: `rotate(${rotation}deg)`,
                            borderRadius: photoShape === 'rounded' ? '9999px' : '8px',
                          }}
                        />
                        <button
                          onClick={() => removePhotoAt(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 group-hover:opacity-100 shadow-md hover:scale-110 transition-transform z-10"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white rounded text-[9px] font-bold z-10">
                          #{idx + 1}
                        </span>
                      </>
                    ) : (
                      <div className="text-center p-1">
                        <Plus className="w-4 h-4 text-pink-400 mx-auto mb-0.5" />
                        <span className="text-[10px] font-bold text-pink-500 block">Slot {idx + 1}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMN 2: STUDIO CUSTOMIZATION TOOLBOX (Center - 4 Cols) */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-0 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-pink-200 p-3 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="flex-none flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-pink-500" />
              <span>Customization Studio</span>
            </span>
            <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
              Step 2
            </span>
          </div>

          {/* Tool Navigation Tabs */}
          <div className="flex-none flex items-center gap-1 overflow-x-auto pb-1 mb-2 scrollbar-none border-b border-pink-100">
            {[
              { id: 'frames', label: 'Borders', icon: FrameIcon },
              { id: 'shape', label: 'Frame Shape', icon: Layers },
              { id: 'filters', label: 'Filters', icon: Palette },
              { id: 'stickers', label: 'Stickers', icon: Smile },
              { id: 'text', label: 'Text', icon: Type },
              { id: 'adjust', label: 'Adjust', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                    isSel
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Tab Content Container */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {/* TAB: FRAME BORDERS */}
            {activeTab === 'frames' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-pink-900">Choose Decorative Frame Border</label>
                <div className="grid grid-cols-2 gap-2">
                  {FRAMES.map((fr) => {
                    const isSel = selectedFrame === fr.id;
                    return (
                      <button
                        key={fr.id}
                        onClick={() => {
                          setSelectedFrame(fr.id);
                          showToast(`Applied ${fr.name} 🎀`);
                        }}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                          isSel
                            ? 'border-pink-500 font-bold shadow-xs scale-[1.02]'
                            : 'border-pink-100 hover:bg-pink-50/60'
                        }`}
                        style={{ backgroundColor: fr.bgColor, color: fr.textColor || '#881337' }}
                      >
                        <div className="text-xs font-bold flex items-center justify-between">
                          <span>{fr.name}</span>
                          {isSel && <Check className="w-3.5 h-3.5 text-pink-600" />}
                        </div>
                        {fr.patternEmoji && (
                          <div className="text-[10px] mt-1 opacity-80">
                            Pattern: {fr.patternEmoji} {fr.patternEmoji} {fr.patternEmoji}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: FRAME ASPECT RATIO / SHAPE */}
            {activeTab === 'shape' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-pink-900 mb-1">Choose Photo Frame Shape / Ratio</label>
                  <p className="text-[10px] text-pink-600 mb-2">Change the aspect ratio of photos inside the strip</p>
                  <div className="grid grid-cols-1 gap-2">
                    {PHOTO_SHAPES.map((shape) => {
                      const isSel = photoShape === shape.id;
                      return (
                        <button
                          key={shape.id}
                          onClick={() => {
                            setPhotoShape(shape.id);
                            showToast(`Frame shape: ${shape.name}`);
                          }}
                          className={`p-3 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                            isSel
                              ? 'border-pink-500 bg-pink-50 text-pink-900 font-bold shadow-xs'
                              : 'border-pink-100 bg-white text-pink-700 hover:bg-pink-50/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{shape.icon}</span>
                            <div>
                              <div className="text-xs font-bold">{shape.name}</div>
                              <span className="text-[10px] text-pink-600 font-normal">{shape.label}</span>
                            </div>
                          </div>
                          {isSel && <span className="text-pink-600 font-bold text-xs">Active ✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-pink-100">
                  <label className="block text-[11px] font-bold text-pink-900 mb-1">Strip Title Stamp</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-pink-50/60 border border-pink-200 text-xs text-pink-900 focus:outline-none focus:ring-1 focus:ring-pink-400 font-['Caveat',cursive] text-lg font-bold"
                  />
                </div>
              </div>
            )}

            {/* TAB: FILTERS */}
            {activeTab === 'filters' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-pink-900">Choose Aesthetic Filter</label>
                <div className="grid grid-cols-3 gap-2">
                  {FILTERS.map((f) => {
                    const isSel = selectedFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          setSelectedFilter(f.id);
                          showToast(`Applied ${f.name} filter ✨`);
                        }}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          isSel
                            ? 'border-pink-500 bg-pink-100 text-pink-900 font-bold shadow-xs'
                            : 'border-pink-100 bg-white text-pink-700 hover:bg-pink-50'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${f.swatch} mx-auto mb-1 flex items-center justify-center text-base shadow-xs border border-pink-200/60`}
                          style={{ filter: f.style }}
                        >
                          {f.icon}
                        </div>
                        <span className="text-[10px] font-bold block truncate">{f.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: STICKERS */}
            {activeTab === 'stickers' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-pink-900">Click to Add Draggable Stickers onto Strip</label>
                <div className="grid grid-cols-5 gap-1.5 p-2 bg-pink-50/50 rounded-xl border border-pink-100">
                  {STICKER_LIST.map((st, idx) => (
                    <button
                      key={idx}
                      onClick={() => addSticker(st)}
                      className="p-2 rounded-lg bg-white hover:bg-pink-100 hover:scale-125 text-xl text-center shadow-xs transition-transform"
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {stickers.length > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-pink-100">
                    <span className="text-[11px] text-pink-700 font-medium">Stickers added: {stickers.length}</span>
                    <button
                      onClick={() => {
                        setStickers([]);
                        showToast('Cleared stickers');
                      }}
                      className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: TEXT */}
            {activeTab === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-pink-900 mb-1">Text Overlay</label>
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="e.g. Sweet Memories 🌸"
                    className="w-full px-3 py-1.5 rounded-xl bg-pink-50/60 border border-pink-200 text-xs text-pink-900 focus:outline-none focus:ring-1 focus:ring-pink-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-pink-800 mb-0.5">Font</label>
                    <select
                      value={newTextFont}
                      onChange={(e) => setNewTextFont(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl bg-white border border-pink-200 text-xs text-pink-900"
                    >
                      {FONTS.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-pink-800 mb-0.5">Color</label>
                    <input
                      type="color"
                      value={newTextColor}
                      onChange={(e) => setNewTextColor(e.target.value)}
                      className="w-full h-8 rounded-xl border border-pink-200 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={addTextOverlay}
                  className="w-full py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1"
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Place Text on Strip</span>
                </button>

                {textOverlays.length > 0 && (
                  <div className="pt-2 border-t border-pink-100 space-y-1">
                    {textOverlays.map((txt) => (
                      <div
                        key={txt.id}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-pink-50 border border-pink-100 text-xs text-pink-900"
                      >
                        <span className="truncate max-w-[150px] font-semibold">{txt.text}</span>
                        <button
                          onClick={() => removeTextOverlay(txt.id)}
                          className="p-0.5 text-rose-500 hover:bg-rose-100 rounded-full"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: ADJUSTMENTS */}
            {activeTab === 'adjust' && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-pink-900 mb-1">
                    <span>Brightness</span>
                    <span>{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-pink-900 mb-1">
                    <span>Contrast</span>
                    <span>{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-pink-900 mb-1">
                    <span>Saturation</span>
                    <span>{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="flex-1 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-800 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Rotate 90°</span>
                  </button>

                  <button
                    onClick={() => {
                      setBrightness(100);
                      setContrast(100);
                      setSaturation(100);
                      setRotation(0);
                      showToast('Reset photo adjustments');
                    }}
                    className="py-1.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-bold"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: LIVE PHOTO STRIP PREVIEW & INSTANT DOWNLOAD (Right - 4 Cols) */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-0 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-pink-200 p-3 shadow-sm overflow-hidden items-center justify-between">
          {/* Header */}
          <div className="flex-none w-full flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-pink-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>LIVE PHOTO STRIP PREVIEW</span>
            </span>
            <span className="text-[10px] font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
              {layout.toUpperCase()} ({currentShapeObj.name.split(' ')[0]})
            </span>
          </div>

          {/* Scaled Vertical Strip Container (Guarantees top header/tape is NEVER cut off) */}
          <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-start pt-2 pb-4 px-1 overflow-y-auto scrollbar-thin">
            <div
              ref={stripRef}
              className={`relative w-full ${getStripMaxWidthClass(photoShape)} p-3.5 rounded-2xl transition-all duration-300 shadow-xl flex flex-col items-center justify-between my-auto`}
              style={{
                backgroundColor: activeFrame.bgColor,
                border: `4px solid ${activeFrame.borderColor}`,
                color: activeFrame.textColor || '#881337',
              }}
            >
              {/* Pattern Frame Border Decorator */}
              {activeFrame.patternEmoji && (
                <div className="w-full flex items-center justify-between text-[11px] px-1 mb-1.5 opacity-90 select-none">
                  <span>{activeFrame.patternEmoji}</span>
                  <span>{activeFrame.patternEmoji}</span>
                  <span>{activeFrame.patternEmoji}</span>
                  <span>{activeFrame.patternEmoji}</span>
                  <span>{activeFrame.patternEmoji}</span>
                </div>
              )}

              {/* 35mm Film Roll Sprocket Holes Header */}
              {activeFrame.frameType === 'film' && (
                <div className="w-full flex items-center justify-between text-[8px] tracking-widest text-amber-400 font-mono mb-1.5 border-b border-zinc-700 pb-0.5">
                  <span>░ ░ ░ ░</span>
                  <span>KODAK 400</span>
                  <span>░ ░ ░ ░</span>
                </div>
              )}

              {/* Top Washi Decor (For normal & pattern frames) */}
              {activeFrame.frameType !== 'film' && activeFrame.frameType !== 'polaroid' && (
                <div className="flex-none mx-auto w-24 h-4 shadow-xs washi-tape-pink transform rotate-1 rounded-xs flex items-center justify-center text-[8px] font-bold text-pink-800 mb-1.5">
                  DEAR LILY 🌸
                </div>
              )}

              {/* Strip Header Title */}
              <div className="flex-none text-center my-0.5">
                <h3 className="font-['Caveat',cursive] text-lg font-bold leading-none truncate max-w-[200px]">
                  {title}
                </h3>
                <span className="text-[8px] opacity-80 font-semibold uppercase tracking-wider block mt-0.5">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Photos Stack */}
              <div className="w-full flex flex-col items-center gap-2 my-2">
                {Array.from({ length: maxPhotosNeeded }).map((_, idx) => {
                  const imgUrl = photos[idx];
                  return (
                    <div
                      key={idx}
                      className="relative w-full overflow-hidden border-2 border-white/90 shadow-xs bg-pink-50/80 flex items-center justify-center shrink-0 transition-all"
                      style={{
                        aspectRatio: currentShapeObj.aspectRatio,
                        borderRadius: photoShape === 'rounded' ? '9999px' : '10px',
                      }}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={`Snap ${idx + 1}`}
                          className="w-full h-full object-cover"
                          style={{
                            filter: getCombinedFilterStyle(),
                            transform: `rotate(${rotation}deg)`,
                          }}
                        />
                      ) : (
                        <div className="text-center p-2">
                          <span className="text-sm opacity-50 block">📸</span>
                          <span className="text-[9px] font-bold text-pink-400">Photo {idx + 1} Empty</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Draggable Stickers Layer */}
              {stickers.map((st) => (
                <motion.div
                  key={st.id}
                  drag
                  dragConstraints={stripRef}
                  className="absolute z-20 cursor-move text-xl select-none filter drop-shadow-xs"
                  style={{
                    left: `${st.x}%`,
                    top: `${st.y}%`,
                    transform: `scale(${st.scale}) rotate(${st.rotation}deg)`,
                  }}
                >
                  {st.content}
                </motion.div>
              ))}

              {/* Text Overlays Layer */}
              {textOverlays.map((txt) => (
                <motion.div
                  key={txt.id}
                  drag
                  dragConstraints={stripRef}
                  className="absolute z-20 cursor-move select-none text-center group flex items-center gap-1"
                  style={{
                    left: `${txt.x}%`,
                    top: `${txt.y}%`,
                    fontFamily: txt.font,
                    color: txt.color,
                    fontSize: `${txt.size * 0.75}px`,
                    textShadow: txt.shadow ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  <span>{txt.text}</span>
                  <button
                    onClick={() => removeTextOverlay(txt.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-rose-500 text-white rounded-full p-0.5"
                    title="Remove Text"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </motion.div>
              ))}

              {/* 35mm Film Roll Sprocket Holes Footer */}
              {activeFrame.frameType === 'film' ? (
                <div className="w-full flex items-center justify-between text-[8px] tracking-widest text-amber-400 font-mono mt-1 border-t border-zinc-700 pt-0.5">
                  <span>░ ░ ░ ░</span>
                  <span>{layout.toUpperCase()}</span>
                  <span>░ ░ ░ ░</span>
                </div>
              ) : (
                /* Footer Stamp */
                <div className="flex-none text-center text-[8px] font-['Caveat',cursive] font-bold opacity-90 mt-1">
                  dear lily photo booth 🎀
                </div>
              )}

              {/* Pattern Frame Bottom Decorator */}
              {activeFrame.patternEmoji && (
                <div className="w-full flex items-center justify-between text-[11px] px-1 mt-1 opacity-90 select-none">
                  <span>{activeFrame.patternEmoji}</span>
                  <span>{activeFrame.patternEmoji}</span>
                  <span>{activeFrame.patternEmoji}</span>
                  <span>{activeFrame.patternEmoji}</span>
                  <span>{activeFrame.patternEmoji}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Direct Action Bar */}
          <div className="flex-none w-full grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={handleSave}
              className="py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            <button
              onClick={handleDownloadFullStripPNG}
              className="py-2 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-amber-200" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
