import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/utils.js';

export function Modal({
  open,
  onClose,
  title,
  description,
  actions,
  children,
  size = 'md',
  dismissable = true,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissable) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, dismissable, onClose]);

  if (!open || typeof document === 'undefined') return null;
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-5xl',
  }[size] || 'max-w-md';

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-checkers p-0 animate-fade-in sm:items-center sm:p-4"
      onClick={() => dismissable && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'kop-modal-title' : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white shadow-[var(--shadow-pop)] animate-scale-in sm:rounded-2xl',
          widths,
        )}
      >
        {(title || description) && (
          <div className="border-b border-gray-100 px-5 py-4">
            {title && (
              <h2 id="kop-modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
        )}
        {children && <div className="px-5 py-4">{children}</div>}
        {actions && (
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-3 sm:flex-row sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
