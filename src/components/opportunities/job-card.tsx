'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MatchedOpportunity, MatchedSkill } from '@/actions/matching';
import GapModal from '@/components/learning/gap-modal';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

interface JobCardProps {
  readonly opportunity: MatchedOpportunity;
  readonly index?: number;
}

// Mock user ID (will come from auth context later)
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

// ----------------------------------------------------------------
// Match score ring
// ----------------------------------------------------------------

function MatchScoreRing({
  score,
  size = 56,
}: {
  readonly score: number;
  readonly size?: number;
}) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80
      ? 'text-emerald-500'
      : score >= 50
        ? 'text-amber-500'
        : 'text-red-500';

  const bgColor =
    score >= 80
      ? 'stroke-emerald-100'
      : score >= 50
        ? 'stroke-amber-100'
        : 'stroke-red-100';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={4}
          className={bgColor}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          className={color}
          stroke="currentColor"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <span className={`absolute text-xs font-bold ${color}`}>{score}%</span>
    </div>
  );
}

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

export default function JobCard({ opportunity, index = 0 }: JobCardProps) {
  const { title, description, location, matchScore, gapSkills, missingSkills, jobType } =
    opportunity;

  // State for gap modal
  const [gapModalOpen, setGapModalOpen] = useState(false);
  const [selectedGapSkill, setSelectedGapSkill] = useState<MatchedSkill | null>(null);

  // First gap/missing skill to suggest
  const topSuggestion = gapSkills[0] ?? missingSkills[0];

  const handleGapClick = (skill: MatchedSkill) => {
    setSelectedGapSkill(skill);
    setGapModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <Card className="group h-full transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col gap-4 p-5">
            {/* Top: Score + Title */}
            <div className="flex items-start gap-4">
              <MatchScoreRing score={matchScore} />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
                  {title}
                </h3>
                {description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2">
              {location && (
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <MapPin className="h-3 w-3" />
                  {location}
                </Badge>
              )}
              {jobType && (
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <Briefcase className="h-3 w-3" />
                  {formatJobType(jobType)}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`gap-1 text-[10px] ${
                  matchScore >= 80
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : matchScore >= 50
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                <TrendingUp className="h-3 w-3" />
                {matchScore >= 80 ? 'Strong Match' : matchScore >= 50 ? 'Good Fit' : 'Stretch Role'}
              </Badge>
            </div>

            {/* Gap suggestion — clickable! */}
            {topSuggestion && matchScore < 100 && (
              <button
                type="button"
                onClick={() => handleGapClick(topSuggestion)}
                className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-left transition-colors hover:bg-amber-100/80"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span className="flex-1 text-[11px] text-amber-700">
                  {topSuggestion.status === 'missing'
                    ? `Learn ${topSuggestion.skillName} to increase your match`
                    : `Level up ${topSuggestion.skillName} (${topSuggestion.userLevel}→${topSuggestion.requiredLevel}) to boost fit`}
                </span>
                <Sparkles className="h-3 w-3 shrink-0 text-amber-500" />
              </button>
            )}

            {/* Additional gaps (show up to 2 more) */}
            {(gapSkills.length + missingSkills.length) > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {[...gapSkills, ...missingSkills]
                  .filter((s) => s.skillId !== topSuggestion?.skillId)
                  .slice(0, 2)
                  .map((skill) => (
                    <button
                      key={skill.skillId}
                      type="button"
                      onClick={() => handleGapClick(skill)}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                        skill.status === 'partial'
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {skill.skillName}
                      {skill.status === 'partial'
                        ? ` (${skill.userLevel}→${skill.requiredLevel})`
                        : ' ✕'}
                    </button>
                  ))}
              </div>
            )}

            {/* Action */}
            <Button variant="ghost" size="sm" className="mt-auto w-full justify-between text-xs">
              View Details
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gap Modal */}
      {selectedGapSkill && (
        <GapModal
          open={gapModalOpen}
          onOpenChange={setGapModalOpen}
          skillName={selectedGapSkill.skillName}
          skillId={selectedGapSkill.skillId}
          currentUserId={MOCK_USER_ID}
          currentLevel={selectedGapSkill.userLevel}
          requiredLevel={selectedGapSkill.requiredLevel}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function formatJobType(type: string): string {
  return type
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
