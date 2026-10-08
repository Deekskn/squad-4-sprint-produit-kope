import { useState } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { changePassword } from '../services/auth.service.js';
import { Button } from '@/shared/components/ui/Button.jsx';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { Input } from '@/shared/components/ui/Input.jsx';

export function ChangePasswordForm({ bare = false } = {}) {
  const { toast } = useNotification();
  const { close: closeModal } = useAuthModal();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ message: 'Les deux mots de passe ne correspondent pas.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ message: 'Mot de passe mis à jour. Les autres appareils ont été invalidés.', type: 'success' });
      closeModal();
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={bare ? 'w-full px-6' : 'mx-auto w-full max-w-md px-6'}>
      <h2 className="text-2xl font-extrabold tracking-tight text-primary-500">Changer le mot de passe</h2>
      <p className="mb-6 mt-2 text-sm text-gray-500">Votre session reste active sur cet appareil. Les autres appareils seront invalidés.</p>
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <FormField label="Mot de passe actuel" id="change-current">
          <div className="relative">
            <Input id="change-current" type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="Votre mot de passe actuel" />
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer"
              type="button"
              aria-label="Afficher le mot de passe"
              onClick={() => setShowCurrent((v) => !v)}
            >
              {showCurrent ? (
                <LockOpen size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500" aria-hidden />
              ) : (
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
              )}
            </button>
          </div>
        </FormField>
        <FormField label="Nouveau mot de passe" id="change-new" help="Au moins 8 caractères.">
          <div className="relative">
            <Input id="change-new" type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} placeholder="8 caractères minimum" />
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer"
              type="button"
              aria-label="Afficher le mot de passe"
              onClick={() => setShowNew((v) => !v)}
            >
              {showNew ? (
                <LockOpen size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500" aria-hidden />
              ) : (
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
              )}
            </button>
          </div>
        </FormField>
        <FormField label="Confirmer le nouveau mot de passe" id="change-confirm">
          <div className="relative">
            <Input id="change-confirm" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Confirmez le nouveau mot de passe" />
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer"
              type="button"
              aria-label="Afficher le mot de passe"
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? (
                <LockOpen size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500" aria-hidden />
              ) : (
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
              )}
            </button>
          </div>
        </FormField>
        <Button type="submit" loading={loading} variant="primary" className="w-full">Mettre à jour</Button>
      </form>
    </div>
  );
}
