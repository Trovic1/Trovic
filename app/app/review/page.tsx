import PageHeader from "@/components/PageHeader";

const metrics = [
  { label: "Check-ins", value: "9 / 10" },
  { label: "Tasks completed", value: "18" },
  { label: "Streak", value: "5 days" }
];

const reflections = [
  "Evening workouts worked best on busy days.",
  "Music cues helped start sessions faster.",
  "Need a reminder to log energy after lunch."
];

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        <PageHeader
          eyebrow="Weekly review"
          title="Momentum summary"
          description="The reflection agent summarizes your week and highlights the next best move."
          ctaLabel="Schedule next week"
          ctaHref="/app/onboarding"
        />

        <section className="grid gap-6 md:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="card space-y-2">
              <p className="text-sm font-semibold uppercase tracking-widest text-commit-amber">
                {metric.label}
              </p>
              <p className="text-2xl font-semibold text-commit-slate">{metric.value}</p>
            </div>
          ))}
        </section>

        <section className="card space-y-4">
          <h2 className="text-xl font-semibold text-commit-slate">What the agent noticed</h2>
          <ul className="space-y-3 text-slate-600">
            {reflections.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-commit-amber" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
