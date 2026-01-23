import PageHeader from "@/components/PageHeader";
import OnboardingForm from "@/components/OnboardingForm";

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

          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
