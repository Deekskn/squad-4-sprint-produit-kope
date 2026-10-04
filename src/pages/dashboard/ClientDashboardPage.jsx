import { Link } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { ROUTES } from '@/lib/constants.js';

export function ClientDashboardPage() {
  const { user } = useAuthContext();
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'Client';
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Espace client</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Bienvenue, {name}
          </h1>
        </div>
        <Button as={Link} to={ROUTES.SEARCH} variant="primary">
          Rechercher un pro
        </Button>
      </header>
    </div>
  );
}
