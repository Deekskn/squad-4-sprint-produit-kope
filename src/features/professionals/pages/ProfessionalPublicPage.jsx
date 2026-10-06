import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Phone, MessageCircle, MapPin, Send } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { getPublishedDetail, canReview } from '../services/professionals.service.js';
import { PhotoGallery } from '../components/PhotoGallery.jsx';
import { RatingSummary, ReviewList, ReviewForm } from '@/features/reviews/components/index.js';
import { DataState } from '@/components/ui/DataState.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { ContactDialog } from '@/features/contacts/components/ContactDialog.jsx';
import { formatPhoneFR, toWhatsappUrl } from '@/lib/utils.js';
import { ROLES, ROUTES } from '@/lib/constants.js';

export function ProfessionalPublicPage() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { open: openAuthModal } = useAuthModal();
  const [contactOpen, setContactOpen] = useState(false);
  const detail = useAsyncData(() => getPublishedDetail(id), [id]);
  const canReviewState = useAsyncData(() => canReview(id), [id, user?.id]);

  if (detail.loading || detail.error) {
    return (
      <div className="container-kop page-padding">
        <DataState loading={detail.loading} error={detail.error} errorPrefix="Fiche introuvable">
          {null}
        </DataState>
      </div>
    );
  }

  const { profile, photos, rating } = detail.data;
  const whatsappUrl = toWhatsappUrl(profile.whatsapp || profile.phone);
  const canLeaveReview = user?.role === ROLES.CLIENT && canReviewState.data === true;
  const isSelf = String(user?.id) === String(profile.id);
  const canContact = Boolean(user) && !isSelf && user?.role !== ROLES.ADMIN;

  const onContactClick = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setContactOpen(true);
  };

  return (
    <div className="container-kop page-padding space-y-10">
      <header className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{profile.trade?.name}</Badge>
            <Badge variant={profile.isAvailable ? 'success' : 'warning'}>
              {profile.isAvailable ? 'Disponible' : 'Indisponible'}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {profile.displayName}
          </h1>
          {profile.zones?.length > 0 && (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
              <MapPin size={16} aria-hidden /> {profile.zones.map((z) => z.name).join(' · ')}
            </p>
          )}
          {profile.yearsExperience != null && (
            <p className="text-sm text-gray-600">
              {profile.yearsExperience} an{profile.yearsExperience > 1 ? 's' : ''} d'expérience
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button as="a" href={`tel:${profile.phone}`} size="lg">
              <Phone size={16} aria-hidden /> Appeler
            </Button>
            {whatsappUrl && (
              <Button as="a" href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="secondary" size="lg">
                <MessageCircle size={16} aria-hidden /> WhatsApp
              </Button>
            )}
            {canContact && (
              <Button variant="secondary" size="lg" onClick={onContactClick}>
                <Send size={16} aria-hidden /> Contacter
              </Button>
            )}
            <span className="self-center text-sm font-semibold text-gray-700">
              {formatPhoneFR(profile.phone)}
            </span>
          </div>
        </div>
        <PhotoGallery photos={photos} editable={false} allowEmptyMessage />
      </header>

      {profile.description && (
        <section className="max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900">À propos</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-700">{profile.description}</p>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <RatingSummary rating={rating} />
        <div className="space-y-4">
          {canLeaveReview && <ReviewForm professionalId={profile.id} onSuccess={() => canReviewState.reload?.()} />}
          <ReviewList professionalId={profile.id} />
        </div>
      </section>

      <p className="text-sm text-gray-500">
        <Link to={ROUTES.SEARCH} className="link-underline text-primary-700">← Retour aux résultats</Link>
      </p>

      <ContactDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        toUserId={profile.id}
        recipientName={profile.displayName}
      />
    </div>
  );
}
