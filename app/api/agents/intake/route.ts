import { NextResponse } from "next/server";
import { intakeInputSchema } from "@/lib/agents/schemas";
import { runIntake } from "@/lib/agents/runner";
import { saveIntake } from "@/lib/fallbackStore";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = intakeInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const result = await runIntake(parsed.data);
  saveIntake(result);

  return NextResponse.json(result);
}
