import { Spinner } from './Spinner.jsx';

export function DataState({ loading, error, errorPrefix = 'Erreur de chargement', children }) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {errorPrefix} : {error.message || 'réessayez'}
      </div>
    );
  }
  return children;
}
