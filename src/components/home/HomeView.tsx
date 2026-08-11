import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, BookOpen, Sparkles, Heart, ArrowRight, Wand2 } from 'lucide-react';
import type { NavTab } from '../layout/Navbar';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [activeFeature, setActiveFeature] = useState<'photobooth' | 'diary' | 'scrapbook'>('photobooth');

  return (
    <div className="relative w-full overflow-hidden pb-16">
      
      {/* Floating Parallax Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Floating Petal/Flower 1 */}
        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-12 left-6 text-4xl opacity-70 filter drop-shadow-md"
        >
          🌸
        </motion.div>

        {/* Floating Butterfly 2 */}
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, 15, 0], rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/4 right-10 text-4xl opacity-80"
        >
          🦋
        </motion.div>

        {/* Ribbon Bow 3 */}
        <motion.div
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="absolute top-1/2 left-10 text-3xl opacity-75"
        >
          🎀
        </motion.div>

        {/* Sparkle Star 4 */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute bottom-1/3 right-1/4 text-3xl text-amber-300"
        >
          ✨
        </motion.div>

        {/* Cat Doodle 5 */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute bottom-16 left-1/4 text-3xl opacity-80"
        >
          🐱
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-8 sm:pt-14 text-center">
        
        {/* Pill Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/90 border border-pink-200 text-pink-700 text-xs font-bold shadow-sm mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Your Dreamy Interactive Digital Scrapbook</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-['Playfair_Display',serif] text-4xl sm:text-6xl md:text-7xl font-bold text-[#4A323B] leading-tight tracking-tight max-w-4xl mx-auto"
        >
          Capture Moments in Soft Pastel{' '}
          <span className="font-['Caveat',cursive] text-pink-600 block sm:inline font-normal">
            & Coquette Polaroids 🌸
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-[#7A5A65] max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Step into a magical Korean photo booth, write in notebook journals with rich paper styles, place cute stickers, and build your vintage scrapbooks.
        </motion.p>

        {/* CTA Button Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => onNavigate('photobooth')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-pink-200/80 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 hover:scale-105"
          >
            <Camera className="w-5 h-5" />
            <span>Open Photo Booth</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('diary')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-pink-50 text-pink-700 font-bold text-base border-2 border-pink-200 shadow-md flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1"
          >
            <BookOpen className="w-5 h-5 text-pink-500" />
            <span>Write Digital Diary</span>
          </button>
        </motion.div>

        {/* Interactive Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-3">
          
          {/* Card 1: Photo Booth Strip */}
          <motion.div
            whileHover={{ y: -8, rotate: -1 }}
            className="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 border-2 border-pink-100 shadow-xl paper-lined group cursor-pointer"
            onClick={() => onNavigate('photobooth')}
          >
            <div className="absolute -top-3.5 right-6 w-24 h-6 washi-tape-pink transform rotate-3 flex items-center justify-center text-[10px] font-bold text-pink-800 shadow-xs z-10">
              PHOTO STRIPS
            </div>

            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-2xl mb-4 text-pink-600 shadow-inner">
              📸
            </div>

            <h3 className="font-['Caveat',cursive] text-3xl font-bold text-pink-700">
              Aesthetic Photo Booth
            </h3>
            <p className="text-xs text-[#7A5A65] mt-2 font-medium leading-relaxed">
              3-strip & 4-strip polaroid layouts with real-time vintage filters, frames, stickers, and editable text.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-pink-500 group-hover:translate-x-1 transition-transform">
              <span>Snap & Decorate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 2: Digital Diary */}
          <motion.div
            whileHover={{ y: -8, rotate: 1 }}
            className="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 border-2 border-pink-100 shadow-xl paper-grid group cursor-pointer"
            onClick={() => onNavigate('diary')}
          >
            <div className="absolute -top-3.5 right-6 w-24 h-6 washi-tape-sage transform -rotate-2 flex items-center justify-center text-[10px] font-bold text-emerald-800 shadow-xs z-10">
              NOTEBOOK
            </div>

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl mb-4 text-emerald-600 shadow-inner">
              📖
            </div>

            <h3 className="font-['Caveat',cursive] text-3xl font-bold text-emerald-700">
              Notebook Digital Diary
            </h3>
            <p className="text-xs text-[#7A5A65] mt-2 font-medium leading-relaxed">
              14 cozy notebook themes, 8 paper styles (kraft, lined, dot-grid), mood & weather tracking, auto-save & password lock.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>Start Writing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 3: Memory Gallery */}
          <motion.div
            whileHover={{ y: -8, rotate: -1 }}
            className="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 border-2 border-pink-100 shadow-xl paper-dot group cursor-pointer"
            onClick={() => onNavigate('gallery')}
          >
            <div className="absolute -top-3.5 right-6 w-24 h-6 washi-tape-yellow transform rotate-2 flex items-center justify-center text-[10px] font-bold text-amber-800 shadow-xs z-10">
              GALLERY
            </div>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl mb-4 text-amber-600 shadow-inner">
              🖼️
            </div>

            <h3 className="font-['Caveat',cursive] text-3xl font-bold text-amber-700">
              Memory Albums
            </h3>
            <p className="text-xs text-[#7A5A65] mt-2 font-medium leading-relaxed">
              Organize your photo booth strips and diary memories into custom albums with masonry scrapbook layouts.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
              <span>View Albums</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

        </div>

        {/* Feature Interactive Showcase Tabs */}
        <div className="mt-20 bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border-4 border-pink-100 shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="font-['Playfair_Display',serif] text-3xl font-bold text-pink-900">
              Interactive Scrapbook Magic ✨
            </h2>
            <p className="text-xs text-pink-700/80 mt-1">Explore what makes Dear Lily so dreamy and fun</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: 'photobooth', label: 'Photo Booth Tools', icon: Camera },
              { id: 'diarytools', label: 'Diary Tools', icon: BookOpen },
              { id: 'diarythemes', label: 'Diary Themes', icon: Sparkles },
              { id: 'scrapbook', label: 'Stickers & Fonts', icon: Wand2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSel = activeFeature === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeature(tab.id as any)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
                    isSel
                      ? 'bg-pink-500 text-white shadow-md scale-105'
                      : 'bg-pink-100/60 text-pink-800 hover:bg-pink-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Feature Demo */}
          {activeFeature === 'photobooth' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
                <span className="text-3xl">🎞️</span>
                <h4 className="font-bold text-pink-900 text-sm mt-2">15+ Filters</h4>
                <p className="text-[11px] text-pink-700/70">Vintage, Film, Soft Glow, Y2K</p>
              </div>
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
                <span className="text-3xl">🎀</span>
                <h4 className="font-bold text-pink-900 text-sm mt-2">Decorative Frames</h4>
                <p className="text-[11px] text-pink-700/70">Hearts, Flowers, Bows, Stars</p>
              </div>
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
                <span className="text-3xl">🐱</span>
                <h4 className="font-bold text-pink-900 text-sm mt-2">Draggable Stickers</h4>
                <p className="text-[11px] text-pink-700/70">Bunnies, cats, ribbons, coffee</p>
              </div>
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
                <span className="text-3xl">✨</span>
                <h4 className="font-bold text-pink-900 text-sm mt-2">Text Overlay</h4>
                <p className="text-[11px] text-pink-700/70">Handwriting & Serif fonts</p>
              </div>
            </motion.div>
          )}

          {activeFeature === ('diarytools' as any) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-3xl">🔒</span>
                <h4 className="font-bold text-rose-900 text-sm mt-2">4-Digit PIN Lock</h4>
                <p className="text-[11px] text-rose-700/70">Password protect private chapters</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-3xl">📁</span>
                <h4 className="font-bold text-rose-900 text-sm mt-2">Custom Folders</h4>
                <p className="text-[11px] text-rose-700/70">Organize thoughts by categories</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-3xl">📸</span>
                <h4 className="font-bold text-rose-900 text-sm mt-2">High-Res JPG Export</h4>
                <p className="text-[11px] text-rose-700/70">Download pixel-perfect pages</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-3xl">📄</span>
                <h4 className="font-bold text-rose-900 text-sm mt-2">8 Paper Styles</h4>
                <p className="text-[11px] text-rose-700/70">Lined, grid, dot, kraft & vintage</p>
              </div>
            </motion.div>
          )}

          {activeFeature === ('diarythemes' as any) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-3xl">🌿</span>
                <h4 className="font-bold text-emerald-900 text-sm mt-2">Cottagecore</h4>
                <p className="text-[11px] text-emerald-700/70">Sage greens & dried petals</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-3xl">📜</span>
                <h4 className="font-bold text-amber-900 text-sm mt-2">Vintage Journal</h4>
                <p className="text-[11px] text-amber-700/70">Kraft paper & tea stains</p>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                <span className="text-3xl">☁️</span>
                <h4 className="font-bold text-sky-900 text-sm mt-2">Cloud Theme</h4>
                <p className="text-[11px] text-sky-700/70">Baby blue & soft fluff</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-3xl">🧚‍♀️</span>
                <h4 className="font-bold text-purple-900 text-sm mt-2">Fairy Theme</h4>
                <p className="text-[11px] text-purple-700/70">Sparkles & magical pastels</p>
              </div>
            </motion.div>
          )}

          {activeFeature === 'scrapbook' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
                <span className="text-3xl">🎀</span>
                <h4 className="font-bold text-pink-900 text-sm mt-2">Graphic SVG Ribbons</h4>
                <p className="text-[11px] text-pink-700/70">Coquette bows & wax seals</p>
              </div>
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
                <span className="text-3xl">✒️</span>
                <h4 className="font-bold text-pink-900 text-sm mt-2">Calligraphy & Script</h4>
                <p className="text-[11px] text-pink-700/70">Caveat, Dancing Script, Serif</p>
              </div>
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
                <span className="text-3xl">🎯</span>
                <h4 className="font-bold text-pink-900 text-sm mt-2">Interactive Controls</h4>
                <p className="text-[11px] text-pink-700/70">Drag, scale, rotate & remove</p>
              </div>
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
                <span className="text-3xl">🌸</span>
                <h4 className="font-bold text-pink-900 text-sm mt-2">Kawaii Stickers</h4>
                <p className="text-[11px] text-pink-700/70">Pastel flowers, hearts & cats</p>
              </div>
            </motion.div>
          )}

        </div>

      </section>
    </div>
  );
};
