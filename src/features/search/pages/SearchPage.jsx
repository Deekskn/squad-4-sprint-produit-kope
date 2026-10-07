import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Badge } from '@/shared/components/ui/Badge.jsx';
import { Modal } from '@/shared/components/ui/Modal.jsx';
import { Select } from '@/shared/components/ui/Select.jsx';
import { SearchFilters } from '../components/SearchFilters.jsx';
import { SearchResults } from '../components/SearchResults.jsx';
import { useSearch } from '../hooks/useSearch.js';
import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { useReferenceData } from '@/features/reference/hooks/useReferenceData.js';

const SORTS = [
  { value: 'recommended', label: 'Tri recommandé' },
  { value: 'rating',      label: 'Mieux notés' },
  { value: 'experience',  label: "Plus d'expérience" },
];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const { trades, zones } = useReferenceData();
  const { trade, zone, page, q } = Object.fromEntries(params.entries());
  const { results, loading, error } = useSearch({ trade, zone, q, page });
  const [sort, setSort] = useState(params.get('sort') || 'recommended');
  const [searchOpen, setSearchOpen] = useState(false);

  const summary = useMemo(() => {
    const parts = [];
    if (trade) {
      const tObj = trades.find((t) => String(t.id) === String(trade));
      if (tObj) parts.push(tObj.name);
    }
    if (zone) {
      const zObj = zones.find((z) => String(z.id) === String(zone));
      if (zObj) parts.push(zObj.name);
    }
    if (q) parts.push(`« ${q} »`);
    return parts.join(' · ');
  }, [trade, zone, q, trades, zones]);

  const onChangeSort = (val) => {
    setSort(val);
    const next = new URLSearchParams(params);
    if (val && val !== 'recommended') next.set('sort', val); else next.delete('sort');
    next.set('page', '1');
    setParams(next);
  };

  return (
    <div className="container-kop page-padding">
      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start">
        <aside className="hidden space-y-4 lg:sticky lg:top-[92px] lg:block">
          <SearchFilters variant="sidebar" initial={{ trade, zone, keyword: q }} />
        </aside>

        <section className="space-y-5 min-w-0">
          <Button
            type="button"
            className="h-14 w-full justify-between gap-4 rounded-2xl bg-primary-700 px-4 text-left text-white shadow-soft hover:bg-primary-800 lg:hidden"
            onClick={() => setSearchOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
          >
            <span className="flex min-w-0 items-center gap-3">
              <Search size={18} aria-hidden />
              <span className="truncate font-semibold">Modifier ma recherche</span>
            </span>
            <ArrowRight size={18} aria-hidden className="shrink-0" />
          </Button>
          <Modal
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            title={
              <span className="flex items-center justify-between gap-3">
                <span>Rechercher un professionnel</span>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Fermer la recherche"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  <X size={16} aria-hidden />
                </button>
              </span>
            }
            size="full"
          >
            <div onSubmitCapture={() => setSearchOpen(false)}>
              <SearchFilters variant="sidebar" initial={{ trade, zone, keyword: q }} bare />
            </div>
          </Modal>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Résultats
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-[28px]">
                <span className="text-primary-700">{results?.total ?? 0}</span> professionnel{(results?.total ?? 0) > 1 ? 's' : ''} trouvés
                {summary && (
                  <span className="block text-base font-semibold text-gray-500 mt-0.5">
                    {summary}
                  </span>
                )}
              </h1>
            </div>
            <div className="w-full sm:w-auto">
              <label className="mb-1 block text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Tri</label>
              <Select
                value={sort}
                onChange={(e) => onChangeSort(e.target.value)}
                className="!py-2.5"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </div>
          </div>

          {loading && (
            <div className="space-y-4" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-4 rounded-[28px] border border-gray-100 bg-white p-5">
                  <Skeleton className="h-28 w-32 shrink-0 rounded-2xl" />
                  <div className="flex-1 space-y-3 py-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && !loading && (
            <div role="alert" className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
              {error.message || 'Erreur de chargement des résultats.'}
              <div className="mt-3">
                <Button variant="outline" as={Link} to={ROUTES.SEARCH}>Réessayer</Button>
              </div>
            </div>
          )}
          {!loading && !error && results && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {(results?.total ?? 0) > 0 && (
                <Badge variant="white">
                  Page {results?.page || 1} sur {Math.max(1, Math.ceil((results.total||0) / (results.pageSize||10)))}
                </Badge>
              )}
            </div>
          )}
          {!loading && !error && (
            <SearchResults data={results} listMode />
          )}
        </section>
      </div>
    </div>
  );
}
