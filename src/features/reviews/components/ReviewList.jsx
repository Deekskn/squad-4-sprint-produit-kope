import { useCallback, useEffect, useState } from 'react';
import { Pagination } from '@/shared/components/ui/Pagination.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';
import { StarRating } from '@/shared/components/ui/StarRating.jsx';
import { PAGE_SIZE } from '@/shared/lib/constants.js';
import { formatDateFr } from '@/shared/utils';
import { listReviews } from '../services/reviews.service.js';
import { ReviewAuthor } from './ReviewAuthor.jsx';

/** Liste paginée d'avis (utilisée dans la modale « Avis »). */
export function ReviewList({ professionalId }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listReviews(professionalId, { page, pageSize: PAGE_SIZE }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [professionalId, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (loading)
    return (
      <div className="space-y-3 py-4" aria-busy="true">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );

  if (error)
    return (
      <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
        Impossible de charger les avis.
      </div>
    );

  const total = Number(data?.total ?? 0);
  const items = data?.items ?? [];

  if (items.length === 0)
    return (
      <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Aucun avis pour le moment.
      </div>
    );

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.id}>
            <Card className="space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ReviewAuthor review={r} />
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} size="sm" />
                  <span className="text-xs text-gray-500">{formatDateFr(r.createdAt)}</span>
                </div>
              </div>
              {r.comment && (
                <p className="line-clamp-4 whitespace-pre-wrap text-[15px] leading-7 text-gray-700">{r.comment}</p>
              )}
            </Card>
          </li>
        ))}
      </ul>
      {total > PAGE_SIZE && (
        <Pagination page={Number(data?.page || page)} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      )}
    </div>
  );
}
