import Link from "next/link";
import GoalDetailClient from "@/components/GoalDetailClient";
import PageHeader from "@/components/PageHeader";
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

        <GoalDetailClient
          goalId={params.id}
          goal={record.intake.goal}
          successMetric={record.intake.successMetric}
          weeklyCadence={record.intake.weeklyCadence}
          initialMilestone={record.intake.initialMilestone}
          timeframeWeeks={record.timeframeWeeks}
          motivation={record.motivation}
          constraints={record.constraints}
          plan={plan}
        />
      </div>
    </div>
  );
}
