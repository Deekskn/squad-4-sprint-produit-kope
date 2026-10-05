import { cn } from '@/lib/utils.js';

/**
 * Navigation de sidebar partagée (client / pro / admin).
 * Les onglets ont le même style de bordure que les inputs.
 */
export function SidebarNav({ items, active, onChange, ariaLabel }) {
  return (
    <nav aria-label={ariaLabel} className="rounded-2xl border border-gray-200 bg-white p-2 space-y-1">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          onClick={() => onChange(id)}
          className={cn(
            'flex w-full cursor-pointer items-center gap-3 rounded-sm border px-4 py-3 text-left text-sm font-semibold transition',
            active === id
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          )}
        >
          <Icon size={18} aria-hidden />
          {label}
        </button>
      ))}
    </nav>
  );
}
