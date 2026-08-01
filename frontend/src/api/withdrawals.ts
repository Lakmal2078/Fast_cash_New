import api, { generateIdempotencyKey } from './client';
import { WithdrawalRequest, PaginatedResponse } from '../types';

export const withdrawalsApi = {
  create: (data: {
    amount: number;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    branch?: string;
    note?: string;
  }) =>
    api.post<{ success: boolean; data: WithdrawalRequest }>('/withdrawals', data, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    }),

  getMyWithdrawals: (page = 1, limit = 10, status?: string) =>
    api.get<PaginatedResponse<WithdrawalRequest>>('/withdrawals/my', {
      params: { page, limit, status },
    }),
};
