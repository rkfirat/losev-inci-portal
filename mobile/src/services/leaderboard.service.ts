import { api } from '../config/api';

export interface LeaderboardUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  school?: string;
  totalHours: number;
  badgeCount: number;
}

export const LeaderboardService = {
  getLeaderboard: async () => {
    const res = await api.get('/leaderboard');
    return res.data;
  },
};
