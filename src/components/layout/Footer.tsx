import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-16 py-8 px-4 border-t border-pink-100 bg-gradient-to-b from-transparent to-pink-50/50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <div>
            <h3 className="font-['Caveat',cursive] text-2xl font-bold text-pink-600">Dear Lily</h3>
            <p className="text-xs text-pink-700/70">Your interactive digital scrapbook & aesthetic photo booth.</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-pink-700 font-medium">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
          <span>for dreamy moments</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <div className="text-xs text-pink-600/80 font-['Caveat',cursive] text-base">
          © 2026 Dear Lily ❀ All rights preserved in soft pink memory
        </div>
      </div>
    </footer>
  );
};
