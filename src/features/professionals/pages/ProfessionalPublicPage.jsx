import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, MessageCircle, Phone, Star, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { getPublishedDetail, canReview } from '../services/professionals.service.js';
import { RatingSummary, ReviewList, ReviewForm } from '@/features/reviews/components/index.js';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { Badge } from '@/shared/components/ui/Badge.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
import { BottomNav } from '@/shared/components/ui/BottomNav.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/Dialog.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { cn, formatDateFr, toWhatsappUrl, truncate } from '@/shared/utils';
import { ROLES, ROUTES } from '@/shared/lib/constants.js';

const CITY = 'Brazzaville';

function initialsOf(displayName) {
  return (displayName || '')
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || '??';
}

export function ProfessionalPublicPage() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { open: openAuthModal } = useAuthModal();
  const [reviewSubmittedFor, setReviewSubmittedFor] = useState(null);
const [revealContact, setRevealContact] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [tabContactOpen, setTabContactOpen] = useState(false);
  const detail = useAsyncData(() => getPublishedDetail(id), [id]);
  const canReviewState = useAsyncData(() => canReview(id), [id, user?.id]);

  if (detail.loading || detail.error)
    return (
      <div className="container-kop page-padding">
        <DataState loading={detail.loading} error={detail.error} errorPrefix="Fiche introuvable">
          {null}
        </DataState>
      </div>
    );

  const { profile, photos, rating } = detail.data;
  const whatsappUrl = toWhatsappUrl(profile.whatsapp || profile.phone);
  const avg = Number(rating?.average ?? 0);
  const count = Number(rating?.count ?? 0);
  const tradeName = profile.trade?.name || 'Artisan';
  const zones = (profile.zones ?? []).map((z) => z?.name).filter(Boolean);
  const localisation = [CITY, ...zones].filter((z, i, arr) => arr.indexOf(z) === i).join(', ');
  const mainZone = zones.find((z) => z !== CITY) ?? zones[0];
  const breadcrumbTrade = mainZone ? `${tradeName} à ${mainZone}` : `${tradeName} à ${CITY}`;
  const firstName = profile.displayName.trim().split(/\s+/)[0] || profile.displayName;
  const tags = Array.isArray(profile.tags) ? profile.tags : [];

  const isSelf = user?.id != null && String(user.id) === String(profile.id);
  const isVisitorView = !isSelf && user?.role !== ROLES.ADMIN;

  const canLeaveReview =
    reviewSubmittedFor !== id && Boolean(user) && user.role !== ROLES.ADMIN && canReviewState.data === true;

  const onContactClick = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setRevealContact((revealed) => !revealed);
  };

  const refreshAfterReview = () => {
    setReviewSubmittedFor(id);
    detail.reload().catch(() => {});
  };

  const goPrev = () => setOpenIndex((cur) => (cur == null ? 0 : (cur - 1 + photos.length) % photos.length));
  const goNext = () => setOpenIndex((cur) => (cur == null ? 0 : (cur + 1) % photos.length));

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionId === 'avis') {
      setReviewsOpen(true);
      return;
    }
    if (sectionId === 'contact') {
      if (user)
        setTabContactOpen(true);
      else
        openAuthModal('login');
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const NAV_SECTIONS = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'avis', label: 'Avis', icon: Star },
    { id: 'contact', label: 'Contact', icon: MessageCircle },
  ];

  const avatarSrc = profile.avatarUrl;

  return (
    <div className="container-kop page-padding space-y-6 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <nav aria-label="Fil d'Ariane" className="text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to={ROUTES.SEARCH} className=" text-primary-700">Recherche</Link>
          </li>
          <li aria-hidden>»</li>
          <li>
            <Link to={ROUTES.SEARCH} className=" text-primary-700">{breadcrumbTrade}</Link>
          </li>
          <li aria-hidden>»</li>
          <li aria-current="page" className="font-semibold text-gray-900">{profile.displayName}</li>
        </ol>
      </nav>

      <div className="grid min-w-0 gap-12 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0 space-y-12">
          <Card id="profile" className=" p-2 sm:p-2">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative w-full shrink-0 sm:w-40">
                <div className="aspect-4/4 md:aspect-4/5.5 w-full overflow-hidden rounded-sm bg-gray-100">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={profile.displayName} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-primary-700">
                      {initialsOf(profile.displayName)}
                    </span>
                  )}
                </div>

              </div>

              <div className="min-w-0 space-y-2.5 relative">
                <Badge
                  variant={profile.isAvailable ? 'success' : 'warning'}
                  className=""
                >
                  {profile.isAvailable ? 'Disponible' : 'Indisponible'}
                </Badge>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  {profile.displayName}
                </h1>
                <p className="font-semibold text-primary-700">{tradeName} à {CITY}</p>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-700">
                  {profile.yearsExperience != null && (
                    <span>
                      {profile.yearsExperience} an{profile.yearsExperience > 1 ? 's' : ''} d'expérience
                    </span>
                  )}
                  {profile.yearsExperience != null && <span aria-hidden>•</span>}
                  {count > 0 ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
                      <Star size={15} className="fill-amber-400 text-amber-400" aria-hidden />
                      {avg.toFixed(1)} sur 5 - {count} avis
                    </span>
                  ) : (
                    <span>Nouveau</span>
                  )}
                </p>
                {zones.length > 0 && (
                  <p className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin size={15} className="shrink-0" aria-hidden /> {localisation}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">À propos de moi</h2>
            <Card className="space-y-4 border-none!">
              {profile.description && (
                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{profile.description}</p>
              )}
              {zones.length > 0 && (
                <>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Zone d'intervention : </span>
                  </p>
                  <p className='space-x-2'>{zones.map((zone) => <Badge key={zone}>{zone}</Badge>)}</p>
                </>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Quelques réalisations <span className="ml-1 text-sm font-semibold text-gray-500">({photos.length})</span>
            </h2>
            {photos.length ? (
              <>
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:auto-rows-[220px] sm:overflow-visible sm:pb-0 lg:grid-cols-3">
                {photos.slice(0, 6).map((p, i) => {
                  const title = p.title || p.caption;
                  const captionLine1 = `${tradeName} - ${title || 'Réalisation'}`;
                  const captionLine2 = [localisation, p.description].filter(Boolean).join(' • ');
                  const featured = i === 0;
                  const onlyOne = photos.length === 1;
                  return (
                    <button
                      type="button"
                      key={p.id ?? i}
                      onClick={() => setOpenIndex(i)}
                      aria-label={`Ouvrir la photo ${i + 1}`}
                      className={cn(
                        onlyOne
                          ? 'group relative w-full shrink-0 snap-center overflow-hidden rounded-sm bg-gray-100 text-left focus-ring aspect-[4/5] sm:aspect-auto'
                          : 'group relative w-[80%] shrink-0 snap-center overflow-hidden rounded-sm bg-gray-100 text-left focus-ring aspect-[4/5] sm:w-auto sm:shrink sm:aspect-auto',
                        featured && (onlyOne ? 'sm:col-span-2 sm:row-span-2 lg:col-span-3' : 'sm:col-span-2 sm:row-span-2'),
                      )}
                    >
                      <img
                        src={p.thumbUrl || p.url}
                        alt={title || 'Réalisation'}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-x-2 bottom-2 rounded-sm bg-white/92 px-3 py-2 backdrop-blur-sm">
                        <p className="truncate text-xs font-semibold leading-tight text-gray-900">
                          {truncate(captionLine1, 64)}
                        </p>
                        {captionLine2 && (
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-gray-500">
                            {truncate(captionLine2, 110)}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {photos.length > 6 && (
                <Button variant="secondary" className="mt-4" onClick={() => setOpenIndex(Math.min(6, photos.length - 1))}>
                  Voir plus
                </Button>
              )}
              </>
            ) : (
              <Card className="p-6">
                <p className="text-sm text-gray-500">Aucune réalisation pour le moment.</p>
              </Card>
            )}
          </section>

          <section id="avis" className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Les retours de ses clients</h2>
            <RatingSummary rating={rating} />
            <ReviewList professionalId={profile.id} compact onViewAll={() => setReviewsOpen(true)} />
            {canLeaveReview && (
              <Button variant="primary" onClick={() => setReviewFormOpen(true)}>
                Donner un avis
              </Button>
            )}
            {!user && (
              <Button variant="secondary" onClick={() => openAuthModal('login')}>
                Donner un avis
              </Button>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-(--header-height) lg:self-start">
          {isVisitorView && (
            <Card id="contact" className="space-y-4 p-5">
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-gray-900">Parlons de votre besoin.</h2>
                <p className="text-sm leading-6 text-gray-600">
                  Décrivez votre projet à {firstName}. Ses coordonnées seront accessibles une fois votre
                  demande envoyée.
                </p>
              </div>
              <Button className="w-full" size="lg" onClick={onContactClick}>
                Contacter {firstName}
              </Button>
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Vous n'avez pas encore contacté {firstName}.
                </p>
                {revealContact && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
                    <Button as="a" href={`tel:${profile.phone}`} variant="secondary" size="sm">
                      <Phone size={15} aria-hidden /> Appeler
                    </Button>
                    {whatsappUrl && (
                      <Button
                        as="a"
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="secondary"
                        size="sm"
                      >
                        <MessageCircle size={15} aria-hidden /> WhatsApp
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {!isVisitorView && (
            <Card className="space-y-3 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Button as="a" href={`tel:${profile.phone}`} variant="secondary">
                  <Phone size={15} aria-hidden /> Appeler
                </Button>
                {whatsappUrl && (
                  <Button
                    as="a"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                  >
                    <MessageCircle size={15} aria-hidden /> WhatsApp
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {profile.isAvailable ? 'Disponible' : 'Indisponible'}
              </p>
            </Card>
          )}

{!user && (
            <Card className="space-y-1.5 border-primary-100 bg-primary-50/70 p-5">
              <p className="text-sm leading-6 text-gray-700">
                <span className="font-semibold text-gray-900">Sans compte,</span> la connexion est demandée
                avant l'envoi. Vous revenez ensuite sur ce profil.
              </p>
            </Card>
          )}

          <div className="space-y-1 px-1 text-xs text-gray-500">
            {profile.updatedAt && <p>Profil mis à jour le {formatDateFr(profile.updatedAt)}</p>}
            <p>Les informations sont renseignées par le professionnel.</p>
          </div>
        </aside>
      </div>

      {openIndex !== null && photos[openIndex] && (
        <Dialog open onOpenChange={(o) => !o && setOpenIndex(null)}>
          <DialogContent className="max-w-3xl p-5" onClose={() => setOpenIndex(null)}>
            <DialogHeader>
              <DialogTitle>
                {photos[openIndex].title || photos[openIndex].caption || `Photo ${openIndex + 1} / ${photos.length}`}
              </DialogTitle>
              {photos[openIndex].description && (
                <DialogDescription>{photos[openIndex].description}</DialogDescription>
              )}
            </DialogHeader>
            <div className="relative">
              <img
                src={photos[openIndex].url || photos[openIndex].thumbUrl}
                alt={photos[openIndex].title || photos[openIndex].caption || 'Réalisation'}
                className="mx-auto max-h-[65vh] w-auto max-w-full rounded-lg object-contain"
              />
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Précédente"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-700 shadow-sm hover:bg-white focus-ring"
                  >
                    <ChevronLeft size={16} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Suivante"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-700 shadow-sm hover:bg-white focus-ring"
                  >
                    <ChevronRight size={16} aria-hidden />
                  </button>
                </>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="mr-auto text-xs font-semibold text-gray-500">
                Photo {openIndex + 1} / {photos.length}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={goPrev} disabled={photos.length < 2}>
                  Précédente
                </Button>
                <Button variant="secondary" onClick={goNext} disabled={photos.length < 2}>
                  Suivante
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={reviewsOpen} onOpenChange={(o) => !o && setReviewsOpen(false)}>
        <DialogContent className="max-w-3xl min-h-[50vh] p-5" onClose={() => setReviewsOpen(false)}>
          <DialogHeader>
            <DialogTitle>Avis ({count})</DialogTitle>
            <DialogDescription>les avis clients laissés sur la fiche</DialogDescription>
          </DialogHeader>
          <ReviewList professionalId={profile.id} />
        </DialogContent>
      </Dialog>

      <Dialog open={reviewFormOpen} onOpenChange={(o) => !o && setReviewFormOpen(false)}>
        <DialogContent className="max-w-lg min-h-[45vh] p-5" onClose={() => setReviewFormOpen(false)}>
          <DialogHeader>
            <DialogTitle>Donner votre avis</DialogTitle>
            <DialogDescription>Votre retour aide les autres clients à faire leur choix.</DialogDescription>
          </DialogHeader>
          <ReviewForm
            professionalId={profile.id}
            onSuccess={() => {
              setReviewFormOpen(false);
              refreshAfterReview();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={tabContactOpen} onOpenChange={(o) => !o && setTabContactOpen(false)}>
        <DialogContent className="max-w-lg min-h-[45vh] p-5" onClose={() => setTabContactOpen(false)}>
          <DialogHeader>
            <DialogTitle>Contacter {firstName}</DialogTitle>
            <DialogDescription>
              Vous pouvez joindre {firstName} directement par téléphone ou WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Button as="a" href={`tel:${profile.phone}`} variant="secondary">
              <Phone size={16} aria-hidden /> Appeler
            </Button>
            {whatsappUrl && (
              <Button as="a" href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="secondary">
                <MessageCircle size={16} aria-hidden /> WhatsApp
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav
        items={NAV_SECTIONS}
        active={activeSection}
        onChange={scrollToSection}
        ariaLabel="Sections de la fiche"
      />
    </div>
  );
}