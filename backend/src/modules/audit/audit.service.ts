import { prisma } from '../../prisma/client';

interface AuditLogEntry {
  actorId?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export const auditService = {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: entry.actorId,
          actorRole: entry.actorRole,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          metadata: entry.metadata ? JSON.parse(JSON.stringify(entry.metadata)) : undefined,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
    } catch (err) {
      // Audit logs must never crash the main flow
      console.error('[Audit] Failed to write audit log:', err);
    }
  },

  async getLogs(filters: {
    actorId?: string;
    entityType?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.actorId && { actorId: filters.actorId }),
      ...(filters.entityType && { entityType: filters.entityType }),
      ...(filters.action && { action: { contains: filters.action } }),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { username: true, fullName: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit };
  },
};
