import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import GoalDetailClient from "@/components/GoalDetailClient";
import { getGoal, getLatestGoal } from "@/lib/store";

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  // If you want /app/goal/commit-30 to work but your store keys are goalIds,
  // you can either:
  // A) use goalId in the URL, OR
  // B) map "commit-30" -> latest goal for now (quick hackathon shortcut)
  const record =
    params.id === "commit-30" ? getLatestGoal() : getGoal(params.id);

  if (!record || !record.plan) return notFound();

  const { intake, plan } = record;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        <PageHeader
          eyebrow="Goal"
          title={intake.goal}
          description="Edit, re-plan, run check-ins, and weekly reviews."
          ctaLabel="Back to onboarding"
          ctaHref="/app/onboarding"
        />

        <GoalDetailClient
          goalId={intake.goalId}
          goal={intake.goal}
          successMetric={intake.successMetric}
          weeklyCadence={intake.weeklyCadence}
          initialMilestone={intake.initialMilestone}
          timeframeWeeks={intake.timeframeWeeks}
          motivation={intake.motivation}
          constraints={intake.constraints}
          plan={plan}
        />
      </div>
    </div>
  );
}
