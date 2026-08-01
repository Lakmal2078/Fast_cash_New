import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { SkeletonTable } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { format } from 'date-fns';

export default function AdminAuditLogs() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page, entityType],
    queryFn: () => adminApi.getAuditLogs(page, entityType || undefined).then(r => r.data),
  });

  const logs: Array<{
    id: string; actorId?: string; actorRole?: string; action: string;
    entityType: string; entityId?: string; ipAddress?: string; createdAt: string;
    actor?: { username: string; fullName: string };
  }> = data?.data || [];
  const pagination = data?.pagination;

  const actionColors: Record<string, string> = {
    USER_LOGIN: 'text-bright',
    USER_REGISTERED: 'text-xgreen',
    DEPOSIT_CREATED: 'text-yellow-400',
    DEPOSIT_APPROVED: 'text-xgreen',
    DEPOSIT_REJECTED: 'text-red-400',
    WITHDRAWAL_CREATED: 'text-yellow-400',
    WITHDRAWAL_APPROVED: 'text-xgreen',
    WITHDRAWAL_REJECTED: 'text-red-400',
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="teko text-4xl font-bold tracking-widest text-white">AUDIT LOGS</h1>
        <p className="text-muted text-sm">Immutable record of all system actions (read-only)</p>
      </div>

      <div className="flex gap-3">
        <select
          className="input-xbet w-auto"
          value={entityType}
          onChange={e => { setEntityType(e.target.value); setPage(1); }}
        >
          {['', 'User', 'DepositRequest', 'WithdrawalRequest'].map(t => (
            <option key={t} value={t} className="bg-deep">{t || 'All Entities'}</option>
          ))}
        </select>
      </div>

      <div className="card-dark overflow-hidden">
        {isLoading ? (
          <div className="p-4"><SkeletonTable rows={8} /></div>
        ) : !logs.length ? (
          <EmptyState icon="📋" title="No audit logs" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead style={{ background: 'rgba(30,91,232,.15)', borderBottom: '1px solid rgba(58,127,255,.2)' }}>
                <tr>
                  {['Time', 'Actor', 'Role', 'Action', 'Entity', 'Entity ID', 'IP'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-bright font-bold tracking-widest uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-2.5 text-muted font-mono whitespace-nowrap">
                      {format(new Date(log.createdAt), 'dd MMM HH:mm:ss')}
                    </td>
                    <td className="px-4 py-2.5 text-white font-bold">
                      {log.actor?.username || log.actorId?.slice(0, 8) || 'System'}
                    </td>
                    <td className="px-4 py-2.5 text-muted">{log.actorRole || '-'}</td>
                    <td className={`px-4 py-2.5 font-bold whitespace-nowrap ${actionColors[log.action] || 'text-xgray'}`}>
                      {log.action}
                    </td>
                    <td className="px-4 py-2.5 text-muted">{log.entityType}</td>
                    <td className="px-4 py-2.5 text-muted font-mono truncate max-w-[120px]">{log.entityId?.slice(0, 12) || '-'}</td>
                    <td className="px-4 py-2.5 text-muted font-mono">{log.ipAddress || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination && (
          <div className="p-4"><Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} /></div>
        )}
      </div>
    </div>
  );
}
