import api from './client';
import { User } from '../types';

export interface RegisterPayload {
  fullName: string;
  mobileNumber: string;
  email?: string;
  username: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
  promoCode?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<{ success: boolean; data: { user: User; token: string } }>('/auth/register', data),

  login: (data: LoginPayload) =>
    api.post<{ success: boolean; data: { user: User; token: string } }>('/auth/login', data),

  me: () =>
    api.get<{ success: boolean; data: User }>('/auth/me'),
};
