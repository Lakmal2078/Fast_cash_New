import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, ArrowDownCircle, ArrowUpCircle, Clock, User, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ToastContainer from '../components/ui/Toast';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/deposit', icon: ArrowDownCircle, label: 'Deposit' },
  { to: '/withdrawal', icon: ArrowUpCircle, label: 'Withdraw' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="xbet-bg min-h-screen">
      <ToastContainer />

      {/* Top Header */}
      <header
        className="sticky top-0 z-40 w-full"
        style={{
          background: 'linear-gradient(180deg, #08121f, #0d1f3c)',
          borderBottom: '1px solid rgba(58,127,255,.22)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="teko text-2xl font-bold tracking-wider">
            Xbet <span className="text-bright">Fast Cash</span>
          </div>
          <div className="flex items-center gap-3">
            <NavLink
              to="/notifications"
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,.06)' }}
            >
              <Bell size={16} />
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-red-400 transition-colors"
              style={{ background: 'rgba(255,255,255,.06)' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-xgray"
              style={{ background: 'rgba(58,127,255,.1)', border: '1px solid rgba(58,127,255,.3)' }}
            >
              {user?.username}
            </div>
          </div>
        </div>
      </header>

      {/* Page content with bottom padding */}
      <main className="page-container max-w-2xl mx-auto pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'linear-gradient(0deg, #08121f, #0d1f3c)',
          borderTop: '1px solid rgba(58,127,255,.22)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <div className="max-w-2xl mx-auto flex">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-bold tracking-wide transition-all ${
                  isActive ? 'text-bright' : 'text-muted hover:text-xgray'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-[10px] tracking-wider uppercase">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
