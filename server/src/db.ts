import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'powersense.db');
export const db = new Database(dbPath);

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roomNumber TEXT NOT NULL,
      occupantName TEXT NOT NULL,
      block TEXT NOT NULL,
      currentKwh REAL NOT NULL,
      monthlyKwh REAL NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roomNumber TEXT NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      resolved INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS daily_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL,
      kwh REAL NOT NULL
    );
  `);

  const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get() as { count: number };
  if (roomCount.count === 0) seedData();
}

function seedData() {
  const rooms = [
    ['A-101', 'David Obi', 'A', 4.8, 132.4, 'normal'],
    ['A-102', 'Favour James', 'A', 6.7, 188.9, 'warning'],
    ['A-103', 'Musa Bello', 'A', 9.2, 230.5, 'critical'],
    ['B-201', 'Ada Nwosu', 'B', 3.9, 120.3, 'normal'],
    ['B-202', 'Tosin Lawal', 'B', 5.4, 164.8, 'warning'],
    ['B-203', 'Peace Umoh', 'B', 2.7, 101.9, 'normal'],
    ['C-301', 'Samuel Okeke', 'C', 8.1, 210.2, 'critical'],
    ['C-302', 'Rita Yusuf', 'C', 4.2, 139.4, 'normal'],
    ['C-303', 'John Eze', 'C', 7.5, 196.1, 'warning'],
    ['D-401', 'Deborah Ali', 'D', 5.0, 170.3, 'normal']
  ];

  const insertRoom = db.prepare(
    'INSERT INTO rooms (roomNumber, occupantName, block, currentKwh, monthlyKwh, status) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertAlert = db.prepare(
    'INSERT INTO alerts (roomNumber, severity, message, createdAt, resolved) VALUES (?, ?, ?, ?, ?)'
  );
  const insertUsage = db.prepare('INSERT INTO daily_usage (day, kwh) VALUES (?, ?)');

  const insertMany = db.transaction(() => {
    rooms.forEach((room) => insertRoom.run(...room));

    [
      ['A-103', 'high', 'High load detected above safe threshold for 3 hours.', new Date().toISOString(), 0],
      ['C-301', 'high', 'Possible illegal appliance usage in room C-301.', new Date(Date.now() - 3600000).toISOString(), 0],
      ['A-102', 'medium', 'Unusual evening consumption pattern observed.', new Date(Date.now() - 7200000).toISOString(), 0],
      ['D-401', 'low', 'Power factor dropped below optimal band briefly.', new Date(Date.now() - 14400000).toISOString(), 1]
    ].forEach((alert) => insertAlert.run(...alert));

    [
      ['Mon', 312],
      ['Tue', 338],
      ['Wed', 305],
      ['Thu', 356],
      ['Fri', 372],
      ['Sat', 330],
      ['Sun', 319]
    ].forEach((usage) => insertUsage.run(...usage));
  });

  insertMany();
}
