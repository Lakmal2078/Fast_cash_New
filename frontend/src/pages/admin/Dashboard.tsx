import { useQuery } from '@tanstack/react-query';
import { Users, ArrowDownCircle, ArrowUpCircle, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminDashboard, DepositRequest, WithdrawalRequest, TransactionStatus } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { format } from 'date-fns';

function StatCard({
  label, value, sub, icon, color,
}: { label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="card-dark p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
          <p className="teko text-3xl font-bold text-white leading-none">{value}</p>
          {sub && <p className="text-muted text-xs mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<AdminDashboard>({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard().then(r => r.data.data),
    refetchInterval: 30_000,
  });

  const fmt = (v: string | number) => `Rs. ${Number(v).toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="teko text-4xl font-bold tracking-widest text-white">ADMIN DASHBOARD</h1>
        <p className="text-muted text-sm">Real-time overview of Xbet Fast Cash operations</p>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Customers" value={data?.totalCustomers || 0} icon={<Users size={18} />} color="bg-bright/20 text-bright" />
          <StatCard label="Pending Deposits" value={data?.pendingDeposits || 0} icon={<ArrowDownCircle size={18} />} color="bg-yellow-500/20 text-yellow-400" />
          <StatCard label="Pending Withdrawals" value={data?.pendingWithdrawals || 0} icon={<ArrowUpCircle size={18} />} color="bg-orange-500/20 text-orange-400" />
          <StatCard
            label="Today's Deposits"
            value={fmt(data?.todayDepositsAmount || 0)}
            sub={`${data?.todayDepositsCount || 0} transactions`}
            icon={<TrendingUp size={18} />}
            color="bg-xgreen/20 text-xgreen"
          />
          <StatCard
            label="Today's Withdrawals"
            value={fmt(data?.todayWithdrawalsAmount || 0)}
            sub={`${data?.todayWithdrawalsCount || 0} transactions`}
            icon={<TrendingDown size={18} />}
            color="bg-red-500/20 text-red-400"
          />
          <StatCard label="Approved Deposits" value={data?.approvedDeposits || 0} icon={<CheckCircle size={18} />} color="bg-xgreen/20 text-xgreen" />
          <StatCard label="Rejected Deposits" value={data?.rejectedDeposits || 0} icon={<XCircle size={18} />} color="bg-red-500/20 text-red-400" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Deposits */}
        <div className="card-dark p-5">
          <h2 className="teko text-xl font-bold tracking-widest text-white mb-4">RECENT DEPOSITS</h2>
          <div className="space-y-2">
            {!data?.recentDeposits?.length ? (
              <p className="text-muted text-sm text-center py-4">No recent deposits</p>
            ) : (
              data.recentDeposits.map((dep: DepositRequest) => (
                <div key={dep.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-bold truncate">{dep.referenceNumber}</div>
                    <div className="text-muted text-xs">{dep.user?.username} • {format(new Date(dep.createdAt), 'dd MMM HH:mm')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm font-bold">Rs. {Number(dep.amount).toLocaleString()}</div>
                    <StatusBadge status={dep.status as TransactionStatus} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="card-dark p-5">
          <h2 className="teko text-xl font-bold tracking-widest text-white mb-4">RECENT WITHDRAWALS</h2>
          <div className="space-y-2">
            {!data?.recentWithdrawals?.length ? (
              <p className="text-muted text-sm text-center py-4">No recent withdrawals</p>
            ) : (
              data.recentWithdrawals.map((wdr: WithdrawalRequest) => (
                <div key={wdr.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-bold truncate">{wdr.referenceNumber}</div>
                    <div className="text-muted text-xs">{wdr.user?.username} • {format(new Date(wdr.createdAt), 'dd MMM HH:mm')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm font-bold">Rs. {Number(wdr.amount).toLocaleString()}</div>
                    <StatusBadge status={wdr.status as TransactionStatus} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
