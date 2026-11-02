import React from 'react';

// Cinematic Apothecary Laboratory Banner Artwork
export function ApothecaryLaboratoryBanner({ className = 'w-full h-48' }) {
  return (
    <svg viewBox="0 0 1200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bgLab" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#101713" />
          <stop offset="50%" stopColor="#17251D" />
          <stop offset="100%" stopColor="#0B120E" />
        </linearGradient>
        <radialGradient id="alembicGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#237A57" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#237A57" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C5A46D" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#C5A46D" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#C5A46D" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>

      {/* Atmospheric Background */}
      <rect width="1200" height="240" fill="url(#bgLab)" />
      
      {/* Background Shelving & Arches */}
      <path d="M0 60 L1200 60 M0 140 L1200 140 M0 210 L1200 210" stroke="#1A2D22" strokeWidth="3" opacity="0.6" />
      <path d="M120 60 C120 20 180 20 180 60 M340 60 C340 20 400 20 400 60 M820 60 C820 20 880 20 880 60 M1040 60 C1040 20 1100 20 1100 60" stroke="#237A57" strokeWidth="1.5" opacity="0.4" />

      {/* Ambient Light Cones */}
      <circle cx="280" cy="110" r="160" fill="url(#alembicGlow)" />
      <circle cx="950" cy="100" r="180" fill="url(#goldGlow)" />

      {/* Hanging Dried Herbs on Left Shelf */}
      <g opacity="0.65">
        <path d="M60 60 Q65 95 62 120 M62 80 L55 90 M62 95 L70 102 M62 110 L56 116" stroke="#A6B99B" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M78 60 Q75 90 80 115 M78 78 L85 86 M79 92 L72 100" stroke="#C5A46D" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M96 60 Q98 90 95 125 M97 82 L90 90 M96 100 L104 108" stroke="#237A57" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Alembic & Distillation Coil on Shelf */}
      <g transform="translate(220, 45)">
        {/* Brass Burner */}
        <ellipse cx="60" cy="160" rx="35" ry="6" fill="#000" opacity="0.5" />
        <path d="M40 160 L45 135 L75 135 L80 160 Z" fill="url(#brassGrad)" stroke="#78350F" strokeWidth="1" />
        <ellipse cx="60" cy="130" rx="10" ry="4" fill="#E9A23B" opacity="0.85" />
        {/* Retort Flask */}
        <ellipse cx="60" cy="105" rx="36" ry="34" fill="#17251D" stroke="#C5A46D" strokeWidth="1.5" />
        <path d="M30 112 C30 128 42 136 60 136 C78 136 90 128 90 112 C78 116 72 108 60 110 C48 112 40 108 30 112 Z" fill="#237A57" opacity="0.8" />
        {/* Alembic Cap & Coiled Tube */}
        <path d="M50 72 L70 72 L65 52 L55 52 Z" fill="url(#brassGrad)" />
        <path d="M60 52 C60 30 100 20 120 40 C140 60 115 80 135 100 C145 110 165 115 175 140" stroke="url(#brassGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Condenser Beaker */}
        <path d="M165 125 L165 160 L195 160 L195 125 Z" fill="#101713" stroke="#A6B99B" strokeWidth="1.2" opacity="0.8" />
        <rect x="166" y="142" width="28" height="17" fill="#38BDF8" opacity="0.65" />
      </g>

      {/* Decorative Jars & Manuscripts in Centre */}
      <g transform="translate(540, 75)" opacity="0.85">
        {/* Ancient Tome */}
        <path d="M40 130 L95 110 L150 130 L95 145 Z" fill="#78350F" stroke="#C5A46D" strokeWidth="1.2" />
        <path d="M40 130 L40 138 L95 153 L150 138 L150 130" fill="#92400E" stroke="#C5A46D" strokeWidth="1" />
        {/* Apothecary Jar with Cork */}
        <rect x="170" y="70" width="34" height="60" rx="4" fill="#17251D" stroke="#C5A46D" strokeWidth="1.5" />
        <rect x="175" y="62" width="24" height="8" rx="2" fill="#C5A46D" />
        <rect x="173" y="90" width="28" height="36" fill="#A6B99B" opacity="0.5" />
        <line x1="178" y1="100" x2="196" y2="100" stroke="#101713" strokeWidth="1" />
        <line x1="178" y1="106" x2="192" y2="106" stroke="#101713" strokeWidth="1" />
      </g>

      {/* Right Side: Celestial Astrolabe & Crystals */}
      <g transform="translate(890, 35)">
        {/* Brass Astrolabe Ring */}
        <circle cx="90" cy="90" r="65" stroke="url(#brassGrad)" strokeWidth="2.5" fill="none" strokeDasharray="6 3" />
        <circle cx="90" cy="90" r="45" stroke="#C5A46D" strokeWidth="1.2" fill="none" />
        <circle cx="90" cy="90" r="20" stroke="#A6B99B" strokeWidth="1" fill="none" />
        <line x1="25" y1="90" x2="155" y2="90" stroke="#C5A46D" strokeWidth="1" opacity="0.7" />
        <line x1="90" y1="25" x2="90" y2="155" stroke="#C5A46D" strokeWidth="1" opacity="0.7" />
        <line x1="45" y1="45" x2="135" y2="135" stroke="#FDE68A" strokeWidth="1.2" />
        {/* Glow Crystals on Stand */}
        <polygon points="175,170 185,95 195,170" fill="#237A57" stroke="#A6B99B" strokeWidth="1" opacity="0.9" />
        <polygon points="192,170 200,115 208,170" fill="#38BDF8" stroke="#F3F0E6" strokeWidth="0.8" opacity="0.85" />
      </g>

      {/* Foreground Subtle Gradient Vignette */}
      <rect width="1200" height="240" fill="url(#bgLab)" opacity="0.2" />
    </svg>
  );
}

// Glowing Crystal Ball Scene Artwork (for Analytics / Prophecy)
export function CrystalBallScene({ className = 'w-40 h-40' }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="orbGlow" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#237A57" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#0B3E2E" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#061F16" stopOpacity="0.95" />
        </radialGradient>
        <linearGradient id="orbGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#C5A46D" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>
      {/* Pedestal Shadow */}
      <ellipse cx="80" cy="150" rx="45" ry="8" fill="#000" opacity="0.6" />
      {/* Carved Claw Feet */}
      <path d="M42 148 C46 142 52 140 60 138 L100 138 C108 140 114 142 118 148 L122 152 L38 152 Z" fill="url(#orbGold)" />
      {/* Stand Column */}
      <rect x="68" y="118" width="24" height="22" rx="3" fill="url(#orbGold)" stroke="#78350F" strokeWidth="1" />
      {/* Supporting Crescent Prongs */}
      <path d="M38 96 C42 118 60 126 80 126 C100 126 118 118 122 96 C116 112 100 120 80 120 C60 120 44 112 38 96 Z" fill="url(#orbGold)" />
      {/* Crystal Sphere */}
      <circle cx="80" cy="74" r="48" fill="url(#orbGlow)" stroke="#C5A46D" strokeWidth="1.5" />
      {/* Swirling Inner Mist & Constellation Ribbons */}
      <ellipse cx="78" cy="72" rx="36" ry="18" stroke="#FDE68A" strokeWidth="1.2" strokeDasharray="4 3" transform="rotate(-25 78 72)" opacity="0.75" />
      <ellipse cx="82" cy="76" rx="28" ry="12" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" transform="rotate(35 82 76)" opacity="0.6" />
      {/* Specular Highlights */}
      <ellipse cx="62" cy="50" rx="14" ry="7" fill="#FFFFFF" opacity="0.55" transform="rotate(-30 62 50)" />
      <circle cx="56" cy="46" r="3.5" fill="#FFFFFF" opacity="0.85" />
      <circle cx="98" cy="88" r="2.5" fill="#A7F3D0" opacity="0.7" />
    </svg>
  );
}

// AI Companion Orb (for Floating Assistant / Intelligence Centre)
export function AICompanionOrb({ className = 'w-10 h-10', active = true }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="aiCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#237A57" />
          <stop offset="85%" stopColor="#101713" />
        </radialGradient>
      </defs>
      {/* Outer Rotating Glyph Rings */}
      <circle cx="32" cy="32" r="28" stroke="#C5A46D" strokeWidth="1" strokeDasharray="6 4" opacity="0.7" className={active ? "animate-spin" : ""} style={{ animationDuration: '18s' }} />
      <circle cx="32" cy="32" r="22" stroke="#A6B99B" strokeWidth="1.2" strokeDasharray="4 2" opacity="0.85" className={active ? "animate-spin" : ""} style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
      {/* Glowing Energy Core */}
      <circle cx="32" cy="32" r="15" fill="url(#aiCore)" />
      {/* Central Diamond Rune */}
      <polygon points="32,22 38,32 32,42 26,32" fill="#F3F0E6" stroke="#C5A46D" strokeWidth="0.8" />
      <circle cx="32" cy="32" r="2.5" fill="#101713" />
    </svg>
  );
}

