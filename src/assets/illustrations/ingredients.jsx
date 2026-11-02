import React from 'react';

/**
 * High-fidelity, handcrafted and procedural SVG illustrations for ingredients.
 * Every item (existing or newly created) receives a unique, connected, and deterministic visual.
 */

// Helper to hash any string deterministically
export function hashString(str = '') {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Detect the best visual archetype based on name and category
export function detectArchetype(name = '', category = '') {
  const text = (name + ' ' + category).toLowerCase();
  if (/berry|fruit|seed|acorn|pod|currant/.test(text)) return 'berry';
  if (/flower|lotus|lily|petal|blossom|bloom|rose|orchid|jasmine|poppy/.test(text)) return 'flower';
  if (/mushroom|fung|spore|truffle|myceli|toadstool|fungus/.test(text)) return 'mushroom';
  if (/crystal|shard|gem|quartz|diamond|prism|stone|ore|obsidian|ruby|sapphire|emerald|amethyst|mineral|geode/.test(text)) return 'crystal';
  if (/root|mandrake|ginseng|tuber|bark|wood|vine|mandragora|stem/.test(text)) return 'root';
  if (/scale|claw|fang|feather|\bhorn\b|bone|tooth|wing|talon|dragon|wyrm|serpent|beast|bat/.test(text)) return 'creature';
  if (/ash|dust|powder|sand|salt|pollen|ember|soot/.test(text)) return 'dust';
  if (/star|sun|moon|celestial|astral|void|cosmic|galaxy|nebula|comet|solar|lunar/.test(text)) return 'celestial';
  if (/dew|water|tear|drop|fluid|nectar|sap|oil|liquid|elixir|essence|extract|ink|blood|venom|resin|slime/.test(text)) return 'flask';
  if (/leaf|herb|foliage|fern|grass|sage|thyme|mint|moss|plant|hazel|botanical/.test(text)) return 'herb';

  // Category fallback
  if (category.includes('Mineral')) return 'crystal';
  if (category.includes('Celestial')) return 'celestial';
  if (category.includes('Botanical')) return 'herb';
  if (category.includes('Ethereal')) return 'dust';
  
  // Hash-based rotation
  const archetypes = ['flower', 'crystal', 'flask', 'mushroom', 'herb', 'celestial', 'berry', 'root'];
  const h = hashString(name);
  return archetypes[h % archetypes.length];
}

// ============================================================================
// PROCEDURAL ARCHETYPE COMPONENTS
// ============================================================================

// 1. Procedural Flower / Blossom
function ProceduralFlower({ name, hash, hue1, hue2, className }) {
  const uid = `${hash}-flw`;
  const petalCount = 5 + (hash % 4); // 5, 6, 7, or 8 petals
  const angles = Array.from({ length: petalCount }, (_, i) => (360 / petalCount) * i);
  const stamenCount = 6 + (hash % 5);

  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(${hue1}, 80%, 55%)`} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`petal-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={`hsl(${hue2}, 90%, 75%)`} />
          <stop offset="60%" stopColor={`hsl(${hue1}, 75%, 52%)`} />
          <stop offset="100%" stopColor={`hsl(${hue1}, 65%, 28%)`} />
        </linearGradient>
        <linearGradient id={`stem-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#237A57" />
          <stop offset="100%" stopColor="#17251D" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill={`url(#aura-${uid})`} />

      {/* Stem & Calyx */}
      <path d="M60 62 Q58 85 52 110" stroke={`url(#stem-${uid})`} strokeWidth="3" strokeLinecap="round" />
      <path d="M56 82 C44 78 36 86 34 94 C46 95 52 90 56 82 Z" fill="#237A57" opacity="0.9" />
      <path d="M57 90 C68 86 78 92 82 100 C70 102 62 97 57 90 Z" fill="#237A57" opacity="0.9" />

      {/* Petals */}
      <g transform="translate(60, 56)">
        {angles.map((deg, i) => (
          <path
            key={i}
            d="M0 0 C-14 -12 -12 -34 0 -42 C12 -34 14 -12 0 0 Z"
            fill={`url(#petal-${uid})`}
            stroke={`hsl(${hue2}, 80%, 75%)`}
            strokeWidth="0.8"
            transform={`rotate(${deg})`}
            opacity="0.95"
          />
        ))}
      </g>

      {/* Central Pistil & Glowing Stamens */}
      <circle cx="60" cy="56" r="9" fill="#101713" stroke="#C5A46D" strokeWidth="1.5" />
      <circle cx="60" cy="56" r="6" fill={`hsl(${hue2}, 90%, 65%)`} />
      {Array.from({ length: stamenCount }).map((_, i) => {
        const rad = (i * 2 * Math.PI) / stamenCount;
        const x = 60 + Math.cos(rad) * 12;
        const y = 56 + Math.sin(rad) * 12;
        return (
          <g key={i}>
            <line x1="60" y1="56" x2={x} y2={y} stroke="#C5A46D" strokeWidth="0.8" opacity="0.75" />
            <circle cx={x} cy={y} r="1.5" fill="#F3F0E6" />
          </g>
        );
      })}
    </svg>
  );
}

// 2. Procedural Crystal Cluster
function ProceduralCrystal({ name, hash, hue1, hue2, className }) {
  const uid = `${hash}-cry`;
  const tilt = (hash % 10) - 5;

  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(${hue1}, 80%, 55%)`} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`cMain-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`hsl(${hue2}, 90%, 75%)`} />
          <stop offset="50%" stopColor={`hsl(${hue1}, 75%, 50%)`} />
          <stop offset="100%" stopColor={`hsl(${hue1}, 70%, 25%)`} />
        </linearGradient>
        <linearGradient id={`cSide-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={`hsl(${hue1}, 80%, 60%)`} />
          <stop offset="100%" stopColor={`hsl(${hue1}, 85%, 20%)`} />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill={`url(#aura-${uid})`} />

      {/* Crystal Base Matrix */}
      <polygon points="26,102 46,94 76,96 98,102 82,108 38,108" fill="#17251D" stroke="#263C30" strokeWidth="1" />

      {/* Left Crystal */}
      <polygon points="36,96 44,52 52,60 48,96" fill={`url(#cSide-${uid})`} stroke={`hsl(${hue2}, 70%, 60%)`} strokeWidth="0.8" opacity="0.85" />
      <polygon points="36,96 30,64 44,52" fill={`url(#cMain-${uid})`} stroke={`hsl(${hue2}, 70%, 60%)`} strokeWidth="0.8" opacity="0.75" />

      {/* Right Crystal */}
      <polygon points="84,96 76,46 68,56 74,96" fill={`url(#cSide-${uid})`} stroke={`hsl(${hue2}, 70%, 60%)`} strokeWidth="0.8" opacity="0.85" />
      <polygon points="84,96 90,60 76,46" fill={`url(#cMain-${uid})`} stroke={`hsl(${hue2}, 70%, 60%)`} strokeWidth="0.8" opacity="0.75" />

      {/* Main Center Crystal */}
      <g transform={`rotate(${tilt} 60 70)`}>
        {/* Facet Left */}
        <polygon points="60,18 46,40 50,96 60,98" fill={`url(#cMain-${uid})`} stroke="#F3F0E6" strokeWidth="0.8" />
        {/* Facet Center Right */}
        <polygon points="60,18 74,38 70,96 60,98" fill={`url(#cSide-${uid})`} stroke="#F3F0E6" strokeWidth="0.8" />
        {/* Specular Ridge Line */}
        <line x1="60" y1="18" x2="60" y2="98" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      </g>

      {/* Sparkles */}
      <circle cx="34" cy="42" r="1.5" fill="#FFFFFF" opacity="0.9" />
      <circle cx="86" cy="38" r="2" fill={`hsl(${hue2}, 90%, 75%)`} opacity="0.9" />
      <circle cx="68" cy="22" r="1" fill="#FFFFFF" />
    </svg>
  );
}

// 3. Procedural Apothecary Flask / Liquid Jewel
function ProceduralFlask({ name, hash, hue1, hue2, className }) {
  const uid = `${hash}-flk`;
  const isSpherical = hash % 2 === 0;

  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(${hue1}, 80%, 55%)`} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`liquid-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`hsl(${hue2}, 85%, 65%)`} />
          <stop offset="60%" stopColor={`hsl(${hue1}, 75%, 45%)`} />
          <stop offset="100%" stopColor={`hsl(${hue1}, 80%, 18%)`} />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill={`url(#aura-${uid})`} />

      {/* Glass Body */}
      {isSpherical ? (
        <>
          <path d="M52 24 L68 24 L68 38 C82 44 92 58 92 74 C92 92 78 106 60 106 C42 106 28 92 28 74 C28 58 38 44 52 38 Z" fill="#101713" stroke="#C5A46D" strokeWidth="1.5" />
          <path d="M32 76 C32 90 44 102 60 102 C76 102 88 90 88 76 C88 68 80 64 72 66 C64 68 56 62 48 64 C40 66 32 70 32 76 Z" fill={`url(#liquid-${uid})`} />
        </>
      ) : (
        <>
          <path d="M52 24 L68 24 L68 40 L94 96 C96 100 92 104 86 104 L34 104 C28 104 24 100 26 96 L52 40 Z" fill="#101713" stroke="#C5A46D" strokeWidth="1.5" />
          <path d="M32 92 L46 62 C54 65 66 59 74 62 L88 92 C90 96 88 100 82 100 L38 100 C32 100 30 96 32 92 Z" fill={`url(#liquid-${uid})`} />
        </>
      )}

      {/* Cork Stopper with Gold Ring */}
      <rect x="54" y="15" width="12" height="10" rx="1.5" fill="#8A6740" stroke="#5E4327" strokeWidth="0.8" />
      <rect x="50" y="24" width="20" height="3" rx="1" fill="#C5A46D" />

      {/* Floating Bubbles */}
      <circle cx="54" cy="84" r="2.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="68" cy="88" r="1.8" fill="#FFFFFF" opacity="0.7" />
      <circle cx="62" cy="74" r="1.2" fill="#FFFFFF" opacity="0.9" />

      {/* Glass Highlight */}
      <path d="M36 62 C32 70 34 82 38 90" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// 4. Procedural Sacred Root
function ProceduralRoot({ name, hash, hue1, hue2, className }) {
  const uid = `${hash}-rot`;
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(${hue1}, 70%, 45%)`} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`root-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8A6740" />
          <stop offset="50%" stopColor={`hsl(${hue1}, 55%, 32%)`} />
          <stop offset="100%" stopColor="#2A1A0C" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill={`url(#aura-${uid})`} />

      {/* Sprouting Leaves at Crown */}
      <path d="M60 36 C54 18 38 12 28 20 C36 30 48 34 58 38 Z" fill="#237A57" stroke="#36A87A" strokeWidth="0.8" />
      <path d="M60 36 C66 16 82 10 92 18 C84 28 72 32 62 38 Z" fill="#237A57" stroke="#36A87A" strokeWidth="0.8" />

      {/* Gnarled Root Body */}
      <ellipse cx="60" cy="48" rx="16" ry="14" fill={`url(#root-${uid})`} stroke="#C5A46D" strokeWidth="1" />
      <circle cx="55" cy="47" r="2.2" fill="#101713" />
      <circle cx="65" cy="47" r="2.2" fill="#101713" />
      <path d="M57 54 Q60 57 63 54" stroke="#101713" strokeWidth="1.2" strokeLinecap="round" />

      {/* Bifurcated Root Tendrils */}
      <path d="M52 60 C46 72 38 84 32 102 C38 98 44 88 52 76 C55 84 57 96 60 106 C63 94 62 82 64 74 C68 84 76 96 84 104 C78 90 72 80 66 60 Z" fill={`url(#root-${uid})`} />

      {/* Golden earth threads */}
      <path d="M34 98 Q26 108 20 112 M42 90 Q38 104 36 114 M80 98 Q88 108 96 112" stroke="#C5A46D" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// 5. Procedural Bioluminescent Mushroom
function ProceduralMushroom({ name, hash, hue1, hue2, className }) {
  const uid = `${hash}-msh`;
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(${hue1}, 80%, 55%)`} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`cap-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={`hsl(${hue2}, 90%, 65%)`} />
          <stop offset="50%" stopColor={`hsl(${hue1}, 75%, 45%)`} />
          <stop offset="100%" stopColor={`hsl(${hue1}, 85%, 20%)`} />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill={`url(#aura-${uid})`} />

      {/* Stem */}
      <path d="M52 64 Q50 90 48 102 L72 102 Q70 90 68 64 Z" fill="#F3F0E6" stroke="#263C30" strokeWidth="1" />
      <path d="M46 72 Q60 76 74 72" stroke="#A6B99B" strokeWidth="1.5" strokeLinecap="round" />

      {/* Gills */}
      <path d="M22 62 Q60 72 98 62 L94 58 Q60 68 26 58 Z" fill="#17251D" />

      {/* Mushroom Cap */}
      <path d="M20 60 C20 30 40 18 60 18 C80 18 100 30 100 60 C80 66 40 66 20 60 Z" fill={`url(#cap-${uid})`} stroke={`hsl(${hue2}, 80%, 75%)`} strokeWidth="1.2" />

      {/* Glowing Spots */}
      <circle cx="60" cy="30" r="4.5" fill="#FFFFFF" opacity="0.9" />
      <circle cx="42" cy="42" r="3.5" fill={`hsl(${hue2}, 90%, 75%)`} opacity="0.85" />
      <circle cx="78" cy="42" r="3.5" fill={`hsl(${hue2}, 90%, 75%)`} opacity="0.85" />
      <circle cx="58" cy="48" r="2.5" fill="#FFFFFF" opacity="0.9" />

      {/* Floating Spores */}
      <circle cx="36" cy="22" r="1.5" fill={`hsl(${hue2}, 90%, 80%)`} />
      <circle cx="84" cy="24" r="1.8" fill={`hsl(${hue2}, 90%, 80%)`} />
      <circle cx="72" cy="14" r="1" fill="#FFFFFF" />
    </svg>
  );
}

// 6. Procedural Mythic Creature Relic
function ProceduralCreature({ name, hash, hue1, hue2, className }) {
  const uid = `${hash}-crt`;
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(${hue1}, 80%, 55%)`} stopOpacity="0.35" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`scale-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`hsl(${hue2}, 85%, 65%)`} />
          <stop offset="40%" stopColor={`hsl(${hue1}, 75%, 45%)`} />
          <stop offset="100%" stopColor="#1C1917" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill={`url(#aura-${uid})`} />

      {/* Creature Crest */}
      <path d="M60 16 C76 34 92 56 88 82 C84 100 60 114 60 114 C60 114 36 100 32 82 C28 56 44 34 60 16 Z" fill={`url(#scale-${uid})`} stroke="#C5A46D" strokeWidth="1.5" />
      <path d="M60 18 Q62 55 60 108" stroke="#C5A46D" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 42 Q60 52 70 42 M46 60 Q60 70 74 60 M46 78 Q60 88 74 78" stroke={`hsl(${hue2}, 90%, 75%)`} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// 7. Procedural Celestial Mandala
function ProceduralCelestial({ name, hash, hue1, hue2, className }) {
  const uid = `${hash}-cel`;
  const points = 4 + (hash % 3) * 2;
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(${hue1}, 80%, 55%)`} stopOpacity="0.45" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill={`url(#aura-${uid})`} />

      {/* Orbit Rings */}
      <circle cx="60" cy="60" r="44" stroke="#C5A46D" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
      <ellipse cx="60" cy="60" rx="46" ry="18" stroke={`hsl(${hue2}, 85%, 65%)`} strokeWidth="1" strokeDasharray="3 3" transform="rotate(-25 60 60)" opacity="0.75" />

      {/* Starburst Mandala */}
      <g transform="translate(60, 60)">
        {Array.from({ length: points }).map((_, i) => {
          const deg = (360 / points) * i;
          return (
            <polygon
              key={i}
              points="0,-36 4,-12 0,0 -4,-12"
              fill={`hsl(${hue1}, 75%, 52%)`}
              stroke="#F3F0E6"
              strokeWidth="0.8"
              transform={`rotate(${deg})`}
            />
          );
        })}
      </g>

      <circle cx="60" cy="60" r="12" fill="#101713" stroke="#C5A46D" strokeWidth="2" />
      <circle cx="60" cy="60" r="8" fill={`hsl(${hue2}, 90%, 70%)`} />
      <circle cx="60" cy="60" r="3" fill="#FFFFFF" />
      <circle cx="28" cy="46" r="2.5" fill="#C5A46D" />
      <circle cx="92" cy="74" r="2" fill={`hsl(${hue1}, 80%, 65%)`} />
    </svg>
  );
}

// 8. Procedural Essence Urn / Incense Dust
function ProceduralDustUrn({ name, hash, hue1, hue2, className }) {
  const uid = `${hash}-dst`;
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(${hue1}, 80%, 55%)`} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`urn-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C5A46D" />
          <stop offset="50%" stopColor="#8A6740" />
          <stop offset="100%" stopColor="#4A3418" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill={`url(#aura-${uid})`} />

      {/* Billowing Essence Vortex */}
      <path d="M60 48 Q40 32 50 18 Q62 10 68 22 Q72 36 60 48 Z" fill={`hsl(${hue2}, 80%, 65%)`} opacity="0.65" />
      <circle cx="48" cy="24" r="2" fill="#FFFFFF" />
      <circle cx="64" cy="18" r="2.5" fill={`hsl(${hue1}, 90%, 75%)`} />
      <circle cx="70" cy="30" r="1.5" fill="#FFFFFF" />

      {/* Urn Base and Body */}
      <ellipse cx="60" cy="104" rx="24" ry="5" fill="#17251D" stroke="#C5A46D" strokeWidth="1" />
      <path d="M42 102 L46 72 C36 64 36 52 44 48 L76 48 C84 52 84 64 74 72 L78 102 Z" fill={`url(#urn-${uid})`} stroke="#DFCA9F" strokeWidth="1.2" />

      {/* Urn Handles */}
      <path d="M38 56 C28 60 30 76 44 76" stroke="#C5A46D" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M82 56 C92 60 90 76 76 76" stroke="#C5A46D" strokeWidth="2" strokeLinecap="round" fill="none" />

      <polygon points="60,60 66,68 60,76 54,68" fill={`hsl(${hue1}, 80%, 55%)`} stroke="#F3F0E6" strokeWidth="1" />
    </svg>
  );
}

// 9. Procedural Botanical Herb Sprig
function ProceduralHerb({ name, hash, hue1, hue2, className }) {
  const uid = `${hash}-hrb`;
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#237A57" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`leaf-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={`hsl(${hue2}, 70%, 65%)`} />
          <stop offset="50%" stopColor="#237A57" />
          <stop offset="100%" stopColor="#10251C" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill={`url(#aura-${uid})`} />

      {/* Main Arching Stem */}
      <path d="M38 108 Q52 75 74 24" stroke="#8A6740" strokeWidth="2.5" strokeLinecap="round" />

      {/* Alternating Foliage */}
      <g>
        <path d="M46 90 C32 88 24 76 28 66 C38 72 44 80 46 90 Z" fill={`url(#leaf-${uid})`} stroke="#A6B99B" strokeWidth="0.8" />
        <path d="M54 78 C68 76 78 84 76 96 C64 92 58 84 54 78 Z" fill={`url(#leaf-${uid})`} stroke="#A6B99B" strokeWidth="0.8" />
        <path d="M58 62 C46 56 40 44 46 36 C54 44 58 52 58 62 Z" fill={`url(#leaf-${uid})`} stroke="#A6B99B" strokeWidth="0.8" />
        <path d="M66 50 C80 46 88 54 86 64 C76 62 70 54 66 50 Z" fill={`url(#leaf-${uid})`} stroke="#A6B99B" strokeWidth="0.8" />
        <path d="M74 24 C68 12 78 4 84 6 C86 16 80 22 74 24 Z" fill={`url(#leaf-${uid})`} stroke="#F3F0E6" strokeWidth="1" />
      </g>

      <circle cx="28" cy="66" r="2" fill="#C5A46D" />
      <circle cx="86" cy="64" r="2" fill="#C5A46D" />
    </svg>
  );
}

// 10. Procedural Botanical Berry Cluster
function ProceduralBerry({ name, hash, hue1, hue2, className }) {
  const uid = `${hash}-bry`;
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id={`aura-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(${hue1}, 80%, 55%)`} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`berry-${uid}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={`hsl(${hue2}, 95%, 70%)`} />
          <stop offset="45%" stopColor={`hsl(${hue1}, 85%, 45%)`} />
          <stop offset="100%" stopColor={`hsl(${hue1}, 95%, 15%)`} />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill={`url(#aura-${uid})`} />

      {/* Stem & Calyx Leaves */}
      <path d="M60 22 Q62 45 60 55" stroke="#8A6740" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 42 C48 36 40 44 42 50 C50 48 56 46 60 42 Z" fill="#237A57" />
      <path d="M60 42 C72 36 80 44 78 50 C70 48 64 46 60 42 Z" fill="#237A57" />

      {/* Berry Cluster */}
      <circle cx="48" cy="62" r="16" fill={`url(#berry-${uid})`} stroke="#C5A46D" strokeWidth="1" />
      <ellipse cx="44" cy="56" rx="4" ry="7" transform="rotate(-30 44 56)" fill="#FFFFFF" opacity="0.65" />

      <circle cx="72" cy="62" r="16" fill={`url(#berry-${uid})`} stroke="#C5A46D" strokeWidth="1" />
      <ellipse cx="68" cy="56" rx="4" ry="7" transform="rotate(-30 68 56)" fill="#FFFFFF" opacity="0.65" />

      <circle cx="60" cy="80" r="18" fill={`url(#berry-${uid})`} stroke="#F3F0E6" strokeWidth="1.2" />
      <ellipse cx="55" cy="74" rx="5" ry="8" transform="rotate(-30 55 74)" fill="#FFFFFF" opacity="0.75" />
      <circle cx="60" cy="88" r="2.5" fill="#101713" />
    </svg>
  );
}

// Master Procedural Dispatcher
export function ProceduralIngredientArtwork({ name = '', category = '', archetype = '', className = 'w-12 h-12' }) {
  const hash = hashString(name || 'ingredient');
  const arc = archetype && archetype !== 'auto' ? archetype : detectArchetype(name, category);
  
  // Deterministic Hues
  const hue1 = (hash * 37) % 360;
  const hue2 = (hue1 + 45 + (hash % 50)) % 360;

  switch (arc) {
    case 'flower':
      return <ProceduralFlower name={name} hash={hash} hue1={hue1} hue2={hue2} className={className} />;
    case 'crystal':
      return <ProceduralCrystal name={name} hash={hash} hue1={hue1} hue2={hue2} className={className} />;
    case 'flask':
      return <ProceduralFlask name={name} hash={hash} hue1={hue1} hue2={hue2} className={className} />;
    case 'root':
      return <ProceduralRoot name={name} hash={hash} hue1={hue1} hue2={hue2} className={className} />;
    case 'mushroom':
      return <ProceduralMushroom name={name} hash={hash} hue1={hue1} hue2={hue2} className={className} />;
    case 'creature':
      return <ProceduralCreature name={name} hash={hash} hue1={hue1} hue2={hue2} className={className} />;
    case 'dust':
      return <ProceduralDustUrn name={name} hash={hash} hue1={hue1} hue2={hue2} className={className} />;
    case 'celestial':
      return <ProceduralCelestial name={name} hash={hash} hue1={hue1} hue2={hue2} className={className} />;
    case 'berry':
      return <ProceduralBerry name={name} hash={hash} hue1={hue1} hue2={hue2} className={className} />;
    case 'herb':
    default:
      return <ProceduralHerb name={name} hash={hash} hue1={hue1} hue2={hue2} className={className} />;
  }
}

// ============================================================================
// CANONICAL HANDCRAFTED ARTWORKS (for the 12 primary default ingredients)
// ============================================================================

export function MandrakeRootImage({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="mandrakeAura" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#C5A46D" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rootBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8A6740" />
          <stop offset="50%" stopColor="#5E4327" />
          <stop offset="100%" stopColor="#3B2915" />
        </linearGradient>
        <linearGradient id="leafGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#237A57" />
          <stop offset="100%" stopColor="#A6B99B" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="65" r="50" fill="url(#mandrakeAura)" />
      <path d="M60 40 C55 20, 40 10, 30 18 C35 30, 48 35, 58 42 Z" fill="url(#leafGrad)" />
      <path d="M60 40 C65 18, 80 8, 90 16 C85 28, 72 34, 62 42 Z" fill="url(#leafGrad)" />
      <path d="M60 38 C58 15, 62 5, 60 0 C58 8, 56 22, 60 38 Z" stroke="#36A87A" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="60" cy="52" rx="16" ry="14" fill="url(#rootBody)" />
      <circle cx="55" cy="50" r="2.5" fill="#241609" />
      <circle cx="65" cy="50" r="2.5" fill="#241609" />
      <path d="M57 58 Q60 61 63 58" stroke="#241609" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M54 64 C50 75, 42 85, 38 102 C44 98, 48 88, 56 78 C58 85, 60 96, 62 106 C64 94, 63 82, 64 74 C68 84, 76 96, 82 104 C78 90, 72 80, 66 64 Z" fill="url(#rootBody)" />
      <path d="M40 98 Q32 108 26 112 M46 92 Q42 105 40 114 M78 98 Q86 108 94 112 M62 104 Q60 112 58 116" stroke="#C5A46D" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function DragonScaleImage({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="dragonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E9A23B" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#D65C56" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="scaleMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E9A23B" />
          <stop offset="40%" stopColor="#D65C56" />
          <stop offset="100%" stopColor="#5E1614" />
        </linearGradient>
        <linearGradient id="scaleGoldRidge" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#F3F0E6" />
          <stop offset="50%" stopColor="#C5A46D" />
          <stop offset="100%" stopColor="#8A6740" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#dragonGlow)" />
      <path d="M38 35 C38 35, 48 55, 36 75 C30 60, 30 45, 38 35 Z" fill="#7A1D1A" opacity="0.7" />
      <path d="M82 35 C82 35, 72 55, 84 75 C90 60, 90 45, 82 35 Z" fill="#7A1D1A" opacity="0.7" />
      <path d="M60 16 C76 34, 92 56, 88 82 C84 100, 60 114, 60 114 C60 114, 36 100, 32 82 C28 56, 44 34, 60 16 Z" fill="url(#scaleMain)" stroke="#C5A46D" strokeWidth="1.5" />
      <path d="M60 18 Q62 55 60 108" stroke="url(#scaleGoldRidge)" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 42 Q60 52 70 42 M46 60 Q60 70 74 60 M46 78 Q60 88 74 78" stroke="#F4B760" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

export function MoonlitDewImage({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="dewAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A6B99B" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dropGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#F3F0E6" />
          <stop offset="35%" stopColor="#A6B99B" />
          <stop offset="80%" stopColor="#237A57" />
          <stop offset="100%" stopColor="#10251C" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill="url(#dewAura)" />
      <path d="M46 22 C34 32, 28 50, 34 68 C40 84, 58 94, 76 90 C62 94, 46 86, 42 70 C38 56, 42 38, 54 28 C51 26, 48 24, 46 22 Z" fill="#C5A46D" opacity="0.4" />
      <path d="M60 16 C60 16, 88 64, 88 82 C88 98, 75 110, 60 110 C45 110, 32 98, 32 82 C32 64, 60 16, 60 16 Z" fill="url(#dropGrad)" stroke="#DFCA9F" strokeWidth="1.5" />
      <ellipse cx="48" cy="74" rx="7" ry="14" transform="rotate(-25 48 74)" fill="#FFFFFF" opacity="0.65" />
    </svg>
  );
}

export function PhoenixAshImage({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="phoenixGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EA580C" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#phoenixGlow)" />
      <path d="M38 100 L44 68 C34 60 34 48 42 44 L78 44 C86 48 86 60 76 68 L82 100 Z" fill="#2E1C14" stroke="#C5A46D" strokeWidth="1.5" />
      <polygon points="60,20 64,36 80,40 66,50 70,66 60,56 50,66 54,50 40,40 56,36" fill="#EA580C" stroke="#FDE047" strokeWidth="1" />
      <circle cx="60" cy="40" r="4" fill="#FDE047" />
    </svg>
  );
}

export function GhostPepperImage({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="pepperGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D65C56" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#pepperGlow)" />
      <path d="M60 22 C64 14 74 16 78 12" stroke="#237A57" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52 28 C64 26 72 32 70 42 C68 56 78 72 70 94 C64 108 58 114 58 114 C58 114 50 102 46 84 C42 66 40 50 42 38 C44 30 48 28 52 28 Z" fill="#D65C56" stroke="#C5A46D" strokeWidth="1.2" />
    </svg>
  );
}

export function BatWingsImage({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="batGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#17251D" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#batGlow)" />
      <path d="M60 62 C48 38 28 32 14 42 C16 58 26 70 34 76 C40 82 52 82 60 76 C68 82 80 82 86 76 C94 70 104 58 106 42 C92 32 72 38 60 62 Z" fill="#1C1917" stroke="#C5A46D" strokeWidth="1.5" />
    </svg>
  );
}

export function CrystalShardsImage({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="crystalGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#crystalGlow)" />
      <polygon points="60,16 46,38 52,98 68,98 74,38" fill="#0284C7" stroke="#BAE6FD" strokeWidth="1.2" />
      <polygon points="34,98 44,52 52,60 46,98" fill="#0369A1" stroke="#38BDF8" strokeWidth="0.8" />
      <polygon points="86,98 76,46 68,56 74,98" fill="#075985" stroke="#38BDF8" strokeWidth="0.8" />
    </svg>
  );
}

export function WitchHazelImage({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="hazelGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C5A46D" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#hazelGlow)" />
      <path d="M40 106 Q54 74 72 26" stroke="#8A6740" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 52 Q44 48 38 38 Q52 42 60 52 Z" fill="#237A57" stroke="#A6B99B" strokeWidth="0.8" />
      <path d="M64 46 Q78 40 84 48 Q72 50 64 46 Z" fill="#237A57" stroke="#A6B99B" strokeWidth="0.8" />
      <circle cx="72" cy="26" r="3" fill="#C5A46D" />
    </svg>
  );
}

export function GlowSporeImage({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="sporeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#sporeGlow)" />
      <path d="M52 64 Q50 90 48 102 L72 102 Q70 90 68 64 Z" fill="#F3F0E6" />
      <path d="M20 60 C20 30 40 18 60 18 C80 18 100 30 100 60 Z" fill="#15803D" stroke="#86EFAC" strokeWidth="1.2" />
      <circle cx="60" cy="32" r="4" fill="#BBF7D0" />
      <circle cx="44" cy="44" r="3" fill="#86EFAC" />
      <circle cx="76" cy="44" r="3" fill="#86EFAC" />
    </svg>
  );
}

export function AbyssalPearlImage({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="pearlGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#pearlGlow)" />
      <circle cx="60" cy="60" r="32" fill="#083344" stroke="#C5A46D" strokeWidth="2" />
      <circle cx="60" cy="60" r="28" fill="#06B6D4" opacity="0.8" />
      <ellipse cx="50" cy="48" rx="8" ry="14" transform="rotate(-30 50 48)" fill="#FFFFFF" opacity="0.75" />
    </svg>
  );
}

export function EctoplasmicResinImage({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="resinAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#36A87A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#resinAura)" />
      <rect x="42" y="32" width="36" height="66" rx="10" fill="none" stroke="#C5A46D" strokeWidth="2" />
      <path d="M40 32 L80 32" stroke="#DFCA9F" strokeWidth="3" strokeLinecap="round" />
      <rect x="48" y="22" width="24" height="10" rx="2" fill="#8A6740" />
      <path d="M44 52 Q60 46 76 52 L76 88 C76 93 72 96 68 96 L52 96 C48 96 44 93 44 88 Z" fill="#237A57" />
      <circle cx="56" cy="68" r="4" fill="#F3F0E6" opacity="0.6" />
    </svg>
  );
}

export function StarlightNectarImage({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C5A46D" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#101713" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#starGlow)" />
      <polygon points="60,16 68,46 98,54 72,70 78,102 60,82 42,102 48,70 22,54 52,46" fill="#C5A46D" stroke="#F3F0E6" strokeWidth="1.5" />
      <circle cx="60" cy="58" r="8" fill="#F3F0E6" />
      <ellipse cx="60" cy="58" rx="46" ry="16" transform="rotate(-20 60 58)" fill="none" stroke="#DFCA9F" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}

// ============================================================================
// MASTER ARTWORK RESOLVER
// ============================================================================

/**
 * Universal lookup returning either a bespoke canonical illustration (for the 12 preset items)
 * or a fully unique, procedural SVG illustration for any new or custom item.
 */
export function getIngredientArtwork(name = '', category = '', className = 'w-12 h-12', archetype = '') {
  const n = (name || '').trim().toLowerCase();

  // If user selected a custom archetype explicitly, use the procedural generator directly
  if (archetype && archetype !== 'auto') {
    return <ProceduralIngredientArtwork name={name} category={category} archetype={archetype} className={className} />;
  }

  // Exact canonical match checks for preset items
  if (n === 'mandragora root essence' || n === 'mandrake root' || n === 'mandrake') {
    return <MandrakeRootImage className={className} />;
  }
  if (n === 'dragon scale powder' || n === 'dragon scale') {
    return <DragonScaleImage className={className} />;
  }
  if (n === 'moonlit dewdrops' || n === 'moonlit dew') {
    return <MoonlitDewImage className={className} />;
  }
  if (n === 'phoenix feather ash' || n === 'phoenix ash') {
    return <PhoenixAshImage className={className} />;
  }
  if (n === 'ghost pepper') {
    return <GhostPepperImage className={className} />;
  }
  if (n === 'bat wings') {
    return <BatWingsImage className={className} />;
  }
  if (n === 'crystal shards') {
    return <CrystalShardsImage className={className} />;
  }
  if (n === 'witch hazel') {
    return <WitchHazelImage className={className} />;
  }
  if (n === 'glow-spore mycelium' || n === 'glow spore') {
    return <GlowSporeImage className={className} />;
  }
  if (n === 'abyssal pearl dust' || n === 'abyssal pearl') {
    return <AbyssalPearlImage className={className} />;
  }
  if (n === 'ectoplasmic resin') {
    return <EctoplasmicResinImage className={className} />;
  }
  if (n === 'starlight nectar') {
    return <StarlightNectarImage className={className} />;
  }

  // For any new, custom, or added item: generate a 100% unique procedural SVG!
  return <ProceduralIngredientArtwork name={name} category={category} className={className} />;
}
