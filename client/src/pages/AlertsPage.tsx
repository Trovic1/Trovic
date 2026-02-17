import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Alert } from '../lib/types';

const severityStyles: Record<Alert['severity'], string> = {
  low: 'bg-sky-900/40 text-sky-300',
  medium: 'bg-amber-900/40 text-amber-300',
  high: 'bg-rose-900/40 text-rose-300'
};

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    api.getAlerts().then(setAlerts);
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Alerts</h2>
      {alerts.map((alert) => (
        <article key={alert.id} className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">Room {alert.roomNumber}</span>
            <span className={`rounded-full px-2 py-1 text-xs font-medium uppercase ${severityStyles[alert.severity]}`}>{alert.severity}</span>
          </div>
          <p className="text-slate-300">{alert.message}</p>
          <p className="mt-2 text-xs text-slate-500">{new Date(alert.createdAt).toLocaleString()} · {alert.resolved ? 'Resolved' : 'Open'}</p>
        </article>
      ))}
    </section>
  );
}
