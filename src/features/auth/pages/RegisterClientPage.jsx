import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { FormField } from '@/components/ui/FormField.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Checkbox } from '@/components/ui/Checkbox.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { useForm } from '@/components/form/useForm.js';
import { registerClientSchema } from '@/components/form/validators.js';
import { registerClient } from '../services/auth.service.js';
import { ROUTES } from '@/lib/constants.js';

const INITIAL = { firstName: '', lastName: '', phone: '', password: '', consent: false };

export function RegisterClientForm({ bare = false } = {}) {
  const { user, login } = useAuthContext();
  const { close: closeModal } = useAuthModal();
  const navigate = useNavigate();
  const { toast } = useNotification();

  const { values, errors, submitting, setField, handleSubmit, setErrors } = useForm(
    registerClientSchema,
    INITIAL,
    async (data) => registerClient(data),
  );

  useEffect(() => {
    if (user) navigate(ROUTES.DASHBOARD_CLIENT, { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e) => {
    const res = await handleSubmit(e);
    if (res.ok) {
      login(res.result);
      toast({ message: 'Compte créé avec succès !', type: 'success' });
      closeModal();
      navigate(ROUTES.DASHBOARD_CLIENT, { replace: true });
    } else if (res.error?.errors) {
      setErrors((prev) => ({ ...prev, ...res.error.errors }));
      toast({ message: res.error.message || 'Veuillez corriger les erreurs.', type: 'error' });
    } else if (res.error?.message) {
      toast({ message: res.error.message, type: 'error' });
    }
  };

  return (
    <Card className={bare ? 'p-0 border-0 shadow-none' : 'p-6 sm:p-8'}>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Créer un compte client</h1>
        <p className="mt-1 text-sm text-gray-500">
          En 1 minute, créez votre compte pour contacter des artisans qualifiés.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="rc-firstName"
              label="Prénom"
              required
              error={errors.firstName}
              value={values.firstName}
              onChange={(e) => setField('firstName', e.target.value)}
              autoComplete="given-name"
            />
            <FormField
              id="rc-lastName"
              label="Nom"
              required
              error={errors.lastName}
              value={values.lastName}
              onChange={(e) => setField('lastName', e.target.value)}
              autoComplete="family-name"
            />
          </div>
          <FormField
            id="rc-phone"
            label="Numéro de téléphone"
            required
            error={errors.phone}
            help="Format Congo : 06 000 00 00"
            placeholder="+242..."
            value={values.phone}
            onChange={(e) => setField('phone', e.target.value)}
            autoComplete="tel"
            inputMode="tel"
          />
          <FormField
            id="rc-password"
            label="Mot de passe"
            required
            error={errors.password}
            as="input"
            help="Minimum 8 caractères"
          >
            <Input
              id="rc-password"
              type="password"
              value={values.password}
              onChange={(e) => setField('password', e.target.value)}
              autoComplete="new-password"
              error={errors.password}
              placeholder="8 caractères minimum"
            />
          </FormField>
          <div>
            <Checkbox
              id="rc-consent"
              label={
                <span className="text-sm leading-5 text-gray-700">
                  J'accepte les conditions d'utilisation de KÔPE.
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
          <Button type="submit" loading={submitting} size="lg" className="w-full">
            Créer mon compte
          </Button>
        </form>
        <div className="mt-6 border-t border-gray-100 pt-4 text-center text-sm text-gray-600">
          Déjà inscrit ? <Link className="link-underline font-medium text-primary-700" to={ROUTES.LOGIN}>Se connecter</Link>
        </div>
    </Card>
  );
}

export function RegisterClientPage() {
  return (
    <div className="mx-auto max-w-md">
      <RegisterClientForm />
    </div>
  );
}
