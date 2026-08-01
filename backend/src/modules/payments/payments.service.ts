import { prisma } from '../../prisma/client';

export const paymentsService = {
  async getActive() {
    return prisma.paymentAccount.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true, bankName: true, branch: true,
        accountNumber: true, accountHolder: true,
        paymentMethod: true, displayOrder: true,
      },
    });
  },

  async getAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [accounts, total] = await Promise.all([
      prisma.paymentAccount.findMany({
        skip, take: limit,
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.paymentAccount.count(),
    ]);
    return { accounts, total, page, limit };
  },

  async create(data: {
    bankName: string;
    branch: string;
    accountNumber: string;
    accountHolder: string;
    paymentMethod?: string;
    displayOrder?: number;
  }) {
    return prisma.paymentAccount.create({ data });
  },

  async update(id: string, data: Partial<{
    bankName: string; branch: string; accountNumber: string;
    accountHolder: string; paymentMethod: string; displayOrder: number; isActive: boolean;
  }>) {
    return prisma.paymentAccount.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.paymentAccount.update({ where: { id }, data: { isActive: false } });
  },
};
