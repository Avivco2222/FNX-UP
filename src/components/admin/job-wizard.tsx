'use client';

import { useState, useTransition } from 'react';
import {
  Sparkles,
  Loader2,
  Plus,
  X,
  ArrowLeft,
  Check,
  Star,
  Briefcase,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

import { parseJobDescription, type ParsedJobSkill } from '@/actions/ai-job-parser';
import { createJobWithSkills } from '@/actions/jobs';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

interface EditableSkill extends ParsedJobSkill {
  _id: string; // client-side key for list rendering
}

type WizardStep = 'input' | 'review';

interface JobWizardProps {
  readonly onSuccess?: () => void;
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

let idCounter = 0;
function nextId(): string {
  return `skill-${++idCounter}-${Date.now()}`;
}

const LEVEL_LABELS = ['', 'Novice', 'Basic', 'Intermediate', 'Advanced', 'Expert'] as const;

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

export default function JobWizard({ onSuccess }: JobWizardProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>('input');
  const [rawText, setRawText] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Parsed / editable state
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState<EditableSkill[]>([]);

  // ----------------------------------------------------------
  // Reset
  // ----------------------------------------------------------
  const resetWizard = () => {
    setStep('input');
    setRawText('');
    setTitle('');
    setDepartment('');
    setSummary('');
    setSkills([]);
  };

  // ----------------------------------------------------------
  // Step 1 → AI Parse
  // ----------------------------------------------------------
  const handleAnalyze = () => {
    startTransition(async () => {
      const result = await parseJobDescription(rawText);

      if (!result.success || !result.data) {
        toast({
          variant: 'destructive',
          title: 'AI Analysis Failed',
          description: result.error ?? 'Could not parse the job description.',
        });
        return;
      }

      const parsed = result.data;
      setTitle(parsed.title);
      setDepartment(parsed.department);
      setSummary(parsed.description_summary);
      setSkills(
        parsed.skills.map((s) => ({ ...s, _id: nextId() })),
      );
      setStep('review');
    });
  };

  // ----------------------------------------------------------
  // Step 2 → Skill editing
  // ----------------------------------------------------------
  const updateSkill = (id: string, patch: Partial<EditableSkill>) => {
    setSkills((prev) =>
      prev.map((s) => (s._id === id ? { ...s, ...patch } : s)),
    );
  };

  const removeSkill = (id: string) => {
    setSkills((prev) => prev.filter((s) => s._id !== id));
  };

  const addManualSkill = () => {
    setSkills((prev) => [
      ...prev,
      {
        _id: nextId(),
        name: '',
        level: 3 as const,
        is_mandatory: false,
        is_new: false,
      },
    ]);
  };

  const setSkillLevel = (id: string, level: 1 | 2 | 3 | 4 | 5) => {
    updateSkill(id, { level });
  };

  // ----------------------------------------------------------
  // Step 2 → Save
  // ----------------------------------------------------------
  const handleCreate = () => {
    if (!title.trim()) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Job title is required.' });
      return;
    }

    // Filter out skills with empty names
    const validSkills = skills.filter((s) => s.name.trim());

    startTransition(async () => {
      const result = await createJobWithSkills({
        title,
        department,
        description_summary: summary,
        skills: validSkills.map(({ name, level, is_mandatory, is_new }) => ({
          name,
          level,
          is_mandatory,
          is_new,
        })),
      });

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: result.errors.join('; ') || 'Unknown error.',
        });
        return;
      }

      const parts = [`Job created as draft.`];
      if (result.skillsCreated > 0) parts.push(`${result.skillsCreated} new skills added to taxonomy.`);
      if (result.skillsLinked > 0) parts.push(`${result.skillsLinked} skills linked.`);
      if (result.errors.length > 0) parts.push(`Warnings: ${result.errors.join('; ')}`);

      toast({ title: 'Job Created', description: parts.join(' ') });

      setOpen(false);
      resetWizard();
      onSuccess?.();
    });
  };

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetWizard();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Sparkles className="mr-1.5 h-4 w-4" />
          AI Job Wizard
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {step === 'input' ? 'Create Job — Paste Description' : 'Review & Edit Job'}
          </DialogTitle>
        </DialogHeader>

        {/* ======== STEP 1: Input ======== */}
        {step === 'input' && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="jd-text">Job Description Text</Label>
              <Textarea
                id="jd-text"
                placeholder="Paste the full job description here… The AI will extract the title, department, skills, and required levels automatically."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={12}
                className="text-sm leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleAnalyze}
                disabled={isPending || !rawText.trim()}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </div>

            {/* Loading skeleton */}
            {isPending && (
              <div className="space-y-3 pt-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
              </div>
            )}
          </div>
        )}

        {/* ======== STEP 2: Review & Edit ======== */}
        {step === 'review' && (
          <div className="space-y-5 py-2">
            {/* Header fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="job-title" className="text-xs font-medium">
                  Job Title
                </Label>
                <Input
                  id="job-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="job-dept" className="text-xs font-medium">
                  Department
                </Label>
                <Input
                  id="job-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="job-summary" className="text-xs font-medium">
                Description Summary
              </Label>
              <Textarea
                id="job-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>

            <Separator />

            {/* Skills list */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Extracted Skills
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {skills.length}
                  </Badge>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addManualSkill}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Skill
                </Button>
              </div>

              {skills.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No skills extracted. Add skills manually.
                </p>
              )}

              <div className="space-y-2">
                {skills.map((skill) => (
                  <div
                    key={skill._id}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30"
                  >
                    {/* Name */}
                    <Input
                      value={skill.name}
                      onChange={(e) =>
                        updateSkill(skill._id, { name: e.target.value })
                      }
                      placeholder="Skill name"
                      className="h-8 flex-1 text-sm"
                    />

                    {/* Level stars */}
                    <div className="flex items-center gap-0.5" title={`Level: ${skill.level} (${LEVEL_LABELS[skill.level]})`}>
                      {([1, 2, 3, 4, 5] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSkillLevel(skill._id, lvl)}
                          className="p-0.5 transition-colors"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              lvl <= skill.level
                                ? 'fill-primary text-primary'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Mandatory checkbox */}
                    <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                      <Checkbox
                        checked={skill.is_mandatory}
                        onCheckedChange={(checked) =>
                          updateSkill(skill._id, {
                            is_mandatory: checked === true,
                          })
                        }
                      />
                      Required
                    </label>

                    {/* New badge */}
                    {skill.is_new && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        NEW
                      </Badge>
                    )}

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => removeSkill(skill._id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep('input')}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </Button>

              <Button
                size="sm"
                onClick={handleCreate}
                disabled={isPending || !title.trim()}
              >
                {isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-1.5 h-4 w-4" />
                )}
                Create Job
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
