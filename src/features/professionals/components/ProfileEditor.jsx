import { useMemo, useState } from 'react';
import { Camera, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { FormField } from '@/components/ui/FormField.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { MultiSelect } from '@/components/ui/MultiSelect.jsx';
import { Textarea } from '@/components/ui/Textarea.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { UserAvatar } from '@/components/ui/UserAvatar.jsx';
import { useForm } from '@/components/form/useForm.js';
import { updateProfileSchema } from '@/components/form/validators.js';
import { useReferenceData } from '@/features/reference/hooks/useReferenceData.js';
import { updateMyProfile } from '../services/professionals.service.js';
import { updateAccount, uploadAvatar } from '@/features/auth/services/auth.service.js';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';

const DESC_MIN = 30;
const DESC_MAX = 500;

function extractInitial(profile) {
  return {
    displayName: profile?.displayName ?? '',
    tradeId: profile?.tradeId ?? '',
    description: profile?.description ?? '',
    yearsExperience: profile?.yearsExperience ?? '',
    whatsapp: profile?.whatsapp ?? '',
    zoneIds: profile?.zones?.map((z) => Number(z.id ?? z))?.filter(Boolean) ?? profile?.zoneIds ?? [],
  };
}

/** Bloc de section : même composant pour la lecture et l'édition. */
function Section({ title, description, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      <div className="mt-3">{children}</div>
    </Card>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 py-1.5">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900">{value || '-'}</dd>
    </div>
  );
}

export function ProfileEditor({ profile, user, onUpdated }) {
  const { trades, zones, loading: loadingRefs } = useReferenceData();
  const { toast } = useNotification();
  const { refresh } = useAuthContext();
  const { open: openModal } = useAuthModal();

  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  const initial = useMemo(() => extractInitial(profile), [profile]);

  const { values, errors, submitting, setField, handleSubmit, setErrors } = useForm(
    updateProfileSchema,
    initial,
    async (data) => updateMyProfile(data),
  );

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.displayName ||
    'Professionnel';
  const zoneNames = (profile?.zones || []).map((z) => z.name).filter(Boolean).join(', ');
  const descLen = String(values.description ?? '').length;

  const onSubmit = async (e) => {
    const res = await handleSubmit(e);
    if (!res.ok) {
      if (res.error?.errors) setErrors((prev) => ({ ...prev, ...res.error.errors }));
      if (res.error?.message) toast({ message: res.error.message, type: 'error' });
      return;
    }
    try {
      await updateAccount({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() });
      await refresh();
      setEditing(false);
      toast({ message: 'Profil mis à jour avec succès.', type: 'success' });
      onUpdated?.(res.result);
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadAvatar(file, setUploadProgress);
      if (url) setAvatar(url);
      await refresh();
      setUploadProgress(100);
      toast({ message: 'Photo de profil mise à jour.', type: 'success' });
    } catch (err) {
      toast({ message: err?.message || 'Erreur lors du téléversement.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Mon profil</h2>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Button variant="outline" size="sm" onClick={() => openModal('change-password')}>
              Changer le mot de passe
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
            <Pencil size={16} aria-hidden className="inline" /> {editing ? 'Annuler' : 'Modifier'}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-5 bg-mint-50/40 p-6">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
            <UserAvatar user={user} src={avatar} className="h-full w-full" />
            {editing && (
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white">
                <Camera size={18} aria-hidden />
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="sr-only"
                  disabled={uploading}
                  onChange={onAvatarChange}
                />
              </label>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{profile?.tradeName || 'Professionnel'}</p>
            {uploading && (
              <div className="mt-2 w-40 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-primary-500 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {editing ? (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Section title="Informations personnelles">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="pe-firstName" className="text-xs font-semibold text-gray-600">Prénom</label>
                <input
                  id="pe-firstName"
                  className="w-full rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="pe-lastName" className="text-xs font-semibold text-gray-600">Nom</label>
                <input
                  id="pe-lastName"
                  className="w-full rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <FormField
                id="pe-display"
                label="Nom affiché (votre nom pour le grand public)"
                required
                error={errors.displayName}
                placeholder="Ex : Plomberie Makélékélé Services"
                value={values.displayName}
                onChange={(e) => setField('displayName', e.target.value)}
              />
            </div>
          </Section>

          <Section title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="pe-phone"
                label="Téléphone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
              />
              <FormField
                id="pe-whatsapp"
                label="Numéro WhatsApp"
                error={errors.whatsapp}
                placeholder="+242... (laisser vide pour utiliser votre numéro de compte)"
                value={values.whatsapp}
                onChange={(e) => setField('whatsapp', e.target.value)}
                inputMode="tel"
              />
            </div>
          </Section>

          <Section title="Description">
            <FormField
              id="pe-desc"
              label="Description de votre activité"
              required
              as="textarea"
              error={errors.description}
              help={
                <>Entre <b>{DESC_MIN}</b> et <b>{DESC_MAX}</b> caractères · <span className={descLen < DESC_MIN || descLen > DESC_MAX ? 'text-danger-500 font-semibold' : ''}>{descLen}/{DESC_MAX}</span></>
              }
            >
              <Textarea
                id="pe-desc"
                rows={5}
                placeholder="Présentez votre activité, vos services, vos horaires, vos garanties..."
                value={values.description}
                onChange={(e) => setField('description', e.target.value.slice(0, DESC_MAX + 10))}
                error={errors.description}
              />
            </FormField>
          </Section>

          <Section title="Informations professionnelles">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="pe-trade" label="Métier" required error={errors.tradeId} as="select">
                <Select
                  id="pe-trade"
                  name="tradeId"
                  className="border border-gray-200"
                  value={values.tradeId}
                  error={errors.tradeId}
                  onChange={(e) => setField('tradeId', e.target.value)}
                >
                  <option value="">Choisissez un métier</option>
                  {trades.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </FormField>
              <FormField
                id="pe-years"
                label="Années d'expérience"
                required
                error={errors.yearsExperience}
                type="number"
                min={0}
                max={60}
                step={1}
                help="Entier entre 0 et 60"
                value={values.yearsExperience}
                onChange={(e) => setField('yearsExperience', e.target.value)}
              />
            </div>

            <div className="mt-4">
              <MultiSelect
                label="Zone"
                required
                hint="Sélectionnez au moins une zone."
                error={errors.zoneIds}
                disabled={loadingRefs}
                options={zones.map((z) => ({ value: z.id, label: z.name }))}
                value={values.zoneIds || []}
                onChange={(ids) => setField('zoneIds', ids)}
              />
            </div>
          </Section>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="submit" loading={submitting} size="md">Enregistrer</Button>
          </div>
        </form>
      ) : (
        <>
          <Section title="Informations personnelles">
            <dl className="divide-y divide-gray-100">
              <Row label="Prénom" value={user?.firstName} />
              <Row label="Nom" value={user?.lastName} />
              <Row label="Nom affiché" value={profile?.displayName} />
            </dl>
          </Section>

          <Section title="Contact" description="Vos coordonnées sont visibles des clients qui vous contactent.">
            <dl className="divide-y divide-gray-100">
              <Row label="Téléphone" value={user?.phone} />
              <Row label="WhatsApp" value={profile?.whatsapp} />
            </dl>
          </Section>

          <Section title="Description">
            {profile?.description ? (
              <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{profile.description}</p>
            ) : (
              <p className="text-sm text-gray-400">Aucune description pour le moment.</p>
            )}
          </Section>

          <Section title="Informations professionnelles">
            <dl className="divide-y divide-gray-100">
              <Row label="Métier" value={profile?.tradeName} />
              <Row label="Zones" value={zoneNames} />
              <Row
                label="Expérience"
                value={
                  profile?.yearsExperience != null && profile?.yearsExperience !== ''
                    ? `${profile.yearsExperience} an(s)`
                    : ''
                }
              />
            </dl>
          </Section>
        </>
      )}

      <div className="sm:hidden">
        <Button variant="outline" size="md" className="w-full" onClick={() => openModal('change-password')}>
          Changer le mot de passe
        </Button>
      </div>
    </div>
  );
}
