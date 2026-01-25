import { NextResponse } from "next/server";
import { intakeInputSchema } from "@/lib/schemas";
import { updateGoalDetails } from "@/lib/store";

export async function PATCH(request: Request) {
  const body = await request.json();
  const parsed = goalUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const updated = updateGoalDetails(parsed.data.goalId, {
    timeframeWeeks: parsed.data.timeframeWeeks,
    motivation: parsed.data.motivation,
    constraints: parsed.data.constraints
  });

  if (!updated) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
