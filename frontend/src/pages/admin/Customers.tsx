import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { User } from '../../types';
import { SkeletonTable } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { toast } from '../../components/ui/Toast';
import { getErrorMessage } from '../../api/client';
import { format } from 'date-fns';

export default function AdminCustomers() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: () => adminApi.getCustomers(page, 20, search || undefined).then(r => r.data),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.toggleCustomer(id, isActive),
    onSuccess: () => { toast('success', 'Customer status updated'); qc.invalidateQueries({ queryKey: ['admin-customers'] }); },
    onError: (e) => toast('error', getErrorMessage(e)),
  });

  const customers: User[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="teko text-4xl font-bold tracking-widest text-white">CUSTOMER MANAGEMENT</h1>
        <p className="text-muted text-sm">View and manage registered customers</p>
      </div>

      <div className="flex items-center gap-2 input-xbet px-3 py-0">
        <Search size={16} className="text-muted" />
        <input
          className="flex-1 bg-transparent outline-none py-2.5 text-white placeholder-muted text-sm font-semibold"
          placeholder="Search by username, name or mobile..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card-dark overflow-hidden">
        {isLoading ? (
          <div className="p-4"><SkeletonTable rows={6} /></div>
        ) : !customers.length ? (
          <EmptyState icon="👤" title="No customers found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: 'rgba(30,91,232,.15)', borderBottom: '1px solid rgba(58,127,255,.2)' }}>
                <tr>
                  {['Username', 'Full Name', 'Mobile', 'Balance', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-bright text-xs font-bold tracking-widest uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-xgray">@{c.username}</td>
                    <td className="px-4 py-3 text-white font-bold text-xs">{c.fullName}</td>
                    <td className="px-4 py-3 text-muted text-xs font-mono">{c.mobileNumber}</td>
                    <td className="px-4 py-3 text-white font-bold whitespace-nowrap">Rs. {Number(c.walletBalance).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">{c.createdAt ? format(new Date(c.createdAt), 'dd MMM yyyy') : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${c.isActive ? 'status-approved' : 'status-rejected'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleMut.mutate({ id: c.id, isActive: !c.isActive })}
                        disabled={toggleMut.isPending}
                        className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                        style={{ background: c.isActive ? 'rgba(255,80,80,.1)' : 'rgba(0,232,122,.1)' }}
                        title={c.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {c.isActive ? <ToggleRight size={16} className="text-red-400" /> : <ToggleLeft size={16} className="text-xgreen" />}
                      </button>
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
    </div>
  );
}
