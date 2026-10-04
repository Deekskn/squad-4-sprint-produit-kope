import { Badge } from '@/components/ui/Badge.jsx';
import { cn } from '@/lib/utils.js';

export function AvailabilityToggle({ isAvailable = true, onChange, loading }) {
  const on = Boolean(isAvailable);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900">Disponibilité</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Les clients voient immédiatement votre statut sur la fiche et les résultats de recherche.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={on ? 'success' : 'warning'} size="md">
          {on ? 'Disponible' : 'Indisponible'}
        </Badge>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          disabled={loading}
          onClick={() => onChange?.(!on)}
          className={cn(
            'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-ring disabled:opacity-50',
            on ? 'bg-emerald-500' : 'bg-gray-300',
          )}
        >
          <span
            aria-hidden
            className={cn(
              'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
              on ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>
    </div>
  );
}
