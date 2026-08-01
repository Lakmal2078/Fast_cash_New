import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { PromoCode } from '../../types';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';
import { getErrorMessage } from '../../api/client';
import Input from '../../components/ui/Input';
import { format } from 'date-fns';

export default function AdminPromos() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editPromo, setEditPromo] = useState<PromoCode | null>(null);
  const [form, setForm] = useState({ code: '', bonusPercentage: '', description: '', termsConditions: '', isActive: true });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-promos'],
    queryFn: () => adminApi.getPromos().then(r => r.data.data),
  });

  const createMut = useMutation({
    mutationFn: (d: typeof form) => adminApi.createPromo({ ...d, bonusPercentage: parseInt(d.bonusPercentage) }),
    onSuccess: () => { toast('success', 'Promo code created!'); qc.invalidateQueries({ queryKey: ['admin-promos'] }); setShowForm(false); resetForm(); },
    onError: (e) => toast('error', getErrorMessage(e)),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: string; d: typeof form }) => adminApi.updatePromo(id, { ...d, bonusPercentage: parseInt(d.bonusPercentage) }),
    onSuccess: () => { toast('success', 'Promo updated!'); qc.invalidateQueries({ queryKey: ['admin-promos'] }); setEditPromo(null); setShowForm(false); resetForm(); },
    onError: (e) => toast('error', getErrorMessage(e)),
  });

  const resetForm = () => setForm({ code: '', bonusPercentage: '', description: '', termsConditions: '', isActive: true });

  const openEdit = (p: PromoCode) => {
    setEditPromo(p);
    setForm({ code: p.code, bonusPercentage: String(p.bonusPercentage), description: p.description || '', termsConditions: p.termsConditions || '', isActive: p.isActive });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPromo) updateMut.mutate({ id: editPromo.id, d: form });
    else createMut.mutate(form);
  };

  const promos: PromoCode[] = data || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="teko text-4xl font-bold tracking-widest text-white">PROMO CODES</h1>
          <p className="text-muted text-sm">Manage promotional codes and bonuses</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditPromo(null); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-blue text-sm">
          <Plus size={16} /> New Promo
        </button>
      </div>

      {showForm && (
        <div className="card-dark p-5 rounded-2xl">
          <h2 className="teko text-xl font-bold text-white mb-4">{editPromo ? 'EDIT PROMO' : 'CREATE PROMO'}</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <Input label="Promo Code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. VGSL" required />
            <Input label="Bonus %" type="number" value={form.bonusPercentage} onChange={e => setForm(f => ({ ...f, bonusPercentage: e.target.value }))} placeholder="200" required />
            <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-xgray uppercase tracking-widest mb-1.5">Terms & Conditions</label>
              <textarea className="input-xbet w-full h-20 resize-none" value={form.termsConditions} onChange={e => setForm(f => ({ ...f, termsConditions: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4" />
              <label htmlFor="isActive" className="text-sm font-bold text-xgray cursor-pointer">Active</label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditPromo(null); resetForm(); }}
                className="flex-1 py-3 rounded-xl border border-white/20 text-xgray font-bold">Cancel</button>
              <button type="submit" disabled={createMut.isPending || updateMut.isPending}
                className="flex-1 py-3 rounded-xl btn-blue font-bold disabled:opacity-60">
                {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save Promo'}
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
                  {['Code', 'Bonus %', 'Description', 'Usage', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-bright text-xs font-bold tracking-widest uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promos.map(p => (
                  <tr key={p.id} className="border-b border-white/4 last:border-0 hover:bg-white/2">
                    <td className="px-4 py-3 font-mono font-bold text-xgold text-sm">{p.code}</td>
                    <td className="px-4 py-3 text-white font-bold">{p.bonusPercentage}%</td>
                    <td className="px-4 py-3 text-muted text-xs max-w-[200px] truncate">{p.description}</td>
                    <td className="px-4 py-3 text-muted text-xs">{p.usageCount}{p.usageLimit ? `/${p.usageLimit}` : ''}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${p.isActive ? 'status-approved' : 'status-rejected'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                      {p.isActive && p.hasOwnProperty('createdAt') ? '-' : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-bright/10 text-bright hover:bg-bright/20 transition-colors"><Edit size={14} /></button>
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
