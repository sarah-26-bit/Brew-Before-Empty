import React from 'react';

// 1. Elixir of Astral Clarity (Sapphire celestial apothecary flacon)
export function AstralClarityBottle({ className = 'w-16 h-16' }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="astralGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="astralLiquid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#082F49" />
        </linearGradient>
        <linearGradient id="astralGlass" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="40%" stopColor="#BAE6FD" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0369A1" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="astralCork" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="50%" stopColor="#C5A46D" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="56" r="38" fill="url(#astralGlow)" />
      {/* Bottle Shadow */}
      <ellipse cx="50" cy="90" rx="22" ry="4" fill="#000000" opacity="0.4" />
      {/* Glass Body */}
      <path d="M42 24 L58 24 L58 34 C68 40 74 50 74 64 C74 78 63 88 50 88 C37 88 26 78 26 64 C26 50 32 40 42 34 Z" fill="url(#astralGlass)" stroke="#C5A46D" strokeWidth="1.5" />
      {/* Liquid interior */}
      <path d="M30 63 C30 76 39 85 50 85 C61 85 70 76 70 63 C70 56 66 50 60 48 C55 52 45 47 40 50 C33 54 30 58 30 63 Z" fill="url(#astralLiquid)" />
      {/* Swirling starry particles */}
      <circle cx="48" cy="68" r="2" fill="#FFFFFF" opacity="0.9" />
      <circle cx="58" cy="74" r="1.5" fill="#BAE6FD" opacity="0.8" />
      <circle cx="38" cy="72" r="1" fill="#BAE6FD" opacity="0.7" />
      <circle cx="52" cy="56" r="1.5" fill="#FFFFFF" opacity="0.95" />
      {/* Constellation lines */}
      <path d="M48 68 L58 74 M48 68 L38 72 M48 68 L52 56" stroke="#BAE6FD" strokeWidth="0.75" strokeDasharray="1.5 1.5" opacity="0.6" />
      {/* Cork / Stopper with Gold Ring */}
      <rect x="44" y="16" width="12" height="9" rx="1.5" fill="url(#astralCork)" stroke="#78350F" strokeWidth="0.8" />
      <rect x="41" y="23" width="18" height="3" rx="1" fill="#C5A46D" stroke="#92400E" strokeWidth="0.5" />
      {/* Glass Specular Highlights */}
      <path d="M32 50 C29 55 29 65 31 72" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="46" cy="28" r="1" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
}

// 2. Phoenix Rebirth Draught (Ornate fiery ampoule with golden embers)
export function PhoenixRebirthBottle({ className = 'w-16 h-16' }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="phoenixGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EA580C" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#C2410C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="phoenixLiquid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="40%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
        <linearGradient id="phoenixGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="60%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="55" r="40" fill="url(#phoenixGlow)" />
      <ellipse cx="50" cy="91" rx="20" ry="3.5" fill="#000000" opacity="0.45" />
      {/* Ornate Gold Casing */}
      <path d="M35 88 C32 80 28 65 34 50 C38 42 43 38 43 28 L57 28 C57 38 62 42 66 50 C72 65 68 80 65 88 Z" fill="#1C1917" stroke="url(#phoenixGold)" strokeWidth="1.5" />
      {/* Liquid Chamber */}
      <path d="M37 84 C34 76 32 63 36 53 C39 46 45 42 45 32 L55 32 C55 42 61 46 64 53 C68 63 66 76 63 84 Z" fill="url(#phoenixLiquid)" />
      {/* Floating Fiery Embers */}
      <polygon points="50,42 52,48 58,50 52,52 50,58 48,52 42,50 48,48" fill="#FEF08A" opacity="0.95" />
      <circle cx="44" cy="65" r="2.2" fill="#FDE047" opacity="0.9" />
      <circle cx="56" cy="68" r="1.8" fill="#FDE047" opacity="0.85" />
      <circle cx="49" cy="76" r="2.5" fill="#FFAA00" opacity="0.9" />
      {/* Golden Filigree Wings */}
      <path d="M28 58 C24 50 25 40 32 35 C33 42 36 46 38 50" stroke="url(#phoenixGold)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M72 58 C76 50 75 40 68 35 C67 42 64 46 62 50" stroke="url(#phoenixGold)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Stopper with Flame Gem */}
      <rect x="45" y="19" width="10" height="9" fill="url(#phoenixGold)" rx="1.5" />
      <path d="M50 10 C53 14 55 17 50 21 C45 17 47 14 50 10 Z" fill="#DC2626" stroke="#FEF08A" strokeWidth="0.8" />
      {/* Gloss */}
      <path d="M38 52 C36 60 36 72 38 78" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// 3. Nocturnal Sight Philter (Emerald & Violet alchemical triangular flask)
export function NocturnalSightBottle({ className = 'w-16 h-16' }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="nocturnalGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nocturnalLiquid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="56" r="38" fill="url(#nocturnalGlow)" />
      <ellipse cx="50" cy="89" rx="26" ry="4" fill="#000000" opacity="0.4" />
      {/* Triangular Erlenmeyer style flask */}
      <path d="M44 22 L56 22 L56 36 L76 78 C78 82 76 86 70 86 L30 86 C24 86 22 82 24 78 L44 36 Z" fill="#062217" stroke="#C5A46D" strokeWidth="1.5" />
      {/* Liquid inside */}
      <path d="M28 77 L38 56 C44 58 54 54 62 56 L72 77 C74 81 72 83 67 83 L33 83 C28 83 26 81 28 77 Z" fill="url(#nocturnalLiquid)" />
      {/* Eye of Insight Sigil on Glass */}
      <ellipse cx="50" cy="69" rx="10" ry="6" stroke="#FEF08A" strokeWidth="1.2" fill="none" />
      <circle cx="50" cy="69" r="3" fill="#064E3B" stroke="#FEF08A" strokeWidth="1" />
      <circle cx="51" cy="68" r="0.9" fill="#FFFFFF" />
      {/* Liquid bubbles */}
      <circle cx="38" cy="74" r="1.5" fill="#A7F3D0" opacity="0.8" />
      <circle cx="60" cy="71" r="1.2" fill="#A7F3D0" opacity="0.8" />
      <circle cx="43" cy="62" r="1" fill="#A7F3D0" opacity="0.6" />
      {/* Neck & Wax Seal */}
      <rect x="42" y="16" width="16" height="7" rx="1.5" fill="#78350F" stroke="#C5A46D" strokeWidth="0.8" />
      <circle cx="50" cy="30" r="3.5" fill="#991B1B" stroke="#7F1D1D" strokeWidth="0.8" />
      {/* Highlight */}
      <path d="M29 76 L46 41" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

// 4. Tidecaller's Ward Potion (Spherical oceanic potion with tidal wave swirl)
export function TidecallersWardBottle({ className = 'w-16 h-16' }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="tideGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tideLiquid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#0891B2" />
          <stop offset="100%" stopColor="#164E63" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="58" r="38" fill="url(#tideGlow)" />
      <ellipse cx="50" cy="90" rx="20" ry="3.5" fill="#000000" opacity="0.4" />
      {/* Round glass sphere with neck */}
      <path d="M43 20 L57 20 L57 32 C69 37 77 49 77 62 C77 77 65 89 50 89 C35 89 23 77 23 62 C23 49 31 37 43 32 Z" fill="#082F3B" stroke="#C5A46D" strokeWidth="1.5" opacity="0.9" />
      {/* Ocean swirl liquid */}
      <path d="M26 63 C26 75 37 86 50 86 C63 86 74 75 74 63 C74 57 70 54 62 55 C54 56 48 50 40 52 C32 54 26 57 26 63 Z" fill="url(#tideLiquid)" />
      {/* Tidal wave foam */}
      <path d="M30 60 C36 57 41 62 48 59 C54 56 61 61 68 57" stroke="#ECFEFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
      <circle cx="42" cy="72" r="2" fill="#E0F2FE" opacity="0.8" />
      <circle cx="55" cy="75" r="1.5" fill="#E0F2FE" opacity="0.8" />
      <circle cx="51" cy="65" r="1.2" fill="#FFFFFF" opacity="0.9" />
      {/* Brass collar and sea-shell stopper */}
      <rect x="42" y="28" width="16" height="4" fill="#C5A46D" stroke="#78350F" strokeWidth="0.8" />
      <path d="M46 14 C46 14 50 10 54 14 C54 20 46 20 46 14 Z" fill="#F3F0E6" stroke="#C5A46D" strokeWidth="0.8" />
      {/* Glass highlights */}
      <path d="M28 53 C26 60 27 68 30 75" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// Master Helper
export function getPotionArtwork(name = '', className = 'w-16 h-16') {
  const n = (name || '').toLowerCase();
  if (n.includes('astral') || n.includes('clarity')) {
    return <AstralClarityBottle className={className} />;
  }
  if (n.includes('phoenix') || n.includes('rebirth') || n.includes('fire')) {
    return <PhoenixRebirthBottle className={className} />;
  }
  if (n.includes('nocturnal') || n.includes('sight') || n.includes('vision') || n.includes('night')) {
    return <NocturnalSightBottle className={className} />;
  }
  if (n.includes('tide') || n.includes('ward') || n.includes('water') || n.includes('ocean')) {
    return <TidecallersWardBottle className={className} />;
  }
  // Generic elegant fallback potion
  return <AstralClarityBottle className={className} />;
}

