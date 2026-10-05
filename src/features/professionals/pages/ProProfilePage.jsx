import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getMyProfile, setAvailability } from '../services/professionals.service.js';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { PublicationStatus } from '../components/PublicationStatus.jsx';
import { AvailabilityToggle } from '../components/AvailabilityToggle.jsx';
import { ProfileEditor } from '../components/ProfileEditor.jsx';
import { PhotoManager } from '../components/PhotoManager.jsx';
import { ROUTES } from '@/lib/constants.js';

export function ProProfilePage() {
  const { user } = useAuthContext();
  const { toast } = useNotification();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingAvailability, setSavingAvailability] = useState(false);

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

  return (
    <div className="container-kop page-padding mx-auto max-w-5xl space-y-6">
      <header className="rounded-[32px] bg-kop-mint p-7 sm:p-9 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary-800/70">Espace professionnel</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Bonjour, {user?.displayName || profile?.displayName || 'Professionnel'}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-gray-700/90 leading-6">
            Gérez votre profil, vos réalisations et votre disponibilité. Les clients pourront alors vous trouver dans les recherches.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button as={Link} to={ROUTES.PROFESSIONAL(user?.id || profile?.userId || profile?.id || '0')} variant="secondary" size="md">
            Voir ma fiche publique <ChevronRight size={16} className="inline" aria-hidden />
          </Button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <PublicationStatus status={profile?.status} missing={profile?.missing || []} />
        <AvailabilityToggle
          isAvailable={profile?.isAvailable}
          onChange={handleAvailabilityChange}
          loading={savingAvailability}
        />
      </div>
      <ProfileEditor profile={profile} onUpdated={(p) => setProfile(p)} />
      <PhotoManager photos={profile?.photos || []} onChange={updatePhotos} />
    </div>
  );
}
