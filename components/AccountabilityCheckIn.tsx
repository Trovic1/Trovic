"use client";

import { useState } from "react";

interface AccountabilityResponse {
  status: string;
  recommendation: string;
  nextAction: string;
}

export default function AccountabilityCheckIn({ goalId }: { goalId: string }) {
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("steady");
  const [completed, setCompleted] = useState(1);
  const [result, setResult] = useState<AccountabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const response = await fetch("/api/agents/accountability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId,
        checkInNote: note,
        mood,
        completedTasks: completed
      })
    });

    const data = (await response.json()) as AccountabilityResponse;
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="card space-y-4">
      <h3 className="text-lg font-semibold text-commit-slate">Check-in with your agent</h3>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <textarea
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          rows={3}
          placeholder="Share today’s progress or blockers"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          required
        />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-600">
            Mood
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={mood}
              onChange={(event) => setMood(event.target.value)}
            >
              <option value="low">Low</option>
              <option value="steady">Steady</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Completed tasks
            <input
              type="number"
              min={0}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={completed}
              onChange={(event) => setCompleted(Number(event.target.value))}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-commit-blue px-4 py-2 text-sm font-semibold text-white"
        >
          {loading ? "Sending check-in..." : "Send check-in"}
        </button>
      </form>

      {result ? (
        <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
          <p className="text-xs font-semibold uppercase tracking-widest text-commit-amber">Status</p>
          <p className="mt-2 text-base font-semibold text-commit-slate">{result.status}</p>
          <p className="mt-2">Recommendation: {result.recommendation}</p>
          <p className="mt-2">Next action: {result.nextAction}</p>
        </div>
      ) : null}
    </div>
  );
}
