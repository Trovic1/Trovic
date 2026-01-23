import { NextResponse } from "next/server";
import { reflectionInputSchema, reflectionOutputSchema } from "@/lib/schemas";
import { addReflection } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = reflectionInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const result = reflectionOutputSchema.parse({
    goalId: parsed.data.goalId,
    summary: "You kept momentum through the week and recovered quickly after dips.",
    wins: parsed.data.weekHighlights,
    adjustments: [
      "Schedule the toughest task earlier in the day",
      "Add a midweek accountability ping"
    ]
  });
  addReflection(result.goalId, result);

  return NextResponse.json(result);
}
