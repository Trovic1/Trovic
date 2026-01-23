"use client";

import { useMemo, useState } from "react";

import type { PlannerOutput } from "@/lib/schemas";
import type { GoalRecord } from "@/lib/store";

interface GoalDetailClientProps {
  goalId: string;
  initialRecord: GoalRecord;
}

interface AccountabilityResponse {
  status: string;
  recommendation: string;
  nextAction: string;
}

interface ReflectionResponse {
  summary: string;
  wins: string[];
  adjustments: string[];
}

export default function GoalDetailClient({
  goalId,
  initialRecord
}: GoalDetailClientProps) {
  const { intake, plan, timeframeWeeks, motivation, constraints } = initialRecord;
  const { goal, successMetric, weeklyCadence, initialMilestone } = intake;
  const [isEditing, setIsEditing] = useState(false);
  const [formWeeks, setFormWeeks] = useState(timeframeWeeks);
  const [formMotivation, setFormMotivation] = useState(motivation);
  const [formConstraints, setFormConstraints] = useState(constraints.join(", "));
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [planState, setPlanState] = useState<PlannerOutput>(plan);
  const [planMessage, setPlanMessage] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInNote, setCheckInNote] = useState("");
  const [checkInMood, setCheckInMood] = useState("steady");
  const [checkInTasks, setCheckInTasks] = useState(1);
  const [checkInResult, setCheckInResult] = useState<AccountabilityResponse | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [reviewHighlights, setReviewHighlights] = useState("");
  const [reviewBlockers, setReviewBlockers] = useState("");
  const [reviewResult, setReviewResult] = useState<ReflectionResponse | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const constraintsArray = useMemo(
    () =>
      formConstraints
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [formConstraints]
  );

  const handleSave = async () => {
    setEditMessage(null);
    const response = await fetch("/api/agents/goal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId,
        timeframeWeeks: Number(formWeeks),
        motivation: formMotivation,
        constraints: constraintsArray
      })
    });

    if (!response.ok) {
      setEditMessage("Could not save updates. Please try again.");
      return;
    }

    setIsEditing(false);
    setEditMessage("Saved updates to your goal details.");
  };

  const handleCancel = () => {
    setFormWeeks(timeframeWeeks);
    setFormMotivation(motivation);
    setFormConstraints(constraints.join(", "));
    setIsEditing(false);
    setEditMessage(null);
  };

  const handleReplan = async () => {
    setPlanLoading(true);
    setPlanMessage(null);
    const response = await fetch("/api/agents/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId,
        goal,
        timeframeWeeks: Number(formWeeks),
        successMetric,
        constraints: constraintsArray
      })
    });

    if (!response.ok) {
      setPlanMessage("Re-plan failed. Please try again.");
      setPlanLoading(false);
      return;
    }

    const data = (await response.json()) as PlannerOutput;
    setPlanState(data);
    setPlanMessage("Plan refreshed successfully.");
    setPlanLoading(false);
  };

  const handleCheckIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckInLoading(true);

    const response = await fetch("/api/agents/accountability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId,
        checkInNote,
        mood: checkInMood,
        completedTasks: Number(checkInTasks)
      })
    });

    const data = (await response.json()) as AccountabilityResponse;
    setCheckInResult(data);
    setCheckInLoading(false);
  };

  const handleReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewLoading(true);

    const response = await fetch("/api/agents/reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId,
        weekHighlights: reviewHighlights
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        blockers: reviewBlockers
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      })
    });

    const data = (await response.json()) as ReflectionResponse;
    setReviewResult(data);
    setReviewLoading(false);
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-commit-slate">SMART goal</h2>
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="text-sm font-semibold text-commit-blue"
            >
              {isEditing ? "Close" : "Edit"}
            </button>
          </div>
          <p className="text-base font-semibold text-commit-slate">{goal}</p>
          <p className="text-sm text-slate-600">Success metric: {successMetric}</p>
          <p className="text-sm text-slate-600">Weekly cadence: {weeklyCadence}</p>
          <p className="text-sm text-slate-600">Initial milestone: {initialMilestone}</p>

          {isEditing ? (
            <div className="mt-4 space-y-3">
              <label className="block text-sm text-slate-600">
                Timeframe (weeks)
                <input
                  type="number"
                  min={1}
                  max={52}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={formWeeks}
                  onChange={(event) => setFormWeeks(Number(event.target.value))}
                />
              </label>
              <label className="block text-sm text-slate-600">
                Motivation
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={formMotivation}
                  onChange={(event) => setFormMotivation(event.target.value)}
                />
              </label>
              <label className="block text-sm text-slate-600">
                Constraints (comma-separated)
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={formConstraints}
                  onChange={(event) => setFormConstraints(event.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-full bg-commit-blue px-4 py-2 text-sm font-semibold text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-commit-slate"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {editMessage ? (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {editMessage}
            </p>
          ) : null}
        </div>

        <div className="card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-commit-slate">Weekly plan</h2>
              <p className="text-sm text-slate-600">Focus: {planState.focus}</p>
            </div>
            <button
              type="button"
              onClick={handleReplan}
              className="rounded-full border border-commit-blue/30 px-4 py-2 text-sm font-semibold text-commit-blue"
              disabled={planLoading}
            >
              {planLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-commit-blue/40 border-t-commit-blue" />
                  Re-planning…
                </span>
              ) : (
                "Re-plan"
              )}
            </button>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            {planState.weeklyMilestones.map((milestone, index) => (
              <li key={`${milestone}-${index}`} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-commit-amber" />
                <span>
                  Week {index + 1}: {milestone}
                </span>
              </li>
            ))}
          </ul>
          {planMessage ? <p className="text-sm text-commit-blue">{planMessage}</p> : null}
        </div>

        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-commit-slate">Daily micro-commitments</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            {planState.dailyCommitments.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-commit-amber" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-commit-slate">Log today</h3>
            <button
              type="button"
              onClick={() => setShowCheckIn((prev) => !prev)}
              className="text-sm font-semibold text-commit-blue"
            >
              {showCheckIn ? "Close" : "Run check-in"}
            </button>
          </div>
          {showCheckIn ? (
            <form className="space-y-3" onSubmit={handleCheckIn}>
              <label className="block text-sm text-slate-600">
                Mood
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={checkInMood}
                  onChange={(event) => setCheckInMood(event.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="steady">Steady</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="block text-sm text-slate-600">
                Completed tasks
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={checkInTasks}
                  onChange={(event) => setCheckInTasks(Number(event.target.value))}
                />
              </label>
              <label className="block text-sm text-slate-600">
                Check-in note
                <textarea
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  rows={3}
                  value={checkInNote}
                  onChange={(event) => setCheckInNote(event.target.value)}
                />
              </label>
              <button
                type="submit"
                disabled={checkInLoading}
                className="rounded-full bg-commit-blue px-4 py-2 text-sm font-semibold text-white"
              >
                {checkInLoading ? "Saving…" : "Submit check-in"}
              </button>
            </form>
          ) : null}

          {checkInResult ? (
            <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
              <p className="text-xs font-semibold uppercase tracking-widest text-commit-amber">
                Status
              </p>
              <p className="mt-2 text-base font-semibold text-commit-slate">
                {checkInResult.status}
              </p>
              <p className="mt-2">Recommendation: {checkInResult.recommendation}</p>
              <p className="mt-2">Next action: {checkInResult.nextAction}</p>
            </div>
          ) : null}
        </div>

        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-commit-slate">Weekly review</h3>
          <form className="space-y-3" onSubmit={handleReview}>
            <label className="block text-sm text-slate-600">
              Week highlights (one per line)
              <textarea
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                rows={3}
                value={reviewHighlights}
                onChange={(event) => setReviewHighlights(event.target.value)}
              />
            </label>
            <label className="block text-sm text-slate-600">
              Blockers (optional)
              <textarea
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                rows={2}
                value={reviewBlockers}
                onChange={(event) => setReviewBlockers(event.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={reviewLoading}
              className="rounded-full bg-commit-blue px-4 py-2 text-sm font-semibold text-white"
            >
              {reviewLoading ? "Generating…" : "Run weekly review"}
            </button>
          </form>

          {reviewResult ? (
            <div className="space-y-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
              <p className="text-xs font-semibold uppercase tracking-widest text-commit-amber">
                Summary
              </p>
              <p className="text-base font-semibold text-commit-slate">{reviewResult.summary}</p>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-commit-amber">
                  Wins
                </p>
                <ul className="mt-2 space-y-1">
                  {reviewResult.wins.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-commit-amber">
                  Adjustments
                </p>
                <ul className="mt-2 space-y-1">
                  {reviewResult.adjustments.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
