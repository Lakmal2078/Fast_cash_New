import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { depositsApi } from '../../api/deposits';
import { withdrawalsApi } from '../../api/withdrawals';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { TransactionStatus } from '../../types';
import { format } from 'date-fns';

type Tab = 'all' | 'deposits' | 'withdrawals';

export default function History() {
  const [tab, setTab] = useState<Tab>('all');
  const [depPage, setDepPage] = useState(1);
  const [wdrPage, setWdrPage] = useState(1);

  const { data: depData, isLoading: depLoading } = useQuery({
    queryKey: ['my-deposits', depPage],
    queryFn: () => depositsApi.getMyDeposits(depPage, 8).then(r => r.data),
    enabled: tab !== 'withdrawals',
  });

  const { data: wdrData, isLoading: wdrLoading } = useQuery({
    queryKey: ['my-withdrawals', wdrPage],
    queryFn: () => withdrawalsApi.getMyWithdrawals(wdrPage, 8).then(r => r.data),
    enabled: tab !== 'deposits',
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'deposits', label: 'Deposits' },
    { id: 'withdrawals', label: 'Withdrawals' },
  ];

  const TxRow = ({
    ref: refNo, amount, status, date, type,
  }: { ref: string; amount: string | number; status: TransactionStatus; date: string; type: 'DEPOSIT' | 'WITHDRAWAL' }) => (
    <div className="card-dark p-3.5 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        type === 'DEPOSIT' ? 'bg-xgreen/20 text-xgreen' : 'bg-xgold/20 text-xgold'
      }`}>
        {type === 'DEPOSIT' ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-bold truncate">{refNo}</div>
        <div className="text-muted text-xs">{format(new Date(date), 'dd MMM yyyy HH:mm')}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`font-bold text-sm ${type === 'DEPOSIT' ? 'text-xgreen' : 'text-xgold'}`}>
          {type === 'DEPOSIT' ? '+' : '-'}Rs. {Number(amount).toLocaleString()}
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="teko text-3xl font-bold tracking-widest text-white mb-5">TRANSACTION HISTORY</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
              tab === t.id
                ? 'bg-bright text-white'
                : 'bg-white/6 text-muted hover:text-xgray'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Deposits */}
      {(tab === 'all' || tab === 'deposits') && (
        <div className="mb-6">
          {tab === 'all' && (
            <h2 className="teko text-lg font-bold tracking-widest text-xgray uppercase mb-3">Deposits</h2>
          )}
          {depLoading ? <SkeletonTable rows={4} /> :
           !depData?.data?.length ? (
            <EmptyState icon="💲" title="No deposits yet" description="Make your first deposit to get started" />
          ) : (
            <div className="space-y-2">
              {depData.data.map(dep => (
                <TxRow
                  key={dep.id}
                  ref={dep.referenceNumber}
                  amount={dep.amount}
                  status={dep.status as TransactionStatus}
                  date={dep.createdAt}
                  type="DEPOSIT"
                />
              ))}
              <Pagination
                page={depPage}
                totalPages={depData.pagination?.totalPages || 1}
                onPageChange={setDepPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Withdrawals */}
      {(tab === 'all' || tab === 'withdrawals') && (
        <div>
          {tab === 'all' && (
            <h2 className="teko text-lg font-bold tracking-widest text-xgray uppercase mb-3">Withdrawals</h2>
          )}
          {wdrLoading ? <SkeletonTable rows={4} /> :
           !wdrData?.data?.length ? (
            <EmptyState icon="💸" title="No withdrawals yet" />
          ) : (
            <div className="space-y-2">
              {wdrData.data.map(wdr => (
                <TxRow
                  key={wdr.id}
                  ref={wdr.referenceNumber}
                  amount={wdr.amount}
                  status={wdr.status as TransactionStatus}
                  date={wdr.createdAt}
                  type="WITHDRAWAL"
                />
              ))}
              <Pagination
                page={wdrPage}
                totalPages={wdrData.pagination?.totalPages || 1}
                onPageChange={setWdrPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
