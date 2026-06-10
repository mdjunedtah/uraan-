// Shared per-category icon and colour theme used by the homepage
// category grid and the mobile navigation menu.

import {
  Crown, Sparkles, Diamond, Gem, Flower2, Link2,
  Sparkle, Circle, CircleDot, Watch, Hexagon, Heart,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, typeof Crown> = {
  gold: Crown,
  silver: Sparkles,
  diamond: Diamond,
  gems: Gem,
  rudraksh: Flower2,
  necklaces: Link2,
  earrings: Sparkle,
  rings: Circle,
  bangles: CircleDot,
  bracelets: Watch,
  pendants: Hexagon,
  bridal: Heart,
};

export const CATEGORY_THEME: Record<string, { bg: string; text: string }> = {
  gold: { bg: '#FBF1DD', text: '#A6790C' },
  silver: { bg: '#F0F1F3', text: '#6B7280' },
  diamond: { bg: '#E5F0FB', text: '#3D6FA8' },
  gems: { bg: '#F1E9FB', text: '#8856D6' },
  rudraksh: { bg: '#FBE6D8', text: '#BD6B36' },
  necklaces: { bg: '#E3F5EC', text: '#3E9C73' },
  earrings: { bg: '#FCE7F0', text: '#C24A82' },
  rings: { bg: '#FBF3D2', text: '#C99A1C' },
  bangles: { bg: '#E3EEFB', text: '#3D6FCB' },
  bracelets: { bg: '#FCE9DA', text: '#D4773A' },
  pendants: { bg: '#F0E7FB', text: '#9356D9' },
  bridal: { bg: '#E0F5EE', text: '#3CA088' },
};

// A distinct, category-appropriate product photo for each card in the
// homepage "Shop By Category" grid (mirrors the per-category imagery in
// the reference design — gold set, diamond ring, gemstone, etc.).
export const CATEGORY_IMAGES: Record<string, string> = {
  gold: '/images/gallery/necklace-1.jpg',
  silver: '/images/gallery/necklace-2.jpg',
  diamond: '/images/gallery/ring-5.jpg',
  gems: '/images/gallery/ring-2.jpg',
  rudraksh: '/images/gallery/necklace-7.jpg',
  necklaces: '/images/gallery/necklace-4.jpg',
  earrings: '/images/gallery/earrings-4.jpg',
  rings: '/images/gallery/ring-1.jpg',
  bangles: '/images/gallery/bracelet-3.jpg',
  bracelets: '/images/gallery/bracelet-1.jpg',
  pendants: '/images/gallery/necklace-6.jpg',
  bridal: '/images/gallery/necklace-8.jpg',
};
