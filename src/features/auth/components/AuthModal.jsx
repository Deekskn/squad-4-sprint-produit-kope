import { Modal } from '@/components/ui/Modal.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { LoginForm } from '../pages/LoginPage.jsx';
import { RegisterClientForm } from '../pages/RegisterClientPage.jsx';
import { BecomeProForm } from './BecomeProForm.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { ROLES } from '@/lib/constants.js';
import { mockImage, LOGIN_IMAGE_PROMPT } from '@/mocks/images.js';

export function AuthModal() {
  const { mode, close, open } = useAuthModal();
  const { user } = useAuthContext();

  const renderPro = () => {
    if (!user) {
      return (
        <div className="space-y-4 p-2 text-sm text-gray-600">
          <p>
            Créez d'abord un compte client, puis vous pourrez passer en compte
            professionnel à tout moment depuis votre espace.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => open('login')}>Se connecter</Button>
            <Button onClick={() => open('register-client')}>Créer un compte</Button>
          </div>
        </div>
      );
    }
    if (user.role === ROLES.PRO) {
      return <p className="p-2 text-sm text-gray-600">Votre compte est déjà professionnel.</p>;
    }
    return <BecomeProForm bare />;
  };

  return (
    <Modal open={mode != null} onClose={close} size="xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-start">
        <aside className="hidden lg:flex flex-col gap-3 rounded-[16px] bg-primary-600 p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-100">KOP · Les savoir-faire des Congolais</p>
          <h2 className="text-2xl font-extrabold tracking-tight leading-tight">
            Les belles rencontres commencent tout près.
          </h2>
          <p className="text-sm leading-6 text-white/80">
            Retrouvez les professionnels de votre quartier et gardez une trace de vos demandes, au même endroit.
          </p>
          <img
            src={mockImage(LOGIN_IMAGE_PROMPT)}
            alt=""
            className="mt-1 h-40 w-full rounded-md object-cover"
          />
          <div className="rounded-md bg-white/10 p-4">
            <p className="text-sm font-bold">Les mains qui font votre quartier</p>
            <p className="text-xs text-white/70">Des professionnels, près de chez vous.</p>
          </div>
        </aside>
        <div className="min-w-0">
          {mode === 'login' && <LoginForm bare />}
          {mode === 'register-client' && <RegisterClientForm bare />}
          {mode === 'register-pro' && renderPro()}
        </div>
      </div>
    </Modal>
  );
}
