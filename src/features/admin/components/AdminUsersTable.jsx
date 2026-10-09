import { useCallback, useEffect, useState } from 'react';
import { Calendar, Phone } from 'lucide-react';
import { Badge, CustomSelect, Pagination, SearchInput, DataState, UserAvatar } from '@/shared/components/ui';
import {
  AdminFilterGroup,
  AdminFilterPanel,
  AdminSectionLayout,
} from './AdminSectionLayout.jsx';
import { useAdminPage } from '../hooks/useAdminPage.js';
import { listUsers } from '../services/admin.service.js';
import { ROLES } from '@/shared/lib/constants.js';
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

export function AdminUsersTable({ rightContainer = null }) {
  const [page, changePage, setPage] = useAdminPage();
  const [role, setRole] = useState('');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              return (
                <li key={u.id} className="flex flex-col rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      user={{ firstName: u.firstName, lastName: u.lastName, avatarUrl: u.avatarUrl }}
                      name={name}
                      className="h-11 w-11"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">{name}</p>
                      {u.phone && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{u.phone}</span>
                        </p>
                      )}
                    </div>
                    <Badge variant={ROLE_VARIANTS[u.role] || 'neutral'}>
                      {ROLE_LABELS[u.role] || u.role}
                    </Badge>
                  </div>
                  {u.createdAt && (
                    <p className="mt-3 flex items-center gap-1.5 border-t border-gray-100 pt-3 text-xs text-gray-400">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      Inscrit le {formatDateFr(u.createdAt)}
                    </p>
                  )}
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
    </AdminSectionLayout>
  );
}
