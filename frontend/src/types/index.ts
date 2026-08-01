export type Role = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

export type TransactionStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  mobileNumber: string;
  email?: string | null;
  walletBalance: number | string;
  pendingBalance?: number | string;
  createdAt?: string;
  isActive?: boolean;
}

export interface PaymentAccount {
  id: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountHolder: string;
  paymentMethod: string;
  displayOrder: number;
  isActive?: boolean;
}

export interface DepositRequest {
  id: string;
  referenceNumber: string;
  userId: string;
  amount: number | string;
  paymentAccountId: string;
  receiptUrl?: string;
  status: TransactionStatus;
  rejectionReason?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  paymentAccount?: { bankName: string; branch: string };
  user?: { username: string; fullName: string; mobileNumber: string };
}

export interface WithdrawalRequest {
  id: string;
  referenceNumber: string;
  userId: string;
  amount: number | string;
  bankName: string;
  accountHolder: string;
  maskedAccountNumber: string;
  branch?: string;
  status: TransactionStatus;
  rejectionReason?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  user?: { username: string; fullName: string; mobileNumber: string };
}

export interface PromoCode {
  id: string;
  code: string;
  bonusPercentage: number;
  description?: string;
  termsConditions?: string;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  walletBalance: number | string;
  pendingBalance: number | string;
  totalDeposits: number | string;
  totalWithdrawals: number | string;
  depositCount: number;
  withdrawalCount: number;
  recentTransactions: Array<{
    id: string;
    referenceNumber: string;
    amount: number | string;
    status: TransactionStatus;
    type: TransactionType;
    createdAt: string;
  }>;
}

export interface AdminDashboard {
  totalCustomers: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  todayDepositsAmount: number | string;
  todayDepositsCount: number;
  todayWithdrawalsAmount: number | string;
  todayWithdrawalsCount: number;
  approvedDeposits: number;
  rejectedDeposits: number;
  recentDeposits: DepositRequest[];
  recentWithdrawals: WithdrawalRequest[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
