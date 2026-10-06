import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LayoutDashboard, User, Image as ImageIcon, Phone, Star, Activity, MapPin, Clock, BadgeCheck } from 'lucide-react';
import { getMyProfile, setAvailability } from '../services/professionals.service.js';
import { listReviews, getClientReviews } from '@/features/reviews/services/reviews.service.js';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { PublicationStatus } from '../components/PublicationStatus.jsx';
import { AvailabilityToggle } from '../components/AvailabilityToggle.jsx';
import { ProfileEditor } from '../components/ProfileEditor.jsx';
import { PhotoManager } from '../components/PhotoManager.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { UserAvatar } from '@/components/ui/UserAvatar.jsx';
import { SidebarNav } from '@/components/ui/SidebarNav.jsx';
import { BottomNav } from '@/components/ui/BottomNav.jsx';
import { ContactsSection } from '@/features/contacts/components/ContactsSection.jsx';
import { ROUTES, PROFILE_STATUS, PROFILE_STATUS_LABELS } from '@/lib/constants.js';

const NAV_ITEMS = [
  { id: 'overview', label: 'Vue d’ensemble', shortLabel: 'Aperçu', icon: LayoutDashboard },
  { id: 'profil', label: 'Mon profil', shortLabel: 'Profil', icon: User },
  { id: 'photos', label: 'Mes photos', shortLabel: 'Photos', icon: ImageIcon },
  { id: 'contacts', label: 'Mes contacts', shortLabel: 'Contacts', icon: Phone },
  { id: 'avis', label: 'Mes avis', shortLabel: 'Avis', icon: Star },
];

function ProReviewsSection({ professionalId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [expandedData, setExpandedData] = useState({});

  useEffect(() => {
    if (!professionalId) return;
    let cancelled = false;
    setLoading(true);
    listReviews(professionalId)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [professionalId]);

  const toggleClient = (clientId) => {
    if (expanded === clientId) {
      setExpanded(null);
      return;
    }
    setExpanded(clientId);
    if (!expandedData[clientId]) {
      getClientReviews(clientId)
        .then((d) => setExpandedData((m) => ({ ...m, [clientId]: d.items || [] })))
        .catch(() => {});
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-900">Avis reçus</h3>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (data?.items || []).length === 0 ? (
        <Card className="p-6"><p className="text-sm text-gray-500">Aucun avis pour le moment.</p></Card>
      ) : (
        (data.items || []).map((r) => (
          <Card key={r.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-gray-900">{r.authorName || 'Client'}</p>
              <span className="text-sm font-bold text-amber-500">★ {r.rating}/5</span>
            </div>
            {r.comment && <p className="text-sm leading-6 text-gray-600">{r.comment}</p>}
            <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
            {r.clientId != null && (
              <button
                type="button"
                onClick={() => toggleClient(r.clientId)}
                className="text-xs font-bold text-primary-500 hover:underline"
              >
                {expanded === r.clientId ? 'Masquer les avis de ce client' : 'Voir tous les avis de ce client'}
              </button>
            )}
            {expanded === r.clientId && (
              <ul className="mt-2 space-y-2 border-t border-gray-100 pt-2">
                {(expandedData[r.clientId] ?? []).map((o) => (
                  <li key={o.id} className="text-xs text-gray-600">
                    Sur « {o.professionalName} » : <span className="font-semibold text-gray-900">★ {o.rating}/5</span> {o.comment ? `— ${o.comment}` : ''}
                  </li>
                ))}
                {(expandedData[r.clientId] ?? []).length === 0 && <li className="text-xs text-gray-400">Aucun autre avis.</li>}
              </ul>
            )}
          </Card>
        ))
      )}
    </div>
  );
}

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
          <Card className="p-0 overflow-hidden">
            <div className="p-5 pb-4 bg-gradient-to-r from-primary-50 to-kop-mint/60">
              <div className="flex items-center gap-4">
                <UserAvatar user={user} name={displayName} className="h-14 w-14" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{profile?.tradeName || 'Professionnel'}</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Statut</p>
              <p className="mt-1 text-sm font-semibold text-gray-900 capitalize">{profile?.status ?? '—'}</p>
            </div>
          </Card>
          <div className="hidden lg:block">
            <SidebarNav
              items={NAV_ITEMS}
              active={active}
              onChange={setActive}
              ariaLabel="Navigation de l'espace pro"
            />
          </div>
          {profile?.status === PROFILE_STATUS.PUBLISHED && (
            <Button as={Link} to={ROUTES.PROFESSIONAL(user?.id || profile?.userId || profile?.id || '0')} variant="secondary" size="md" className="w-full">
              Voir ma fiche publique <ChevronRight size={16} className="inline" aria-hidden />
            </Button>
          )}
        </aside>

        <main className="space-y-6">
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
              <Card className="overflow-hidden">
                <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary-50 text-primary-500">
                    <Activity size={18} aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Vue d'ensemble de votre activité</p>
                    <p className="text-xs text-gray-500">Les chiffres clés de votre espace pro</p>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
                  <div className="rounded-sm border border-gray-200 bg-gray-50/60 p-4">
                    <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      <ImageIcon size={14} className="text-primary-500" aria-hidden /> Photos
                    </dt>
                    <dd className="mt-2 text-2xl font-extrabold text-gray-900">
                      {profile?.photos?.length ?? 0}
                      <span className="ml-1 text-sm font-semibold text-gray-400">/ 10</span>
                    </dd>
                  </div>
                  <div className="rounded-sm border border-gray-200 bg-gray-50/60 p-4">
                    <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      <MapPin size={14} className="text-primary-500" aria-hidden /> Zones
                    </dt>
                    <dd className="mt-2 text-2xl font-extrabold text-gray-900">
                      {profile?.zones?.length ?? 0}
                    </dd>
                  </div>
                  <div className="rounded-sm border border-gray-200 bg-gray-50/60 p-4">
                    <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      <Clock size={14} className="text-primary-500" aria-hidden /> Disponibilité
                    </dt>
                    <dd className={`mt-2 text-lg font-bold ${profile?.isAvailable ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {profile?.isAvailable ? 'Disponible' : 'Indisponible'}
                    </dd>
                  </div>
                  <div className="rounded-sm border border-gray-200 bg-gray-50/60 p-4">
                    <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      <BadgeCheck size={14} className="text-primary-500" aria-hidden /> Statut
                    </dt>
                    <dd className="mt-2 text-lg font-bold text-gray-900">
                      {PROFILE_STATUS_LABELS[profile?.status] || '—'}
                    </dd>
                  </div>
                </dl>
              </Card>
            </div>
          )}

          {active === 'profil' && (
            <ProfileEditor profile={profile} user={user} onUpdated={(p) => setProfile(p)} />
          )}

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
