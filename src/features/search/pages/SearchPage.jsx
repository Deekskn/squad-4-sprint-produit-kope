import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { SearchFilters } from '../components/SearchFilters.jsx';
import { SearchResults } from '../components/SearchResults.jsx';
import { useSearch } from '../hooks/useSearch.js';
import { Spinner } from '@/components/ui/Spinner.jsx';
import { ROUTES } from '@/lib/constants.js';
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
  const { results, loading, error } = useSearch({ trade, zone, page });
  const [sort, setSort] = useState(params.get('sort') || 'recommended');

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
        {/* LEFT COLUMN - sidebar filters */}
        <aside className="lg:sticky lg:top-[92px] space-y-4">
          <SearchFilters variant="sidebar" initial={{ trade, zone, keyword: q }} />
        </aside>

        {/* RIGHT COLUMN - results */}
        <section className="space-y-5 min-w-0">
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
            <div className="flex items-center justify-center py-20 bg-white rounded-[28px] border border-gray-100">
              <Spinner size="lg" />
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
