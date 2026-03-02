import { api } from '../config/api';
import { User, AuthTokens, useAuthStore } from '../store/auth.store';

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  };
  error?: {
    message: string;
    details?: any[];
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface AuthUrlResponse {
  success: boolean;
  data: {
    authUrl: string;
  };
}

export class AuthService {
  static async register(data: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.success) {
      useAuthStore.getState().setAuth(response.data.data.user, response.data.data.tokens);
    }
    return response.data;
  }

  static async login(data: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.success) {
      useAuthStore.getState().setAuth(response.data.data.user, response.data.data.tokens);
    }
    return response.data;
  }

  static async getMe(): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/auth/me');
    return response.data;
  }

  static async get42AuthUrl(): Promise<AuthUrlResponse> {
    const response = await api.get<AuthUrlResponse>('/auth/42');
    return response.data;
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error on server', e);
    } finally {
      useAuthStore.getState().logout();
    }
  }
}
