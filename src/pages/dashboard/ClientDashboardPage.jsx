import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Star, Settings, Search } from 'lucide-react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { cn } from '@/lib/utils.js';
import { ROUTES } from '@/lib/constants.js';
import { initials } from '@/lib/utils.js';

const NAV_ITEMS = [
  { id: 'profil', label: 'Mon profil', icon: User },
  { id: 'activite', label: 'Mon activité', icon: Star },
  { id: 'parametres', label: 'Paramètres', icon: Settings },
];

function Sidebar({ user, active, onChange }) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'Client';
  return (
    <aside className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-800 ring-1 ring-primary-200">
            {initials(user?.firstName, user?.lastName) || <User size={20} />}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{name}</p>
            <p className="text-xs text-gray-500">Client</p>
          </div>
        </div>
      </Card>
      <nav aria-label="Navigation du profil" className="space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition',
              active === id
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            )}
          >
            <Icon size={18} aria-hidden />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function ProfilSection({ user }) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || '—';
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Mon profil</h2>
      <Card className="p-6">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-gray-500">Nom complet</dt>
            <dd className="font-semibold text-gray-900">{name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Téléphone</dt>
            <dd className="font-semibold text-gray-900">{user?.phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Rôle</dt>
            <dd className="font-semibold text-gray-900">Client</dd>
          </div>
        </dl>
      </Card>
      <Button as={Link} to={ROUTES.SEARCH} variant="primary">
        <Search size={16} aria-hidden className="inline" /> Rechercher un pro
      </Button>
    </div>
  );
}

function ActiviteSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Mon activité</h2>
      <Card className="p-6">
        <p className="text-sm text-gray-500">Vos avis laissés aux professionnels apparaîtront ici.</p>
      </Card>
    </div>
  );
}

function ParametresSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Paramètres</h2>
      <Card className="p-6">
        <p className="text-sm text-gray-500">Les paramètres de votre compte (notifications, confidentialité) seront disponibles ici.</p>
      </Card>
    </div>
  );
}

export function ClientDashboardPage() {
  const { user } = useAuthContext();
  const [active, setActive] = useState('profil');

  return (
    <div className="container-kop py-10 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Sidebar user={user} active={active} onChange={setActive} />
        <main>
          {active === 'profil' && <ProfilSection user={user} />}
          {active === 'activite' && <ActiviteSection />}
          {active === 'parametres' && <ParametresSection />}
        </main>
      </div>
    </div>
  );
}
