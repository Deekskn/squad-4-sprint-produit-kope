import { useCallback, useState } from 'react';

/** Remonte la fenêtre en haut de la page lors d'un changement de page de liste. */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Page courante + changeur qui remonte en haut de la page. */
export function useAdminPage(initial = 1) {
  const [page, setPage] = useState(initial);
  const changePage = useCallback((next) => {
    setPage(next);
    scrollToTop();
  }, []);

  return [page, changePage, setPage];
}
