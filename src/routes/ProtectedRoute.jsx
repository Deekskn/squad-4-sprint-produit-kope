import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { Spinner } from '@/components/ui/Spinner.jsx';
import { ROUTES } from '@/lib/constants.js';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${ROUTES.LOGIN}?next=${next}`} replace />;
  }
  return children;
}
