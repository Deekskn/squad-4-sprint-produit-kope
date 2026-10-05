import { useEffect, useState } from 'react';
import { User, Star, Pencil, Camera } from 'lucide-react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { UserAvatar } from '@/components/ui/UserAvatar.jsx';
import { EmptyState } from '@/components/ui/EmptyState.jsx';
import { getMyReviews } from '@/features/reviews/services/reviews.service.js';
import { updateAccount, uploadAvatar } from '@/features/auth/services/auth.service.js';
import { SidebarNav } from '@/components/ui/SidebarNav.jsx';
import { AccountSettings } from '@/features/auth/components/AccountSettings.jsx';

const NAV_ITEMS = [
  { id: 'profil', label: 'Mon profil', icon: User },
  { id: 'activite', label: 'Mon activité', icon: Star },
];

function Sidebar({ user, active, onChange }) {
  return (
    <aside className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <UserAvatar user={user} className="h-14 w-14" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">
              {[user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'Client'}
            </p>
            <p className="text-xs text-gray-500">Client</p>
          </div>
        </div>
      </Card>
      <SidebarNav
        items={NAV_ITEMS}
        active={active}
        onChange={onChange}
        ariaLabel="Navigation du profil"
      />
    </aside>
  );
}

function ProfilSection({ user }) {
  const { refresh } = useAuthContext();
  const { toast } = useNotification();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || '—';

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAccount({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() });
      await refresh();
      setEditing(false);
      toast({ message: 'Informations enregistrées.', type: 'success' });
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      if (url) setAvatar(url);
      await refresh();
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
        <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
          <Pencil size={16} aria-hidden className="inline" /> {editing ? 'Annuler' : 'Modifier'}
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-5 border-b border-gray-100 bg-mint-50/40 p-6">
          <div className="relative h-20 w-20 overflow-hidden rounded-full">
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
          <div>
            <p className="text-lg font-semibold text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{user?.phone || 'Aucun numéro'}</p>
            {editing && (
              <p className="mt-1 text-[12px] font-semibold text-primary-600">{uploading ? 'Téléversement…' : 'Clique sur la photo pour la changer'}</p>
            )}
          </div>
        </div>

        {editing ? (
          <form onSubmit={save} className="grid gap-4 px-6 py-5 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Prénom</label>
              <input
                className="w-full rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Nom</label>
              <input
                className="w-full rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Téléphone</label>
              <input
                className="w-full rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" loading={saving}>Enregistrer</Button>
            </div>
          </form>
        ) : (
          <dl className="divide-y divide-gray-100 text-sm">
            <div className="grid grid-cols-[120px_1fr] gap-4 px-6 py-4">
              <dt className="text-gray-500">Nom complet</dt>
              <dd className="font-semibold text-gray-900">{name}</dd>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-4 px-6 py-4">
              <dt className="text-gray-500">Téléphone</dt>
              <dd className="font-semibold text-gray-900">{user?.phone || '—'}</dd>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-4 px-6 py-4">
              <dt className="text-gray-500">Rôle</dt>
              <dd className="font-semibold text-gray-900">Client</dd>
            </div>
          </dl>
        )}
      </Card>

      <AccountSettings user={user} passwordOnly />
    </div>
  );
}

function ActiviteSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getMyReviews()
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Mon activité</h2>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Aucun avis pour le moment"
          description="Les avis que vous laissez aux professionnels apparaîtront ici pour garder un historique."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-gray-900">{r.professionalName}</p>
                <span className="text-sm font-bold text-amber-500">★ {r.rating}/5</span>
              </div>
              {r.comment && <p className="mt-2 text-sm leading-6 text-gray-600">{r.comment}</p>}
              <p className="mt-1 text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ClientDashboardPage() {
  const { user } = useAuthContext();
  const { open: openModal } = useAuthModal();
  const [active, setActive] = useState('profil');

  return (
    <div className="container-kop py-10 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Sidebar user={user} active={active} onChange={setActive} />
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => openModal('register-pro')}
          >
            Devenir pro
          </Button>
        </div>
        <main>
          {active === 'profil' && <ProfilSection user={user} />}
          {active === 'activite' && <ActiviteSection />}
        </main>
      </div>
    </div>
  );
}
