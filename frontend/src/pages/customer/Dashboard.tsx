import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle, Clock, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { DashboardStats, TransactionStatus, TransactionType } from '../../types';
import { format } from 'date-fns';

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="card-dark p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted text-xs font-bold uppercase tracking-widest">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <div className="teko text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/users/dashboard').then(r => r.data.data),
    refetchInterval: 30_000,
  });

  const fmt = (v: string | number) =>
    `Rs. ${Number(v).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

  const quickActions = [
    { label: 'Deposit', icon: <ArrowDownCircle size={20} />, to: '/deposit', color: 'bg-xgreen/20 text-xgreen' },
    { label: 'Withdraw', icon: <ArrowUpCircle size={20} />, to: '/withdrawal', color: 'bg-xgold/20 text-xgold' },
    { label: 'History', icon: <Clock size={20} />, to: '/history', color: 'bg-bright/20 text-bright' },
    { label: 'Profile', icon: <CreditCard size={20} />, to: '/profile', color: 'bg-purple-500/20 text-purple-400' },
  ];

  return (
    <div className="p-4 space-y-5">
      {/* Welcome */}
      <div className="animate-fade-in">
        <h1 className="teko text-3xl font-bold tracking-widest text-white">
          Welcome, <span className="text-bright">{user?.fullName?.split(' ')[0]}</span>!
        </h1>
        <p className="text-muted text-sm">@{user?.username}</p>
      </div>

      {/* Wallet Balance Hero */}
      {isLoading ? (
        <div className="animate-pulse h-28 rounded-2xl" style={{ background: 'linear-gradient(135deg, #162f80, #1e5be8)' }} />
      ) : (
        <div
          className="card-blue p-6 relative overflow-hidden animate-fade-in"
          style={{ animationDelay: '.1s' }}
        >
          <div className="relative z-10">
            <div className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1">Wallet Balance</div>
            <div className="teko text-4xl font-bold text-white">{fmt(data?.walletBalance || 0)}</div>
            {Number(data?.pendingBalance) > 0 && (
              <div className="text-white/60 text-xs mt-1 font-semibold">
                + {fmt(data?.pendingBalance || 0)} pending
              </div>
            )}
          </div>
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #fff, transparent)' }}
          />
        </div>
      )}

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          <SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Deposits"
            value={fmt(data?.totalDeposits || 0)}
            icon={<TrendingUp size={16} />}
            color="bg-xgreen/20 text-xgreen"
          />
          <StatCard
            label="Total Withdrawals"
            value={fmt(data?.totalWithdrawals || 0)}
            icon={<TrendingDown size={16} />}
            color="bg-red-500/20 text-red-400"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="teko text-lg font-bold tracking-widest text-xgray uppercase mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map(({ label, icon, to, color }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl card-dark hover:-translate-y-1 transition-all active:scale-95"
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
                {icon}
              </div>
              <span className="text-xgray text-xs font-bold tracking-wide uppercase">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="teko text-lg font-bold tracking-widest text-xgray uppercase">Recent Transactions</h2>
          <button onClick={() => navigate('/history')} className="text-bright text-xs font-bold hover:text-white transition-colors">
            View All →
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse h-14 rounded-xl bg-white/4" />
            ))}
          </div>
        ) : !data?.recentTransactions?.length ? (
          <div className="card-dark p-8 text-center">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-muted text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentTransactions.map((tx) => (
              <div key={tx.id} className="card-dark p-3.5 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  (tx.type as TransactionType) === 'DEPOSIT' ? 'bg-xgreen/20 text-xgreen' : 'bg-xgold/20 text-xgold'
                }`}>
                  {(tx.type as TransactionType) === 'DEPOSIT'
                    ? <ArrowDownCircle size={18} />
                    : <ArrowUpCircle size={18} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-bold truncate">{tx.referenceNumber}</div>
                  <div className="text-muted text-xs">{format(new Date(tx.createdAt), 'dd MMM yyyy HH:mm')}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-bold text-sm">Rs. {Number(tx.amount).toLocaleString()}</div>
                  <StatusBadge status={tx.status as TransactionStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
