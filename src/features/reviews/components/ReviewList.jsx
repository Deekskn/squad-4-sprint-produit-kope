import { useCallback, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { listReviews } from '../services/reviews.service.js';
import { Pagination } from '@/components/ui/Pagination.jsx';
import { StarRating } from '@/components/ui/StarRating.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { formatDateFr, fullNameInitials } from '@/lib/utils.js';

const PAGE_SIZE = 10;
const COMPACT_COUNT = 3;

function Author({ review }) {
  const first = review.client?.firstName;
  const last = review.client?.lastName;
  const name = review.client?.displayName || fullNameInitials(first, last) || 'Client';
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-100 text-xs font-bold text-primary-700 ring-1 ring-mint-200">
        {fullNameInitials(first, last).slice(0, 2) || '??'}
      </span>
      <p className="text-sm font-bold text-gray-900 leading-5">{name}</p>
    </div>
  );
}

export function ReviewList({ professionalId, compact }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const size = compact ? COMPACT_COUNT : PAGE_SIZE;
      const res = await listReviews(professionalId, { page: compact ? 1 : page, pageSize: size });
      setData(res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [professionalId, page, compact]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (loading)
    return (
      <div className="space-y-3 py-4" aria-busy="true">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );

  if (error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">Impossible de charger les avis.</div>;

  const total = Number(data?.total ?? 0);
  const items = data?.items ?? [];

  if (items.length === 0)
    return (
      <div className="rounded-[20px] border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Aucun avis pour le moment.
      </div>
    );


  if (compact)
    return (
      <div className="space-y-0">
        <div className="divide-y divide-gray-100">
          {items.map((r) => (
            <article key={r.id} className="py-4 first:pt-2 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Author review={r} />
                <div className="flex items-center gap-2 text-xs">
                  <StarRating value={r.rating} size="sm" />
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500">{formatDateFr(r.createdAt)}</span>
                </div>
              </div>
              {r.comment && (
                <p className="mt-2 text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                  {r.comment}
                </p>
              )}
            </article>
          ))}
        </div>
        {total > COMPACT_COUNT && (
          <div className="mt-3">
            <Button variant="ghost" size="sm" className="!text-primary-700 !font-bold !pl-0">
              Voir les {total} avis <ChevronRight size={14} className="inline" aria-hidden />
            </Button>
          </div>
        )}
      </div>
    );


  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.id} className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Author review={r} />
              <div className="flex items-center gap-2">
                <StarRating value={r.rating} size="sm" />
                <span className="text-xs text-gray-500">{formatDateFr(r.createdAt)}</span>
              </div>
            </div>
            {r.comment && (
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-gray-700">
                {r.comment}
              </p>
            )}
          </li>
        ))}
      </ul>
      {total > PAGE_SIZE && (
        <Pagination
          page={Number(data?.page || page)}
          pageSize={Number(data?.pageSize || PAGE_SIZE)}
          total={total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
