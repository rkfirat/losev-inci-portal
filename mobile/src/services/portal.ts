import { api } from './api';
import type { ApiResponse } from '../types/api';
import type { DashboardData, VolunteerHour, Badge, EventItem, LeaderboardEntry, Pagination } from '../types/portal';

function extractData<T>(response: ApiResponse<T>): T {
    if (!response.data) throw new Error('Unexpected empty response');
    return response.data;
}

export const portalService = {
    // Dashboard
    async getDashboard(): Promise<DashboardData> {
        const { data } = await api.get<ApiResponse<DashboardData>>('/dashboard');
        return extractData(data);
    },

    // Volunteer Hours
    async createHour(input: {
        projectName: string;
        date: string;
        hours: number;
        description?: string;
        activityType?: string;
        photoUrl?: string;
        documentUrl?: string;
    }): Promise<VolunteerHour> {
        const { data } = await api.post<ApiResponse<VolunteerHour>>('/volunteer-hours', input);
        return extractData(data);
    },

    async listHours(page = 1, status?: string): Promise<{ hours: VolunteerHour[]; totalApprovedHours: number; pagination: Pagination }> {
        const params: Record<string, unknown> = { page, limit: 20 };
        if (status) params.status = status;
        const { data } = await api.get<ApiResponse<{ hours: VolunteerHour[]; totalApprovedHours: number; pagination: Pagination }>>('/volunteer-hours', { params });
        return extractData(data);
    },

    // Review hours (Teacher/Admin)
    async reviewHour(hourId: string, status: 'APPROVED' | 'REJECTED', feedback?: string): Promise<VolunteerHour> {
        const { data } = await api.patch<ApiResponse<VolunteerHour>>(`/volunteer-hours/${hourId}/review`, { status, feedback });
        return extractData(data);
    },

    // Teacher: pending reviews
    async getPendingReviews(): Promise<VolunteerHour[]> {
        const { data } = await api.get<ApiResponse<VolunteerHour[]>>('/teacher/pending-reviews');
        return extractData(data);
    },

    // Badges
    async listBadges(): Promise<Badge[]> {
        const { data } = await api.get<ApiResponse<Badge[]>>('/badges');
        return extractData(data);
    },

    async getBadgeDetail(id: string): Promise<Badge> {
        const { data } = await api.get<ApiResponse<Badge>>(`/badges/${id}`);
        return extractData(data);
    },

    // Events
    async listEvents(page = 1, status = 'upcoming'): Promise<{ events: EventItem[]; pagination: Pagination }> {
        const { data } = await api.get<ApiResponse<{ events: EventItem[]; pagination: Pagination }>>('/events', { params: { page, limit: 20, status } });
        return extractData(data);
    },

    async getEventDetail(id: string): Promise<EventItem> {
        const { data } = await api.get<ApiResponse<EventItem>>(`/events/${id}`);
        return extractData(data);
    },

    async createEvent(input: {
        title: string;
        description?: string;
        date: string;
        endDate?: string;
        location?: string;
        capacity?: number;
    }): Promise<EventItem> {
        const { data } = await api.post<ApiResponse<EventItem>>('/events', input);
        return extractData(data);
    },

    async participateEvent(id: string): Promise<void> {
        await api.post(`/events/${id}/participate`);
    },

    async cancelParticipation(id: string): Promise<void> {
        await api.delete(`/events/${id}/participate`);
    },

    // Leaderboard
    async getLeaderboard(period = 'monthly'): Promise<{ entries: LeaderboardEntry[]; currentUserRank: LeaderboardEntry | null; period: string }> {
        const { data } = await api.get<ApiResponse<{ entries: LeaderboardEntry[]; currentUserRank: LeaderboardEntry | null; period: string }>>('/leaderboard', { params: { period } });
        return extractData(data);
    },
};
