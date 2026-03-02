import { api } from '../config/api';

export interface VolunteerHour {
  id: string;
  projectName: string;
  description?: string;
  hours: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface VolunteerStats {
  totalHours: number;
  totalBadges: number;
  upcomingEvents: number;
}

export class VolunteerService {
  static async logHours(data: { projectName: string; description?: string; hours: number; date: string }) {
    const response = await api.post('/volunteers/log-hours', data);
    return response.data;
  }

  static async getMyHours(page = 1, limit = 20) {
    const response = await api.get('/volunteers/my-hours', { params: { page, limit } });
    return response.data;
  }

  static async getStats(): Promise<{ success: boolean; data: VolunteerStats }> {
    const response = await api.get('/volunteers/stats');
    return response.data;
  }

  static async getPendingHours(page = 1, limit = 20) {
    const response = await api.get('/volunteers/pending-hours', { params: { page, limit } });
    return response.data;
  }

  static async approveHours(id: string, status: 'APPROVED' | 'REJECTED') {
    const response = await api.patch(`/volunteers/approve-hours/${id}`, { status });
    return response.data;
  }
}
