import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import LoadingPage from '../components/ui/LoadingPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Lazy-loaded pages
const Home = lazy(() => import('../pages/Home'));
const Register = lazy(() => import('../pages/Register'));
const Login = lazy(() => import('../pages/Login'));
const CustomerDashboard = lazy(() => import('../pages/customer/Dashboard'));
const CustomerDeposit = lazy(() => import('../pages/customer/Deposit'));
const CustomerWithdrawal = lazy(() => import('../pages/customer/Withdrawal'));
const CustomerHistory = lazy(() => import('../pages/customer/History'));
const CustomerProfile = lazy(() => import('../pages/customer/Profile'));
const CustomerNotifications = lazy(() => import('../pages/customer/Notifications'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminDeposits = lazy(() => import('../pages/admin/Deposits'));
const AdminWithdrawals = lazy(() => import('../pages/admin/Withdrawals'));
const AdminCustomers = lazy(() => import('../pages/admin/Customers'));
const AdminPaymentAccounts = lazy(() => import('../pages/admin/PaymentAccounts'));
const AdminPromos = lazy(() => import('../pages/admin/Promos'));
const AdminAuditLogs = lazy(() => import('../pages/admin/AuditLogs'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));

function wrap(Component: React.LazyExoticComponent<() => JSX.Element>) {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: wrap(Home) },
      { path: '/login', element: wrap(Login) },
      { path: '/register', element: wrap(Register) },
    ],
  },
  {
    element: (
      <ProtectedRoute role="CUSTOMER">
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: wrap(CustomerDashboard) },
      { path: '/deposit', element: wrap(CustomerDeposit) },
      { path: '/withdrawal', element: wrap(CustomerWithdrawal) },
      { path: '/history', element: wrap(CustomerHistory) },
      { path: '/profile', element: wrap(CustomerProfile) },
      { path: '/notifications', element: wrap(CustomerNotifications) },
    ],
  },
  {
    element: (
      <ProtectedRoute role="ADMIN">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
      { path: '/admin/dashboard', element: wrap(AdminDashboard) },
      { path: '/admin/deposits', element: wrap(AdminDeposits) },
      { path: '/admin/withdrawals', element: wrap(AdminWithdrawals) },
      { path: '/admin/customers', element: wrap(AdminCustomers) },
      { path: '/admin/payment-accounts', element: wrap(AdminPaymentAccounts) },
      { path: '/admin/promos', element: wrap(AdminPromos) },
      { path: '/admin/audit-logs', element: wrap(AdminAuditLogs) },
      { path: '/admin/settings', element: wrap(AdminSettings) },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
