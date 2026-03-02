import { api } from '../config/api';

export interface UserStats {
  totalHours: number;
  totalBadges: number;
  upcomingEvents: number;
  rank?: number;
}

export const ProfileService = {
  getStats: async () => {
    const res = await api.get('/volunteers/stats');
    return res.data;
  },

  updateProfile: async (data: any) => {
    const res = await api.patch('/auth/profile', data);
    return res.data;
  },

  getCertificate: async () => {
    return api.get('/volunteers/certificate', {
      responseType: 'blob'
    });
  },
};
