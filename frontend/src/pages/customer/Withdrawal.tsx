import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle } from 'lucide-react';
import { withdrawalsApi } from '../../api/withdrawals';
import { authApi } from '../../api/auth';
import { getErrorMessage } from '../../api/client';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { toast } from '../../components/ui/Toast';

const schema = z.object({
  amount: z.coerce.number().min(1000, 'Minimum withdrawal Rs. 1,000').max(200000, 'Maximum Rs. 200,000'),
  bankName: z.string().min(1, 'Select a bank'),
  accountHolder: z.string().min(2, 'Account holder name required'),
  accountNumber: z.string().min(4, 'Account number required'),
  branch: z.string().optional(),
  note: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

const BANKS = [
  'LOLC Bank', 'Peoples Bank', 'Sampath Bank', 'BOC Bank',
  'Commercial Bank', 'Hatton National Bank (HNB)', 'Nations Trust Bank',
  'NDB Bank', 'Pan Asia Bank', 'Seylan Bank', 'Other',
];

export default function Withdrawal() {
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [createdRef, setCreatedRef] = useState('');
  const [error, setError] = useState('');

  const { data: userData } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.data),
  });

  const balance = Number(userData?.walletBalance || 0);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => withdrawalsApi.create(data),
    onSuccess: (res) => {
      setCreatedRef(res.data.data.referenceNumber);
      setStep('success');
      toast('success', 'Withdrawal request submitted!');
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  if (step === 'success') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ background: 'rgba(0,232,122,.15)', border: '2px solid rgba(0,232,122,.4)' }}
        >
          <CheckCircle className="text-xgreen" size={40} />
        </div>
        <h2 className="teko text-3xl font-bold tracking-widest text-white mb-2">REQUEST SUBMITTED!</h2>
        <p className="text-muted text-sm mb-4">Your withdrawal request has been received.</p>
        <div
          className="px-6 py-3 rounded-xl mb-6"
          style={{ background: 'rgba(0,232,122,.08)', border: '1px solid rgba(0,232,122,.25)' }}
        >
          <div className="text-muted text-xs uppercase tracking-wider font-bold mb-1">Reference</div>
          <div className="teko text-2xl text-xgreen font-bold tracking-wider">{createdRef}</div>
        </div>
        <button onClick={() => setStep('form')} className="btn-blue px-8">
          New Withdrawal
        </button>
      </div>
    );
  }

  if (step === 'confirm' && formData) {
    return (
      <div className="p-4">
        <h1 className="teko text-3xl font-bold tracking-widest text-white mb-6">CONFIRM WITHDRAWAL</h1>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm text-red-400 font-semibold"
            style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.25)' }}>
            {error}
          </div>
        )}

        <div className="card-dark p-5 space-y-3 mb-4">
          {[
            { label: 'Amount', value: `Rs. ${Number(formData.amount).toLocaleString()}` },
            { label: 'Bank', value: formData.bankName },
            { label: 'Account Holder', value: formData.accountHolder },
            { label: 'Account Number', value: `****${formData.accountNumber.slice(-4)}` },
            ...(formData.branch ? [{ label: 'Branch', value: formData.branch }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
              <span className="text-muted text-xs font-bold uppercase tracking-wider">{label}</span>
              <span className="text-white font-bold text-sm">{value}</span>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl p-3 mb-4 text-xs text-muted sinhala leading-relaxed"
          style={{ background: 'rgba(245,197,24,.06)', border: '1px solid rgba(245,197,24,.2)' }}
        >
          ⚠️ Withdrawal amount ඔබගේ wallet balance එකෙන් hold කෙරේ. Approved වූ පසු transfer කෙරේ.
        </div>

        <div className="flex gap-3">
          <button onClick={() => setStep('form')} className="flex-1 py-3 rounded-xl border border-white/20 text-xgray font-bold">
            ← Back
          </button>
          <button
            onClick={() => mutate(formData)}
            disabled={isPending}
            className="flex-grow py-3 rounded-xl font-bold text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #1e5be8, #3a7fff)' }}
          >
            {isPending ? 'Submitting...' : '✓ Confirm Withdrawal'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-5">
        <h1 className="teko text-3xl font-bold tracking-widest text-white">WITHDRAWAL</h1>
        <p className="text-muted text-sm sinhala">ගෙවීම් ඉල්ලීම</p>
      </div>

      {/* Balance */}
      <div
        className="card-dark p-4 mb-5 flex items-center justify-between"
      >
        <div>
          <div className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Available Balance</div>
          <div className="teko text-2xl font-bold text-white">
            Rs. {balance.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-3xl">💰</div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm text-red-400 font-semibold"
          style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.25)' }}>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => { setFormData(data); setStep('confirm'); setError(''); })}
        className="space-y-4"
      >
        <Input
          label="Amount (Rs.)"
          placeholder="Minimum Rs. 1,000"
          type="number"
          error={errors.amount?.message}
          hint={`Available: Rs. ${balance.toLocaleString()}`}
          {...register('amount')}
        />

        <Select
          label="Bank"
          options={BANKS.map(b => ({ value: b, label: b }))}
          placeholder="— Select bank —"
          error={errors.bankName?.message}
          {...register('bankName')}
        />

        <Input
          label="Account Holder Name"
          placeholder="Name as on bank card"
          error={errors.accountHolder?.message}
          {...register('accountHolder')}
        />
        <Input
          label="Account Number"
          placeholder="Bank account number"
          error={errors.accountNumber?.message}
          {...register('accountNumber')}
        />
        <Input
          label="Branch (optional)"
          placeholder="Bank branch"
          error={errors.branch?.message}
          {...register('branch')}
        />
        <Input
          label="Note (optional)"
          placeholder="Additional notes"
          error={errors.note?.message}
          {...register('note')}
        />

        <button type="submit" className="w-full btn-blue py-3.5 mt-2">
          Review Withdrawal →
        </button>
      </form>
    </div>
  );
}
