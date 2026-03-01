export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phone?: string;
  tcKimlikNo?: string;
  school?: string;
  city?: string;
  district?: string;
  grade?: string;
  coordinatorName?: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  emailVerified: boolean;
  createdAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  tcKimlikNo?: string;
  school?: string;
  city?: string;
  district?: string;
  grade?: string;
  coordinatorName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
