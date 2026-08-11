// High-Quality Aesthetic Graphic Journal Stickers (SVG Data URLs)
// Designed to mimic cute scrapbooking, bullet journal washi tapes, banners, kawaii characters, and aesthetic stamps.

export interface GraphicSticker {
  id: string;
  name: string;
  category: 'aesthetic' | 'kawaii' | 'washi' | 'banners';
  svgSrc: string;
  defaultScale: number;
}

const encodeSVG = (svgString: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim().replace(/\s+/g, ' '))}`;
};

export const GRAPHIC_STICKERS: GraphicSticker[] = [
  // KAWAII CHARACTERS & ICONS
  {
    id: 'g_milk_carton',
    name: 'Strawberry Milk Carton 🥛',
    category: 'kawaii',
    defaultScale: 1.2,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100" height="120">
        <path d="M 20,25 L 35,5 L 65,5 L 80,25 L 85,115 L 15,115 Z" fill="#FFFFFF" filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.18))"/>
        <path d="M 23,28 L 36,8 L 64,8 L 77,28 L 81,111 L 19,111 Z" fill="#FFD1DC" stroke="#F48FB1" stroke-width="3" stroke-linejoin="round"/>
        <polygon points="23,28 77,28 64,8 36,8" fill="#F8BBD0"/>
        <circle cx="35" cy="50" r="5" fill="#FF4081"/>
        <circle cx="65" cy="75" r="5" fill="#FF4081"/>
        <circle cx="40" cy="80" r="3" fill="#880E4F"/>
        <circle cx="60" cy="80" r="3" fill="#880E4F"/>
        <ellipse cx="34" cy="83" rx="4" ry="2.5" fill="#FF80AB" opacity="0.7"/>
        <ellipse cx="66" cy="83" rx="4" ry="2.5" fill="#FF80AB" opacity="0.7"/>
        <path d="M 47,83 Q 50,86 53,83" fill="none" stroke="#880E4F" stroke-width="2" stroke-linecap="round"/>
        <rect x="30" cy="55" width="40" height="16" rx="4" fill="#FFFFFF" stroke="#F48FB1" stroke-width="1.5"/>
        <text x="50" y="66" font-family="sans-serif" font-size="9" font-weight="bold" fill="#D81B60" text-anchor="middle">MILK 🍓</text>
      </svg>
    `),
  },

  {
    id: 'g_take_it_slow',
    name: 'Take It Slow Badge 🌸',
    category: 'aesthetic',
    defaultScale: 1.2,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <rect x="5" y="5" width="110" height="110" rx="25" fill="#FFFFFF" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.16))"/>
        <rect x="10" y="10" width="100" height="100" rx="20" fill="#FFF9F0" stroke="#F4C2C2" stroke-width="3"/>
        <path d="M 45,48 C 45,35 75,35 75,48 Z" fill="#FF8A80" stroke="#E57373" stroke-width="2"/>
        <ellipse cx="60" cy="42" rx="3" ry="2" fill="#FFFFFF"/>
        <ellipse cx="52" cy="46" rx="2" ry="2" fill="#FFFFFF"/>
        <ellipse cx="68" cy="46" rx="2" ry="2" fill="#FFFFFF"/>
        <rect x="56" y="48" width="8" height="14" rx="3" fill="#FFF3E0" stroke="#D7CCC8" stroke-width="1.5"/>
        <text x="60" y="78" font-family="'Caveat', cursive, serif" font-size="14" font-weight="bold" fill="#880E4F" text-anchor="middle">Take It</text>
        <text x="60" y="94" font-family="'Caveat', cursive, serif" font-size="15" font-weight="bold" fill="#C2185B" text-anchor="middle">Slow ✨</text>
      </svg>
    `),
  },

  {
    id: 'g_coquette_bow',
    name: 'Coquette Ribbon Bow 🎀',
    category: 'aesthetic',
    defaultScale: 1.3,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 90" width="130" height="90">
        <path d="M 20,15 C 40,5 60,35 65,40 C 70,35 90,5 110,15 C 125,25 125,55 105,65 C 90,72 70,48 65,45 C 60,48 40,72 25,65 C 5,55 5,25 20,15 Z" fill="#FFFFFF" filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.18))"/>
        <path d="M 25,18 C 43,8 60,36 65,40 C 58,45 35,68 22,58 C 10,48 10,28 25,18 Z" fill="#FFB7C5" stroke="#F48FB1" stroke-width="3"/>
        <path d="M 30,25 C 40,20 52,35 58,40" fill="none" stroke="#F06292" stroke-width="2" stroke-linecap="round"/>
        <path d="M 105,18 C 87,8 70,36 65,40 C 72,45 95,68 108,58 C 120,48 120,28 105,18 Z" fill="#FFB7C5" stroke="#F48FB1" stroke-width="3"/>
        <path d="M 100,25 C 90,20 78,35 72,40" fill="none" stroke="#F06292" stroke-width="2" stroke-linecap="round"/>
        <path d="M 60,42 Q 40,70 30,85 L 45,82 Q 62,55 65,44 Z" fill="#F8BBD0" stroke="#F48FB1" stroke-width="2"/>
        <path d="M 70,42 Q 90,70 100,85 L 85,82 Q 68,55 65,44 Z" fill="#F8BBD0" stroke="#F48FB1" stroke-width="2"/>
        <ellipse cx="65" cy="40" rx="9" ry="8" fill="#FF4081" stroke="#C2185B" stroke-width="2"/>
      </svg>
    `),
  },

  {
    id: 'g_boba_tea',
    name: 'Boba Milk Tea 🧋',
    category: 'kawaii',
    defaultScale: 1.2,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130" width="100" height="130">
        <path d="M 25,35 L 30,120 L 70,120 L 75,35 Z" fill="#FFFFFF" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.18))"/>
        <rect x="25" y="15" width="50" height="15" rx="5" fill="#FFFFFF"/>
        <!-- Straw -->
        <rect x="46" y="2" width="8" height="35" rx="3" fill="#FF80AB"/>
        <!-- Cup Body -->
        <path d="M 28,38 L 33,117 L 67,117 L 72,38 Z" fill="#FFE0B2" stroke="#FB8C00" stroke-width="2"/>
        <!-- Liquid Level -->
        <path d="M 28,50 L 33,117 L 67,117 L 72,50 Z" fill="#D7CCC8" opacity="0.8"/>
        <!-- Tapioca Pearls -->
        <circle cx="40" cy="105" r="4" fill="#3E2723"/>
        <circle cx="50" cy="110" r="4" fill="#3E2723"/>
        <circle cx="60" cy="105" r="4" fill="#3E2723"/>
        <circle cx="45" cy="95" r="4" fill="#3E2723"/>
        <circle cx="55" cy="97" r="4" fill="#3E2723"/>
        <!-- Eyes & Smile -->
        <circle cx="42" cy="70" r="2.5" fill="#3E2723"/>
        <circle cx="58" cy="70" r="2.5" fill="#3E2723"/>
        <ellipse cx="36" cy="73" rx="3" ry="2" fill="#FF80AB"/>
        <ellipse cx="64" cy="73" rx="3" ry="2" fill="#FF80AB"/>
        <path d="M 47,73 Q 50,76 53,73" fill="none" stroke="#3E2723" stroke-width="1.5"/>
      </svg>
    `),
  },

  {
    id: 'g_happy_cloud',
    name: 'Blushing Cloud ☁️',
    category: 'kawaii',
    defaultScale: 1.2,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" width="120" height="80">
        <path d="M 30,65 C 10,65 5,45 20,35 C 15,20 35,10 50,20 C 60,5 85,10 95,25 C 110,25 115,45 105,60 C 115,75 90,75 80,70 C 65,78 40,75 30,65 Z" fill="#FFFFFF" filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.15))"/>
        <path d="M 32,60 C 15,60 10,43 23,34 C 18,22 36,13 49,22 C 58,9 81,14 90,27 C 103,27 108,44 98,57 C 88,68 68,68 55,65 C 45,67 36,65 32,60 Z" fill="#E0F7FA" stroke="#80DEEA" stroke-width="2.5"/>
        <circle cx="48" cy="42" r="3.5" fill="#006064"/>
        <circle cx="72" cy="42" r="3.5" fill="#006064"/>
        <ellipse cx="40" cy="47" rx="5" ry="3" fill="#FF80AB" opacity="0.8"/>
        <ellipse cx="80" cy="47" rx="5" ry="3" fill="#FF80AB" opacity="0.8"/>
        <path d="M 55,47 Q 60,52 65,47" fill="none" stroke="#006064" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 95,18 L 97,23 L 102,25 L 97,27 L 95,32 L 93,27 L 88,25 L 93,23 Z" fill="#FFD54F"/>
      </svg>
    `),
  },

  {
    id: 'g_washi_pink_gingham',
    name: 'Pink Gingham Washi 📜',
    category: 'washi',
    defaultScale: 1.4,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 45" width="150" height="45">
        <g filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.2))">
          <path d="M 8,5 L 142,5 L 145,12 L 140,20 L 146,28 L 141,36 L 144,40 L 6,40 L 3,32 L 8,24 L 2,16 Z" fill="#FFF0F5" stroke="#F8BBD0" stroke-width="2"/>
          <path d="M 25,5 V 40 M 50,5 V 40 M 75,5 V 40 M 100,5 V 40 M 125,5 V 40" stroke="#F48FB1" stroke-width="8" stroke-dasharray="4 4" opacity="0.5"/>
          <path d="M 5,15 H 145 M 5,30 H 145" stroke="#F48FB1" stroke-width="8" stroke-dasharray="4 4" opacity="0.5"/>
        </g>
      </svg>
    `),
  },

  {
    id: 'g_washi_sage_floral',
    name: 'Sage Green Botanical Washi 🌿',
    category: 'washi',
    defaultScale: 1.4,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 45" width="150" height="45">
        <g filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.18))">
          <path d="M 6,5 L 144,5 L 141,13 L 146,22 L 140,30 L 145,40 L 5,40 L 9,30 L 3,21 L 8,12 Z" fill="#E8F5E9" stroke="#A5D6A7" stroke-width="2"/>
          <path d="M 20,22 Q 30,12 40,22 Q 30,32 20,22 Z" fill="#81C784"/>
          <path d="M 60,22 Q 70,12 80,22 Q 70,32 60,22 Z" fill="#81C784"/>
          <path d="M 100,22 Q 110,12 120,22 Q 110,32 100,22 Z" fill="#81C784"/>
          <circle cx="30" cy="22" r="3" fill="#FFFFFF"/>
          <circle cx="70" cy="22" r="3" fill="#FFFFFF"/>
          <circle cx="110" cy="22" r="3" fill="#FFFFFF"/>
        </g>
      </svg>
    `),
  },

  {
    id: 'g_vintage_stamp',
    name: 'Rose Postage Stamp 📮',
    category: 'aesthetic',
    defaultScale: 1.2,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100" height="120">
        <g filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.2))">
          <rect x="10" y="10" width="80" height="100" rx="4" fill="#FFFFFF"/>
          <rect x="18" y="18" width="64" height="84" rx="2" fill="#F5E6D3" stroke="#D7CCC8" stroke-width="2"/>
          <circle cx="50" cy="52" r="16" fill="#F8BBD0"/>
          <circle cx="50" cy="52" r="10" fill="#F48FB1"/>
          <circle cx="50" cy="52" r="5" fill="#C2185B"/>
          <path d="M 38,65 Q 50,75 62,65" stroke="#81C784" stroke-width="3" fill="none" stroke-linecap="round"/>
          <circle cx="70" cy="35" r="15" fill="none" stroke="#5D4037" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.6"/>
          <text x="70" y="38" font-family="sans-serif" font-size="6" font-weight="bold" fill="#5D4037" text-anchor="middle" opacity="0.7">DEAR LILY</text>
          <text x="24" y="94" font-family="'Courier Prime', monospace" font-size="10" font-weight="bold" fill="#5D4037">50¢</text>
        </g>
      </svg>
    `),
  },

  {
    id: 'g_banner_love_yourself',
    name: 'Love Yourself Ribbon 🎀',
    category: 'banners',
    defaultScale: 1.4,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 55" width="160" height="55">
        <g filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.18))">
          <path d="M 10,12 L 30,5 L 130,5 L 150,12 L 140,27 L 150,42 L 130,48 L 30,48 L 10,42 L 20,27 Z" fill="#FFFFFF"/>
          <path d="M 15,15 L 32,8 L 128,8 L 145,15 L 136,27 L 145,39 L 128,45 L 32,45 L 15,39 L 24,27 Z" fill="#FFD1DC" stroke="#F48FB1" stroke-width="2"/>
          <text x="80" y="31" font-family="'Playfair Display', serif" font-size="13" font-weight="bold" fill="#880E4F" text-anchor="middle">LOVE YOURSELF ♡</text>
        </g>
      </svg>
    `),
  },

  {
    id: 'g_sticky_note_pink',
    name: 'Pastel Grid Sticky Note 📝',
    category: 'banners',
    defaultScale: 1.3,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110" width="110" height="110">
        <g filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.18))">
          <rect x="5" y="5" width="100" height="100" rx="8" fill="#FFFFFF"/>
          <rect x="9" y="9" width="92" height="92" rx="6" fill="#FFF0F5" stroke="#F8BBD0" stroke-width="1.5"/>
          <path d="M 9,30 H 101 M 9,50 H 101 M 9,70 H 101 M 9,90 H 101" stroke="#F48FB1" stroke-width="0.8" opacity="0.4"/>
          <path d="M 30,9 V 101 M 50,9 V 101 M 70,9 V 101 M 90,9 V 101" stroke="#F48FB1" stroke-width="0.8" opacity="0.4"/>
          <path d="M 50,15 C 45,8 35,14 42,22 L 50,28 L 58,22 C 65,14 55,8 50,15 Z" fill="#FF4081"/>
        </g>
      </svg>
    `),
  },

  {
    id: 'g_cozy_teacup',
    name: 'Cozy Steaming Teacup ☕',
    category: 'kawaii',
    defaultScale: 1.2,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <g filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.15))">
          <path d="M 20,40 C 20,75 70,75 70,40 C 85,40 85,60 70,60 H 20 Z" stroke="#FFFFFF" stroke-width="10" fill="#FFFFFF"/>
          <path d="M 22,40 C 22,72 68,72 68,40 Z" fill="#FFE0B2" stroke="#FB8C00" stroke-width="2.5"/>
          <path d="M 68,45 C 82,45 82,60 68,60" fill="none" stroke="#FB8C00" stroke-width="3" stroke-linecap="round"/>
          <path d="M 38,32 Q 35,22 40,16 Q 45,22 42,32" stroke="#FF8A80" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M 52,32 Q 49,20 54,12 Q 59,20 56,32" stroke="#FF8A80" stroke-width="2" fill="none" stroke-linecap="round"/>
          <circle cx="38" cy="52" r="2.5" fill="#5D4037"/>
          <circle cx="52" cy="52" r="2.5" fill="#5D4037"/>
          <path d="M 43,54 Q 45,57 47,54" fill="none" stroke="#5D4037" stroke-width="1.5"/>
        </g>
      </svg>
    `),
  },

  {
    id: 'g_polaroid_frame',
    name: 'Mini Polaroid Frame 📷',
    category: 'aesthetic',
    defaultScale: 1.3,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 130" width="110" height="130">
        <g filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.18))">
          <rect x="5" y="5" width="100" height="120" rx="6" fill="#FFFFFF"/>
          <rect x="15" y="15" width="80" height="80" rx="3" fill="#FDF8F5" stroke="#E2D4C9" stroke-width="2"/>
          <path d="M 35,55 C 35,40 75,40 75,55 Z" fill="#F8BBD0"/>
          <circle cx="55" cy="50" r="8" fill="#FF80AB"/>
          <text x="55" y="112" font-family="'Caveat', cursive" font-size="13" font-weight="bold" fill="#880E4F" text-anchor="middle">sweet moments ♡</text>
        </g>
      </svg>
    `),
  },

  {
    id: 'g_cupcake_sweet',
    name: 'Sweet Birthday Cupcake 🧁',
    category: 'kawaii',
    defaultScale: 1.2,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110" width="100" height="110">
        <g filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.16))">
          <path d="M 25,60 L 32,100 L 68,100 L 75,60 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="8"/>
          <!-- Wrapper Base -->
          <path d="M 28,62 L 34,98 L 66,98 L 72,62 Z" fill="#F8BBD0" stroke="#F48FB1" stroke-width="2"/>
          <!-- Cream Top -->
          <path d="M 20,62 C 20,40 40,30 50,30 C 60,30 80,40 80,62 Z" fill="#FFF0F5" stroke="#FF4081" stroke-width="2"/>
          <!-- Cherry -->
          <circle cx="50" cy="24" r="8" fill="#D81B60"/>
          <path d="M 50,16 Q 58,8 64,12" fill="none" stroke="#D81B60" stroke-width="2"/>
          <!-- Sprinkles -->
          <rect x="35" cy="45" width="4" height="2" rx="1" fill="#FFD54F" transform="rotate(30 35 45)"/>
          <rect x="60" cy="48" width="4" height="2" rx="1" fill="#4FC3F7" transform="rotate(-20 60 48)"/>
        </g>
      </svg>
    `),
  },

  {
    id: 'g_speech_bubble',
    name: 'Coquette Speech Bubble 💬',
    category: 'banners',
    defaultScale: 1.3,
    svgSrc: encodeSVG(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 80" width="140" height="80">
        <g filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.16))">
          <path d="M 15,10 H 125 A 12 12 0 0 1 137 22 V 55 A 12 12 0 0 1 125 67 H 55 L 35,78 V 67 H 15 A 12 12 0 0 1 3 55 V 22 A 12 12 0 0 1 15 10 Z" fill="#FFFFFF"/>
          <path d="M 18,13 H 122 A 10 10 0 0 1 132 23 V 53 A 10 10 0 0 1 122 63 H 53 L 37,72 V 63 H 18 A 10 10 0 0 1 8 53 V 23 A 10 10 0 0 1 18 13 Z" fill="#FFF5F7" stroke="#F48FB1" stroke-width="2"/>
          <text x="70" y="42" font-family="'Caveat', cursive, serif" font-size="16" font-weight="bold" fill="#880E4F" text-anchor="middle">Dear Lily ♡</text>
        </g>
      </svg>
    `),
  },
];
