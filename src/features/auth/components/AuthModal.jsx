import { Dialog, DialogContent } from '@/components/ui/Dialog.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { LoginForm } from '../pages/LoginPage.jsx';
import { RegisterClientForm } from '../pages/RegisterClientPage.jsx';
import { BecomeProForm } from './BecomeProForm.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { ROLES } from '@/lib/constants.js';
import { mockImage, LOGIN_IMAGE_PROMPT } from '@/mocks/images.js';
import { Card } from '@/components/ui/Card.jsx';
import { User } from 'lucide-react';

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
    <Dialog open={mode != null} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-4xl p-2 " onClose={close}>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <aside className="hidden  h-full min-h-142.5 lg:flex flex-col justify-between gap-3 rounded-[16px] bg-primary-600 p-2 text-white">
            <div className='space-y-2 p-6'>
              <p className="text-xs font-bold uppercase tracking-wider text-primary-100">KOP · Les savoir-faire des Congolais</p>
              <h2 className="text-2xl font-extrabold tracking-tight leading-tight">
                Les belles rencontres commencent tout près.
              </h2>
              <p className="text-sm leading-6 text-white/80">
                Retrouvez les professionnels de votre quartier et gardez une trace de vos demandes, au même endroit.
              </p>
            </div>
            <Card className="overflow-hidden flex flex-col transition rounded-sm! border-0! ">
              <div className="relative aspect-6/4 overflow-hidden ">
                <img
                  src={mockImage(LOGIN_IMAGE_PROMPT)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute  left-2 bottom-2 rounded-sm bg-white/92 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center text-gray-800"><User size={24} strokeWidth={1.5} aria-hidden /></span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">Les mains qui font votre quartier</p>
                    <p className="text-[11px] text-gray-500">Des professionnels, près de chez vous.</p>
                  </div>
                </div>
              </div>

            </Card>
          </aside>
          <div className="min-w-0">
            {mode === 'login' && <LoginForm bare />}
            {mode === 'register-client' && <RegisterClientForm bare />}
            {mode === 'register-pro' && renderPro()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
