import { useState } from 'react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { updateAccount, changePassword } from '../services/auth.service.js';
import { Button } from '@/components/ui/Button.jsx';
import { FormField } from '@/components/ui/FormField.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Card } from '@/components/ui/Card.jsx';

export function AccountSettings({ user }) {
  const { refresh } = useAuthContext();
  const { toast } = useNotification();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const submitName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await updateAccount({ firstName: firstName.trim(), lastName: lastName.trim() });
      await refresh();
      toast({ message: 'Informations enregistrées.', type: 'success' });
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setSavingName(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ message: 'Les deux mots de passe ne correspondent pas.', type: 'error' });
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ message: 'Mot de passe mis à jour. Les autres appareils ont été invalidés.', type: 'success' });
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  const showNameForm = user?.role !== 'professional' && user?.role !== 'admin';

  return (
    <div className="space-y-6">
      {showNameForm && (
        <Card className="p-6">
          <h3 className="text-base font-bold text-gray-900">Informations personnelles</h3>
          <form onSubmit={submitName} className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Prénom" id="acc-firstname">
              <Input id="acc-firstname" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </FormField>
            <FormField label="Nom" id="acc-lastname">
              <Input id="acc-lastname" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </FormField>
            <div className="sm:col-span-2">
              <Button type="submit" loading={savingName} variant="primary">Enregistrer</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-base font-bold text-gray-900">Changer le mot de passe</h3>
        <form onSubmit={submitPassword} className="mt-4 space-y-4 max-w-md">
          <FormField label="Mot de passe actuel" id="acc-current">
            <Input id="acc-current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </FormField>
          <FormField label="Nouveau mot de passe" id="acc-new" help="Au moins 8 caractères.">
            <Input id="acc-new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
          </FormField>
          <FormField label="Confirmer le nouveau mot de passe" id="acc-confirm">
            <Input id="acc-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </FormField>
          <Button type="submit" loading={savingPassword} variant="primary">Mettre à jour</Button>
        </form>
      </Card>
    </div>
  );
}
