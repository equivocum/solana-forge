// Shared color tokens for architecture components
// STAGE: component_theme
// WHY: Single source of truth for both DOM (Tailwind classes) and canvas (hex fills)
// HOW: Extracted from ComponentNode.tsx to satisfy Principle VIII

import type { ComponentCategory } from '../components/architecture/data/components'

export interface CategoryColorTokens {
  bg: string
  border: string
  text: string
  activeBg: string
  activeBorder: string
}

export const CATEGORY_COLORS: Record<ComponentCategory, CategoryColorTokens> = {
  networking: {
    bg: 'bg-cyan-950/60',
    border: 'border-cyan-700/50',
    text: 'text-cyan-300',
    activeBg: 'bg-cyan-900',
    activeBorder: 'border-cyan-400',
  },
  tpu: {
    bg: 'bg-blue-950/60',
    border: 'border-blue-700/50',
    text: 'text-blue-300',
    activeBg: 'bg-blue-900',
    activeBorder: 'border-blue-400',
  },
  tvu: {
    bg: 'bg-purple-950/60',
    border: 'border-purple-700/50',
    text: 'text-purple-300',
    activeBg: 'bg-purple-900',
    activeBorder: 'border-purple-400',
  },
  runtime: {
    bg: 'bg-yellow-950/60',
    border: 'border-yellow-700/50',
    text: 'text-yellow-300',
    activeBg: 'bg-yellow-900',
    activeBorder: 'border-yellow-400',
  },
  consensus: {
    bg: 'bg-green-950/60',
    border: 'border-green-700/50',
    text: 'text-green-300',
    activeBg: 'bg-green-900',
    activeBorder: 'border-green-400',
  },
  storage: {
    bg: 'bg-orange-950/60',
    border: 'border-orange-700/50',
    text: 'text-orange-300',
    activeBg: 'bg-orange-900',
    activeBorder: 'border-orange-400',
  },
  programs: {
    bg: 'bg-pink-950/60',
    border: 'border-pink-700/50',
    text: 'text-pink-300',
    activeBg: 'bg-pink-900',
    activeBorder: 'border-pink-400',
  },
}

export const SUB_CATEGORY_COLORS: Record<ComponentCategory, string> = {
  networking:
    'text-cyan-300 border-cyan-600 bg-cyan-950/90 hover:bg-cyan-900 hover:border-cyan-400',
  tpu: 'text-blue-300 border-blue-600 bg-blue-950/90 hover:bg-blue-900 hover:border-blue-400',
  tvu: 'text-purple-300 border-purple-600 bg-purple-950/90 hover:bg-purple-900 hover:border-purple-400',
  runtime:
    'text-yellow-300 border-yellow-600 bg-yellow-950/90 hover:bg-yellow-900 hover:border-yellow-400',
  consensus:
    'text-green-300 border-green-600 bg-green-950/90 hover:bg-green-900 hover:border-green-400',
  storage:
    'text-orange-300 border-orange-600 bg-orange-950/90 hover:bg-orange-900 hover:border-orange-400',
  programs:
    'text-pink-300 border-pink-600 bg-pink-950/90 hover:bg-pink-900 hover:border-pink-400',
}

// Hex color twins for canvas fills (approximated from Tailwind palette)
export interface CategoryHexTokens {
  fill: string
  glow: string
  label: string
}

export const CATEGORY_HEX: Record<ComponentCategory, CategoryHexTokens> = {
  networking: { fill: '#164e63', glow: '#0e7490', label: '#67e8f9' },
  tpu: { fill: '#1e3a5f', glow: '#1d4ed8', label: '#93c5fd' },
  tvu: { fill: '#2e1065', glow: '#7c3aed', label: '#c4b5fd' },
  runtime: { fill: '#422006', glow: '#ca8a04', label: '#fde047' },
  consensus: { fill: '#052e16', glow: '#15803d', label: '#86efac' },
  storage: { fill: '#431407', glow: '#ea580c', label: '#fdba74' },
  programs: { fill: '#4c0519', glow: '#db2777', label: '#f9a8d4' },
}

