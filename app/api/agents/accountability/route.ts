import { NextResponse } from "next/server";
import { accountabilityInputSchema, accountabilityOutputSchema } from "@/lib/schemas";
import { addCheckIn } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = accountabilityInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const status = parsed.data.completedTasks >= 2 ? "On track" : "Needs a reset";
  const result = accountabilityOutputSchema.parse({
    goalId: parsed.data.goalId,
    status,
    recommendation:
      parsed.data.mood === "low"
        ? "Scale back and protect a smaller win today."
        : "Keep momentum with a shorter focused session.",
    nextAction: "Send a reminder two hours before the next commitment."
  });
  addCheckIn(result.goalId, result);

  return NextResponse.json(result);
}
