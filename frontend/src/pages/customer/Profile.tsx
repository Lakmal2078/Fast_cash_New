import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, LogOut, Shield } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

export default function Profile() {
  const { user: storedUser, logout } = useAuth();
  const navigate = useNavigate();

  const { data: userData } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data.data),
  });

  const user = userData || storedUser;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="p-4 space-y-5">
      <h1 className="teko text-3xl font-bold tracking-widest text-white">MY PROFILE</h1>

      {/* Avatar + name */}
      <div className="card-blue p-6 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center teko text-3xl font-bold text-white flex-shrink-0"
          style={{ background: 'rgba(255,255,255,.15)' }}
        >
          {user?.fullName?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <div className="teko text-2xl font-bold text-white">{user?.fullName}</div>
          <div className="text-white/70 text-sm">@{user?.username}</div>
          <div
            className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}
          >
            <Shield size={12} />
            {user?.role}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="space-y-3">
        {[
          { icon: <User size={16} />, label: 'Full Name', value: user?.fullName },
          { icon: <Phone size={16} />, label: 'Mobile Number', value: user?.mobileNumber },
          { icon: <Mail size={16} />, label: 'Email', value: user?.email || 'Not provided' },
        ].map(({ icon, label, value }) => (
          <div key={label} className="card-dark p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-bright/15 text-bright flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
            <div>
              <div className="text-muted text-xs font-bold uppercase tracking-wider mb-0.5">{label}</div>
              <div className="text-white font-bold">{value}</div>
            </div>
          </div>
        ))}

        {user?.createdAt && (
          <div className="card-dark p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-bright/15 text-bright flex items-center justify-center flex-shrink-0">
              📅
            </div>
            <div>
              <div className="text-muted text-xs font-bold uppercase tracking-wider mb-0.5">Member Since</div>
              <div className="text-white font-bold">{format(new Date(user.createdAt), 'dd MMMM yyyy')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold tracking-wide transition-all mt-4"
        style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.3)', color: '#ff5050' }}
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
}
