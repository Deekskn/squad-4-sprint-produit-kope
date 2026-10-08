import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils';

export function Sheet({ open, onOpenChange, children }) {
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

  if (!render || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-90 bg-checkers backdrop-blur-sm transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0',
      )}
      onClick={() => onOpenChange?.(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300',
          show ? 'translate-x-0' : 'translate-x-full',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Fermer"
          className="absolute cursor-pointer right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 focus-ring"
          onClick={() => onOpenChange?.(false)}
        >
          <X size={16} aria-hidden />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
