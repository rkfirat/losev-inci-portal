import { api } from '../config/api';

export interface CoalitionData {
  id: string;
  name: string;
  description: string;
  color: string;
  imageUrl: string;
  totalHours: number;
  memberCount: number;
}

export interface TeamLeaderboardResponse {
  success: boolean;
  data: CoalitionData[];
}

export class CoalitionService {
  static async getTeamLeaderboard(): Promise<TeamLeaderboardResponse> {
    const response = await api.get<TeamLeaderboardResponse>('/leaderboard/teams');
    return response.data;
  }

  static async getMyCoalitionDetails(): Promise<{ success: boolean; data: any }> {
    // This could be a specific endpoint or derived from /auth/me
    const response = await api.get('/auth/me');
    return { success: response.data.success, data: response.data.data.coalition };
  }
}
