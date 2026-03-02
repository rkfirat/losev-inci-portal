import { api } from '../config/api';

export const AdminService = {
  getVolunteers: async (page = 1, search = '') => {
    const res = await api.get('/admin/volunteers', { params: { page, search } });
    return res.data;
  },

  toggleUserStatus: async (userId: string) => {
    const res = await api.patch(`/admin/volunteers/${userId}/toggle-status`);
    return res.data;
  },

  deleteUser: async (userId: string) => {
    const res = await api.delete(`/admin/volunteers/${userId}`);
    return res.data;
  },

  createEvent: async (data: any) => {
    const res = await api.post('/admin/events', data);
    return res.data;
  },

  updateEvent: async (id: string, data: any) => {
    const res = await api.patch(`/admin/events/${id}`, data);
    return res.data;
  },

  deleteEvent: async (id: string) => {
    const res = await api.delete(`/admin/events/${id}`);
    return res.data;
  },

  getReport: async () => {
    const res = await api.get('/admin/reports/volunteers');
    return res.data;
  },

  sendAnnouncement: async (data: { title: string, content: string }) => {
    const res = await api.post('/admin/announcements', data);
    return res.data;
  },
};
