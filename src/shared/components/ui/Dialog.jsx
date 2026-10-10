import { isValidElement, cloneElement } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useOverlay } from './useOverlay.js';

export function Dialog({ open, onOpenChange, children }) {
  const { render, show, panelRef } = useOverlay({ open, onClose: () => onOpenChange?.(false) });

  if (!render || typeof document === 'undefined') return null;

  let body = children;
  if (isValidElement(children))
    body = cloneElement(children, {
      ref: panelRef,
      className: cn(
        children.props.className,
        'transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0',
      ),
    });

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-90 flex items-end justify-center bg-checkers backdrop-blur p-0 sm:items-center sm:p-2 transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0',
      )}
      onClick={() => onOpenChange?.(false)}
    >
      {body}
    </div>,
    document.body,
  );
}

export function DialogContent({ className, children, onClose, ref: forwardedRef }) {
  return (
    <div
      ref={forwardedRef}
      role="dialog"
      aria-modal="true"
      className={cn(
        'relative w-full rounded-t-3xl bg-white p-2 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-(--shadow-pop) animate-scale-in sm:rounded-3xl',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      <button
        type="button"
        aria-label="Fermer"
        className="absolute cursor-pointer right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 focus-ring"
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
