import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Pagination, Modal, StarRating, DataState } from '@/shared/components/ui';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { listReviews, setReviewHidden } from '../services/admin.service.js';
import { formatDateFr, fullNameInitials } from '@/shared/utils';

const PAGE_SIZE = 20;

export function AdminReviewsTable() {
  const { toast } = useNotification();
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listReviews({ page, pageSize: PAGE_SIZE }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const apply = async () => {
    if (!confirm) return;
    try {
      await setReviewHidden(confirm.item.id, confirm.action === 'hide');
      toast({
        message: confirm.action === 'hide' ? 'Avis masqué.' : 'Avis réactivé.',
        type: 'success',
      });
      setConfirm(null);
      load();
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    }
  };

  return (
    <div className="space-y-4">
      <DataState loading={loading} error={error}>
        <>
          <ul className="space-y-3">
            {(data?.items || []).length === 0 ? (
              <li className="rounded-sm border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
                Aucun avis.
              </li>
            ) : (
              (data?.items || []).map((r) => (
                <li key={r.id} className={`rounded-md border bg-white p-4 ${r.isHidden ? 'border-rose-200 bg-rose-50/30' : 'border-gray-200'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {fullNameInitials(r.client?.firstName, r.client?.lastName) || 'Client'}
                          </p>
                          <Badge size="sm" variant="neutral" className="text-[10px]">
                            #{r.id}
                          </Badge>
                          {r.isHidden && <Badge size="sm" variant="danger">Masqué</Badge>}
                        </div>
                        <p className="text-xs text-gray-500">
                          sur {r.professional?.displayName || r.professional?.name || `Pro #${r.professional?.id || '?'}`}
                          {' · '}
                          {formatDateFr(r.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StarRating value={r.rating} size="sm" />
                      {r.isHidden ? (
                        <Button size="xs" variant="outline" onClick={() => setConfirm({ item: r, action: 'show' })}>
                          Réactiver
                        </Button>
                      ) : (
                        <Button size="xs" variant="danger-outline" onClick={() => setConfirm({ item: r, action: 'hide' })}>
                          Masquer
                        </Button>
                      )}
                    </div>
                  </div>
                  {r.comment && (
                    <blockquote className="mt-3 whitespace-pre-wrap border-l-2 border-gray-200 pl-3 text-sm leading-6 text-gray-700">
                      {r.comment}
                    </blockquote>
                  )}
                </li>
              ))
            )}
          </ul>
          {(data?.total ?? 0) > PAGE_SIZE && (
            <Pagination
              page={Number(data?.page || page)}
              pageSize={Number(data?.pageSize || PAGE_SIZE)}
              total={Number(data?.total || 0)}
              onPageChange={setPage}
            />
          )}
        </>
      </DataState>

      <Modal
        open={!!confirm}
        onClose={() => !confirm?.loading && setConfirm(null)}
        dismissable={!confirm?.loading}
        title={confirm?.action === 'hide' ? 'Masquer cet avis ?' : 'Réactiver cet avis ?'}
        description={
          confirm
            ? confirm.action === 'hide'
              ? "L'avis disparaîtra de la fiche publique."
              : "L'avis sera de nouveau visible sur la fiche du professionnel."
            : ''
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)} disabled={!!confirm?.loading}>
              Annuler
            </Button>
            <Button
              variant={confirm?.action === 'hide' ? 'danger' : 'primary'}
              onClick={apply}
              loading={!!confirm?.loading}
            >
              {confirm?.action === 'hide' ? 'Masquer' : 'Réactiver'}
            </Button>
          </>
        }
      />
    </div>
  );
}
