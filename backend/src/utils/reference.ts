import { prisma } from '../prisma/client';

export async function generateReference(prefix: 'DEP' | 'WDR'): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  // Get a sequence number for today
  const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  let count = 0;
  if (prefix === 'DEP') {
    count = await prisma.depositRequest.count({
      where: { createdAt: { gte: todayStart, lt: todayEnd } },
    });
  } else {
    count = await prisma.withdrawalRequest.count({
      where: { createdAt: { gte: todayStart, lt: todayEnd } },
    });
  }

  const seq = (count + 1).toString().padStart(4, '0');
  return `${prefix}-${year}${month}${day}-${seq}`;
}
