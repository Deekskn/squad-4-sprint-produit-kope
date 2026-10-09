import { useCallback, useEffect, useState } from 'react';
import { Calendar, CornerDownRight, Eye, EyeOff } from 'lucide-react';
import { Button, CustomSelect, SearchInput, Pagination, Modal, StarRating, DataState, Tooltip, UserAvatar } from '@/shared/components/ui';
import {
  AdminFilterGroup,
  AdminFilterPanel,
  AdminSectionLayout,
} from './AdminSectionLayout.jsx';
import { useAdminPage } from '../hooks/useAdminPage.js';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { listReviews, setReviewHidden } from '../services/admin.service.js';
import { formatDateFr, fullNameInitials } from '@/shared/utils';

const PAGE_SIZE = 25;

const VISIBILITY_OPTIONS = [
  { value: '', label: 'Tous les avis' },
  { value: 'false', label: 'Non masqués' },
  { value: 'true', label: 'Masqués' },
];

export function AdminReviewsTable({ rightContainer = null }) {
  const { toast } = useNotification();
  const [page, changePage, setPage] = useAdminPage();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [hidden, setHidden] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(
        await listReviews({
          page,
          pageSize: PAGE_SIZE,
          hidden: hidden === '' ? undefined : hidden === 'true',
          query: search,
        }),
      );
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, hidden, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const apply = async () => {
    if (!confirm) return;
    try {
      await setReviewHidden(confirm.item.id, confirm.action === 'hide');
      toast({
        message: confirm.action === 'hide' ? 'Avis masqué.' : 'Avis rétabli.',
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
    setHidden('');
    setPage(1);
  };

  const total = Number(data?.total || 0);
  const dirty = Boolean(query || search || hidden);

  const renderFilters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <form onSubmit={submitSearch} className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder="Client, professionnel ou contenu..."
            aria-label="Rechercher un avis"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Visibilité">
          <CustomSelect
            value={hidden}
            onChange={(v) => {
              setHidden(v);
              setPage(1);
            }}
            options={VISIBILITY_OPTIONS}
            className="w-full"
            aria-label="Filtrer par visibilité"
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
              Aucun avis.
            </li>
          ) : (
            (data?.items || []).map((r) => (
              <li
                key={r.id}
                className={`rounded-lg border bg-white p-4 ${r.isHidden ? 'border-rose-200 bg-rose-50/30' : 'border-gray-200'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={r.client} className="h-7 w-7" />
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {fullNameInitials(r.client?.firstName, r.client?.lastName) || 'Client'}
                      </p>
                      {r.isHidden ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                          Masqué
                        </span>
                      ) : (
                        <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                          Visible
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 opacity-60 grayscale">
                      <CornerDownRight className="h-4 w-4 shrink-0 text-gray-300" aria-hidden />
                      <UserAvatar user={r.professional} className="h-6 w-6" iconSize={12} />
                      <p className="truncate text-xs text-gray-500">
                        {r.professional?.displayName || r.professional?.name || `Pro #${r.professional?.id || '?'}`}
                      </p>
                    </div>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {formatDateFr(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StarRating value={r.rating} size="sm" />
                    {r.isHidden ? (
                      <Tooltip content="Rétablir l'avis">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-primary-600 hover:bg-mint-100"
                          onClick={() => setConfirm({ item: r, action: 'show' })}
                          aria-label="Rétablir l'avis"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip content="Masquer l'avis">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => setConfirm({ item: r, action: 'hide' })}
                          aria-label="Masquer l'avis"
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>
                {r.comment && (
                  <blockquote className="mt-3 whitespace-pre-wrap border-l-2 border-primary-400 bg-mint-50 py-2 pl-3 pr-3 text-sm leading-6 text-gray-700">
                    {r.comment}
                  </blockquote>
                )}
              </li>
            ))
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
      noun="Avis"
      dirty={dirty}
      filters={renderFilters}
      searchId="rev-search"
    >
      {list}

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.action === 'hide' ? 'Masquer cet avis ?' : "Rétablir cet avis ?"}
        description={
          confirm
            ? confirm.action === 'hide'
              ? "L'avis disparaîtra de la fiche publique."
              : "L'avis sera de nouveau visible sur la fiche du professionnel."
            : ''
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Annuler
            </Button>
            <Button variant={confirm?.action === 'hide' ? 'danger' : 'primary'} onClick={apply}>
              {confirm?.action === 'hide' ? 'Masquer' : 'Rétablir'}
            </Button>
          </>
        }
      />
    </AdminSectionLayout>
  );
}
