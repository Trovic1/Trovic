import Image from "next/image";
import Link from "next/link";
import FeatureCard from "@/components/FeatureCard";
import NavBar from "@/components/NavBar";

const features = [
  {
    title: "Goal clarity",
    description:
      "Turn resolutions into measurable outcomes with an intake agent that asks the right questions."
  },
  {
    title: "Momentum plans",
    description:
      "Weekly sprints and daily micro-commitments keep your progress tangible and achievable."
  },
  {
    title: "Accountability loops",
    description:
      "Opik agents check in, unblock you, and summarize wins so you never lose the thread."
  }
];

const workflow = [
  "Define your resolution and timeframe.",
  "Generate a SMART goal and weekly plan.",
  "Check in daily, reflect weekly, and adjust fast."
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <NavBar />
      <main>
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-commit-amber">
              Hackathon Project
            </p>
            <h1 className="text-4xl font-semibold text-commit-slate md:text-5xl">
              Commit Coach helps you turn resolutions into weekly wins.
            </h1>
            <p className="text-lg text-slate-600">
              Powered by Opik agents and Supabase, Commit Coach keeps your goals visible,
              actionable, and supported with daily accountability.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/app/onboarding"
                className="rounded-full bg-commit-blue px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-commit-slate"
              >
                Start onboarding
              </Link>
              <Link
                href="/app"
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-commit-slate shadow-sm transition hover:-translate-y-0.5 hover:border-commit-blue"
              >
                View dashboard
              </Link>
            </div>
          </div>
          <div className="relative rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Image src="/brand/icon.svg" alt="Commit Coach icon" width={64} height={64} />
                <div>
                  <p className="text-sm font-semibold text-commit-amber">Progress ring</p>
                  <p className="text-lg font-semibold text-commit-slate">Accountability snapshot</p>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-6">
                <p className="text-sm font-semibold text-commit-slate">Today</p>
                <p className="mt-2 text-2xl font-semibold text-commit-amber">2 of 3 tasks done</p>
                <p className="mt-2 text-sm text-slate-500">
                  Opik agents have scheduled your next check-in for 7:00 PM.
                </p>
              </div>
              <div className="rounded-2xl border border-dashed border-commit-blue/40 p-6">
                <p className="text-sm font-semibold text-commit-blue">Next action</p>
                <p className="mt-2 text-base text-slate-600">
                  Send reflection prompt after the evening workout.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="section-title">Designed for consistency</h2>
            <p className="text-sm text-slate-500">AI agents + human commitment</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="section-title">Your weekly commit loop</h2>
              <p className="mt-3 text-slate-600">
                Each goal becomes a sprint that the agents can measure, nudge, and optimize.
              </p>
              <ul className="mt-6 space-y-4 text-slate-600">
                {workflow.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-commit-amber" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-commit-blue to-commit-slate p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/70">Agent focus</p>
              <p className="mt-4 text-2xl font-semibold">Daily check-ins</p>
              <p className="mt-3 text-sm text-white/80">
                The accountability agent summarizes blockers, adjusts your schedule, and keeps the
                streak alive.
              </p>
              <div className="mt-6 rounded-2xl bg-white/10 p-4">
                <p className="text-sm">Next prompt</p>
                <p className="text-lg font-semibold">"What is your smallest win today?"</p>
              </div>
            </div>
          </div>
        </section>

        <section id="agents" className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card space-y-4">
              <h3 className="text-xl font-semibold text-commit-slate">Opik agent stack</h3>
              <p className="text-slate-600">
                Configure Intake, Planner, Accountability, and Reflection agents with Opik to
                orchestrate every touchpoint.
              </p>
              <Link className="text-sm font-semibold text-commit-blue" href="/app/onboarding">
                Map your first workflow →
              </Link>
            </div>
            <div className="card space-y-4">
              <h3 className="text-xl font-semibold text-commit-slate">Supabase secure core</h3>
              <p className="text-slate-600">
                Store goals, tasks, check-ins, and reflections with built-in auth and row-level
                security.
              </p>
              <Link className="text-sm font-semibold text-commit-blue" href="/app">
                Explore the demo dashboard →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-6 py-10 text-sm text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p>© 2026 Commit Coach. Built for Comet Resolution v2.</p>
          <p>Opik + Supabase + Next.js</p>
        </div>
      </footer>
    </div>
  );
}
