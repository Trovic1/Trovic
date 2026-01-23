import { NextResponse } from "next/server";
import { intakeInputSchema, intakeOutputSchema } from "@/lib/schemas";
import { saveGoal } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = intakeInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const result = intakeOutputSchema.parse({
    goalId: `goal_${Math.random().toString(36).slice(2, 8)}`,
    goal: `Commit to ${parsed.data.resolution.toLowerCase()} in ${parsed.data.timeframeWeeks} weeks`,
    successMetric: `Complete ${parsed.data.timeframeWeeks * 3} focused sessions`,
    weeklyCadence: `${Math.min(3, parsed.data.timeframeWeeks)} sessions per week`,
    initialMilestone: "Block your first two sessions on the calendar"
  });

  saveGoal(result.goalId, { intake: result, plan: null, checkIns: [], reflections: [] });

  return NextResponse.json(result);
}
