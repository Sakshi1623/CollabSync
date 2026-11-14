import { Navigate } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component - redirects to login if not authenticated
 * Optional: can restrict by roles
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-sm text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-dvh bg-zinc-950 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">Access Denied</h1>
          <p className="text-sm text-zinc-400">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
