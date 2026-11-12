import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Cargando PataTurnos…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'vet' ? '/veterinario' : '/'} replace />;
  return <Outlet />;
}
