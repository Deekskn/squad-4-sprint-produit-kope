import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { Input } from '@/shared/components/ui/Input.jsx';
import { Checkbox } from '@/shared/components/ui/Checkbox.jsx';
import { useForm } from '@/shared/hooks/useForm.js';
import { registerClientSchema } from '@/shared/utils/validators.js';
import { registerClient } from '../services/auth.service.js';
import { ROUTES } from '@/shared/lib/constants.js';
import { Lock, LockOpen } from 'lucide-react';

const INITIAL = { firstName: '', lastName: '', phone: '', password: '', consent: false };

export function RegisterClientForm({ bare = false } = {}) {
  const [showPassword, setShowPassword] = useState(false);
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
    } else if (res.error?.message)
      toast({ message: res.error.message, type: 'error' });

  };

  return (
    <aside className={bare ? 'p-6 ' : 'p-6 sm:p-8'}>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Créer un compte </h1>
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
            placeholder="+242 06 000 00 00"
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
            <div className="relative">
            <Input
              id="rc-password"
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              onChange={(e) => setField('password', e.target.value)}
              autoComplete="new-password"
              error={errors.password}
              placeholder="8 caractères minimum"
            />
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer"
              type="button" aria-label="Afficher le mot de passe"
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <LockOpen size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500" aria-hidden />
              ) : (
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
              )}
            </button>
            </div>
          </FormField>
          <div>
            <Checkbox
              id="rc-consent"
              label={
                <span className="text-sm leading-5 text-gray-700">
                  J'accepte les conditions d'utilisation de KOP.
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
        <div className="pt-4 pl-4 text-sm text-gray-600">
          Déjà inscrit ? <Link className="link-underline font-medium text-primary-700" to={ROUTES.LOGIN}>Se connecter</Link>
        </div>
    </aside>
  );
}

export function RegisterClientPage() {
  return (
    <div className="mx-auto max-w-md">
      <RegisterClientForm />
    </div>
  );
}
