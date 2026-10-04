import { ProtectedRoute } from './ProtectedRoute.jsx';
import { ForbiddenPage } from '@/pages/ForbiddenPage.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';

export function RoleRoute({ role, children }) {
  return (
    <ProtectedRoute>
      <RoleGate role={role}>{children}</RoleGate>
    </ProtectedRoute>
  );
}

function RoleGate({ role, children }) {
  const { hasRole } = useAuthContext();
  if (!hasRole(role)) return <ForbiddenPage />;
  return children;
}
