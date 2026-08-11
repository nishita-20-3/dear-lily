import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

export const LoadingNotebook: React.FC<LoadingProps> = ({ message = 'Opening Dear Lily Scrapbook...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFF5F7]/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-80 h-96 bg-[#FFFDF9] border-4 border-pink-200 rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-between paper-lined overflow-hidden"
      >
        {/* Washi Tape Header */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-7 washi-tape-pink transform -rotate-1 rounded-sm flex items-center justify-center text-xs text-pink-700 font-bold tracking-wider">
          DEAR LILY
        </div>

        {/* Notebook Spiral Left Edge */}
        <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around py-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-[#E2E8F0] border-2 border-[#CBD5E1] shadow-inner" />
          ))}
        </div>

        {/* Floating Flower Graphic */}
        <div className="mt-8 flex flex-col items-center text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.08, 0.95, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-full bg-pink-100/80 border-2 border-pink-300 flex items-center justify-center text-4xl shadow-md"
          >
            🌸
          </motion.div>

          <h2 className="mt-6 font-['Caveat',cursive] text-3xl font-bold text-pink-600 tracking-wide flex items-center gap-2">
            Dear Lily <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          </h2>
          <p className="mt-2 text-sm text-pink-700/80 font-medium px-4">{message}</p>
        </div>

        {/* Loading Progress Dots */}
        <div className="w-full flex items-center justify-center gap-3 mb-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
              className="w-3 h-3 rounded-full bg-pink-400"
            />
          ))}
        </div>

        {/* Cute Footer */}
        <div className="flex items-center gap-1 text-xs text-pink-400 font-['Caveat',cursive]">
          <span>crafting memories</span> <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
        </div>
      </motion.div>
    </div>
  );
};
