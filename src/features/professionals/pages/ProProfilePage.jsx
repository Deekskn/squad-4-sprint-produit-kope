import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LayoutDashboard, User, Image as ImageIcon, Settings } from 'lucide-react';
import { getMyProfile, setAvailability } from '../services/professionals.service.js';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { PublicationStatus } from '../components/PublicationStatus.jsx';
import { AvailabilityToggle } from '../components/AvailabilityToggle.jsx';
import { ProfileEditor } from '../components/ProfileEditor.jsx';
import { PhotoManager } from '../components/PhotoManager.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { initials } from '@/lib/utils.js';
import { SidebarNav } from '@/components/ui/SidebarNav.jsx';
import { AccountSettings } from '@/features/auth/components/AccountSettings.jsx';
import { ROUTES } from '@/lib/constants.js';

const NAV_ITEMS = [
  { id: 'overview', label: 'Vue d\u2019ensemble', icon: LayoutDashboard },
  { id: 'profil', label: 'Mon profil', icon: User },
  { id: 'photos', label: 'Mes photos', icon: ImageIcon },
  { id: 'compte', label: 'Mon compte', icon: Settings },
];

export function ProProfilePage() {
  const { user } = useAuthContext();
  const { toast } = useNotification();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [active, setActive] = useState('overview');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfile(await getMyProfile());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleAvailabilityChange = async (next) => {
    setSavingAvailability(true);
    try {
      const res = await setAvailability(Boolean(next));
      setProfile((p) => ({ ...(p || {}), isAvailable: res }));
      toast({ message: `Disponibilité : ${res ? 'Disponible' : 'Indisponible'}`, type: 'info' });
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setSavingAvailability(false);
    }
  };

  const updatePhotos = (photos) => {
    setProfile((p) => ({ ...(p || {}), photos }));
    // Rechargement pour recalculer le statut et la checklist
    load();
  };

  if (loading) {
    return (
      <div className="container-kop space-y-4 py-10" aria-busy="true">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
        <h1 className="text-xl font-bold">Erreur de chargement du profil</h1>
        <p className="mt-1 text-sm">{error.message || 'Impossible de charger votre profil.'}</p>
        <div className="mt-4 flex gap-2">
          <Button onClick={load}>Réessayer</Button>
        </div>
      </div>
    );
  }

  const displayName = user?.displayName || profile?.displayName || 'Professionnel';

  return (
    <div className="container-kop py-10 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-800 ring-1 ring-primary-200">
                {initials('', displayName) || 'P'}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{profile?.tradeName || 'Professionnel'}</p>
              </div>
            </div>
          </Card>
          <SidebarNav
            items={NAV_ITEMS}
            active={active}
            onChange={setActive}
            ariaLabel="Navigation de l'espace pro"
          />
          <Button as={Link} to={ROUTES.PROFESSIONAL(user?.id || profile?.userId || profile?.id || '0')} variant="secondary" size="md" className="w-full">
            Voir ma fiche publique <ChevronRight size={16} className="inline" aria-hidden />
          </Button>
        </aside>

        <main className="space-y-6">
          <header className="rounded-[24px] bg-kop-mint p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-800/70">Espace professionnel</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Bonjour, {displayName}
            </h1>
            <p className="mt-2 max-w-lg text-sm text-gray-700/90 leading-6">
              Gérez votre profil, vos réalisations et votre disponibilité.
            </p>
          </header>

          {active === 'overview' && (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <PublicationStatus status={profile?.status} missing={profile?.missing || []} />
                <AvailabilityToggle
                  isAvailable={profile?.isAvailable}
                  onChange={handleAvailabilityChange}
                  loading={savingAvailability}
                />
              </div>
              <Card className="p-6">
                <h3 className="text-base font-bold text-gray-900">Vue d'ensemble de votre activité</h3>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-gray-500">Photos</dt>
                    <dd className="text-lg font-bold text-gray-900">{profile?.photos?.length ?? 0} / 10</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Zones</dt>
                    <dd className="text-lg font-bold text-gray-900">{profile?.zones?.length ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Disponibilité</dt>
                    <dd className={profile?.isAvailable ? 'text-lg font-bold text-emerald-600' : 'text-lg font-bold text-gray-400'}>
                      {profile?.isAvailable ? 'Disponible' : 'Indisponible'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Statut</dt>
                    <dd className="text-lg font-bold text-gray-900 capitalize">{profile?.status ?? '—'}</dd>
                  </div>
                </dl>
              </Card>
            </div>
          )}

          {active === 'profil' && <ProfileEditor profile={profile} onUpdated={(p) => setProfile(p)} />}

          {active === 'photos' && <PhotoManager photos={profile?.photos || []} onChange={updatePhotos} />}

          {active === 'compte' && <AccountSettings user={user} />}
        </main>
      </div>
    </div>
  );
}
