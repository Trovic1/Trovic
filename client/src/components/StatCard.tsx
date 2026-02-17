interface StatCardProps {
  label: string;
  value: string;
  tone?: 'default' | 'warn';
}

export function StatCard({ label, value, tone = 'default' }: StatCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${tone === 'warn' ? 'border-amber-600 bg-amber-950/40' : 'border-slate-700 bg-slate-900'}`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
