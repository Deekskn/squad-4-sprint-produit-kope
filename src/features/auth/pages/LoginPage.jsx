import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { FormField } from '@/components/ui/FormField.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { useForm } from '@/components/form/useForm.js';
import { loginSchema } from '@/components/form/validators.js';
import { login } from '../services/auth.service.js';
import { ROLES, ROUTES } from '@/lib/constants.js';
import { mockImage, LOGIN_IMAGE_PROMPT } from '@/mocks/images.js';

const INITIAL = { phone: '', password: '' };

function dashboardForRole(role) {
  if (role === ROLES.CLIENT) return ROUTES.DASHBOARD_CLIENT;
  if (role === ROLES.PRO) return ROUTES.DASHBOARD_PRO;
  if (role === ROLES.ADMIN) return ROUTES.ADMIN;
  return ROUTES.HOME;
}

export function LoginForm({ bare = false } = {}) {
  const { user, login: setUser } = useAuthContext();
  const { close: closeModal } = useAuthModal();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useNotification();

  const { values, errors, globalError, submitting, setField, handleSubmit, setGlobalError } =
    useForm(loginSchema, INITIAL, async (data) => login(data));

  useEffect(() => {
    if (user) navigate(dashboardForRole(user.role), { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e) => {
    setGlobalError(null);
    const res = await handleSubmit(e);
    if (res.ok) {
      setUser(res.result);
      const next = params.get('next') || dashboardForRole(res.result.role);
      toast({ message: 'Bienvenue !', type: 'success' });
      closeModal();
      navigate(next, { replace: true });
    } else if (res.error && !res.error?.errors) {
      toast({ message: res.error?.message || 'Identifiants incorrects', type: 'error' });
    }
  };

  return (
    <div className={bare ? 'w-full' : 'mx-auto w-full max-w-md'}>
      <Card className={bare ? 'p-0 border-0 shadow-none' : 'p-7 sm:p-9 shadow-[0_20px_60px_-20px_rgba(45,92,74,0.2)]'}>
            <div className="flex items-center gap-2 text-primary-700 font-bold mb-6">
              <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
                <path d="M5 21h22l-3.5-3.5L18 14l-6 6-3-3-4 4z" fill="#2d5c4a"/>
              </svg>
              KOP
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Connexion</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Accédez à votre espace client, professionnel ou administrateur.
            </p>
            <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate>
              {(globalError || errors._global) && (
                <div role="alert" className="rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {globalError || errors._global}
                </div>
              )}
              <FormField
                id="login-phone"
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
                id="login-password"
                label="Mot de passe"
                required
                error={errors.password}
                as="input"
              >
                <Input
                  id="login-password"
                  type="password"
                  value={values.password}
                  autoComplete="current-password"
                  error={errors.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder="8 caractères minimum"
                />
              </FormField>
              <Button type="submit" loading={submitting} size="lg" className="!w-full">
                Se connecter
              </Button>
            </form>
            <div className="mt-8 grid gap-2.5 border-t border-gray-100 pt-6 text-sm sm:grid-cols-2 sm:gap-3">
              <Link
                to={ROUTES.REGISTER_CLIENT}
                className="rounded-[14px] border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-ring transition"
              >
                Créer un compte client
              </Link>
              <Link
                to={ROUTES.REGISTER_PRO}
                className="rounded-[14px] border border-primary-200 bg-primary-50 px-4 py-2.5 text-center text-sm font-bold text-primary-800 hover:bg-primary-100 focus-ring transition"
              >
                S'inscrire en tant qu'artisan
              </Link>
            </div>
      </Card>
    </div>
  );
}

export function LoginPage() {
  return (
    <div className="container-kop page-padding">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16 min-h-[72vh]">
        {/* Left illustration */}
        <div className="hidden lg:block">
          <div className="rounded-[32px] bg-kop-mint p-10 h-full max-w-[520px] relative overflow-hidden">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-800/70">KOP</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Retrouvez votre
              <br />
              <span className="text-primary-700">espace</span>.
            </h2>
            <p className="mt-3 text-base leading-7 text-gray-700/90 max-w-md">
              Un compte pour chercher, contacter et laisser des avis aux pros de votre quartier.
            </p>
            <div className="mt-10">
              <div className="rounded-[24px] overflow-hidden ring-1 ring-black/5 shadow-[0_24px_60px_-30px_rgba(45,92,74,0.45)] max-w-[380px]">
                <img
                  src={mockImage(LOGIN_IMAGE_PROMPT)}
                  alt="Connexion KOP"
                  className="w-full h-[320px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Right form */}
        <LoginForm />
      </div>
    </div>
  );
}
