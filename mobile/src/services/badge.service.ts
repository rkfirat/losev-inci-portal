import { api } from '../config/api';

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'hours' | 'events' | 'special';
  criteria: any;
  earnedAt?: string; // Only if fetched via /my
}

export class BadgeService {
  static async getAllBadges() {
    const response = await api.get<{ success: boolean; data: Badge[] }>('/badges');
    return response.data;
  }

  static async getMyBadges() {
    const response = await api.get<{ success: boolean; data: Badge[] }>('/badges/my');
    return response.data;
  }
}
