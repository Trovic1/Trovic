import { prompts } from "@/lib/agents/prompts";
import { safeJsonParse } from "@/lib/agents/parser";
import {
  accountabilityOutputSchema,
  intakeOutputSchema,
  plannerOutputSchema,
  reflectionOutputSchema,
  type AccountabilityInput,
  type IntakeInput,
  type PlannerInput,
  type ReflectionInput
} from "@/lib/agents/schemas";
import { emitOpikTrace } from "@/lib/opikClient";

const goalSeed = () => `goal_${Math.random().toString(36).slice(2, 8)}`;

export async function runIntake(input: IntakeInput) {
  const draft = {
    goalId: goalSeed(),
    goal: `Build ${input.resolution.toLowerCase()} in ${input.timeframeWeeks} weeks`,
    successMetric: `Complete ${input.timeframeWeeks * 3} focused sessions`,
    weeklyCadence: `${Math.min(3, input.timeframeWeeks)} sessions per week`,
    initialMilestone: "Book the first three sessions in your calendar"
  };
  const parsedDraft = safeJsonParse(JSON.stringify(draft), draft);
  const output = intakeOutputSchema.parse(parsedDraft);

  await emitOpikTrace("intake", { prompt: prompts.intake, input, output });
  return output;
}

export async function runPlanner(input: PlannerInput) {
  const weeklyMilestones = Array.from({ length: Math.min(input.timeframeWeeks, 4) }, (_, i) =>
    `Week ${i + 1}: ${input.successMetric}`
  );

  const draft = {
    goalId: input.goalId,
    focus: "Consistency and low-friction scheduling",
    weeklyMilestones,
    dailyCommitments: [
      "Morning check-in with your accountability agent",
      "Complete the highest-impact task of the day",
      "Evening reflection in under 2 minutes"
    ]
  };
  const parsedDraft = safeJsonParse(JSON.stringify(draft), draft);
  const output = plannerOutputSchema.parse(parsedDraft);

  await emitOpikTrace("planner", { prompt: prompts.planner, input, output });
  return output;
}

export async function runAccountability(input: AccountabilityInput) {
  const status = input.completedTasks >= 2 ? "On track" : "Needs a reset";
  const draft = {
    goalId: input.goalId,
    status,
    recommendation:
      input.mood === "low"
        ? "Swap to a lighter session and celebrate a small win."
        : "Keep the plan and protect the next check-in window.",
    nextAction: "Send a reminder 2 hours before your next commitment."
  };
  const parsedDraft = safeJsonParse(JSON.stringify(draft), draft);
  const output = accountabilityOutputSchema.parse(parsedDraft);

  await emitOpikTrace("accountability", { prompt: prompts.accountability, input, output });
  return output;
}

export async function runReflection(input: ReflectionInput) {
  const draft = {
    goalId: input.goalId,
    summary: "You kept momentum through mid-week and recovered quickly after a dip.",
    wins: input.weekHighlights,
    adjustments: [
      "Schedule the hardest task earlier in the day",
      "Add a midweek accountability ping"
    ]
  };
  const parsedDraft = safeJsonParse(JSON.stringify(draft), draft);
  const output = reflectionOutputSchema.parse(parsedDraft);

  await emitOpikTrace("reflection", { prompt: prompts.reflection, input, output });
  return output;
}
