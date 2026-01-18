"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface IntakeResponse {
  goalId: string;
  goal: string;
  successMetric: string;
  weeklyCadence: string;
  initialMilestone: string;
}

interface PlannerResponse {
  goalId: string;
  focus: string;
  weeklyMilestones: string[];
  dailyCommitments: string[];
}

export default function OnboardingForm() {
  const router = useRouter();
  const [resolution, setResolution] = useState("");
  const [motivation, setMotivation] = useState("");
  const [timeframeWeeks, setTimeframeWeeks] = useState(4);
  const [constraints, setConstraints] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntakeResponse | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const intakePayload = {
      resolution,
      motivation,
      timeframeWeeks: Number(timeframeWeeks),
      constraints: constraints
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    const intakeRes = await fetch("/api/agents/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(intakePayload)
    });

    const intakeData = (await intakeRes.json()) as IntakeResponse;
    setResult(intakeData);

    await fetch("/api/agents/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId: intakeData.goalId,
        goal: intakeData.goal,
        timeframeWeeks: Number(timeframeWeeks),
        successMetric: intakeData.successMetric,
        constraints: intakePayload.constraints
      })
    });

    setLoading(false);
    router.push("/app");
  };

  return (
    <div className="card space-y-6">
      <h3 className="text-lg font-semibold text-commit-slate">Resolution intake</h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-600">
          Resolution
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="Build a consistent workout habit"
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-600">
          Motivation
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="Feel stronger and energized"
            value={motivation}
            onChange={(event) => setMotivation(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-600">
          Timeframe (weeks)
          <input
            type="number"
            min={1}
            max={52}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            value={timeframeWeeks}
            onChange={(event) => setTimeframeWeeks(Number(event.target.value))}
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-600">
          Constraints (comma-separated)
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="Late meetings, travel on Fridays"
            value={constraints}
            onChange={(event) => setConstraints(event.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-commit-blue px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-commit-slate disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating your plan..." : "Generate plan"}
        </button>
      </form>

      {result ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
          <p className="text-xs font-semibold uppercase tracking-widest text-commit-amber">
            Intake summary
          </p>
          <p className="mt-2 font-semibold text-commit-slate">{result.goal}</p>
          <p className="mt-1">Success metric: {result.successMetric}</p>
          <p className="mt-1">Weekly cadence: {result.weeklyCadence}</p>
        </div>
      ) : null}
    </div>
  );
}
