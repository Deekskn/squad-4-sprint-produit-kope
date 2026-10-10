import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils';

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
  const [render, setRender] = useState(open);
  const [show, setShow] = useState(open);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRender(true);
      requestAnimationFrame(() => setShow(true));
    } else {
      setShow(false);
      const timer = setTimeout(() => setRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

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

  if (!render || typeof document === 'undefined') return null;
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-5xl',
  }[size] || 'max-w-md';

  // Moins de 4 sections (titre, description, contenu, actions) : réduire le rayon des coins.
  const sections = [title, description, children, actions].filter(Boolean).length;
  const radiusTop = sections < 4 ? 'rounded-t-xl' : 'rounded-t-2xl';
  const radiusMain = sections < 4 ? 'sm:rounded-xl' : 'sm:rounded-2xl';

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[90] flex items-end justify-center bg-checkers p-0 sm:items-center sm:p-4 transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0',
      )}
      onClick={() => dismissable && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'kop-modal-title' : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full max-h-[90vh] overflow-y-auto bg-white shadow-[var(--shadow-pop)] transition-opacity duration-300',
          radiusTop,
          radiusMain,
          show ? 'opacity-100' : 'opacity-0',
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
        {children && <div className="px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">{children}</div>}
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
