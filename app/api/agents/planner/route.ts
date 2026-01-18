import { NextResponse } from "next/server";
import { plannerInputSchema } from "@/lib/agents/schemas";
import { runPlanner } from "@/lib/agents/runner";
import { savePlan } from "@/lib/fallbackStore";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = plannerInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const result = await runPlanner(parsed.data);
  savePlan(result);

  return NextResponse.json(result);
}
