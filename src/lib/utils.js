import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  Flower2,
  Crown,
  Star,
  Heart,
  Gem,
  Sparkles,
  Sun,
  Moon,
  Leaf,
  Feather,
  Palette,
  Droplets,
} from 'lucide-react';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Profile icon options — solid Lucide icons
export const PROFILE_ICONS = [
  { key: 'Flower2',   Icon: Flower2   },
  { key: 'Crown',     Icon: Crown     },
  { key: 'Star',      Icon: Star      },
  { key: 'Heart',     Icon: Heart     },
  { key: 'Gem',       Icon: Gem       },
  { key: 'Sparkles',  Icon: Sparkles  },
  { key: 'Sun',       Icon: Sun       },
  { key: 'Moon',      Icon: Moon      },
  { key: 'Leaf',      Icon: Leaf      },
  { key: 'Feather',   Icon: Feather   },
  { key: 'Palette',   Icon: Palette   },
  { key: 'Droplets',  Icon: Droplets  },
];

const ICON_MAP = Object.fromEntries(PROFILE_ICONS.map(({ key, Icon }) => [key, Icon]));

// Legacy emoji → icon key mapping for backward compat
const EMOJI_TO_KEY = {
  '🌸': 'Flower2', '🌿': 'Leaf', '👑': 'Crown', '✨': 'Sparkles',
  '🎨': 'Palette', '💖': 'Heart', '🌙': 'Moon', '🦋': 'Feather',
  '💅': 'Sparkles', '🌺': 'Flower2', '🍀': 'Leaf', '⭐': 'Star',
  '💎': 'Gem', '☀️': 'Sun', '⚡': 'Sparkles',
};

/** Resolve any stored value (icon key, legacy Lucide name, or emoji) to an icon key */
export function resolveIconKey(name) {
  if (!name) return 'Flower2';
  if (ICON_MAP[name]) return name;
  if (EMOJI_TO_KEY[name]) return EMOJI_TO_KEY[name];
  // Legacy Lucide names that match directly
  const legacyMap = {
    Flower: 'Flower2', User: 'Flower2', Scissors: 'Feather',
    Smile: 'Star', Zap: 'Sparkles',
  };
  return legacyMap[name] || 'Flower2';
}

/** Renders a profile icon as a solid Lucide icon */
export function ProfileIcon({ name, className = 'w-5 h-5', style }) {
  const key = resolveIconKey(name);
  const Icon = ICON_MAP[key] || Flower2;
  return <Icon className={className} style={style} />;
}

// Keep resolveEmoji as an alias that returns the icon key (for any legacy callers)
export function resolveEmoji(name) {
  return resolveIconKey(name);
}

// Keep getProfileIcon for legacy callers
export function getProfileIcon(name) {
  const key = resolveIconKey(name);
  return ICON_MAP[key] || Flower2;
}

export const DESIGN_STYLES = [
  'Arabic',
  'Indian',
  'Dubai',
  'Pakistani',
  'Doha',
  'Floral',
  'Indo Dubai',
  'Patch Work',
  'Bridal Mehndi',
];

export const OCCASIONS = [
  'Wedding',
  'Engagement',
  'Mehndi Night',
  'Eid',
  'Diwali',
  'Baby Shower',
  'Birthday',
  'Party',
  'Other',
];
