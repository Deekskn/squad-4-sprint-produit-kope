import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Select } from '@/shared/components/ui/Select.jsx';
import { SearchFilters } from '../components/SearchFilters.jsx';
import { Sheet } from '@/shared/components/ui/Sheet.jsx';
import { Search } from 'lucide-react';
import { SearchResults } from '../components/SearchResults.jsx';
import { useSearch } from '../hooks/useSearch.js';
import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';
import { ROUTES } from '@/shared/lib/constants.js';

const SORTS = [
  { value: 'recommended', label: 'Tri recommandé' },
  { value: 'rating', label: 'Mieux notés' },
  { value: 'experience', label: "Plus d'expérience" },
];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const { trade, zone, page, q } = Object.fromEntries(params.entries());
  const [sort, setSort] = useState(params.get('sort') || 'recommended');
  const { results, loading, error } = useSearch({ trade, zone, q, page, sort });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const onChangeSort = (val) => {
    setSort(val);
    const next = new URLSearchParams(params);
    if (val && val !== 'recommended') next.set('sort', val); else next.delete('sort');
    next.set('page', '1');
    setParams(next);
  };

  return (
    <div>
      <div className="container-kop page-padding">
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:block lg:sticky lg:top-23 space-y-4">
            <SearchFilters variant="sidebar" initial={{ trade, zone, keyword: q }} />
          </aside>

          <section className="min-w-0 space-y-5">
            {results?.total > 0 && (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div >
                  <p className="text-md font-semibold uppercase tracking-[0.12em] ">
                    {results?.total ?? 0} Résultats
                  </p>
                  <p className='text-xs'>Disponibles d'abord, puis note et date de mise à jour décroissantes.</p>

                </div>
                <div className="w-full sm:w-auto">
                  <Select
                    value={sort}
                    onChange={(e) => onChangeSort(e.target.value)}
                    className="h-10.5! rounded-[10px]! border-[#dde4e1] bg-white text-[14px]"
                  >
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>
                </div>
              </div>
            )

            }

            {loading && (
              <div className="space-y-4" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-4 rounded-[20px] border border-gray-100 bg-white p-4">
                    <Skeleton className="h-24 w-28 shrink-0 rounded-[16px]" />
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
              <div role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
                {error.message || 'Erreur de chargement des résultats.'}
                <div className="mt-3">
                  <Button variant="outline" as={Link} to={ROUTES.SEARCH}>Réessayer</Button>
                </div>
              </div>
            )}
            {!loading && !error && (
              <SearchResults data={results} listMode />
            )}
          </section>
        </div>

        <Button
          type="button"
          aria-label="Rechercher"
          onClick={() => setFiltersOpen(true)}
          className="fixed! bottom-4 left-1/2 z-40 -translate-x-1/2 h-14 w-[90%] lg:hidden"
        >
          <Search size={18} aria-hidden /> Rechercher
        </Button>

        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen} side="bottom">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Filtres de recherche</h2>
            <div onSubmit={() => setFiltersOpen(false)}>
              <SearchFilters variant="home-k" initial={{ trade, zone, keyword: q }} />
            </div>
          </div>
        </Sheet>
      </div>
    </div>
  );
}
