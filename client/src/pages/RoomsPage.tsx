import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Room } from '../lib/types';

const statusColor: Record<Room['status'], string> = {
  normal: 'text-emerald-300',
  warning: 'text-amber-300',
  critical: 'text-rose-300'
};

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    api.getRooms().then(setRooms);
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Room Monitoring</h2>
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-full bg-slate-900 text-sm">
          <thead className="bg-slate-800 text-left text-slate-300">
            <tr>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Occupant</th>
              <th className="px-4 py-3">Block</th>
              <th className="px-4 py-3">Current kWh</th>
              <th className="px-4 py-3">Monthly kWh</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-t border-slate-700">
                <td className="px-4 py-3">{room.roomNumber}</td>
                <td className="px-4 py-3">{room.occupantName}</td>
                <td className="px-4 py-3">{room.block}</td>
                <td className="px-4 py-3">{room.currentKwh}</td>
                <td className="px-4 py-3">{room.monthlyKwh}</td>
                <td className={`px-4 py-3 font-semibold capitalize ${statusColor[room.status]}`}>{room.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
