'use client';

import { useState, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import {
  Zap,
  Clock,
  Coins,
  Heart,
  X,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { MatchedOpportunity } from '@/actions/matching';
import { useToast } from '@/hooks/use-toast';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

interface GigSwiperProps {
  readonly gigs: MatchedOpportunity[];
}

// ----------------------------------------------------------------
// Threshold constants
// ----------------------------------------------------------------

const SWIPE_THRESHOLD = 120;
const ROTATION_FACTOR = 15;

// ----------------------------------------------------------------
// Swipeable Card
// ----------------------------------------------------------------

function SwipeableGigCard({
  gig,
  onSwipe,
  isTop,
}: {
  readonly gig: MatchedOpportunity;
  readonly onSwipe: (direction: 'left' | 'right') => void;
  readonly isTop: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-ROTATION_FACTOR, 0, ROTATION_FACTOR]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0.5, 1, 1, 1, 0.5]);

  // Overlay indicators
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.x > SWIPE_THRESHOLD) {
        onSwipe('right');
      } else if (info.offset.x < -SWIPE_THRESHOLD) {
        onSwipe('left');
      }
    },
    [onSwipe],
  );

  const matchColor =
    gig.matchScore >= 80
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : gig.matchScore >= 50
        ? 'text-amber-600 bg-amber-50 border-amber-200'
        : 'text-red-600 bg-red-50 border-red-200';

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 0.6,
        zIndex: isTop ? 10 : 5,
        scale: isTop ? 1 : 0.95,
        cursor: isTop ? 'grab' : 'default',
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={isTop ? handleDragEnd : undefined}
      whileDrag={{ cursor: 'grabbing' }}
      initial={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.6 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.6 }}
      exit={{
        x: 300,
        opacity: 0,
        rotate: 15,
        transition: { duration: 0.3 },
      }}
    >
      <Card className="h-full overflow-hidden border-2 shadow-lg">
        <CardContent className="relative flex h-full flex-col p-6">
          {/* Swipe indicators (visible on drag) */}
          {isTop && (
            <>
              <motion.div
                className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-1 rounded-lg border-2 border-emerald-500 bg-emerald-50 px-3 py-1.5"
                style={{ opacity: likeOpacity }}
              >
                <Heart className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-600">
                  Interested
                </span>
              </motion.div>
              <motion.div
                className="pointer-events-none absolute right-4 top-4 z-20 flex items-center gap-1 rounded-lg border-2 border-red-500 bg-red-50 px-3 py-1.5"
                style={{ opacity: nopeOpacity }}
              >
                <X className="h-4 w-4 text-red-500" />
                <span className="text-sm font-bold text-red-600">
                  Not Now
                </span>
              </motion.div>
            </>
          )}

          {/* Match badge */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`gap-1 ${matchColor}`}>
              <Sparkles className="h-3 w-3" />
              {gig.matchScore}% Match
            </Badge>
            {gig.department && (
              <span className="text-[10px] text-muted-foreground">
                {gig.department}
              </span>
            )}
          </div>

          {/* Title & description */}
          <div className="mt-4 flex-1">
            <h3 className="text-lg font-bold leading-tight">{gig.title}</h3>
            {gig.description && (
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {gig.description}
              </p>
            )}
          </div>

          {/* Reward badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {gig.xpReward && gig.xpReward > 0 && (
              <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                <Zap className="h-3 w-3" />
                {gig.xpReward} XP
              </Badge>
            )}
            {gig.coinReward && gig.coinReward > 0 && (
              <Badge className="gap-1 bg-amber-50 text-amber-700 hover:bg-amber-100">
                <Coins className="h-3 w-3" />
                {gig.coinReward} Coins
              </Badge>
            )}
            {gig.commitmentHours && (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                ~{gig.commitmentHours}h/week
              </Badge>
            )}
          </div>

          {/* Skills */}
          {gig.matchedSkills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {gig.matchedSkills.map((s) => (
                <span
                  key={s.skillId}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                    s.status === 'match'
                      ? 'bg-emerald-50 text-emerald-700'
                      : s.status === 'partial'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'
                  }`}
                >
                  {s.skillName}
                  {s.status === 'partial' ? ` (${s.userLevel}/${s.requiredLevel})` : ''}
                  {s.status === 'missing' ? ' ✕' : ''}
                </span>
              ))}
            </div>
          )}

          {/* Swipe hint (only for top card) */}
          {isTop && (
            <p className="mt-4 text-center text-[10px] text-muted-foreground">
              ← Swipe left to skip • Swipe right to save →
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ----------------------------------------------------------------
// Swiper
// ----------------------------------------------------------------

export default function GigSwiper({ gigs: initialGigs }: GigSwiperProps) {
  const [stack, setStack] = useState(initialGigs);
  const { toast } = useToast();

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const swiped = stack[0];
      if (!swiped) return;

      if (direction === 'right') {
        toast({
          title: '💜 Saved!',
          description: `"${swiped.title}" added to your bookmarks.`,
        });
      }

      setStack((prev) => prev.slice(1));
    },
    [stack, toast],
  );

  const handleButtonSwipe = useCallback(
    (direction: 'left' | 'right') => {
      handleSwipe(direction);
    },
    [handleSwipe],
  );

  // Empty state
  if (stack.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center"
      >
        <Sparkles className="h-10 w-10 text-muted-foreground/40" />
        <h3 className="mt-4 text-sm font-semibold">All caught up!</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Check back later for new gigs.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Card stack */}
      <div className="relative h-[380px] w-full max-w-sm">
        {/* Show top 2 cards for depth effect */}
        {stack.slice(0, 2).reverse().map((gig, reverseIdx) => {
          const isTop = reverseIdx === stack.slice(0, 2).length - 1;
          return (
            <SwipeableGigCard
              key={gig.id}
              gig={gig}
              onSwipe={handleSwipe}
              isTop={isTop}
            />
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-2 border-red-200 text-red-500 shadow-sm transition-all hover:border-red-400 hover:bg-red-50 hover:text-red-600"
          onClick={() => handleButtonSwipe('left')}
        >
          <X className="h-5 w-5" />
        </Button>
        <span className="text-xs text-muted-foreground">
          {stack.length} remaining
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-2 border-emerald-200 text-emerald-500 shadow-sm transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600"
          onClick={() => handleButtonSwipe('right')}
        >
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
