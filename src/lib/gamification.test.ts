import { describe, it, expect } from 'vitest';
import {
  xpForLevel,
  cumulativeXpForLevel,
  calculateLevel,
  getLevelBadge,
  formatXp,
  formatCoins,
  XP_PER_LEVEL_BASE,
  XP_MULTIPLIER,
  MAX_LEVEL,
} from './gamification';

// ================================================================
// xpForLevel
// ================================================================

describe('xpForLevel', () => {
  it('returns base XP for level 1', () => {
    expect(xpForLevel(1)).toBe(XP_PER_LEVEL_BASE); // 1000
  });

  it('scales by multiplier for level 2', () => {
    expect(xpForLevel(2)).toBe(Math.floor(XP_PER_LEVEL_BASE * XP_MULTIPLIER)); // 1200
  });

  it('scales exponentially for level 3', () => {
    expect(xpForLevel(3)).toBe(
      Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_MULTIPLIER, 2)),
    ); // 1440
  });

  it('returns base for level < 1', () => {
    expect(xpForLevel(0)).toBe(XP_PER_LEVEL_BASE);
    expect(xpForLevel(-5)).toBe(XP_PER_LEVEL_BASE);
  });
});

// ================================================================
// cumulativeXpForLevel
// ================================================================

describe('cumulativeXpForLevel', () => {
  it('returns 0 for level 1 (start of the game)', () => {
    expect(cumulativeXpForLevel(1)).toBe(0);
  });

  it('returns 1000 for level 2', () => {
    expect(cumulativeXpForLevel(2)).toBe(1000);
  });

  it('returns 2200 for level 3 (1000 + 1200)', () => {
    expect(cumulativeXpForLevel(3)).toBe(2200);
  });

  it('returns 3640 for level 4 (1000 + 1200 + 1440)', () => {
    expect(cumulativeXpForLevel(4)).toBe(3640);
  });
});

// ================================================================
// calculateLevel
// ================================================================

describe('calculateLevel', () => {
  it('returns level 1 at 0 XP', () => {
    const info = calculateLevel(0);
    expect(info.level).toBe(1);
    expect(info.progress).toBe(0);
    expect(info.currentLevelXp).toBe(0);
    expect(info.nextLevelXp).toBe(1000);
  });

  it('returns level 1 at 500 XP with 50% progress', () => {
    const info = calculateLevel(500);
    expect(info.level).toBe(1);
    expect(info.progress).toBeCloseTo(0.5);
    expect(info.currentLevelXp).toBe(500);
  });

  it('returns level 2 at exactly 1000 XP', () => {
    const info = calculateLevel(1000);
    expect(info.level).toBe(2);
    expect(info.progress).toBe(0);
    expect(info.currentLevelXp).toBe(0);
  });

  it('returns level 3 at exactly 2200 XP', () => {
    const info = calculateLevel(2200);
    expect(info.level).toBe(3);
    expect(info.progress).toBe(0);
  });

  it('calculates mid-level progress correctly', () => {
    // Level 3 starts at 2200, needs 1440 to reach level 4
    const info = calculateLevel(2200 + 720);
    expect(info.level).toBe(3);
    expect(info.progress).toBeCloseTo(0.5);
    expect(info.currentLevelXp).toBe(720);
    expect(info.nextLevelXp).toBe(1440);
  });

  it('handles negative XP gracefully', () => {
    const info = calculateLevel(-100);
    expect(info.level).toBe(1);
    expect(info.progress).toBe(0);
  });

  it('caps at MAX_LEVEL for an astronomically high XP', () => {
    // The exponential curve grows very fast; we need a truly huge number
    const info = calculateLevel(Number.MAX_SAFE_INTEGER);
    expect(info.level).toBe(MAX_LEVEL);
    expect(info.progress).toBe(1);
  });

  it('returns a high level for 1 billion XP', () => {
    const info = calculateLevel(1_000_000_000);
    expect(info.level).toBeGreaterThan(60);
    expect(info.progress).toBeGreaterThan(0);
  });

  it('totalXpForCurrentLevel and totalXpForNextLevel are consistent', () => {
    const info = calculateLevel(1500);
    expect(info.level).toBe(2);
    expect(info.totalXpForCurrentLevel).toBe(1000);
    expect(info.totalXpForNextLevel).toBe(1000 + 1200);
  });
});

// ================================================================
// getLevelBadge
// ================================================================

describe('getLevelBadge', () => {
  it('returns Novice for levels 1-5', () => {
    expect(getLevelBadge(1).title).toBe('Novice');
    expect(getLevelBadge(5).title).toBe('Novice');
  });

  it('returns Apprentice for levels 6-10', () => {
    expect(getLevelBadge(6).title).toBe('Apprentice');
    expect(getLevelBadge(10).title).toBe('Apprentice');
  });

  it('returns Journeyman for levels 11-15', () => {
    expect(getLevelBadge(11).title).toBe('Journeyman');
  });

  it('returns Expert for levels 16-20', () => {
    expect(getLevelBadge(20).title).toBe('Expert');
  });

  it('returns Master for levels 21-30', () => {
    expect(getLevelBadge(25).title).toBe('Master');
  });

  it('returns Grandmaster for levels 31-50', () => {
    expect(getLevelBadge(50).title).toBe('Grandmaster');
  });

  it('returns Legend for levels 51-75', () => {
    expect(getLevelBadge(75).title).toBe('Legend');
  });

  it('returns Phoenix for levels 76+', () => {
    expect(getLevelBadge(100).title).toBe('Phoenix');
  });

  it('includes emoji', () => {
    expect(getLevelBadge(1).emoji).toBe('🌱');
    expect(getLevelBadge(100).emoji).toBe('🔮');
  });
});

// ================================================================
// formatXp
// ================================================================

describe('formatXp', () => {
  it('shows raw number for < 1000', () => {
    expect(formatXp(0)).toBe('0');
    expect(formatXp(999)).toBe('999');
  });

  it('shows one decimal K for 1000-9999', () => {
    expect(formatXp(1000)).toBe('1.0K');
    expect(formatXp(2500)).toBe('2.5K');
  });

  it('shows integer K for 10000+', () => {
    expect(formatXp(12500)).toBe('12K');
    expect(formatXp(99999)).toBe('99K');
  });

  it('shows M for 1M+', () => {
    expect(formatXp(1_500_000)).toBe('1.5M');
  });
});

// ================================================================
// formatCoins
// ================================================================

describe('formatCoins', () => {
  it('formats with commas', () => {
    expect(formatCoins(0)).toBe('0');
    expect(formatCoins(1234)).toBe('1,234');
    expect(formatCoins(50000)).toBe('50,000');
  });
});
