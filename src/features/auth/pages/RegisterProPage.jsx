import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { FormField } from '@/components/ui/FormField.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { Checkbox } from '@/components/ui/Checkbox.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Spinner } from '@/components/ui/Spinner.jsx';
import { useForm } from '@/components/form/useForm.js';
import { registerProfessionalSchema } from '@/components/form/validators.js';
import { registerProfessional } from '../services/auth.service.js';
import { useReferenceData } from '@/features/reference/hooks/useReferenceData.js';
import { ROUTES } from '@/lib/constants.js';

const INITIAL = { displayName: '', phone: '', password: '', tradeId: '', zoneIds: [], consent: false };

function toggleZone(list, id, on) {
  const n = Number(id);
  if (on) return Array.from(new Set([...list, n]));
  return list.filter((z) => z !== n);
}

export function RegisterProForm({ bare = false } = {}) {
  const { user, login } = useAuthContext();
  const { close: closeModal } = useAuthModal();
  const navigate = useNavigate();
  const { toast } = useNotification();
  const { trades, zones, loading: loadingRefs } = useReferenceData();

  const { values, errors, submitting, setField, handleSubmit, setErrors } = useForm(
    registerProfessionalSchema,
    INITIAL,
    async (data) => registerProfessional(data),
  );

  useEffect(() => {
    if (user) navigate(ROUTES.DASHBOARD_PRO, { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e) => {
    const res = await handleSubmit(e);
    if (res.ok) {
      login(res.result);
      toast({
        message: 'Compte créé ! Complétez maintenant votre profil pour apparaître dans les recherches.',
        type: 'success',
      });
      closeModal();
      navigate(ROUTES.DASHBOARD_PRO, { replace: true });
    } else if (res.error?.errors) {
      setErrors((prev) => ({ ...prev, ...res.error.errors }));
      toast({ message: res.error.message || 'Veuillez corriger les erreurs.', type: 'error' });
    } else if (res.error?.message) {
      toast({ message: res.error.message, type: 'error' });
    }
  };

  return (
    <Card className={bare ? 'p-0 border-0 shadow-none' : 'p-6 sm:p-8'}>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Devenir artisan KÔPE</h1>
        <p className="mt-1 text-sm text-gray-500">
          Renseignez votre activité pour créer votre fiche professionnelle.
          Vous pourrez ensuite compléter votre profil et vos photos.
        </p>
        {loadingRefs && (
          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <Spinner /> Chargement des métiers et zones...
          </div>
        )}
        <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate hidden={loadingRefs}>
          <FormField
            id="rp-display"
            label="Nom affiché (nom d'atelier, enseigne)"
            required
            error={errors.displayName}
            placeholder="Ex : Plomberie Makélékélé Services"
            value={values.displayName}
            onChange={(e) => setField('displayName', e.target.value)}
          />
          <FormField
            id="rp-phone"
            label="Numéro de téléphone"
            required
            error={errors.phone}
            help="Votre numéro principal sera aussi utilisé par défaut pour WhatsApp."
            placeholder="+242..."
            value={values.phone}
            onChange={(e) => setField('phone', e.target.value)}
            autoComplete="tel"
            inputMode="tel"
          />
          <FormField
            id="rp-password"
            label="Mot de passe"
            required
            error={errors.password}
            as="input"
            help="Minimum 8 caractères"
          >
            <Input
              id="rp-password"
              type="password"
              value={values.password}
              onChange={(e) => setField('password', e.target.value)}
              autoComplete="new-password"
              error={errors.password}
              placeholder="8 caractères minimum"
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
            <FormField id="rp-trade" label="Métier" required error={errors.tradeId} as="select">
              <Select
                id="rp-trade"
                name="tradeId"
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
          </div>

          <FormField
            id="rp-zones"
            label="Zones d'intervention"
            required
            error={errors.zoneIds}
            help="Sélectionnez au moins une zone. Vous pourrez modifier cette liste plus tard."
          >
            <ul className="grid gap-1.5 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-3">
              {zones.map((z) => {
                const checked = values.zoneIds?.includes?.(z.id);
                return (
                  <li key={z.id}>
                    <Checkbox
                      id={`rp-zone-${z.id}`}
                      label={z.name}
                      checked={checked}
                      onChange={(e) =>
                        setField('zoneIds', toggleZone(values.zoneIds || [], z.id, e.target.checked))
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </FormField>

          <div>
            <Checkbox
              id="rp-consent"
              label={
                <span className="text-sm leading-5 text-gray-700">
                  J'accepte les conditions d'utilisation de la plateforme KÔPE.
                </span>
              }
              checked={Boolean(values.consent)}
              onChange={(e) => setField('consent', e.target.checked)}
              error={errors.consent}
            />
            {errors.consent && (
              <p role="alert" className="mt-1 text-xs text-danger-500">{errors.consent}</p>
            )}
          </div>

          <Button type="submit" loading={submitting} size="lg" className="w-full sm:w-auto sm:px-8">
            Créer mon compte professionnel
          </Button>
        </form>
        <div className="mt-6 border-t border-gray-100 pt-4 text-center text-sm text-gray-600">
          Déjà inscrit ?{' '}
          <Link className="link-underline font-medium text-primary-700" to={ROUTES.LOGIN}>
            Se connecter
          </Link>
        </div>
    </Card>
  );
}

export function RegisterProPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <RegisterProForm />
    </div>
  );
}
