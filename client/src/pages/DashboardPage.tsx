import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Summary, DailyUsage } from '../lib/types';
import { StatCard } from '../components/StatCard';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [usage, setUsage] = useState<DailyUsage[]>([]);

  useEffect(() => {
    api.getSummary().then(setSummary);
    api.getDailyUsage().then(setUsage);
  }, []);

  if (!summary) return <p>Loading dashboard...</p>;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="Total Rooms" value={String(summary.totalRooms)} />
        <StatCard label="Active Alerts" value={String(summary.activeAlerts)} tone="warn" />
        <StatCard label="Monthly kWh" value={summary.totalMonthlyKwh.toFixed(1)} />
        <StatCard label="Average / Room" value={`${summary.avgRoomKwh.toFixed(1)} kWh`} />
        <StatCard label="Estimated Bill" value={`₦${summary.estimatedBill.toLocaleString()}`} />
      </div>
      <div className="h-80 rounded-lg border border-slate-700 bg-slate-900 p-4">
        <h3 className="mb-3 text-sm text-slate-300">Last 7 Days Power Consumption</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={usage}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Area dataKey="kwh" stroke="#22d3ee" fill="#155e75" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
