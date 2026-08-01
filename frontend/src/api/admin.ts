import api from './client';
import { AdminDashboard, DepositRequest, WithdrawalRequest, User, PromoCode, PaginatedResponse } from '../types';

export const adminApi = {
  getDashboard: () =>
    api.get<{ success: boolean; data: AdminDashboard }>('/admin/dashboard'),

  // Deposits
  getDeposits: (page = 1, limit = 20, status?: string, search?: string) =>
    api.get<PaginatedResponse<DepositRequest>>('/admin/deposits', {
      params: { page, limit, status, search },
    }),
  approveDeposit: (id: string) =>
    api.post(`/admin/deposits/${id}/approve`),
  rejectDeposit: (id: string, reason: string) =>
    api.post(`/admin/deposits/${id}/reject`, { reason }),

  // Withdrawals
  getWithdrawals: (page = 1, limit = 20, status?: string, search?: string) =>
    api.get<PaginatedResponse<WithdrawalRequest>>('/admin/withdrawals', {
      params: { page, limit, status, search },
    }),
  approveWithdrawal: (id: string) =>
    api.post(`/admin/withdrawals/${id}/approve`),
  rejectWithdrawal: (id: string, reason: string) =>
    api.post(`/admin/withdrawals/${id}/reject`, { reason }),

  // Customers
  getCustomers: (page = 1, limit = 20, search?: string) =>
    api.get<PaginatedResponse<User>>('/admin/customers', { params: { page, limit, search } }),
  toggleCustomer: (id: string, isActive: boolean) =>
    api.patch(`/admin/customers/${id}/toggle`, { isActive }),

  // Promos
  getPromos: () =>
    api.get<{ success: boolean; data: PromoCode[] }>('/admin/promos'),
  createPromo: (data: Partial<PromoCode>) =>
    api.post('/admin/promos', data),
  updatePromo: (id: string, data: Partial<PromoCode>) =>
    api.put(`/admin/promos/${id}`, data),

  // Audit
  getAuditLogs: (page = 1, entityType?: string) =>
    api.get('/admin/audit-logs', { params: { page, entityType } }),

  // Settings
  getSettings: () =>
    api.get('/admin/settings'),
  updateSetting: (key: string, value: string, label?: string) =>
    api.put(`/admin/settings/${key}`, { value, label }),
};
