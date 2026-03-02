import { api } from '../config/api';

export interface EventParticipant {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  status: string;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity?: number;
  imageUrl?: string;
  _count: {
    participants: number;
  };
  participants: EventParticipant[];
  isUserParticipating: boolean;
  userParticipationStatus?: string;
}

export const EventService = {
  getAllEvents: async () => {
    const res = await api.get('/events');
    return res.data;
  },

  getEventById: async (id: string) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },

  participate: async (id: string) => {
    const res = await api.post(`/events/${id}/participate`);
    return res.data;
  },

  cancelParticipation: async (id: string) => {
    const res = await api.delete(`/events/${id}/participate`);
    return res.data;
  },
};
