import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getLatestGoal } from "@/lib/fallbackStore";

const defaultHighlights = [
  {
    label: "Active goal",
    value: "30-day fitness sprint",
    detail: "Day 12 · 78% adherence"
  },
  {
    label: "Next check-in",
    value: "Today, 7:00 PM",
    detail: "Accountability agent"
  },
  {
    label: "Weekly focus",
    value: "3 workouts + 2 reflections",
    detail: "Planner agent"
  }
];

const tasks = [
  "Log your workout after lunch.",
  "Check in: mood + energy (1 minute).",
  "Review tomorrow's plan with Opik agent."
];

export default function DashboardPage() {
  const latestGoal = getLatestGoal();
  const plan = latestGoal?.plan;
  const highlights = latestGoal
    ? [
        {
          label: "Active goal",
          value: latestGoal.intake.goal,
          detail: latestGoal.intake.successMetric
        },
        {
          label: "Next check-in",
          value: "Tonight",
          detail: "Accountability agent"
        },
        {
          label: "Weekly focus",
          value: plan?.focus ?? "Planner agent",
          detail: plan?.weeklyMilestones?.[0] ?? "Weekly milestones in progress"
        }
      ]
    : defaultHighlights;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        <PageHeader
          eyebrow="Dashboard"
          title={latestGoal ? "Welcome back" : "Welcome back, Victory"}
          description="Your AI agents are tracking momentum, celebrating wins, and adjusting your plan in real time."
          ctaLabel={latestGoal ? "View goal" : "Start check-in"}
          ctaHref={latestGoal ? `/app/goal/${latestGoal.intake.goalId}` : "/app/goal/commit-30"}
        />

        <section className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.label} className="card space-y-2">
              <p className="text-sm font-semibold uppercase tracking-widest text-commit-amber">
                {item.label}
              </p>
              <p className="text-xl font-semibold text-commit-slate">{item.value}</p>
              <p className="text-sm text-slate-500">{item.detail}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card space-y-4">
            <h2 className="text-xl font-semibold text-commit-slate">Today’s momentum</h2>
            <p className="text-slate-600">
              {latestGoal
                ? "Your planner agent is ready to adjust tasks if your schedule shifts."
                : "The accountability agent noticed you skipped Tuesday. Want to reschedule a shorter session this evening?"}
            </p>
            <div className="rounded-2xl bg-commit-blue/5 p-4 text-sm text-commit-slate">
              Suggestion: 20-minute mobility session + 10-minute reflection.
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-commit-blue px-4 py-2 text-sm font-semibold text-white">
                Accept plan
              </button>
              <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-commit-slate">
                Ask for alternatives
              </button>
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="text-lg font-semibold text-commit-slate">Tasks to close today</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {(plan?.dailyCommitments ?? tasks).map((task) => (
                <li key={task} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-commit-amber" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
            <Link href="/app/review" className="text-sm font-semibold text-commit-blue">
              View weekly review →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
