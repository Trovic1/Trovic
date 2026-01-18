import AccountabilityCheckIn from "@/components/AccountabilityCheckIn";
import PageHeader from "@/components/PageHeader";
import { getGoal } from "@/lib/fallbackStore";

const defaultMilestones = [
import PageHeader from "@/components/PageHeader";

const milestones = [
  {
    label: "Week 1",
    detail: "3 workouts + 1 reflection"
  },
  {
    label: "Week 2",
    detail: "Increase intensity + add a mobility session"
  },
  {
    label: "Week 3",
    detail: "Add accountability buddy check-in"
  }
];

const checkIns = [
  {
    label: "Morning",
    detail: "Energy level + planned workout"
  },
  {
    label: "Evening",
    detail: "Completion status + reflection"
  }
];

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  const record = getGoal(params.id);
  const milestones = record?.plan
    ? record.plan.weeklyMilestones.map((item, index) => ({
        label: `Week ${index + 1}`,
        detail: item
      }))
    : defaultMilestones;

export default function GoalDetailPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        <PageHeader
          eyebrow="Goal"
          title={record?.intake.goal ?? "30-day fitness sprint"}
          title="30-day fitness sprint"
          description="The planner agent mapped a 4-week path with progress ring tracking and daily check-ins."
          ctaLabel="Log today"
          ctaHref="/app/review"
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card space-y-4">
            <h2 className="text-xl font-semibold text-commit-slate">Weekly milestones</h2>
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.label} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-commit-amber">{milestone.label}</p>
                  <p className="text-slate-600">{milestone.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card space-y-4">
              <h3 className="text-lg font-semibold text-commit-slate">Agent check-ins</h3>
              <p className="text-sm text-slate-600">
                Scheduled prompts keep you aligned with the plan and help the accountability agent
                adapt on the fly.
              </p>
              <div className="space-y-3">
                {checkIns.map((checkIn) => (
                  <div key={checkIn.label} className="rounded-2xl bg-commit-blue/5 p-4">
                    <p className="text-sm font-semibold text-commit-blue">{checkIn.label}</p>
                    <p className="text-sm text-slate-600">{checkIn.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <AccountabilityCheckIn goalId={params.id} />
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold text-commit-slate">Agent check-ins</h3>
            <p className="text-sm text-slate-600">
              Scheduled prompts keep you aligned with the plan and help the accountability agent
              adapt on the fly.
            </p>
            <div className="space-y-3">
              {checkIns.map((checkIn) => (
                <div key={checkIn.label} className="rounded-2xl bg-commit-blue/5 p-4">
                  <p className="text-sm font-semibold text-commit-blue">{checkIn.label}</p>
                  <p className="text-sm text-slate-600">{checkIn.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
