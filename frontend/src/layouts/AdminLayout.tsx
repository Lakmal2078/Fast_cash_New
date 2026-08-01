import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowDownCircle, ArrowUpCircle, Users, CreditCard,
  Tag, ScrollText, Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ToastContainer from '../components/ui/Toast';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/deposits', icon: ArrowDownCircle, label: 'Deposits' },
  { to: '/admin/withdrawals', icon: ArrowUpCircle, label: 'Withdrawals' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/payment-accounts', icon: CreditCard, label: 'Payment Accounts' },
  { to: '/admin/promos', icon: Tag, label: 'Promo Codes' },
  { to: '/admin/audit-logs', icon: ScrollText, label: 'Audit Logs' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="xbet-bg min-h-screen flex">
      <ToastContainer />

      {/* Sidebar — desktop */}
      <aside
        className="hidden lg:flex flex-col w-64 min-h-screen fixed left-0 top-0 z-30"
        style={{
          background: 'linear-gradient(180deg, #0d1f3c, #08121f)',
          borderRight: '1px solid rgba(58,127,255,.18)',
        }}
      >
        <div className="p-5 border-b border-bright/10">
          <div className="teko text-2xl font-bold tracking-wider">
            Xbet <span className="text-bright">Admin</span>
          </div>
          <div className="text-xs text-muted mt-0.5 tracking-wide uppercase font-semibold">
            {user?.role?.replace('_', ' ')}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
                  isActive
                    ? 'bg-bright/15 text-bright border border-bright/25'
                    : 'text-muted hover:text-xgray hover:bg-white/4'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-bright/10">
          <div className="px-3 py-2 mb-2">
            <div className="text-sm font-bold text-xgray">{user?.fullName}</div>
            <div className="text-xs text-muted">{user?.username}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted hover:text-red-400 hover:bg-red-500/8 transition-all"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(4,10,22,.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="w-72 min-h-screen flex flex-col"
            style={{ background: 'linear-gradient(180deg, #0d1f3c, #08121f)', borderRight: '1px solid rgba(58,127,255,.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-bright/10 flex items-center justify-between">
              <div className="teko text-2xl font-bold tracking-wider">
                Xbet <span className="text-bright">Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
                      isActive
                        ? 'bg-bright/15 text-bright border border-bright/25'
                        : 'text-muted hover:text-xgray hover:bg-white/4'
                    }`
                  }
                >
                  <Icon size={17} />
                  {label}
                  <ChevronRight size={14} className="ml-auto opacity-40" />
                </NavLink>
              ))}
            </nav>
            <div className="p-3 border-t border-bright/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted hover:text-red-400 transition-all"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 lg:ml-64 page-container">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 px-4 lg:px-6 py-3 flex items-center justify-between"
          style={{ background: 'rgba(8,18,31,.95)', borderBottom: '1px solid rgba(58,127,255,.15)', backdropFilter: 'blur(18px)' }}
        >
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-bright/20 text-muted hover:text-white transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <div className="lg:hidden teko text-xl font-bold">
            Xbet <span className="text-bright">Admin</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted">
            Welcome back, <span className="text-white font-bold ml-1">{user?.fullName}</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-bright"
            style={{ background: 'rgba(58,127,255,.1)', border: '1px solid rgba(58,127,255,.25)' }}
          >
            <div className="w-2 h-2 rounded-full bg-xgreen animate-blink" />
            ADMIN PANEL
          </div>
        </header>

        <main className="p-4 lg:p-6 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
