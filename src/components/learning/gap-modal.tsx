'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Users,
  Play,
  FileText,
  Code,
  Dumbbell,
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Star,
  Rocket,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import {
  generateLearningPlan,
  type LearningPlan,
  type LearningStepType,
} from '@/actions/ai-learning';
import { findMentors, type MentorProfile } from '@/actions/mentors';
import { useToast } from '@/hooks/use-toast';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

interface GapModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly skillName: string;
  readonly skillId: string;
  readonly currentUserId: string;
  readonly currentLevel?: number | null;
  readonly requiredLevel?: number;
}

// ----------------------------------------------------------------
// Step type icons / colors
// ----------------------------------------------------------------

const STEP_TYPE_META: Record<
  LearningStepType,
  { icon: typeof Play; color: string; label: string }
> = {
  video: { icon: Play, color: 'bg-red-50 text-red-600', label: 'Video' },
  article: { icon: FileText, color: 'bg-blue-50 text-blue-600', label: 'Article' },
  project: { icon: Code, color: 'bg-emerald-50 text-emerald-600', label: 'Project' },
  exercise: { icon: Dumbbell, color: 'bg-purple-50 text-purple-600', label: 'Exercise' },
  course: { icon: GraduationCap, color: 'bg-amber-50 text-amber-600', label: 'Course' },
};

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

export default function GapModal({
  open,
  onOpenChange,
  skillName,
  skillId,
  currentUserId,
  currentLevel,
  requiredLevel,
}: GapModalProps) {
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [mentorError, setMentorError] = useState<string | null>(null);
  const [startedSteps, setStartedSteps] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Fetch learning plan + mentors when dialog opens
  useEffect(() => {
    if (!open) return;

    // Reset state
    setLearningPlan(null);
    setMentors([]);
    setPlanError(null);
    setMentorError(null);
    setStartedSteps(new Set());

    // Fetch learning plan
    setLoadingPlan(true);
    generateLearningPlan(skillName)
      .then((res) => {
        if (res.success && res.data) {
          setLearningPlan(res.data);
        } else {
          setPlanError(res.error ?? 'Failed to generate plan.');
        }
      })
      .catch(() => setPlanError('Network error.'))
      .finally(() => setLoadingPlan(false));

    // Fetch mentors
    setLoadingMentors(true);
    findMentors(skillId, currentUserId)
      .then((res) => {
        if (res.success) {
          setMentors(res.mentors);
        } else {
          setMentorError(res.error ?? 'Failed to find mentors.');
        }
      })
      .catch(() => setMentorError('Network error.'))
      .finally(() => setLoadingMentors(false));
  }, [open, skillName, skillId, currentUserId]);

  const handleMarkStarted = useCallback(
    (stepIndex: number) => {
      setStartedSteps((prev) => new Set(prev).add(stepIndex));
      toast({
        title: '🚀 Step started!',
        description: 'Great progress — keep going!',
      });
    },
    [toast],
  );

  const handleConnect = useCallback(
    (mentor: MentorProfile) => {
      if (mentor.email) {
        window.open(
          `mailto:${mentor.email}?subject=Mentorship%20Request%20—%20${encodeURIComponent(skillName)}&body=Hi%20${encodeURIComponent(mentor.displayName)}%2C%0A%0AI%20noticed%20you%20are%20an%20expert%20in%20${encodeURIComponent(skillName)}.%20I%20would%20love%20to%20learn%20from%20you!`,
          '_blank',
        );
      }
      toast({
        title: '📬 Request sent!',
        description: `Connection request sent to ${mentor.displayName}.`,
      });
    },
    [skillName, toast],
  );

  const levelText =
    currentLevel != null && requiredLevel
      ? `Level ${currentLevel} → ${requiredLevel}`
      : 'Missing skill';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Close the Gap: {skillName}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {levelText}
            </Badge>
            <span>You are 3 steps away from mastering this.</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="learn" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="learn" className="gap-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              Learning Path
            </TabsTrigger>
            <TabsTrigger value="mentors" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" />
              Find a Mentor
            </TabsTrigger>
          </TabsList>

          {/* ============================================== */}
          {/* TAB 1: LEARNING PATH                          */}
          {/* ============================================== */}
          <TabsContent value="learn" className="mt-4">
            {loadingPlan && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="mt-3 text-xs text-muted-foreground">
                  AI is crafting your learning plan...
                </p>
              </div>
            )}

            {planError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {planError}
              </div>
            )}

            {learningPlan && (
              <div className="space-y-1">
                {/* Estimated total */}
                <p className="mb-4 text-xs text-muted-foreground">
                  Estimated time:{' '}
                  <strong className="text-foreground">
                    {learningPlan.estimatedTotal}
                  </strong>
                </p>

                {/* Timeline */}
                <div className="relative space-y-4 pl-6">
                  {/* Vertical line */}
                  <div className="absolute left-[11px] top-2 h-[calc(100%-16px)] w-px bg-border" />

                  <AnimatePresence>
                    {learningPlan.steps.map((step, i) => {
                      const meta = STEP_TYPE_META[step.type] ?? STEP_TYPE_META.article;
                      const Icon = meta.icon;
                      const isStarted = startedSteps.has(i);

                      return (
                        <motion.div
                          key={step.title}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.15 }}
                          className="relative"
                        >
                          {/* Timeline dot */}
                          <div
                            className={`absolute -left-6 top-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 ${
                              isStarted
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-border bg-background'
                            }`}
                          >
                            {isStarted ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <span className="text-[9px] font-bold text-muted-foreground">
                                {i + 1}
                              </span>
                            )}
                          </div>

                          {/* Step card */}
                          <div className="rounded-lg border bg-background p-3.5">
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.color}`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold leading-tight">
                                    {step.title}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="shrink-0 text-[9px]"
                                  >
                                    {step.duration}
                                  </Badge>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {step.description}
                                </p>
                                <div className="mt-2">
                                  {isStarted ? (
                                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                      <CheckCircle2 className="h-3 w-3" />
                                      In Progress
                                    </span>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-[11px]"
                                      onClick={() => handleMarkStarted(i)}
                                    >
                                      Mark as Started
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ============================================== */}
          {/* TAB 2: FIND A MENTOR                          */}
          {/* ============================================== */}
          <TabsContent value="mentors" className="mt-4">
            {loadingMentors && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="mt-3 text-xs text-muted-foreground">
                  Finding experts in your organization...
                </p>
              </div>
            )}

            {mentorError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {mentorError}
              </div>
            )}

            {!loadingMentors && !mentorError && mentors.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium">No mentors found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  No colleagues with expert-level {skillName} skills yet.
                </p>
              </div>
            )}

            {mentors.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  These colleagues are experts in <strong>{skillName}</strong> and can help you grow.
                </p>

                <AnimatePresence>
                  {mentors.map((mentor, i) => {
                    const initials = mentor.displayName
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <motion.div
                        key={mentor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="flex items-center gap-3 rounded-lg border bg-background p-3.5"
                      >
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                          {mentor.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={mentor.avatarUrl}
                              alt={mentor.displayName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                              {initials}
                            </AvatarFallback>
                          )}
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">
                            {mentor.displayName}
                          </p>
                          {mentor.roleTitle && (
                            <p className="text-[11px] text-muted-foreground">
                              {mentor.roleTitle}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-1">
                            {Array.from({ length: mentor.skillLevel }).map(
                              (_, si) => (
                                <Star
                                  key={`star-${mentor.id}-${si}`}
                                  className="h-3 w-3 fill-amber-400 text-amber-400"
                                />
                              ),
                            )}
                            <span className="ml-1 text-[10px] text-muted-foreground">
                              Lvl {mentor.skillLevel}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 gap-1.5 text-xs"
                          onClick={() => handleConnect(mentor)}
                        >
                          <Mail className="h-3 w-3" />
                          Connect
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
