import { api } from '../config/api';

export interface DashboardData {
  stats: {
    totalHours: number;
    badgeCount: number;
    rank: number | null;
  };
  weeklyHours: { date: string; hours: number }[];
  recentBadges: any[];
  upcomingEvents: any[];
  announcements: any[];
}

export interface AdminDashboardData {
  pendingHoursCount: number;
  activeVolunteersCount: number;
  activeEventsCount: number;
  totalSystemHours: number;
  totalBadgesAwarded: number;
}

export const DashboardService = {
  getDashboardData: async () => {
    const res = await api.get('/dashboard');
    return res.data;
  },

  getAdminStats: async () => {
    const res = await api.get('/dashboard/admin');
    return res.data;
  },
};
