import api, { generateIdempotencyKey } from './client';
import { DepositRequest, PaginatedResponse } from '../types';

export const depositsApi = {
  create: (data: {
    amount: number;
    paymentAccountId: string;
    receiptUrl?: string;
    receiptKey?: string;
    note?: string;
  }) =>
    api.post<{ success: boolean; data: DepositRequest }>('/deposits', data, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    }),

  getMyDeposits: (page = 1, limit = 10, status?: string) =>
    api.get<PaginatedResponse<DepositRequest>>('/deposits/my', {
      params: { page, limit, status },
    }),

  getOne: (id: string) =>
    api.get<{ success: boolean; data: DepositRequest }>(`/deposits/${id}`),

  getUploadUrl: (filename: string, mimeType: string) =>
    api.post<{ success: boolean; data: { uploadUrl: string; key: string; method: string } }>(
      '/deposits/upload-url',
      { filename, mimeType }
    ),

  uploadFile: (key: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.put<{ success: boolean; data: { url: string; key: string } }>(
      `/deposits/upload/${encodeURIComponent(key)}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};
