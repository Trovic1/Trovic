import { Alert, DailyUsage, Room, Summary } from './types';

const API_BASE = 'http://localhost:4000/api';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  getSummary: () => fetchJson<Summary>('/summary'),
  getRooms: () => fetchJson<Room[]>('/rooms'),
  getAlerts: () => fetchJson<Alert[]>('/alerts'),
  getDailyUsage: () => fetchJson<DailyUsage[]>('/usage/daily')
};
