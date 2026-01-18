import { NextResponse } from "next/server";
import { reflectionInputSchema } from "@/lib/agents/schemas";
import { runReflection } from "@/lib/agents/runner";
import { saveReflection } from "@/lib/fallbackStore";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = reflectionInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const result = await runReflection(parsed.data);
  saveReflection(result);

  return NextResponse.json(result);
}
