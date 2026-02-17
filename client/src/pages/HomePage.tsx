import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <section className="space-y-6">
      <p className="inline-flex rounded-full bg-cyan-900/40 px-3 py-1 text-xs text-cyan-300">Software-Only Demo</p>
      <h1 className="text-4xl font-bold text-white">Smart Power Management for Hostel Electricity Monitoring</h1>
      <p className="max-w-3xl text-slate-300">
        PowerSense Technologies Ltd helps hostel admins monitor room-level electricity consumption, detect unusual load patterns,
        and reduce energy waste using real-time software analytics.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          'Room-level usage visibility',
          'Automated high-consumption alerts',
          'Actionable trend analytics'
        ].map((item) => (
          <div key={item} className="rounded-lg border border-slate-700 bg-slate-900 p-4 text-slate-200">{item}</div>
        ))}
      </div>
      <Link to="/dashboard" className="inline-block rounded-md bg-cyan-500 px-5 py-2 font-medium text-slate-950 transition hover:bg-cyan-400">
        Open Admin Dashboard
      </Link>
    </section>
  );
}
