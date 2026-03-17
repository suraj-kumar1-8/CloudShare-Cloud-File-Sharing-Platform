import { Navigate, Outlet } from 'react-router-dom';
import { useAuth }          from '../context/AuthContext';

/**
 * Renders child routes only when the user is authenticated.
 * Shows a loading spinner while the initial token check runs.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
