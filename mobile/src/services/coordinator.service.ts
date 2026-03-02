import { api } from '../config/api';

export const CoordinatorService = {
  getPendingHours: async (page = 1) => {
    const res = await api.get('/coordinator/hours/pending', { params: { page } });
    return res.data;
  },

  updateHourStatus: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await api.patch(`/coordinator/hours/${id}/status`, { status });
    return res.data;
  },
};
