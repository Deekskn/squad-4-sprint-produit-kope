import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button.jsx';
import { cn } from '@/shared/utils';

export function Pagination({ page, pageSize, total, onPageChange, className }) {
  const pageCount = Math.max(1, Math.ceil((total ?? 0) / pageSize));
  const current = Math.max(1, Math.min(page || 1, pageCount));
  const prevDisabled = current <= 1;
  const nextDisabled = current >= pageCount;
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-sm', className)}
    >
      <p className="text-sm text-gray-600">
        Page <span className="font-semibold text-gray-900">{current}</span> /{' '}
        <span className="font-semibold text-gray-900">{pageCount}</span>
        {typeof total === 'number' && (
          <> · <span className="text-gray-500">{total} résultat{total > 1 ? 's' : ''}</span></>
        )}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={prevDisabled}
          onClick={() => onPageChange?.(current - 1)}
        >
          <span className="inline-flex items-center gap-1"><ChevronLeft size={16} aria-hidden /> Précédent</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={nextDisabled}
          onClick={() => onPageChange?.(current + 1)}
        >
          <span className="inline-flex items-center gap-1">Suivant <ChevronRight size={16} aria-hidden /></span>
        </Button>
      </div>
    </nav>
  );
}
