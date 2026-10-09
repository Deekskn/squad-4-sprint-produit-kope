import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink, Eye, EyeOff, MapPin, Phone, Wrench } from 'lucide-react';
import { Badge, Button, CustomSelect, SearchInput, Pagination, Modal, DataState, UserAvatar, Tooltip } from '@/shared/components/ui';
import {
  AdminFilterField,
  AdminFilterGroup,
  AdminFilterPanel,
  AdminSectionLayout,
} from './AdminSectionLayout.jsx';
import { useAdminPage } from '../hooks/useAdminPage.js';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { listPros, setProHidden } from '../services/admin.service.js';
import {
  CITIES,
  COUNTRIES,
  DEFAULT_CITY,
  DEFAULT_COUNTRY,
  PROFILE_STATUS,
  PROFILE_STATUS_LABELS,
  ROUTES,
} from '@/shared/lib/constants.js';
import { formatDateFr } from '@/shared/utils';

const PAGE_SIZE = 100;

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: PROFILE_STATUS.PUBLISHED, label: 'Publiés' },
  { value: PROFILE_STATUS.INCOMPLETE, label: 'Incomplets' },
  { value: PROFILE_STATUS.HIDDEN, label: 'Masqués' },
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Nom (A-Z)' },
  { value: 'recent', label: 'Plus récents' },
];

function statusVariant(s) {
  if (s === PROFILE_STATUS.PUBLISHED) return 'success';
  if (s === PROFILE_STATUS.HIDDEN) return 'danger';
  return 'warning';
}

export function AdminProfessionalsGrid({ rightContainer = null }) {
  const { toast } = useNotification();
  const [page, changePage, setPage] = useAdminPage();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('name');
  const [city, setCity] = useState(DEFAULT_CITY);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listPros({ page, pageSize: PAGE_SIZE, query: search, status, sort, city, country }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, sort, city, country]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const apply = async () => {
    if (!confirm) return;
    try {
      await setProHidden(confirm.item.userId || confirm.item.id, confirm.action === 'hide');
      toast({
        message: confirm.action === 'hide' ? 'Profil masqué.' : 'Profil réactivé.',
        type: 'success',
      });
      setConfirm(null);
      load();
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    }
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(query.trim());
  };

  const resetFilters = () => {
    setQuery('');
    setSearch('');
    setStatus('');
    setSort('name');
    setCity(DEFAULT_CITY);
    setCountry(DEFAULT_COUNTRY);
    setPage(1);
  };

  const dirty =
    Boolean(query || search || status) ||
    sort !== 'name' ||
    city !== DEFAULT_CITY ||
    country !== DEFAULT_COUNTRY;

  const renderFilters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <form onSubmit={submitSearch} className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder="Nom, métier, téléphone..."
            aria-label="Rechercher un professionnel"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Statut">
          <CustomSelect
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
            className="w-full"
            aria-label="Filtrer par statut"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Localisation">
          <AdminFilterField label="Ville">
            <CustomSelect
              value={city}
              onChange={(v) => {
                setCity(v);
                setPage(1);
              }}
              options={CITIES.map((c) => ({ value: c, label: c }))}
              className="w-full"
              aria-label="Filtrer par ville"
            />
          </AdminFilterField>
          <AdminFilterField label="Pays">
            <CustomSelect
              value={country}
              onChange={(v) => {
                setCountry(v);
                setPage(1);
              }}
              options={COUNTRIES.map((c) => ({ value: c, label: c }))}
              className="w-full"
              aria-label="Filtrer par pays"
            />
          </AdminFilterField>
        </AdminFilterGroup>

        <AdminFilterGroup title="Trier par">
          <CustomSelect
            value={sort}
            onChange={setSort}
            options={SORT_OPTIONS}
            className="w-full"
            aria-label="Trier"
          />
        </AdminFilterGroup>
      </form>
    </AdminFilterPanel>
  );

  const total = Number(data?.total || 0);

  const cards = (
    <DataState loading={loading} error={error}>
      <>
        
        <ul className="space-y-3">
          {(data?.items || []).length === 0 ? (
            <li className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Aucun résultat.
            </li>
          ) : (
            (data?.items || []).map((p) => {
              const id = p.userId || p.id;
              const name = p.displayName || [p.firstName, p.lastName].filter(Boolean).join(' ') || `#${id}`;
              const hidden = p.status === PROFILE_STATUS.HIDDEN;
              return (
                <li key={id} className=" relative flex flex-col rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      user={{ firstName: p.firstName, lastName: p.lastName, avatarUrl: p.avatarUrl }}
                      name={name}
                      className="h-11 w-11"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">{name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                        <Wrench className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{p.trade || '-'}</span>
                      </p>
                    </div>
                    <Badge variant={statusVariant(p.status)}>
                      {PROFILE_STATUS_LABELS[p.status] || p.status || '-'}
                    </Badge>
                  </div>

                  <div className="mt-3  pl-3 space-y-2 text-xs text-gray-600">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {[p.city || DEFAULT_CITY, p.country || DEFAULT_COUNTRY].filter(Boolean).join(', ')}
                      </span>
                    </p>
                    {p.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{p.phone}</span>
                      </p>
                    )}
                    {
                      p.createdAt &&
                      <p className="text-gray-400 flex items-center gap-1.5 text-xs">
                        <Calendar  className="h-3.5 w-3.5 shrink-0"/>
                        Inscrit le {formatDateFr(p.createdAt)}
                      </p>
                    }
                  </div>

                  <div className="flex items-center gap-1.5 absolute  right-3  bottom-3 overflow-hidden bg-gray-100/50 border border-gray-200   rounded-md">
                    <Tooltip content="Voir la fiche">
                      <Button
                        as={Link}
                        to={ROUTES.PROFESSIONAL(id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Voir la fiche"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                    <span className="border border-gray-200 h-2" ></span>
                    {hidden ? (
                      <Tooltip content="Réactiver le profil">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-primary-600 hover:bg-mint-100"
                          onClick={() => setConfirm({ item: p, action: 'show' })}
                          aria-label="Réactiver le profil"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip content="Masquer le profil">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => setConfirm({ item: p, action: 'hide' })}
                          aria-label="Masquer le profil"
                        >
                          <EyeOff className="h-4 w-4" />
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
          className="mt-4 border border-gray-200 px-4 py-2 rounded-md bg-white"
        />
      </>
    </DataState>
  );

  return (
    <AdminSectionLayout
      rightContainer={rightContainer}
      total={total}
      noun="Professionnel"
      dirty={dirty}
      filters={renderFilters}
      searchId="pro-search"
    >
      {cards}

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.action === 'hide' ? 'Masquer le profil ?' : 'Réactiver le profil ?'}
        description={
          confirm
            ? confirm.action === 'hide'
              ? 'Le profil disparaîtra des recherches et de la fiche publique. Vous pouvez le réactiver à tout moment.'
              : 'Le profil sera à nouveau visible dans les recherches et sa fiche publique sera réouverte.'
            : ''
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Annuler
            </Button>
            <Button variant={confirm?.action === 'hide' ? 'danger' : 'primary'} onClick={apply}>
              {confirm?.action === 'hide' ? 'Masquer' : 'Réactiver'}
            </Button>
          </>
        }
      />
    </AdminSectionLayout>
  );
}
