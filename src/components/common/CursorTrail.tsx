import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import type { AppSettings } from '../../types';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  symbol: string;
  rotation: number;
}

const PASTEL_COLORS = ['#FFB6C1', '#F4C2C2', '#E6E6FA', '#B3E5FC', '#C8E6C9', '#FFE5B4', '#FFD1DC'];
const CLICK_SYMBOLS = ['🌸', '💖', '✨', '🎀', '⭐', '🦋', '🌷', '🤍'];

interface CursorTrailProps {
  settings?: AppSettings;
}

export const CursorTrail: React.FC<CursorTrailProps> = ({ settings: propSettings }) => {
  const [settings, setSettings] = useState<AppSettings>(() => propSettings || StorageService.getSettings());

  useEffect(() => {
    if (propSettings) {
      setSettings(propSettings);
    }
  }, [propSettings]);

  // Listen to window storage events or setting updates
  useEffect(() => {
    const handleStorageChange = () => {
      setSettings(StorageService.getSettings());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dear_lily_settings_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dear_lily_settings_updated', handleStorageChange);
    };
  }, []);

  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [clickParticles, setClickParticles] = useState<ClickParticle[]>([]);

  useEffect(() => {
    if (!settings.cursorSparkles) {
      setSparkles([]);
      return;
    }

    let counter = 0;
    const handleMouseMove = (e: MouseEvent) => {
      counter++;
      if (counter % 3 !== 0) return;

      const newSparkle: Sparkle = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 8 + 4,
        color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
      };

      setSparkles((prev) => [...prev.slice(-15), newSparkle]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [settings.cursorSparkles]);

  useEffect(() => {
    if (!settings.clickEffects) {
      setClickParticles([]);
      return;
    }

    const handleClick = (e: MouseEvent) => {
      const numParticles = 6;
      const newParticles: ClickParticle[] = [];

      for (let i = 0; i < numParticles; i++) {
        const angle = (i / numParticles) * Math.PI * 2;
        const speed = Math.random() * 60 + 30;
        newParticles.push({
          id: Date.now() + i + Math.random(),
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20,
          symbol: CLICK_SYMBOLS[Math.floor(Math.random() * CLICK_SYMBOLS.length)],
          rotation: (Math.random() - 0.5) * 60,
        });
      }

      setClickParticles((prev) => [...prev, ...newParticles]);

      setTimeout(() => {
        setClickParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
      }, 900);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [settings.clickEffects]);

  return (
    <>
      {/* Sparkle Trail */}
      {settings.cursorSparkles &&
        sparkles.map((sp) => (
          <div
            key={sp.id}
            className="sparkle-trail-dot shadow-sm"
            style={{
              left: `${sp.x}px`,
              top: `${sp.y}px`,
              width: `${sp.size}px`,
              height: `${sp.size}px`,
              backgroundColor: sp.color,
              boxShadow: `0 0 8px ${sp.color}`,
            }}
          />
        ))}

      {/* Click Particles */}
      {settings.clickEffects &&
        clickParticles.map((cp) => (
          <div
            key={cp.id}
            className="click-particle font-serif text-lg select-none"
            style={{
              left: `${cp.x}px`,
              top: `${cp.y}px`,
              '--tw-translate-x': `${cp.vx}px`,
              '--tw-translate-y': `${cp.vy}px`,
              '--tw-rotate': `${cp.rotation}deg`,
            } as React.CSSProperties}
          >
            {cp.symbol}
          </div>
        ))}
    </>
  );
};
