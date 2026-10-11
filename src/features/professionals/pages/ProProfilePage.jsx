import { useCallback, useEffect, useState } from 'react';
import { Image as ImageIcon, LayoutDashboard, Phone, Star, User } from 'lucide-react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { BottomNav } from '@/shared/components/ui/BottomNav.jsx';
import { getMyProfile, setAvailability } from '../services/professionals.service.js';
import { AvailabilityToggle } from '../components/AvailabilityToggle.jsx';
import { OverviewSection } from '../components/OverviewSection.jsx';
import { PhotoManager } from '../components/PhotoManager.jsx';
import { ProfileEditor } from '../components/ProfileEditor.jsx';
import { ProfileErrorState, ProfileLoadingState } from '../components/ProfileStates.jsx';
import { ProSidebar } from '../components/ProSidebar.jsx';
import { PublicationStatus } from '../components/PublicationStatus.jsx';
import { ContactsSection } from '@/features/contacts/components/ContactsSection.jsx';
import { ProReviewsSection } from '@/features/reviews/components/ProReviewsSection.jsx';

const NAV_ITEMS = [
  { id: 'overview', label: 'Vue d’ensemble', shortLabel: 'Aperçu', icon: LayoutDashboard },
  { id: 'profil', label: 'Mon profil', shortLabel: 'Profil', icon: User },
  { id: 'photos', label: 'Mes photos', shortLabel: 'Photos', icon: ImageIcon },
  { id: 'contacts', label: 'Mes contacts', shortLabel: 'Contacts', icon: Phone },
  { id: 'avis', label: 'Mes avis', shortLabel: 'Avis', icon: Star },
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
    load();
  };

  if (loading) return <ProfileLoadingState />;
  if (error && !profile) return <ProfileErrorState error={error} onRetry={load} />;

  const displayName = user?.displayName || profile?.displayName || 'Professionnel';

  return (
    <div className="container-kop py-10 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <ProSidebar
          user={user}
          profile={profile}
          displayName={displayName}
          items={NAV_ITEMS}
          active={active}
          onChange={setActive}
        />

        <main className="space-y-6">
          {active === 'overview' && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <PublicationStatus status={profile?.status} missing={profile?.missing || []} />
                <AvailabilityToggle
                  isAvailable={profile?.isAvailable}
                  onChange={handleAvailabilityChange}
                  loading={savingAvailability}
                />
              </div>
              <OverviewSection profile={profile} />
            </>
          )}

          {active === 'profil' && <ProfileEditor profile={profile} user={user} onUpdated={setProfile} />}

          {active === 'photos' && <PhotoManager photos={profile?.photos || []} onChange={updatePhotos} />}

          {active === 'contacts' && <ContactsSection />}

          {active === 'avis' && <ProReviewsSection professionalId={profile?.id} />}
        </main>
      </div>

      <BottomNav
        items={NAV_ITEMS}
        active={active}
        onChange={setActive}
        ariaLabel="Navigation de l'espace pro (mobile)"
      />
    </div>
  );
}