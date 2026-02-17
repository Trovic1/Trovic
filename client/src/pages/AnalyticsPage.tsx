import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { Room } from '../lib/types';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function AnalyticsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    api.getRooms().then(setRooms);
  }, []);

  const topConsumers = useMemo(
    () => [...rooms].sort((a, b) => b.monthlyKwh - a.monthlyKwh).slice(0, 8),
    [rooms]
  );

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Energy Analytics</h2>
      <div className="h-96 rounded-lg border border-slate-700 bg-slate-900 p-4">
        <h3 className="mb-3 text-sm text-slate-300">Top 8 Highest-Consuming Rooms (Monthly kWh)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topConsumers}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="roomNumber" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="monthlyKwh" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
