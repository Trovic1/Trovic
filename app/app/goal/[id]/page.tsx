import Link from "next/link";
import AccountabilityCheckIn from "@/components/AccountabilityCheckIn";
import PageHeader from "@/components/PageHeader";
import ReflectionPanel from "@/components/ReflectionPanel";
import { getGoal } from "@/lib/store";

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  const record = getGoal(params.id);
  const plan = record?.plan;

  if (!record || !plan) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 px-6 py-16">
          <h1 className="text-3xl font-semibold text-commit-slate">Let’s start a new goal</h1>
          <p className="text-slate-600">
            We couldn’t find a saved plan for this goal. Start onboarding to generate a fresh
            commitment plan.
          </p>
          <Link
            href="/app/onboarding"
            className="rounded-full bg-commit-blue px-5 py-2 text-sm font-semibold text-white"
          >
            Go to onboarding
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        <PageHeader
          eyebrow="Goal"
          title={record.intake.goal}
          description="Your AI planner mapped a 4-week path with daily check-ins and momentum nudges."
          ctaLabel="Log today"
          ctaHref="/app/review"
        />

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="card space-y-3">
              <h2 className="text-xl font-semibold text-commit-slate">SMART goal</h2>
              <p className="text-base font-semibold text-commit-slate">{record.intake.goal}</p>
              <p className="text-sm text-slate-600">Success metric: {record.intake.successMetric}</p>
              <p className="text-sm text-slate-600">Weekly cadence: {record.intake.weeklyCadence}</p>
              <p className="text-sm text-slate-600">
                Initial milestone: {record.intake.initialMilestone}
              </p>
            </div>

            <div className="card space-y-4">
              <h2 className="text-xl font-semibold text-commit-slate">Weekly plan</h2>
              <p className="text-sm text-slate-600">Focus: {plan.focus}</p>
              <ul className="space-y-3 text-sm text-slate-600">
                {plan.weeklyMilestones.map((milestone, index) => (
                  <li key={milestone} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-commit-amber" />
                    <span>Week {index + 1}: {milestone}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card space-y-4">
              <h2 className="text-xl font-semibold text-commit-slate">Daily micro-commitments</h2>
              <ul className="space-y-3 text-sm text-slate-600">
                {plan.dailyCommitments.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-commit-amber" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <AccountabilityCheckIn goalId={params.id} />
            <ReflectionPanel goalId={params.id} />
          </div>
        </section>
      </div>
    </div>
  );
}
