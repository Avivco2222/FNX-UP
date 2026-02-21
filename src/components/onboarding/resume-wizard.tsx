'use client';

import { useState, useCallback, useRef, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Sparkles,
  Check,
  X,
  Plus,
  PartyPopper,
  Loader2,
  AlertCircle,
  ChevronRight,
  Flame,
  Coins,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { parseResume, type ParsedResumeSkill } from '@/actions/ai-resume-parser';
import { completeOnboarding } from '@/actions/user-onboarding';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

type WizardStep = 'upload' | 'processing' | 'verify' | 'success';

interface EditableSkill extends ParsedResumeSkill {
  id: string; // Client-side unique key
}

interface ResumeWizardProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly userId: string;
}

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------

const LEVEL_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

const LEVEL_COLORS: Record<number, string> = {
  1: 'bg-slate-100 text-slate-700 border-slate-200',
  2: 'bg-blue-50 text-blue-700 border-blue-200',
  3: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  4: 'bg-purple-50 text-purple-700 border-purple-200',
  5: 'bg-amber-50 text-amber-700 border-amber-200',
};

// ----------------------------------------------------------------
// Processing messages
// ----------------------------------------------------------------

const PROCESSING_STEPS = [
  { text: 'Reading your resume...', icon: FileText, delay: 0 },
  { text: 'Extracting key information...', icon: Sparkles, delay: 1500 },
  { text: 'Identifying skills & proficiency...', icon: Flame, delay: 3000 },
  { text: 'Almost there...', icon: Check, delay: 5000 },
];

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

export default function ResumeWizard({ open, onOpenChange, userId }: ResumeWizardProps) {
  const [step, setStep] = useState<WizardStep>('upload');
  const [skills, setSkills] = useState<EditableSkill[]>([]);
  const [fullName, setFullName] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<{
    skillsAdded: number;
    xpAwarded: number;
    coinsAwarded: number;
  } | null>(null);
  const [newSkillName, setNewSkillName] = useState('');

  const [, startParsing] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----- Reset state when dialog closes -----
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        // Allow closing only from success step or upload step
        if (step === 'processing') return;
        setStep('upload');
        setSkills([]);
        setFullName('');
        setSummary('');
        setError(null);
        setFileName(null);
        setProcessingStep(0);
        setResult(null);
        setNewSkillName('');
      }
      onOpenChange(isOpen);
    },
    [onOpenChange, step],
  );

  // ----- File handling -----
  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      setError(null);
      setStep('processing');

      // Animate processing steps
      let stepIndex = 0;
      const interval = setInterval(() => {
        stepIndex++;
        if (stepIndex < PROCESSING_STEPS.length) {
          setProcessingStep(stepIndex);
        } else {
          clearInterval(interval);
        }
      }, 1800);

      const formData = new FormData();
      formData.append('resume', file);

      startParsing(async () => {
        const result = await parseResume(formData);
        clearInterval(interval);

        if (result.success && result.data) {
          setFullName(result.data.fullName);
          setSummary(result.data.summary);
          setSkills(
            result.data.skills.map((s, i) => ({
              ...s,
              id: `skill-${i}-${Date.now()}`,
            })),
          );
          setStep('verify');
        } else {
          setError(result.error ?? 'Failed to parse resume.');
          setStep('upload');
        }
      });
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  // ----- Skill editing -----
  const removeSkill = useCallback((id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateSkillLevel = useCallback((id: string, level: 1 | 2 | 3 | 4 | 5) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, level } : s)),
    );
  }, []);

  const addSkill = useCallback(() => {
    if (!newSkillName.trim()) return;
    setSkills((prev) => [
      ...prev,
      {
        id: `skill-new-${Date.now()}`,
        name: newSkillName.trim(),
        level: 3,
      },
    ]);
    setNewSkillName('');
  }, [newSkillName]);

  // ----- Save & complete -----
  const handleComplete = useCallback(() => {
    if (skills.length === 0) {
      setError('Please add at least one skill.');
      return;
    }

    startSaving(async () => {
      const onboardingResult = await completeOnboarding(userId, {
        fullName,
        summary,
        skills: skills.map((s) => ({ name: s.name, level: s.level })),
      });

      if (onboardingResult.success) {
        setResult({
          skillsAdded: onboardingResult.skillsAdded,
          xpAwarded: onboardingResult.xpAwarded,
          coinsAwarded: onboardingResult.coinsAwarded,
        });
        setStep('success');
      } else {
        setError(onboardingResult.error ?? 'Failed to save onboarding data.');
      }
    });
  }, [skills, userId, fullName, summary]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* STEP 1: UPLOAD                                               */}
          {/* ============================================================ */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Let&apos;s Build Your Profile
                </DialogTitle>
                <DialogDescription>
                  Upload your resume and our AI will extract your skills automatically. You&apos;ll earn <strong className="text-primary">500 XP</strong> for completing onboarding!
                </DialogDescription>
              </DialogHeader>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Drop zone */}
              <div
                className={`mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/50'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="mt-4 text-sm font-medium">
                  Drag & drop your resume here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF or TXT • Max 10 MB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: PROCESSING                                           */}
          {/* ============================================================ */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-8"
            >
              <DialogHeader className="text-center">
                <DialogTitle>Analyzing Your Career</DialogTitle>
                <DialogDescription>
                  {fileName && (
                    <span className="text-xs text-muted-foreground">
                      {fileName}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              {/* Animated spinner */}
              <motion.div
                className="my-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="h-8 w-8 text-primary" />
              </motion.div>

              {/* Step indicators */}
              <div className="w-full space-y-3 px-4">
                {PROCESSING_STEPS.map((ps, i) => {
                  const Icon = ps.icon;
                  const isActive = i === processingStep;
                  const isDone = i < processingStep;

                  return (
                    <motion.div
                      key={ps.text}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isDone || isActive ? 1 : 0.4,
                        x: 0,
                      }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-600'
                            : isActive
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isDone ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Icon className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {ps.text}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: VERIFY                                               */}
          {/* ============================================================ */}
          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" />
                  Verify Your Skills
                </DialogTitle>
                <DialogDescription>
                  We found <strong>{skills.length} skills</strong> in your resume. Review, adjust levels, or add missing ones.
                </DialogDescription>
              </DialogHeader>

              {/* Profile preview */}
              <div className="mt-4 rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-sm font-medium">{fullName}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {summary}
                </p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Skills list */}
              <div className="mt-4 max-h-[320px] space-y-2 overflow-y-auto pr-1">
                <AnimatePresence>
                  {skills.map((skill) => (
                    <motion.div
                      key={skill.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2"
                    >
                      <span className="flex-1 text-sm font-medium">
                        {skill.name}
                      </span>

                      {/* Level selector */}
                      <div className="flex gap-1">
                        {([1, 2, 3, 4, 5] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => updateSkillLevel(skill.id, lvl)}
                            title={LEVEL_LABELS[lvl]}
                            className={`h-6 w-6 rounded text-[10px] font-bold transition-all ${
                              skill.level === lvl
                                ? LEVEL_COLORS[lvl]
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.id)}
                        className="ml-1 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add skill */}
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={addSkill}
                  disabled={!newSkillName.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Level legend */}
              <div className="mt-3 flex flex-wrap gap-2">
                {([1, 2, 3, 4, 5] as const).map((lvl) => (
                  <Badge
                    key={lvl}
                    variant="outline"
                    className={`text-[10px] ${LEVEL_COLORS[lvl]}`}
                  >
                    {lvl} = {LEVEL_LABELS[lvl]}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('upload');
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Re-upload
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isSaving || skills.length === 0}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Confirm & Earn XP
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: SUCCESS                                              */}
          {/* ============================================================ */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center py-6 text-center"
            >
              {/* Confetti burst */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-amber-100"
              >
                <PartyPopper className="h-10 w-10 text-primary" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-xl font-bold"
              >
                Welcome aboard! 🎉
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-2 text-sm text-muted-foreground"
              >
                Your profile is set up and ready to go.
              </motion.p>

              {/* Rewards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex gap-6"
              >
                {/* XP */}
                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.6 }}
                  >
                    <Flame className="h-7 w-7 text-primary" />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-lg font-bold text-primary"
                  >
                    +{result?.xpAwarded ?? 500} XP
                  </motion.span>
                  <span className="text-[10px] text-muted-foreground">Experience</span>
                </div>

                {/* Coins */}
                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.7 }}
                  >
                    <Coins className="h-7 w-7 text-amber-600" />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-lg font-bold text-amber-600"
                  >
                    +{result?.coinsAwarded ?? 100}
                  </motion.span>
                  <span className="text-[10px] text-muted-foreground">Coins</span>
                </div>

                {/* Skills */}
                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.8 }}
                  >
                    <Sparkles className="h-7 w-7 text-emerald-600" />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="text-lg font-bold text-emerald-600"
                  >
                    {result?.skillsAdded ?? skills.length}
                  </motion.span>
                  <span className="text-[10px] text-muted-foreground">Skills</span>
                </div>
              </motion.div>

              {/* Confetti particles */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={`confetti-${i}`}
                    className="absolute h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: [
                        '#f97316',
                        '#eab308',
                        '#22c55e',
                        '#3b82f6',
                        '#a855f7',
                        '#ef4444',
                      ][i % 6],
                      left: `${Math.random() * 100}%`,
                      top: '-5%',
                    }}
                    initial={{ y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      y: 500,
                      opacity: 0,
                      scale: 0,
                      rotate: Math.random() * 720 - 360,
                      x: Math.random() * 200 - 100,
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      delay: 0.5 + Math.random() * 0.5,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="mt-8"
              >
                <Button
                  size="lg"
                  onClick={() => handleOpenChange(false)}
                  className="px-8"
                >
                  Start Exploring
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
