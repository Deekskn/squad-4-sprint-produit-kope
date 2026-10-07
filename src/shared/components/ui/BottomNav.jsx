import { cn } from '@/shared/lib/utils.js';

export function BottomNav({ items, active, onChange, ariaLabel }) {
  return (
    <nav
      aria-label={ariaLabel}
      className="fixed inset-x-0 bottom-0   z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur-sm lg:hidden"
    >
      <ul className="flex">
        {items.map(({ id, label, shortLabel, icon: Icon }) => (
          <li key={id} className="min-w-0 flex-1">
            <button
              type="button"
              role="tab"
              aria-selected={active === id}
              onClick={() => onChange(id)}
              className={cn(
                'flex w-full cursor-pointer flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-semibold transition',
                active === id
                  ? 'bg-primary-50 text-primary-500'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon size={20} aria-hidden />
              <span className="w-full truncate text-center">{shortLabel || label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
