export type ActivityType = 'SEMINAR' | 'STAND' | 'DONATION' | 'FAIR' | 'AWARENESS' | 'SOCIAL_MEDIA' | 'OTHER';

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
    SEMINAR: 'Seminer',
    STAND: 'Stant',
    DONATION: 'Bağış',
    FAIR: 'Kermes',
    AWARENESS: 'Farkındalık Etkinliği',
    SOCIAL_MEDIA: 'Sosyal Medya Çalışması',
    OTHER: 'Diğer',
};

export interface VolunteerHour {
    id: string;
    activityType: ActivityType;
    projectName: string;
    date: string;
    hours: number;
    description?: string;
    photoUrl?: string;
    documentUrl?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewNote?: string;
    createdAt: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    iconUrl?: string;
    criteria: { type: string; threshold: number };
    earned: boolean;
    earnedAt?: string;
    progress?: number;
    threshold?: number;
    progressPercent?: number;
}

export interface EventItem {
    id: string;
    title: string;
    description?: string;
    date: string;
    endDate?: string;
    location?: string;
    capacity?: number;
    participantCount: number;
    isFull: boolean;
    isParticipating?: boolean;
    createdAt: string;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    school?: string;
    totalHours: number;
    badgeCount: number;
}

export interface DashboardData {
    stats: {
        totalHours: number;
        monthlyHours: number;
        yearlyHours: number;
        targetHours: number;
        pendingCount: number;
        earnedBadges: number;
        totalBadges: number;
        leaderboardRank: number;
    };
    recentBadges: Array<{
        id: string;
        name: string;
        iconUrl?: string;
        earnedAt: string;
    }>;
    upcomingEvents: Array<{
        id: string;
        title: string;
        date: string;
        location?: string;
        participantCount: number;
        capacity?: number;
    }>;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
