import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Star, Settings, Search } from 'lucide-react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { initials } from '@/lib/utils.js';
import { EmptyState } from '@/components/ui/EmptyState.jsx';
import { getMyReviews } from '@/features/reviews/services/reviews.service.js';
import { ROUTES } from '@/lib/constants.js';
import { SidebarNav } from '@/components/ui/SidebarNav.jsx';
import { AccountSettings } from '@/features/auth/components/AccountSettings.jsx';

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
      <SidebarNav
        items={NAV_ITEMS}
        active={active}
        onChange={onChange}
        ariaLabel="Navigation du profil"
      />
    </aside>
  );
}

function ProfilSection({ user }) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || '—';
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Mon profil</h2>
      <Card className="overflow-hidden">
        <div className="flex items-center gap-5 border-b border-gray-100 bg-mint-50/40 p-6">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-800 ring-1 ring-primary-200">
            {initials(user?.firstName, user?.lastName) || <User size={28} />}
          </span>
          <div>
            <p className="text-lg font-semibold text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{user?.phone || 'Aucun numéro'}</p>
          </div>
        </div>
        <dl className="divide-y divide-gray-100 text-sm">
          <div className="grid grid-cols-[120px_1fr] gap-4 px-6 py-4">
            <dt className="text-gray-500">Nom complet</dt>
            <dd className="font-semibold text-gray-900">{name}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-4 px-6 py-4">
            <dt className="text-gray-500">Téléphone</dt>
            <dd className="font-semibold text-gray-900">{user?.phone || '—'}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-4 px-6 py-4">
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getMyReviews()
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Mon activité</h2>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Aucun avis pour le moment"
          description="Les avis que vous laissez aux professionnels apparaîtront ici pour garder un historique."
          action={<Button as={Link} to={ROUTES.SEARCH} variant="primary">Consulter les professionnels</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-gray-900">{r.professionalName}</p>
                <span className="text-sm font-bold text-amber-500">★ {r.rating}/5</span>
              </div>
              {r.comment && <p className="mt-2 text-sm leading-6 text-gray-600">{r.comment}</p>}
              <p className="mt-1 text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ParametresSection({ user }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Paramètres</h2>
      <AccountSettings user={user} />
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
          {active === 'parametres' && <ParametresSection user={user} />}
        </main>
      </div>
    </div>
  );
}
