import { Card, CardContent } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type PpsPoint = { label: string; pps: number };

export function PpsChart({ points }: { points: PpsPoint[] }) {
  return (
    <Card>
      <CardContent>
        <h3 className="text-lg font-semibold">Price Per Share Trend</h3>
        <p className="text-xs text-slate-400">Lightweight client-side polling snapshots while this page is open.</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}>
              <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip />
              <Line type="monotone" dataKey="pps" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
