import { useState } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal } from 'lucide-react';
import { Button, Sheet } from '@/shared/components/ui';

export function AdminFilterPanel({ title = 'Filtres', dirty = false, onReset, children }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-2">
      <div className="flex items-center justify-between px-2 py-2">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={onReset}
          disabled={!dirty}
          className="text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          Réinitialiser
        </button>
      </div>
      {children}
    </div>
  );
}

export function AdminFilterGroup({ title, children }) {
  return (
    <div className="space-y-2 px-2 py-3">
      {title && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">{title}</p>
      )}
      {children}
    </div>
  );
}

export function AdminFilterField({ label, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-gray-600">{label}</label>}
      {children}
    </div>
  );
}

export function AdminSectionLayout({
  rightContainer = null,
  total = 0,
  noun,
  dirty = false,
  filters,
  searchId = 'admin-search',
  children,
}) {
  const [open, setOpen] = useState(false);
  const panel = filters(searchId);

  return (
    <div className="space-y-4">
      <div className="-mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {total} {noun}
          {total > 1 ? 's' : ''}
        </p>
        <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setOpen(true)}>
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {dirty && <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />}
        </Button>
      </div>

      {rightContainer ? (
        <>
          <div className="min-w-0">{children}</div>
          {createPortal(panel, rightContainer)}
        </>
      ) : (
        <div className="lg:flex lg:items-start lg:gap-6">
          <div className="min-w-0 flex-1">{children}</div>
          <aside className="hidden lg:block lg:w-72 lg:shrink-0 lg:sticky lg:top-23">{panel}</aside>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen} side="right">
        <div className="w-full overflow-y-auto p-4 pt-16">
          {filters(`${searchId}-mobile`)}
        </div>
      </Sheet>
    </div>
  );
}
