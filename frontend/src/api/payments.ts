import api from './client';
import { PaymentAccount, PaginatedResponse } from '../types';

export const paymentsApi = {
  getActive: () =>
    api.get<{ success: boolean; data: PaymentAccount[] }>('/payment-accounts'),

  getAll: (page = 1) =>
    api.get<PaginatedResponse<PaymentAccount>>('/payment-accounts/all', { params: { page } }),

  create: (data: Partial<PaymentAccount>) =>
    api.post<{ success: boolean; data: PaymentAccount }>('/payment-accounts', data),

  update: (id: string, data: Partial<PaymentAccount>) =>
    api.put<{ success: boolean; data: PaymentAccount }>(`/payment-accounts/${id}`, data),

  toggle: (id: string, isActive: boolean) =>
    api.patch(`/payment-accounts/${id}/toggle`, { isActive }),
};
