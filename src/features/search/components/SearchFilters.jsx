import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { FormField } from '@/components/ui/FormField.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { useReferenceData } from '@/features/reference/hooks/useReferenceData.js';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { ROUTES } from '@/lib/constants.js';
import { cn } from '@/lib/utils.js';

export function SearchFilters({ initial = {}, variant = 'search', className }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { trades, zones, loading } = useReferenceData();
  const [keyword, setKeyword] = useState(initial.keyword || '');

  const trade = initial.trade ?? params.get('trade') ?? '';
  const zone  = initial.zone  ?? params.get('zone')  ?? '';
  const error = initial.error;

  const onSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const t = String(fd.get('trade') || '').trim();
    const z = String(fd.get('zone') || '').trim();
    const k = String(fd.get('q') || keyword || '').trim();
    const next = new URLSearchParams();
    if (t) next.set('trade', t);
    if (z) next.set('zone',  z);
    if (k) next.set('q',     k);
    next.set('page', '1');
    navigate(`${ROUTES.SEARCH}?${next.toString()}`);
  };

  const dense  = variant === 'sidebar';
  const home   = variant === 'home';

  if (loading) 
    return (
      <div className="space-y-3 py-2" aria-busy="true">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-40" />
      </div>
    );
  

  if (dense) 
    return (
      <form
        onSubmit={onSubmit}
        className={cn(
          'rounded-[28px] border border-mint-200 bg-mint-50/60 p-4 sm:p-5 space-y-4',
          className,
        )}
        noValidate
      >
        <div>
          <label className="mb-2 inline-flex items-center gap-2 text-xs font-bold text-gray-600">
            <Search size={14} aria-hidden /> Recherche par mot-clé
          </label>
          <Input
            name="q"
            placeholder="Nom, entreprise, mot-clé..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <FormField label="Quel métier ?" error={error?.trade} id="sf-trade-sb">
          <Select
            id="sf-trade-sb"
            name="trade"
            defaultValue={trade}
            error={error?.trade}
          >
            <option value="">Sélectionner un métier</option>
            {trades.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Quelle ville ?" id="sf-zone-sb" help="Par défaut : toute la ville">
          <Select id="sf-zone-sb" name="zone" defaultValue={zone}>
            <option value="">Toute la ville</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </Select>
        </FormField>
        <div className="pt-1">
          <Button type="submit" className="w-full!">
            Rechercher <Search size={16} aria-hidden />
          </Button>
        </div>
        </form>
    );
  

   if (home) 
    return (
      <form
        onSubmit={onSubmit}
        className={cn(
          'flex flex-col items-stretch gap-2 rounded-2xl bg-white p-2 md:flex-row md:items-center',
          className,
        )}
        noValidate
      >
        <FormField id="sf-trade-h" hideLabel className="flex-1">
          <Select
            bordered={false}
            id="sf-trade-h"
            name="trade"
            defaultValue={trade}
            error={error?.trade}
          >
            <option value="">Quel métier ?</option>
            {trades.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </FormField>
        <span className="hidden opacity-20 md:inline">|</span>
        <FormField id="sf-zone-h" hideLabel className="flex-1">
          <Select bordered={false} id="sf-zone-h" name="zone" defaultValue={zone}>
            <option value="">Quel quartier ?</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </Select>
        </FormField>
        <Button type="submit" size="lg" className="w-full! md:w-auto!">
          Rechercher <Search size={16} aria-hidden />
        </Button>
      </form>
    );
  

  return (
    <form onSubmit={onSubmit} className={cn('space-y-4', className)} noValidate>
      <FormField label="Métier" error={error?.trade} id="sf-trade-d">
        <Select id="sf-trade-d" name="trade" defaultValue={trade} error={error?.trade}>
          <option value="">Choisissez un métier</option>
          {trades.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
      </FormField>
      <FormField label="Zone (facultatif)" help="Par défaut : toute la ville" id="sf-zone-d">
        <Select id="sf-zone-d" name="zone" defaultValue={zone}>
          <option value="">Toute la ville</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>{z.name}</option>
          ))}
        </Select>
      </FormField>
      <Button type="submit" size="lg">Rechercher</Button>
    </form>
  );
}
