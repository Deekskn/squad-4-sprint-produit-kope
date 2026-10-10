import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ban, Calendar, Check, Phone, Plus, ShieldCheck, UserPlus, X } from 'lucide-react';
import {
  Badge,
  Button,
  CustomSelect,
  Pagination,
  SearchInput,
  DataState,
  UserAvatar,
  Tooltip,
  Modal,
} from '@/shared/components/ui';
import {
  AdminFilterGroup,
  AdminFilterPanel,
  AdminSectionLayout,
} from './AdminSectionLayout.jsx';
import { useAdminPage } from '../hooks/useAdminPage.js';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { createAdmin, listUsers, setUserBlocked } from '../services/admin.service.js';
import { ROLES, ROUTES } from '@/shared/lib/constants.js';
import { formatDateFr } from '@/shared/utils';

const PAGE_SIZE = 100;

const ROLE_LABELS = {
  [ROLES.CLIENT]: 'Client',
  [ROLES.PRO]: 'Professionnel',
  [ROLES.ADMIN]: 'Administrateur',
};

const ROLE_VARIANTS = {
  [ROLES.CLIENT]: 'neutral',
  [ROLES.PRO]: 'info',
  [ROLES.ADMIN]: 'success',
};

const ROLE_OPTIONS = [
  { value: '', label: 'Tous les rôles' },
  { value: ROLES.CLIENT, label: 'Clients' },
  { value: ROLES.PRO, label: 'Professionnels' },
  { value: ROLES.ADMIN, label: 'Administrateurs' },
];

const EMPTY_ADMIN = { firstName: '', lastName: '', phone: '', password: '' };

export function AdminUsersTable({ rightContainer = null }) {
  const { user: currentUser } = useAuthContext();
  const { toast } = useNotification();
  const [page, changePage, setPage] = useAdminPage();
  const [role, setRole] = useState('');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(null);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listUsers({ page, pageSize: PAGE_SIZE, role, query: search }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, role, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(query.trim());
  };

  const resetFilters = () => {
    setQuery('');
    setSearch('');
    setRole('');
    setPage(1);
  };

  const total = Number(data?.total || 0);
  const dirty = Boolean(query || search || role);

  const applyBlock = async () => {
    if (!confirm) return;
    setSaving(true);
    try {
      await setUserBlocked(currentUser?.id, confirm.target.id, confirm.blocked);
      toast({
        message: confirm.blocked ? 'Utilisateur bloqué.' : 'Utilisateur débloqué.',
        type: 'success',
      });
      setConfirm(null);
      load();
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const submitAdmin = async (e) => {
    e.preventDefault();
    if (!creating) return;
    if (!creating.firstName.trim() || !creating.lastName.trim() || !creating.phone.trim()) {
      setFormError('Prénom, nom et numéro sont obligatoires');
      return;
    }
    if (creating.password.length < 8) {
      setFormError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      await createAdmin({
        firstName: creating.firstName.trim(),
        lastName: creating.lastName.trim(),
        phone: creating.phone.trim(),
        password: creating.password,
      });
      toast({ message: 'Administrateur créé.', type: 'success' });
      setCreating(null);
      load();
    } catch (err) {
      setFormError(err?.message || 'Erreur.');
    } finally {
      setSaving(false);
    }
  };

  const renderFilters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <form onSubmit={submitSearch} className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder="Nom ou téléphone..."
            aria-label="Rechercher un utilisateur"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Rôle">
          <CustomSelect
            value={role}
            onChange={(v) => {
              setRole(v);
              setPage(1);
            }}
            options={ROLE_OPTIONS}
            className="w-full"
            aria-label="Filtrer par rôle"
          />
        </AdminFilterGroup>
      </form>
    </AdminFilterPanel>
  );

  const list = (
    <DataState loading={loading} error={error}>
      <>
        <ul className="space-y-3">
          {(data?.items || []).length === 0 ? (
            <li className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Aucun utilisateur.
            </li>
          ) : (
            (data?.items || []).map((u) => {
              const name =
                u.displayName ||
                [u.firstName, u.lastName].filter(Boolean).join(' ') ||
                `#${u.id}`;
              const blocked = Boolean(u.blockedAt);
              const isSelf = currentUser?.id === u.id;
              const isPro = u.role === ROLES.PRO;
              return (
                <li
                  key={u.id}
                  className={`flex flex-col overflow-hidden rounded-lg border bg-white ${
                    blocked ? 'border-rose-200 bg-rose-50/40' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3 p-4">
                    {isPro ? (
                      <Link
                        to={ROUTES.PROFESSIONAL(u.id)}
                        className="shrink-0 rounded-full transition hover:opacity-80"
                        aria-label={`Voir la fiche publique de ${name}`}
                      >
                        <UserAvatar
                          user={{ firstName: u.firstName, lastName: u.lastName, avatarUrl: u.avatarUrl }}
                          name={name}
                          className="h-11 w-11"
                        />
                      </Link>
                    ) : (
                      <UserAvatar
                        user={{ firstName: u.firstName, lastName: u.lastName, avatarUrl: u.avatarUrl }}
                        name={name}
                        className="h-11 w-11"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      {isPro ? (
                        <Link
                          to={ROUTES.PROFESSIONAL(u.id)}
                          className="block truncate font-semibold text-gray-900 transition hover:text-primary-700 hover:underline"
                        >
                          {name}
                        </Link>
                      ) : (
                        <p className="truncate font-semibold text-gray-900">{name}</p>
                      )}
                      {u.phone && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{u.phone}</span>
                        </p>
                      )}
                      {u.createdAt && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          Inscrit le {formatDateFr(u.createdAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={ROLE_VARIANTS[u.role] || 'neutral'}>
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                      {blocked && <Badge variant="danger">Bloqué</Badge>}
                    </div>
                  </div>

                  <div className="-mx-4 -mb-4 flex items-center justify-end gap-1 border-t border-gray-100 bg-gray-50/80 px-4 py-1.5">
                    {isSelf ? (
                      <span className="text-xs text-gray-400">Votre compte</span>
                    ) : blocked ? (
                      <Tooltip content="Débloquer le compte">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-primary-600 hover:bg-mint-100"
                          onClick={() => setConfirm({ target: u, blocked: false })}
                          aria-label={`Débloquer ${name}`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip content="Bloquer le compte">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => setConfirm({ target: u, blocked: true })}
                          aria-label={`Bloquer ${name}`}
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>

        <Pagination
          page={Number(data?.page || page)}
          pageSize={Number(data?.pageSize || PAGE_SIZE)}
          total={total}
          onPageChange={changePage}
          variant="summary"
          className="mt-4"
        />

        {creating ? (
          <form
            onSubmit={submitAdmin}
            className="mt-4 rounded-lg border border-primary-200 bg-primary-50 p-4"
          >
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-700">
              <UserPlus className="h-4 w-4" />
              Nouvel administrateur
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                autoFocus
                value={creating.firstName}
                onChange={(e) => setCreating((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="Prénom"
                aria-label="Prénom"
                className="h-9 rounded-sm border border-gray-300 bg-white px-2.5 text-sm outline-none focus:border-primary-500"
              />
              <input
                value={creating.lastName}
                onChange={(e) => setCreating((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Nom"
                aria-label="Nom"
                className="h-9 rounded-sm border border-gray-300 bg-white px-2.5 text-sm outline-none focus:border-primary-500"
              />
              <input
                value={creating.phone}
                onChange={(e) => setCreating((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Téléphone (+242…)"
                aria-label="Téléphone"
                className="h-9 rounded-sm border border-gray-300 bg-white px-2.5 text-sm outline-none focus:border-primary-500"
              />
              <input
                type="password"
                value={creating.password}
                onChange={(e) => setCreating((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Mot de passe (8 caractères min.)"
                aria-label="Mot de passe"
                className="h-9 rounded-sm border border-gray-300 bg-white px-2.5 text-sm outline-none focus:border-primary-500"
              />
            </div>
            {formError && <p className="mt-2 text-sm text-danger-500">{formError}</p>}
            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCreating(null);
                  setFormError('');
                }}
              >
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button type="submit" size="sm" loading={saving}>
                <ShieldCheck className="h-4 w-4" />
                Créer
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => setCreating(EMPTY_ADMIN)}>
            <Plus className="h-4 w-4" />
            Nouvel administrateur
          </Button>
        )}
      </>
    </DataState>
  );

  return (
    <AdminSectionLayout
      rightContainer={rightContainer}
      total={total}
      noun="Utilisateur"
      dirty={dirty}
      filters={renderFilters}
      searchId="usr-search"
    >
      {list}

      <Modal
        open={Boolean(confirm)}
        onClose={() => !saving && setConfirm(null)}
        dismissable={!saving}
        title={confirm?.blocked ? 'Bloquer cet utilisateur ?' : 'Débloquer cet utilisateur ?'}
        description={
          confirm?.blocked
            ? 'Son compte ne pourra plus se connecter et ses sessions seront fermées immédiatement.'
            : 'L’utilisateur pourra de nouveau se connecter à la plateforme.'
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)} disabled={saving}>
              Annuler
            </Button>
            <Button variant={confirm?.blocked ? 'danger' : 'primary'} onClick={applyBlock} loading={saving}>
              {confirm?.blocked ? 'Bloquer' : 'Débloquer'}
            </Button>
          </>
        }
      />
    </AdminSectionLayout>
  );
}
