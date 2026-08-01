import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Check, X } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { WithdrawalRequest, TransactionStatus } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { toast } from '../../components/ui/Toast';
import { getErrorMessage } from '../../api/client';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

export default function AdminWithdrawals() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [rejectId, setRejectId] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawals', page, search, status],
    queryFn: () => adminApi.getWithdrawals(page, 20, status || undefined, search || undefined).then(r => r.data),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => adminApi.approveWithdrawal(id),
    onSuccess: () => { toast('success', 'Withdrawal approved!'); qc.invalidateQueries({ queryKey: ['admin-withdrawals'] }); qc.invalidateQueries({ queryKey: ['admin-dashboard'] }); },
    onError: (e) => toast('error', getErrorMessage(e)),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.rejectWithdrawal(id, reason),
    onSuccess: () => { toast('success', 'Withdrawal rejected.'); setRejectId(''); setRejectReason(''); qc.invalidateQueries({ queryKey: ['admin-withdrawals'] }); },
    onError: (e) => toast('error', getErrorMessage(e)),
  });

  const withdrawals: WithdrawalRequest[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="teko text-4xl font-bold tracking-widest text-white">WITHDRAWAL MANAGEMENT</h1>
        <p className="text-muted text-sm">Process customer withdrawal requests</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] input-xbet px-3 py-0">
          <Search size={16} className="text-muted" />
          <input
            className="flex-1 bg-transparent outline-none py-2.5 text-white placeholder-muted text-sm font-semibold"
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input-xbet w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-deep">{s || 'All Status'}</option>)}
        </select>
      </div>

      <div className="card-dark overflow-hidden">
        {isLoading ? (
          <div className="p-4"><SkeletonTable rows={6} /></div>
        ) : !withdrawals.length ? (
          <EmptyState icon="💸" title="No withdrawals found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: 'rgba(30,91,232,.15)', borderBottom: '1px solid rgba(58,127,255,.2)' }}>
                <tr>
                  {['Reference', 'Customer', 'Amount', 'Bank', 'Account', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-bright text-xs font-bold tracking-widest uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(wdr => (
                  <tr key={wdr.id} className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-xgray whitespace-nowrap">{wdr.referenceNumber}</td>
                    <td className="px-4 py-3">
                      <div className="text-white font-bold text-xs">{wdr.user?.username}</div>
                      <div className="text-muted text-[11px]">{wdr.user?.fullName}</div>
                    </td>
                    <td className="px-4 py-3 text-white font-bold whitespace-nowrap">Rs. {Number(wdr.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{wdr.bankName}</td>
                    <td className="px-4 py-3 text-xs text-muted font-mono">{wdr.maskedAccountNumber}</td>
                    <td className="px-4 py-3"><StatusBadge status={wdr.status as TransactionStatus} /></td>
                    <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{format(new Date(wdr.createdAt), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {(wdr.status === 'PENDING' || wdr.status === 'UNDER_REVIEW') && (
                          <>
                            <button onClick={() => approveMut.mutate(wdr.id)} disabled={approveMut.isPending}
                              className="p-1.5 rounded-lg bg-xgreen/10 text-xgreen hover:bg-xgreen/20 transition-colors disabled:opacity-50" title="Approve">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setRejectId(wdr.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Reject">
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(4,10,22,.9)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md card-dark p-6 rounded-2xl animate-fade-in">
            <h3 className="teko text-2xl font-bold text-white mb-4">REJECT WITHDRAWAL</h3>
            <textarea className="input-xbet w-full h-24 resize-none mb-4" placeholder="Reason for rejection..."
              value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => { setRejectId(''); setRejectReason(''); }}
                className="flex-1 py-3 rounded-xl border border-white/20 text-xgray font-bold">Cancel</button>
              <button onClick={() => rejectMut.mutate({ id: rejectId, reason: rejectReason })}
                disabled={!rejectReason.trim() || rejectMut.isPending}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold disabled:opacity-50">
                {rejectMut.isPending ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
