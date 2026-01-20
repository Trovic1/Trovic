import { NextResponse } from "next/server";
import { plannerInputSchema, plannerOutputSchema } from "@/lib/schemas";
import { updateGoalPlan } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = plannerInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const milestones = Array.from({ length: Math.min(parsed.data.timeframeWeeks, 4) }, (_, index) => {
    return `Week ${index + 1}: ${parsed.data.successMetric}`;
  });
  const result = plannerOutputSchema.parse({
    goalId: parsed.data.goalId,
    focus: "Consistency and low-friction scheduling",
    weeklyMilestones: milestones,
    dailyCommitments: [
      "Send a quick AM check-in",
      "Complete the highest-impact task",
      "Log a 2-minute evening reflection"
    ]
  });
  updateGoalPlan(result.goalId, result);

  return NextResponse.json(result);
}
