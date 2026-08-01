import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, CheckCircle } from 'lucide-react';
import { paymentsApi } from '../../api/payments';
import { depositsApi } from '../../api/deposits';
import { getErrorMessage } from '../../api/client';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { toast } from '../../components/ui/Toast';
import { PaymentAccount } from '../../types';

const schema = z.object({
  amount: z.coerce.number().min(500, 'Minimum deposit Rs. 500').max(500000, 'Maximum deposit Rs. 500,000'),
  paymentAccountId: z.string().min(1, 'Select a payment account'),
  note: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

type Step = 'form' | 'upload' | 'confirm' | 'success';

export default function Deposit() {
  const [step, setStep] = useState<Step>('form');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptKey, setReceiptKey] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [createdRef, setCreatedRef] = useState('');
  const [error, setError] = useState('');

  const { data: accountsData } = useQuery({
    queryKey: ['payment-accounts'],
    queryFn: () => paymentsApi.getActive().then(r => r.data.data),
  });

  const accounts: PaymentAccount[] = accountsData || [];
  const accountOptions = accounts.map(a => ({
    value: a.id,
    label: `${a.bankName} (${a.branch}) — ${a.accountHolder}`,
  }));

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedAccountId = watch('paymentAccountId');
  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  const { mutate: createDeposit, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      depositsApi.create({ ...data, receiptUrl, receiptKey }),
    onSuccess: (res) => {
      setCreatedRef(res.data.data.referenceNumber);
      setStep('success');
      toast('success', 'Deposit request submitted successfully!');
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const onFormSubmit = (data: FormData) => {
    setFormData(data);
    setStep('upload');
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }
    setReceiptFile(file);
    setError('');
  };

  const handleUpload = async () => {
    if (!receiptFile || !formData) return;
    setUploading(true);
    setError('');
    try {
      const urlRes = await depositsApi.getUploadUrl(receiptFile.name, receiptFile.type);
      const { key } = urlRes.data.data;
      const uploadRes = await depositsApi.uploadFile(key, receiptFile);
      setReceiptUrl(uploadRes.data.data.url);
      setReceiptKey(key);
      setStep('confirm');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleSkipUpload = () => setStep('confirm');

  const handleConfirm = () => {
    if (formData) createDeposit(formData);
  };

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
        <p className="text-muted text-sm mb-4">Your deposit request has been received.</p>
        <div
          className="px-6 py-3 rounded-xl mb-6"
          style={{ background: 'rgba(0,232,122,.08)', border: '1px solid rgba(0,232,122,.25)' }}
        >
          <div className="text-muted text-xs uppercase tracking-wider font-bold mb-1">Reference</div>
          <div className="teko text-2xl text-xgreen font-bold tracking-wider">{createdRef}</div>
        </div>
        <button
          onClick={() => setStep('form')}
          className="btn-blue px-8"
        >
          New Deposit
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="teko text-3xl font-bold tracking-widest text-white">DEPOSIT REQUEST</h1>
        <p className="text-muted text-sm sinhala">ඩිපෝසිට් ඉල්ලීම</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { n: 1, label: 'Details', active: step === 'form' },
          { n: 2, label: 'Receipt', active: step === 'upload' },
          { n: 3, label: 'Confirm', active: step === 'confirm' },
        ].map(({ n, label, active }) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center teko text-sm font-bold transition-all ${
                active
                  ? 'bg-bright text-white'
                  : ['confirm','upload'].includes(step) && n === 1 || step === 'confirm' && n === 2
                  ? 'bg-xgreen/20 text-xgreen border border-xgreen/30'
                  : 'bg-white/8 text-muted'
              }`}
            >
              {n}
            </div>
            <span className={`text-xs font-bold tracking-wide uppercase ${active ? 'text-white' : 'text-muted'}`}>
              {label}
            </span>
            {n < 3 && <div className="w-8 h-px bg-white/15 mx-1" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm text-red-400 font-semibold"
          style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.25)' }}>
          {error}
        </div>
      )}

      {/* Step 1: Form */}
      {step === 'form' && (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <Select
            label="Payment Account"
            options={accountOptions}
            placeholder="— Select bank / account —"
            error={errors.paymentAccountId?.message}
            {...register('paymentAccountId')}
          />

          {selectedAccount && (
            <div className="card-dark p-4 animate-fade-in">
              <div className="teko text-base font-bold text-bright mb-2">
                {selectedAccount.bankName} ({selectedAccount.branch})
              </div>
              <div className="text-xgray text-sm font-mono">{selectedAccount.accountNumber}</div>
              <div className="text-muted text-xs">{selectedAccount.accountHolder}</div>
            </div>
          )}

          <Input
            label="Amount (Rs.)"
            placeholder="Minimum Rs. 500"
            type="number"
            error={errors.amount?.message}
            {...register('amount')}
          />
          <Input
            label="Note (optional)"
            placeholder="Any additional notes"
            error={errors.note?.message}
            {...register('note')}
          />
          <button type="submit" className="w-full btn-blue py-3.5 mt-2">
            Continue →
          </button>
        </form>
      )}

      {/* Step 2: Receipt Upload */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div
            className="rounded-xl p-4 sinhala text-sm leading-relaxed"
            style={{ background: 'rgba(58,127,255,.08)', border: '1px solid rgba(58,127,255,.25)' }}
          >
            ගෙවීමෙන් පසු <strong className="text-bright">Payment Slip</strong> upload කරන්න. (Optional)
          </div>

          <div
            className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
              receiptFile
                ? 'border-xgreen/50 bg-xgreen/5'
                : 'border-bright/30 hover:border-bright/60 bg-white/3'
            }`}
            onClick={() => document.getElementById('receipt-input')?.click()}
          >
            <input
              id="receipt-input"
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileChange}
            />
            {receiptFile ? (
              <>
                <CheckCircle className="text-xgreen mx-auto mb-2" size={32} />
                <p className="text-xgreen font-bold text-sm">{receiptFile.name}</p>
                <p className="text-muted text-xs mt-1">{(receiptFile.size / 1024).toFixed(0)} KB</p>
              </>
            ) : (
              <>
                <Upload className="text-muted mx-auto mb-3" size={32} />
                <p className="text-xgray font-bold text-sm">Click to upload receipt</p>
                <p className="text-muted text-xs mt-1">JPG, PNG, PDF — max 5MB</p>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('form')} className="flex-1 py-3 rounded-xl border border-white/20 text-xgray font-bold hover:border-white/40 transition-all">
              ← Back
            </button>
            {receiptFile ? (
              <button onClick={handleUpload} disabled={uploading} className="flex-2 flex-grow py-3 rounded-xl btn-blue font-bold disabled:opacity-60">
                {uploading ? 'Uploading...' : 'Upload & Continue →'}
              </button>
            ) : (
              <button onClick={handleSkipUpload} className="flex-2 flex-grow py-3 rounded-xl border border-bright/30 text-bright font-bold hover:bg-bright/10 transition-all">
                Skip — Continue →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && formData && (
        <div className="space-y-4">
          <div className="card-dark p-5 space-y-3">
            <div className="teko text-lg font-bold text-white tracking-widest border-b border-white/10 pb-3 mb-3">
              CONFIRM DEPOSIT
            </div>
            {[
              { label: 'Amount', value: `Rs. ${Number(formData.amount).toLocaleString()}` },
              { label: 'Account', value: accounts.find(a => a.id === formData.paymentAccountId)?.bankName || '-' },
              { label: 'Receipt', value: receiptUrl ? '✓ Uploaded' : '✗ Not uploaded' },
              ...(formData.note ? [{ label: 'Note', value: formData.note }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-muted text-xs font-bold uppercase tracking-wider">{label}</span>
                <span className="text-white font-bold text-sm">{value}</span>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl p-3 text-xs text-muted sinhala leading-relaxed"
            style={{ background: 'rgba(245,197,24,.06)', border: '1px solid rgba(245,197,24,.2)' }}
          >
            ⚠️ Submit කිරීමෙන් පසු request review කෙරේ. Approved වූ පසු ඔබගේ wallet balance update වේ.
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('upload')} className="flex-1 py-3 rounded-xl border border-white/20 text-xgray font-bold hover:border-white/40 transition-all">
              ← Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="flex-grow py-3 rounded-xl font-bold text-white disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(135deg, #1e5be8, #3a7fff)' }}
            >
              {isPending ? 'Submitting...' : '✓ Submit Deposit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
