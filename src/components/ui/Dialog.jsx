import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onOpenChange?.(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed inset-0 z-90 flex items-end justify-center bg-black/50 p-0 animate-fade-in sm:items-center sm:p-2"
      onClick={() => onOpenChange?.(false)}
    >
      {children}
    </div>,
    document.body,
  );
}

export function DialogContent({ className, children, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'relative w-full rounded-t-3xl bg-white p-2 shadow-(--shadow-pop) animate-scale-in sm:rounded-3xl',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      <button
        type="button"
        aria-label="Fermer"
        className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 focus-ring"
        onClick={() => onClose?.()}
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}

export function DialogHeader({ className, children }) {
  return <div className={cn('mb-4 space-y-1.5', className)}>{children}</div>;
}

export function DialogTitle({ className, children }) {
  return (
    <h2 className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900', className)}>
      {children}
    </h2>
  );
}

export function DialogDescription({ className, children }) {
  return <p className={cn('text-sm text-gray-500', className)}>{children}</p>;
}

export function DialogFooter({ className, children }) {
  return (
    <div className={cn('mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}>
      {children}
    </div>
  );
}
