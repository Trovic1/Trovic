export interface Room {
  id: number;
  roomNumber: string;
  occupantName: string;
  block: string;
  currentKwh: number;
  monthlyKwh: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface Alert {
  id: number;
  roomNumber: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  createdAt: string;
  resolved: number;
}

export interface Summary {
  totalRooms: number;
  activeAlerts: number;
  totalMonthlyKwh: number;
  avgRoomKwh: number;
  estimatedBill: number;
}

export interface DailyUsage {
  day: string;
  kwh: number;
}
