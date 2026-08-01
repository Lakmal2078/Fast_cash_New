import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AtSign, Lock } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../api/client';
import Input from '../components/ui/Input';

const schema = z.object({
  identifier: z.string().min(1, 'Username or mobile number required'),
  password: z.string().min(1, 'Password required'),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const { setAuthData, user } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in
  if (user) {
    const dest = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/dashboard';
    navigate(dest, { replace: true });
    return null;
  }

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(data);
      setAuthData(res.data.data.user, res.data.data.token);
      const dest = res.data.data.user.role === 'ADMIN' || res.data.data.user.role === 'SUPER_ADMIN'
        ? '/admin/dashboard' : '/dashboard';
      navigate(dest);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-[420px]">

        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="teko text-3xl font-bold tracking-wider inline-block mb-4">
            Xbet <span className="text-bright">Fast Cash</span>
          </Link>
          <h1 className="teko text-4xl font-bold tracking-widest text-white mb-1">SIGN IN</h1>
          <p className="text-muted text-sm">Welcome back to Xbet Fast Cash</p>
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
              label="Username or Mobile"
              placeholder="Username or 0711234567"
              icon={<AtSign size={16} />}
              error={errors.identifier?.message}
              autoComplete="username"
              {...register('identifier')}
            />

            <div className="relative">
              <Input
                label="Password"
                placeholder="Your password"
                type={showPw ? 'text' : 'password'}
                icon={<Lock size={16} />}
                error={errors.password?.message}
                autoComplete="current-password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                  {...register('rememberMe')}
                />
                <span className="text-sm text-muted font-semibold">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              style={{ borderRadius: '12px', padding: '13px', fontSize: '1.1rem' }}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 space-y-2">
          <p className="text-muted text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-bright font-bold hover:text-white transition-colors">
              Register Now
            </Link>
          </p>
          <Link to="/" className="text-muted text-xs hover:text-xgray transition-colors block">
            ← Back to Home
          </Link>
        </div>

        {/* Demo credentials hint */}
        <div
          className="mt-4 p-3 rounded-xl text-xs text-muted"
          style={{ background: 'rgba(58,127,255,.06)', border: '1px solid rgba(58,127,255,.15)' }}
        >
          <strong className="text-bright">Demo:</strong> demoplayer / Demo@123 &nbsp;|&nbsp;
          <strong className="text-bright">Admin:</strong> admin / Admin@123
        </div>
      </div>
    </div>
  );
}
