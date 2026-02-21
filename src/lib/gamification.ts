// ============================================================
// FnxLevelUp — Gamification Math
// ============================================================
// RPG-style experience / leveling system.
// The XP curve scales exponentially so higher levels feel harder.
// ============================================================

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------

/** XP required for Level 1 → Level 2 */
export const XP_PER_LEVEL_BASE = 1000;

/** Each level requires this multiple more XP than the previous */
export const XP_MULTIPLIER = 1.2;

/** Maximum supported level (safety cap) */
export const MAX_LEVEL = 100;

// ----------------------------------------------------------------
// Level calculation
// ----------------------------------------------------------------

export interface LevelInfo {
  /** Current level (1-based) */
  level: number;
  /** XP earned towards the next level (0 .. nextLevelXp-1) */
  currentLevelXp: number;
  /** XP required to go from current level to next */
  nextLevelXp: number;
  /** Progress toward next level as 0–1 fraction */
  progress: number;
  /** Total XP needed to reach the start of the current level */
  totalXpForCurrentLevel: number;
  /** Total XP needed to reach the start of the next level */
  totalXpForNextLevel: number;
}

/**
 * XP required to advance from a given level to the next.
 *
 * @example xpForLevel(1) → 1000  (need 1000 to go from Lv1 → Lv2)
 * @example xpForLevel(2) → 1200
 * @example xpForLevel(3) → 1440
 */
export function xpForLevel(level: number): number {
  if (level < 1) return XP_PER_LEVEL_BASE;
  return Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_MULTIPLIER, level - 1));
}

/**
 * Total cumulative XP required to reach a given level.
 * Level 1 starts at 0 XP.
 *
 * @example cumulativeXpForLevel(1) → 0
 * @example cumulativeXpForLevel(2) → 1000
 * @example cumulativeXpForLevel(3) → 2200
 */
export function cumulativeXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

/**
 * Given a total XP amount, calculate the player's level, progress,
 * and XP thresholds.
 *
 * @example
 * calculateLevel(0)    → { level: 1, progress: 0, ... }
 * calculateLevel(500)  → { level: 1, progress: 0.5, ... }
 * calculateLevel(1000) → { level: 2, progress: 0, ... }
 * calculateLevel(2500) → { level: 3, progress: 0.208..., ... }
 */
export function calculateLevel(totalXp: number): LevelInfo {
  const xp = Math.max(0, totalXp);
  let level = 1;
  let accumulated = 0;

  while (level < MAX_LEVEL) {
    const needed = xpForLevel(level);
    if (accumulated + needed > xp) {
      // Player is within this level
      const currentLevelXp = xp - accumulated;
      const progress = needed > 0 ? currentLevelXp / needed : 0;
      return {
        level,
        currentLevelXp,
        nextLevelXp: needed,
        progress: Math.min(progress, 1),
        totalXpForCurrentLevel: accumulated,
        totalXpForNextLevel: accumulated + needed,
      };
    }
    accumulated += needed;
    level++;
  }

  // Maxed out
  return {
    level: MAX_LEVEL,
    currentLevelXp: 0,
    nextLevelXp: 0,
    progress: 1,
    totalXpForCurrentLevel: accumulated,
    totalXpForNextLevel: accumulated,
  };
}

// ----------------------------------------------------------------
// Level badges / titles
// ----------------------------------------------------------------

const LEVEL_BADGES: readonly { maxLevel: number; title: string; emoji: string }[] = [
  { maxLevel: 5, title: 'Novice', emoji: '🌱' },
  { maxLevel: 10, title: 'Apprentice', emoji: '⚡' },
  { maxLevel: 15, title: 'Journeyman', emoji: '🔥' },
  { maxLevel: 20, title: 'Expert', emoji: '💎' },
  { maxLevel: 30, title: 'Master', emoji: '🏆' },
  { maxLevel: 50, title: 'Grandmaster', emoji: '👑' },
  { maxLevel: 75, title: 'Legend', emoji: '🌟' },
  { maxLevel: MAX_LEVEL, title: 'Phoenix', emoji: '🔮' },
];

export interface LevelBadge {
  title: string;
  emoji: string;
}

/**
 * Get the badge/title for a given level.
 *
 * @example getLevelBadge(1)  → { title: "Novice", emoji: "🌱" }
 * @example getLevelBadge(7)  → { title: "Apprentice", emoji: "⚡" }
 * @example getLevelBadge(50) → { title: "Grandmaster", emoji: "👑" }
 */
export function getLevelBadge(level: number): LevelBadge {
  for (const badge of LEVEL_BADGES) {
    if (level <= badge.maxLevel) {
      return { title: badge.title, emoji: badge.emoji };
    }
  }
  return { title: 'Phoenix', emoji: '🔮' };
}

// ----------------------------------------------------------------
// Display helpers
// ----------------------------------------------------------------

/**
 * Format an XP number for display (e.g., 12500 → "12.5K").
 */
export function formatXp(xp: number): string {
  if (xp < 1000) return `${xp}`;
  if (xp < 10_000) return `${(xp / 1000).toFixed(1)}K`;
  if (xp < 1_000_000) return `${Math.floor(xp / 1000)}K`;
  return `${(xp / 1_000_000).toFixed(1)}M`;
}

/**
 * Format coins for display (e.g., 5000 → "5,000").
 */
export function formatCoins(coins: number): string {
  return coins.toLocaleString('en-US');
}
