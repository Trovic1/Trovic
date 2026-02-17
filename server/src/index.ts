import express from 'express';
import cors from 'cors';
import { db, initializeDatabase } from './db';

initializeDatabase();

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/api/rooms', (_req, res) => {
  const rooms = db.prepare('SELECT * FROM rooms ORDER BY roomNumber').all();
  res.json(rooms);
});

app.get('/api/alerts', (_req, res) => {
  const alerts = db.prepare('SELECT * FROM alerts ORDER BY datetime(createdAt) DESC').all();
  res.json(alerts);
});

app.get('/api/usage/daily', (_req, res) => {
  const usage = db.prepare('SELECT day, kwh FROM daily_usage ORDER BY id').all();
  res.json(usage);
});

app.get('/api/summary', (_req, res) => {
  const totalRooms = (db.prepare('SELECT COUNT(*) as count FROM rooms').get() as { count: number }).count;
  const activeAlerts = (db.prepare('SELECT COUNT(*) as count FROM alerts WHERE resolved = 0').get() as { count: number }).count;
  const totalMonthlyKwh = (db.prepare('SELECT SUM(monthlyKwh) as total FROM rooms').get() as { total: number }).total;
  const avgRoomKwh = totalMonthlyKwh / totalRooms;
  const estimatedBill = Number((totalMonthlyKwh * 68).toFixed(2));

  res.json({ totalRooms, activeAlerts, totalMonthlyKwh, avgRoomKwh, estimatedBill });
});

app.listen(port, () => {
  console.log(`PowerSense demo server running on http://localhost:${port}`);
});
