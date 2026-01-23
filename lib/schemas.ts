import { z } from "zod";

export const intakeInputSchema = z.object({
  resolution: z.string().min(5),
  timeframeWeeks: z.number().int().min(1).max(52),
  motivation: z.string().min(3),
  constraints: z.array(z.string()).default([])
});

export const intakeOutputSchema = z.object({
  goalId: z.string(),
  goal: z.string(),
  successMetric: z.string(),
  weeklyCadence: z.string(),
  initialMilestone: z.string()
});

export const plannerInputSchema = z.object({
  goalId: z.string(),
  goal: z.string(),
  timeframeWeeks: z.number().int().min(1).max(52),
  successMetric: z.string(),
  constraints: z.array(z.string()).default([])
});

export const plannerOutputSchema = z.object({
  goalId: z.string(),
  focus: z.string(),
  weeklyMilestones: z.array(z.string()).min(1),
  dailyCommitments: z.array(z.string()).min(1)
});

export const accountabilityInputSchema = z.object({
  goalId: z.string(),
  checkInNote: z.string().min(3),
  mood: z.enum(["low", "steady", "high"]),
  completedTasks: z.number().int().min(0)
});

export const accountabilityOutputSchema = z.object({
  goalId: z.string(),
  status: z.string(),
  recommendation: z.string(),
  nextAction: z.string()
});

export const reflectionInputSchema = z.object({
  goalId: z.string(),
  weekHighlights: z.array(z.string()).min(1),
  blockers: z.array(z.string()).default([])
});

export const reflectionOutputSchema = z.object({
  goalId: z.string(),
  summary: z.string(),
  wins: z.array(z.string()).min(1),
  adjustments: z.array(z.string()).min(1)
});

export type IntakeInput = z.infer<typeof intakeInputSchema>;
export type IntakeOutput = z.infer<typeof intakeOutputSchema>;
export type PlannerInput = z.infer<typeof plannerInputSchema>;
export type PlannerOutput = z.infer<typeof plannerOutputSchema>;
export type AccountabilityInput = z.infer<typeof accountabilityInputSchema>;
export type AccountabilityOutput = z.infer<typeof accountabilityOutputSchema>;
export type ReflectionInput = z.infer<typeof reflectionInputSchema>;
export type ReflectionOutput = z.infer<typeof reflectionOutputSchema>;
