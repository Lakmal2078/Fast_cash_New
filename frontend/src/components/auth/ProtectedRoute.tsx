import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  children: React.ReactNode;
  role?: 'CUSTOMER' | 'ADMIN';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (role === 'ADMIN' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  if (role === 'CUSTOMER' && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
