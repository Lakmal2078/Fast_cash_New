import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, User, Phone, Mail, Lock, AtSign } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../api/client';
import Input from '../components/ui/Input';

const schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  mobileNumber: z.string().regex(/^07[0-9]{8}$/, 'Enter a valid mobile number (e.g. 0711234567)'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  username: z.string().min(4, 'Minimum 4 characters').regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, _ only'),
  password: z.string().min(6, 'Minimum 6 characters'),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register(data);
      setAuthData(res.data.data.user, res.data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-[480px]">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="teko text-3xl font-bold tracking-wider inline-block mb-4">
            Xbet <span className="text-bright">Fast Cash</span>
          </Link>
          <h1 className="teko text-4xl font-bold tracking-widest text-white mb-1">CREATE ACCOUNT</h1>
          <p className="text-muted text-sm">Join Xbet Fast Cash Sri Lanka</p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(58,127,255,.2)' }}
        >
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-400 font-semibold"
              style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.25)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Your full name"
              icon={<User size={16} />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label="Mobile Number"
              placeholder="0711234567"
              type="tel"
              icon={<Phone size={16} />}
              error={errors.mobileNumber?.message}
              {...register('mobileNumber')}
            />
            <Input
              label="Email (optional)"
              placeholder="email@example.com"
              type="email"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Username / Player ID"
              placeholder="Choose a username"
              icon={<AtSign size={16} />}
              error={errors.username?.message}
              {...register('username')}
            />

            <div className="relative">
              <Input
                label="Password"
                placeholder="Minimum 6 characters"
                type={showPw ? 'text' : 'password'}
                icon={<Lock size={16} />}
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-[38px] text-muted hover:text-xgray transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                placeholder="Repeat password"
                type={showCpw ? 'text' : 'password'}
                icon={<Lock size={16} />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCpw(!showCpw)}
                className="absolute right-3 top-[38px] text-muted hover:text-xgray transition-colors"
              >
                {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Input
              label="Referral Code (optional)"
              placeholder="e.g. VGSL"
              error={errors.referralCode?.message}
              {...register('referralCode')}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none text-sm"
              style={{ borderRadius: '12px', padding: '13px' }}
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-muted text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-bright font-bold hover:text-white transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
