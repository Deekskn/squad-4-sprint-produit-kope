import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils';

const SIZES = {
  sm: 'h-9 text-[13px]',
  md: 'h-10 text-[14px]',
};

function toOption(raw) {
  return typeof raw === 'string' ? { value: raw, label: raw } : raw;
}

export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionner...',
  className,
  menuClassName,
  disabled,
  id,
  size = 'md',
  'aria-label': ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const generatedId = useId();
  const triggerId = id || generatedId;
  const selected = options.map(toOption).find((o) => String(o.value) === String(value));

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSelect = (next) => {
    onChange?.(next);
    setOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        id={triggerId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={typeof ariaLabel === 'string' ? ariaLabel : undefined}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-sm border border-gray-200 bg-white px-3 text-left text-gray-900 transition-colors hover:border-gray-300 focus-ring disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
          SIZES[size] || SIZES.md,
          open && 'border-primary-500',
        )}
      >
        <span className={cn('truncate', !selected && 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-gray-500 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby={triggerId}
          className={cn(
            'absolute left-0 top-full z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-gray-200 bg-white p-1 shadow-pop',
            menuClassName,
          )}
        >
          {options.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-gray-500">Aucune option</p>
          ) : (
            options.map((raw) => {
              const o = toOption(raw);
              const isSel = String(o.value) === String(value);
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onClick={() => handleSelect(o.value)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left text-[14px] transition-colors',
                    isSel ? 'bg-mint-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100',
                  )}
                >
                  <Check className={cn('h-4 w-4 shrink-0', isSel ? 'opacity-100' : 'opacity-0')} />
                  <span className="truncate">{o.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
