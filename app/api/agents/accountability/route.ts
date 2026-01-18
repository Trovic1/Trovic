import { NextResponse } from "next/server";
import { accountabilityInputSchema } from "@/lib/agents/schemas";
import { runAccountability } from "@/lib/agents/runner";
import { saveCheckIn } from "@/lib/fallbackStore";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = accountabilityInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const result = await runAccountability(parsed.data);
  saveCheckIn(result);

  return NextResponse.json(result);
}
