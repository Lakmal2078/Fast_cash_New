import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { paymentsApi } from '../../api/payments';
import { PaymentAccount } from '../../types';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';
import { getErrorMessage } from '../../api/client';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

export default function AdminPaymentAccounts() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editAcc, setEditAcc] = useState<PaymentAccount | null>(null);
  const [form, setForm] = useState({ bankName: '', branch: '', accountNumber: '', accountHolder: '', paymentMethod: 'bank', displayOrder: '0' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payment-accounts'],
    queryFn: () => paymentsApi.getAll().then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: (d: typeof form) => paymentsApi.create({ ...d, displayOrder: parseInt(d.displayOrder) }),
    onSuccess: () => { toast('success', 'Account added!'); qc.invalidateQueries({ queryKey: ['admin-payment-accounts'] }); setShowForm(false); resetForm(); },
    onError: (e) => toast('error', getErrorMessage(e)),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: string; d: typeof form }) => paymentsApi.update(id, { ...d, displayOrder: parseInt(d.displayOrder) }),
    onSuccess: () => { toast('success', 'Account updated!'); qc.invalidateQueries({ queryKey: ['admin-payment-accounts'] }); setEditAcc(null); resetForm(); },
    onError: (e) => toast('error', getErrorMessage(e)),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => paymentsApi.toggle(id, isActive),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-payment-accounts'] }); },
    onError: (e) => toast('error', getErrorMessage(e)),
  });

  const resetForm = () => setForm({ bankName: '', branch: '', accountNumber: '', accountHolder: '', paymentMethod: 'bank', displayOrder: '0' });

  const openEdit = (acc: PaymentAccount) => {
    setEditAcc(acc);
    setForm({ bankName: acc.bankName, branch: acc.branch, accountNumber: acc.accountNumber, accountHolder: acc.accountHolder, paymentMethod: acc.paymentMethod, displayOrder: String(acc.displayOrder) });
    setShowForm(true);
  };

  const accounts: PaymentAccount[] = data?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editAcc) updateMut.mutate({ id: editAcc.id, d: form });
    else createMut.mutate(form);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="teko text-4xl font-bold tracking-widest text-white">PAYMENT ACCOUNTS</h1>
          <p className="text-muted text-sm">Manage bank accounts and iPay numbers</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditAcc(null); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-blue text-sm">
          <Plus size={16} /> Add Account
        </button>
      </div>

      {showForm && (
        <div className="card-dark p-5 rounded-2xl">
          <h2 className="teko text-xl font-bold text-white mb-4">{editAcc ? 'EDIT ACCOUNT' : 'ADD ACCOUNT'}</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <Input label="Bank Name" value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} required />
            <Input label="Branch" value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} required />
            <Input label="Account Number" value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} required />
            <Input label="Account Holder" value={form.accountHolder} onChange={e => setForm(f => ({ ...f, accountHolder: e.target.value }))} required />
            <Select label="Payment Method" value={form.paymentMethod} options={[{ value: 'bank', label: 'Bank Transfer' }, { value: 'ipay', label: 'iPay' }]} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} />
            <Input label="Display Order" type="number" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditAcc(null); resetForm(); }}
                className="flex-1 py-3 rounded-xl border border-white/20 text-xgray font-bold">Cancel</button>
              <button type="submit" disabled={createMut.isPending || updateMut.isPending}
                className="flex-1 py-3 rounded-xl btn-blue font-bold disabled:opacity-60">
                {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card-dark overflow-hidden">
        {isLoading ? <div className="p-4"><SkeletonTable rows={4} /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: 'rgba(30,91,232,.15)', borderBottom: '1px solid rgba(58,127,255,.2)' }}>
                <tr>
                  {['Bank', 'Branch', 'Account Number', 'Holder', 'Method', 'Order', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-bright text-xs font-bold tracking-widest uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => (
                  <tr key={acc.id} className="border-b border-white/4 last:border-0 hover:bg-white/2">
                    <td className="px-4 py-3 text-white font-bold text-xs">{acc.bankName}</td>
                    <td className="px-4 py-3 text-muted text-xs">{acc.branch}</td>
                    <td className="px-4 py-3 font-mono text-xs text-xgray">{acc.accountNumber}</td>
                    <td className="px-4 py-3 text-xs text-muted">{acc.accountHolder}</td>
                    <td className="px-4 py-3 text-xs text-muted capitalize">{acc.paymentMethod}</td>
                    <td className="px-4 py-3 text-muted text-xs">{acc.displayOrder}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${acc.isActive ? 'status-approved' : 'status-rejected'}`}>
                        {acc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(acc)} className="p-1.5 rounded-lg bg-bright/10 text-bright hover:bg-bright/20 transition-colors"><Edit size={14} /></button>
                        <button onClick={() => toggleMut.mutate({ id: acc.id, isActive: !acc.isActive })} className="p-1.5 rounded-lg transition-colors" style={{ background: acc.isActive ? 'rgba(255,80,80,.1)' : 'rgba(0,232,122,.1)' }}>
                          {acc.isActive ? <ToggleRight size={14} className="text-red-400" /> : <ToggleLeft size={14} className="text-xgreen" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
