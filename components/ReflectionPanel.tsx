"use client";

import { useState } from "react";

interface ReflectionResponse {
  summary: string;
  wins: string[];
  adjustments: string[];
}

export default function ReflectionPanel({ goalId }: { goalId: string }) {
  const [highlight, setHighlight] = useState("");
  const [blocker, setBlocker] = useState("");
  const [result, setResult] = useState<ReflectionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const response = await fetch("/api/agents/reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId,
        weekHighlights: highlight
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        blockers: blocker
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      })
    });

    const data = (await response.json()) as ReflectionResponse;
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-semibold text-commit-slate">Weekly reflection</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-600">
          Week highlights (one per line)
          <textarea
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            rows={3}
            value={highlight}
            onChange={(event) => setHighlight(event.target.value)}
            placeholder="Completed all workouts\nHit 5k steps streak"
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-600">
          Blockers (optional)
          <textarea
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            rows={2}
            value={blocker}
            onChange={(event) => setBlocker(event.target.value)}
            placeholder="Late meetings on Thursday"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-commit-blue px-4 py-2 text-sm font-semibold text-white"
        >
          {loading ? "Generating summary..." : "Run reflection"}
        </button>
      </form>

      {result ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
          <p className="text-xs font-semibold uppercase tracking-widest text-commit-amber">Summary</p>
          <p className="text-base font-semibold text-commit-slate">{result.summary}</p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-commit-amber">
              Wins
            </p>
            <ul className="mt-2 space-y-1">
              {result.wins.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-commit-amber">
              Adjustments
            </p>
            <ul className="mt-2 space-y-1">
              {result.adjustments.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
