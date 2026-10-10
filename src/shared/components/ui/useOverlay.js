import { useEffect, useRef, useState } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Comportement commun aux surfaces superposées (Modal, Dialog, Sheet) :
 * animation d'ouverture/fermeture, touche Échap, blocage du scroll,
 * piégeage du focus et restitution du focus à l'élément déclencheur.
 */
export function useOverlay({ open, onClose, dismissable = true, duration = 300 }) {
  const [render, setRender] = useState(open);
  const [show, setShow] = useState(open);
  const panelRef = useRef(null);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRender(true);
      const frame = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(frame);
    }
    setShow(false);
    const timer = setTimeout(() => setRender(false), duration);
    return () => clearTimeout(timer);
  }, [open, duration]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && dismissable) {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== 'Tab') return;

      // Piégeage : la tabulation ne doit jamais sortir de la surface ouverte.
      const panel = panelRef.current;
      if (!panel) return;
      const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    // Focus initial sur le premier élément interactif de la surface.
    requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector(FOCUSABLE);
      target?.focus();
    });

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, dismissable, onClose]);

  return { render, show, panelRef };
}
