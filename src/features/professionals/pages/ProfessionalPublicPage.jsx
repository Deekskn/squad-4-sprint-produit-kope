import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, MessageCircle, Phone, Star, FileText, Images } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { getPublishedDetail, canReview } from '../services/professionals.service.js';
import { RatingSummary, ReviewList, ReviewForm } from '@/features/reviews/components/index.js';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { Badge } from '@/shared/components/ui/Badge.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
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
  const [reviewsVersion, setReviewsVersion] = useState(0);
  const [revealContact, setRevealContact] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
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
    reviewSubmittedFor !== id && user?.role === ROLES.CLIENT && canReviewState.data === true;

  const onContactClick = () => {
    if (!user) {
      openAuthModal({ mode: 'login' });
      return;
    }
    setRevealContact((revealed) => !revealed);
  };

  const refreshAfterReview = () => {
    setReviewSubmittedFor(id);
    setReviewsVersion((version) => version + 1);
    detail.reload().catch(() => {});
  };

  const avatarSrc = photos[0]?.url || photos[0]?.thumbUrl;

  return (
    <div className="container-kop page-padding space-y-12">
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <Card className=" p-2 sm:p-2">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative w-36 shrink-0 sm:w-40">
                <div className="aspect-4/5.5 w-full overflow-hidden rounded-sm bg-gray-100">
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
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              Présentation
            </h2>
            <Card className="space-y-4 border-none!">
              {profile.description && (
                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{profile.description}</p>
              )}
              {zones.length > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Zone d'intervention : </span>
                  {zones.join(', ')}
                </p>
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
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              Quelques réalisations
            </h2>
            {photos.length ? (
              <ul className="grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((p, i) => {
                  const title = p.title || p.caption;
                  const captionLine1 = `${tradeName} - ${title || 'Réalisation'}`;
                  const captionLine2 = [localisation, p.description].filter(Boolean).join(' • ');
                  const featured = i === 0;
                  return (
                    <li
                      key={p.id ?? i}
                      className={cn(
                        'group relative overflow-hidden rounded-sm bg-gray-100',
                        featured && 'sm:col-span-2 sm:row-span-2',
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
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Card className="p-6">
                <p className="text-sm text-gray-500">Aucune réalisation pour le moment.</p>
              </Card>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              Les retours de ses clients
            </h2>
            <RatingSummary rating={rating} />
            {canLeaveReview && <ReviewForm professionalId={profile.id} onSuccess={refreshAfterReview} />}
            {showAllReviews ? (
              <ReviewList key={reviewsVersion} professionalId={profile.id} />
            ) : (
              <ReviewList
                key={reviewsVersion}
                professionalId={profile.id}
                compact
                onViewAll={() => setShowAllReviews(true)}
              />
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-(--header-height) lg:self-start">
          {isVisitorView && (
            <Card className="space-y-4 p-5">
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

          <Card className="space-y-1.5 border-primary-100 bg-primary-50/70 p-5">
            <p className="text-sm leading-6 text-gray-700">
              <span className="font-semibold text-gray-900">Sans compte,</span> la connexion est demandée
              avant l'envoi. Vous revenez ensuite sur ce profil.
            </p>
          </Card>

          <div className="space-y-1 px-1 text-xs text-gray-500">
            {profile.updatedAt && <p>Profil mis à jour le {formatDateFr(profile.updatedAt)}</p>}
            <p>Les informations sont renseignées par le professionnel.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}