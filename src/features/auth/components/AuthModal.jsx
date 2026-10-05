import { Dialog, DialogContent } from '@/components/ui/Dialog.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { LoginForm } from '../pages/LoginPage.jsx';
import { RegisterClientForm } from '../pages/RegisterClientPage.jsx';
import { BecomeProForm } from './BecomeProForm.jsx';
import { ROLES } from '@/lib/constants.js';
import { mockImage, LOGIN_IMAGE_PROMPT } from '@/mocks/images.js';
import { Card } from '@/components/ui/Card.jsx';
import { FloatingCaption } from '@/components/ui/FloatingCaption.jsx';
import { User } from 'lucide-react';

export function AuthModal() {
  const { mode, close } = useAuthModal();
  const { user } = useAuthContext();

  const renderPro = () => {

    if (!user) return <LoginForm bare />
    
    if (user.role === ROLES.PRO) {
      return <p className="p-2 text-sm text-gray-600">Votre compte est déjà professionnel.</p>;
    }
    return <BecomeProForm bare />;
  };

  return (
    <Dialog open={mode != null} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-4xl p-2 " onClose={close}>
        <div className="grid lg:grid-cols-2 lg:items-start min-h-140">
          <aside className="hidden  h-full  lg:flex flex-col justify-between gap-3 rounded-[16px] bg-radial from-[#28604B] to-[#183E30] p-2 text-white">
            <div className='space-y-2 p-6'>
              <h2 className="text-3xl font-semibold tracking-tight leading-tight text-white!">
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
                <FloatingCaption
                  icon={User}
                  title="Les mains qui font votre quartier"
                  subtitle="Des professionnels, près de chez vous."
                />
              </div>

            </Card>
          </aside>
          <div className="min-w-0 h-full grid place-content-center">
            {mode === 'login' && <LoginForm bare />}
            {mode === 'register-client' && <RegisterClientForm bare />}
            {mode === 'register-pro' &&  renderPro() }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
