import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Briefcase, Calendar, ChevronLeft, ChevronRight, MapPin, MapPinned, MessageCircle, Phone, Star, User } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { getPublishedDetail, canReview } from '../services/professionals.service.js';
import { RatingSummary, ReviewList, ReviewForm } from '@/features/reviews/components/index.js';
import { ReportDialog, ReportTrigger } from '../components/ReportDialog.jsx';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { Badge } from '@/shared/components/ui/Badge.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { Separator } from '@/shared/components/ui/Separator.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
import { BottomNav } from '@/shared/components/ui/BottomNav.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/Dialog.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { formatDateFr, toWhatsappUrl, truncate } from '@/shared/utils';
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
  const [openIndex, setOpenIndex] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [tabContactOpen, setTabContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
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
    setTabContactOpen(true);
  };

  const onReportClick = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setReportOpen(true);
  };

  // Point d'entrée unique pour laisser un avis : le bouton de la card "Note moyenne".
  const onLeaveReviewClick = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setReviewFormOpen(true);
  };

  const refreshAfterReview = () => {
    setReviewSubmittedFor(id);
    detail.reload().catch(() => { });
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


      <div className="grid min-w-0 gap-6 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,280px)] lg:items-start">
        <aside className="hidden min-w-0 space-y-6 lg:block lg:self-stretch">
          <Card id="profile" className="space-y-3.5 p-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={profile.displayName}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xl font-extrabold text-primary-700">
                    {initialsOf(profile.displayName)}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={profile.isAvailable ? 'success' : 'warning'} size="sm">
                    {profile.isAvailable ? 'Disponible' : 'Indisponible'}
                  </Badge>
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h1 className="truncate text-base font-bold leading-tight tracking-tight text-gray-900">
                    {profile.displayName}
                  </h1>
                  <p className="truncate text-xs font-medium text-primary-700">
                    {tradeName} à {CITY}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <dl className="space-y-2 text-sm">
              {profile.yearsExperience != null && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-gray-500">
                    <Briefcase size={14} className="shrink-0 text-gray-400" aria-hidden />
                    Expérience
                  </dt>
                  <dd className="font-semibold text-gray-900">
                    {profile.yearsExperience} an{profile.yearsExperience > 1 ? 's' : ''}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-gray-500">
                  <Star size={14} className="shrink-0 text-gray-400" aria-hidden />
                  Note moyenne
                </dt>
                <dd className="font-semibold text-gray-900">
                  {count > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      {avg.toFixed(1)}
                      <span className="font-normal text-gray-400">/ 5</span>
                      <span className="text-xs font-normal text-gray-500">({count})</span>
                    </span>
                  ) : (
                    <span className="font-normal text-gray-500">Aucun avis</span>
                  )}
                </dd>
              </div>
              {zones.length > 0 && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-2 text-gray-500">
                      <MapPin size={14} className="shrink-0 text-gray-400" aria-hidden />
                      Ville
                    </dt>
                    <dd className="truncate font-semibold text-gray-900">{CITY}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-2 text-gray-500">
                      <MapPinned size={14} className="shrink-0 text-gray-400" aria-hidden />
                      Zones
                    </dt>
                    <dd className="truncate font-semibold text-gray-900" title={zones.join(', ')}>
                      {zones[0]}
                      {zones.length > 1 && (
                        <span className="font-medium text-gray-500"> +{zones.length - 1}</span>
                      )}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </Card>

          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-3 px-1">
              <h2 className="text-sm font-bold text-gray-900">À propos</h2>
              {profile.createdAt && (
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar size={13} className="shrink-0" aria-hidden />
                  {formatDateFr(profile.createdAt)}
                </span>
              )}
            </div>
            <Card className="space-y-4 p-4 bg-primary-100!">
              {profile.description && (
                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{profile.description}</p>
              )}
              {(zones.length > 0 || tags.length > 0) && <Separator />}
              {zones.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Zones d'intervention
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {zones.map((zone) => (
                      <Badge key={zone} variant="neutral" size="sm">
                        <MapPin size={11} aria-hidden />
                        {zone}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Spécialités</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </section>

          <Card className="hidden items-center gap-3 p-3 lg:sticky lg:top-23 lg:flex">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-extrabold text-primary-700">
                  {initialsOf(profile.displayName)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-900">{profile.displayName}</p>
              <p className="truncate text-xs text-gray-500">{tradeName}</p>
            </div>
            <div className="shrink-0 text-right">
              {count > 0 && (
                <p className="inline-flex items-center gap-1 text-sm font-bold text-gray-900">
                  <Star size={13} className="fill-amber-400 text-amber-400" aria-hidden />
                  {avg.toFixed(1)}
                </p>
              )}
              <p className="text-[11px] text-gray-400">
                {count > 0 ? `${count} avis` : profile.isAvailable ? 'Disponible' : 'Indisponible'}
              </p>
            </div>
          </Card>

          {isVisitorView && (
            <div className="hidden lg:block">
              <ReportTrigger onClick={onReportClick} />
            </div>
          )}
        </aside>

        <div className="min-w-0 space-y-12">
          <div className="lg:hidden">
            <Card id="profile" className=" p-2 sm:p-2">
              <div className="flex flex-col gap-5">
                <div className="relative w-full shrink-0">
                  <div className="aspect-4/4 w-full overflow-hidden rounded-sm bg-gray-100">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={profile.displayName} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-primary-700">
                        {initialsOf(profile.displayName)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="min-w-0 space-y-2.5">
                  <Badge variant={profile.isAvailable ? 'success' : 'warning'}>
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
                    {count > 0 && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
                        <Star size={15} className="fill-amber-400 text-amber-400" aria-hidden />
                        {avg.toFixed(1)} sur 5 - {count} avis
                      </span>
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

            <section className="mt-6 space-y-4">
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
          </div>

          <section className="space-y-6">


            <section className="space-y-4">
              <nav aria-label="Fil d'Ariane" className="text-sm text-gray-500 pb-4 pt-2 border-b border-gray-200">
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
              <h3 className="text-base font-bold text-gray-900">
                Quelques réalisations{' '}
                <span className="text-sm font-semibold text-gray-500">({photos.length})</span>
              </h3>
              {photos.length ? (
                <>
                  <ul className="space-y-4">
                    {photos.map((p, i) => {
                      const title = p.title || p.caption;
                      const captionLine1 = `${tradeName} - ${title || 'Réalisation'}`;
                      const captionLine2 = [localisation, p.description].filter(Boolean).join(' • ');
                      return (
                        <li key={p.id ?? i}>
                          <button
                            type="button"
                            onClick={() => setOpenIndex(i)}
                            aria-label={`Ouvrir la photo ${i + 1}`}
                            className="group block w-full overflow-hidden rounded-sm border border-gray-200 bg-white text-left transition hover:border-primary-200 hover:shadow-sm focus-ring"
                          >
                            <img
                              src={p.thumbUrl || p.url}
                              alt={title || 'Réalisation'}
                              loading="lazy"
                              className="aspect-[4/3] w-full bg-gray-100 object-cover transition duration-500 group-hover:scale-[1.02]"
                            />
                            <div className="space-y-1 p-4">
                              <p className="text-sm font-bold text-gray-900">{truncate(captionLine1, 90)}</p>
                              {captionLine2 && (
                                <p className="text-sm leading-6 text-gray-600">{truncate(captionLine2, 180)}</p>
                              )}
                              {p.createdAt && (
                                <p className="flex items-center gap-1.5 pt-1 text-xs text-gray-400">
                                  <Calendar size={13} className="shrink-0" aria-hidden />
                                  Publié le {formatDateFr(p.createdAt)}
                                </p>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {photos.length > 6 && (
                    <Button variant="secondary" className="mt-4" onClick={() => setOpenIndex(6)}>
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
          </section>

          <section className="space-y-4 lg:hidden">
            <RatingSummary
              rating={rating}
              canReview={canLeaveReview || !user}
              onLeaveReview={onLeaveReviewClick}
            />
            <h2 className="text-xl font-bold text-gray-900">Les retours de ses clients</h2>
            <ReviewList professionalId={profile.id} compact onViewAll={() => setReviewsOpen(true)} />
          </section>

          {isVisitorView && (
            <div className="lg:hidden">
              <ReportTrigger onClick={onReportClick} />
            </div>
          )}
        </div>
        <aside className="min-w-0 space-y-5 lg:self-stretch">
          <section id="avis" className="space-y-4 ">
            <RatingSummary
              rating={rating}
              canReview={canLeaveReview || !user}
              onLeaveReview={onLeaveReviewClick}
            />
            <h2 className="text-base font-bold text-gray-900">Les retours de ses clients</h2>
            <ReviewList professionalId={profile.id} compact onViewAll={() => setReviewsOpen(true)} />
          </section>

          <Card id="contact" className="space-y-4 p-5 lg:sticky lg:top-23 lg:bottom-4">
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-gray-900">Parlons de votre besoin.</h2>
              <p className="text-sm leading-6 text-gray-600">
                Décrivez votre projet, ses coordonnées apparaîtront ensuite.
              </p>
            </div>
            <Button className="w-full" size="lg" onClick={onContactClick}>
              Contacter {firstName}
            </Button>
          </Card>
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
            <DialogDescription>les avis laissés sur la fiche</DialogDescription>
          </DialogHeader>
          <ReviewList professionalId={profile.id} />
        </DialogContent>
      </Dialog>

      <Dialog open={reviewFormOpen} onOpenChange={(o) => !o && setReviewFormOpen(false)}>
        <DialogContent className="max-w-lg min-h-[45vh] p-5" onClose={() => setReviewFormOpen(false)}>
          <DialogHeader>
            <DialogTitle>Donner votre avis</DialogTitle>
            <DialogDescription>Client ou professionnel, votre retour aide à faire leur choix.</DialogDescription>
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

      {reportOpen && <ReportDialog open onClose={() => setReportOpen(false)} professionalId={profile.id} />}

      <BottomNav
        items={NAV_SECTIONS}
        active={activeSection}
        onChange={scrollToSection}
        ariaLabel="Sections de la fiche"
      />
    </div>
  );
}