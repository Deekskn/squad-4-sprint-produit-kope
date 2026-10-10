import { Skeleton } from './Skeleton.jsx';
import { Button } from './Button.jsx';

export function DataState({ loading, error, errorPrefix = 'Erreur de chargement', onRetry, children }) {
  if (loading)
    return (
      <div className="space-y-3 py-4" aria-busy="true">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-2/3" />
      </div>
    );

  if (error)
    return (
      <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        <p>
          {errorPrefix} : {error.message || 'réessayez'}
        </p>
        {onRetry && (
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={onRetry}>
              Réessayer
            </Button>
          </div>
        )}
      </div>
    );

  return children;
}
