import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const steps = [
  {
    title: "Define your resolution",
    detail: "Tell the intake agent what you want to change and why it matters."
  },
  {
    title: "Confirm your SMART goal",
    detail: "Opik converts your idea into measurable checkpoints."
  },
  {
    title: "Schedule your check-ins",
    detail: "Pick the cadence and reminder channels that keep you accountable."
  }
];

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl space-y-10 px-6 py-12">
        <PageHeader
          eyebrow="Onboarding"
          title="Let’s set your first commitment"
          description="Connect your intention to a weekly plan and let the Opik agents stay on top of the follow-through."
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.title} className="card space-y-2">
                <p className="text-sm font-semibold text-commit-amber">Step {index + 1}</p>
                <h2 className="text-xl font-semibold text-commit-slate">{step.title}</h2>
                <p className="text-slate-600">{step.detail}</p>
              </div>
            ))}
          </div>

          <div className="card space-y-4">
            <h3 className="text-lg font-semibold text-commit-slate">Resolution intake</h3>
            <p className="text-sm text-slate-600">
              Example: “Build a consistent workout habit to feel stronger by March.”
            </p>
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              Opik prompt preview
              <br />
              “What does success look like in 4 weeks?”
            </div>
            <Link
              href="/app/goal/commit-30"
              className="rounded-full bg-commit-blue px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Continue to goal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
