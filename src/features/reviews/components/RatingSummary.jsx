import { StarRating } from '@/components/ui/StarRating.jsx';
import { Badge } from '@/components/ui/Badge.jsx';

export function RatingSummary({ rating }) {
  const count = Number(rating?.count ?? 0);
  const avg = Number(rating?.average ?? 0);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-lg font-bold text-gray-900">Note moyenne</h2>
      {count > 0 ? (
        <div className="flex items-center gap-4">
          <div className="text-4xl font-extrabold text-gray-900">{avg.toFixed(1)}</div>
          <div className="space-y-1">
            <StarRating value={avg} size="md" />
            <p className="text-sm text-gray-500">
              Basé sur <span className="font-semibold text-gray-700">{count}</span> avis client{count > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
          <Badge variant="neutral">Pas encore d'avis</Badge>
          <span>Soyez le premier à donner votre avis sur ce professionnel.</span>
        </div>
      )}
    </div>
  );
}
