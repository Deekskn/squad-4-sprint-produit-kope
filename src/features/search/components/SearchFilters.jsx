import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { Select } from '@/shared/components/ui/Select.jsx';
import { Input } from '@/shared/components/ui/Input.jsx';
import { useReferenceData } from '@/features/reference/hooks/useReferenceData.js';
import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { cn } from '@/shared/utils';

export function SearchFilters({ initial = {}, variant = "search", className, bare = false }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { trades, zones, loading } = useReferenceData();
  const [keyword, setKeyword] = useState(initial.keyword || "");

  const trade = initial.trade ?? params.get("trade") ?? "";
  const zone = initial.zone ?? params.get("zone") ?? "";
  const error = initial.error;

  const onSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const t = String(fd.get("trade") || "").trim();
    const z = String(fd.get("zone") || "").trim();
    const k = String(fd.get("q") || keyword || "").trim();
    const next = new URLSearchParams();
    if (t) next.set("trade", t);
    if (z) next.set("zone", z);
    if (k) next.set("q", k);
    next.set("page", "1");
    navigate(`${ROUTES.SEARCH}?${next.toString()}`);
  };

  const dense = variant === "sidebar";
  const home = variant === "home";
  const suffix = home ? "hm" : "sb";

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
          'rounded-[22px] border border-[#dfe5e2] bg-white p-4 shadow-[0_10px_24px_-18px_rgba(16,42,32,0.4)] sm:p-5',
          className,
        )}
        noValidate
      >
        <div className="relative">
          <Search size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            name="q"
            placeholder="Recherche par mot-clé"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="h-[46px] rounded-[12px] border-[#dde4e1] bg-white pl-10 text-[15px] text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div className="mt-4 space-y-3">
          <Select
            id="sf-trade-sb"
            name="trade"
            defaultValue={trade}
            error={error?.trade}
            className="h-[48px] rounded-[12px] border-[#dde4e1] bg-white text-[15px] text-gray-900"
          >
            <option value="">Plombier</option>
            {trades.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>

          <Select
            id="sf-zone-sb"
            name="zone"
            defaultValue={zone}
            className="h-[48px] rounded-[12px] border-[#dde4e1] bg-white text-[15px] text-gray-900"
          >
            <option value="">Brazaville</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="pt-4">
          <Button type="submit" className="h-[48px] w-full rounded-[12px] bg-[#214d3d] text-base font-bold hover:bg-[#1a3d33]">
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
          'flex flex-col items-stretch gap-2.5',
          className,
        )}
        noValidate
      >
        <div className="relative">
          <Search size={16} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            name="q"
            id="sf-keyword-h"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Recherche par mot-clé"
            className="h-[52px] rounded-[14px] border border-[#dfe5e2] bg-white pl-11 text-base text-gray-900 placeholder:text-gray-500 shadow-sm"
          />
        </div>

        <div className="grid gap-2.5 md:grid-cols-[1fr_1fr_auto] md:items-center">
          <div className="relative">
            <Select
              id="sf-trade-h"
              name="trade"
              defaultValue={trade}
              error={error?.trade}
              className="h-[52px] rounded-[14px] border border-[#dfe5e2] bg-white text-base text-gray-900 shadow-sm"
            >
              <option value="">Quel métier ?</option>
              {trades.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </div>

          <div className="relative">
            <Select
              id="sf-zone-h"
              name="zone"
              defaultValue={zone}
              className="h-[52px] rounded-[14px] border border-[#dfe5e2] bg-white text-base text-gray-900 shadow-sm"
            >
              <option value="">Quel quartier ?</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </Select>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-[52px] rounded-[14px] bg-[#214d3d] px-6 text-base font-bold text-white hover:bg-[#1a3d33]"
          >
            Rechercher <Search size={16} aria-hidden />
          </Button>
        </div>
      </form>
    );
  

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)} noValidate>
      <FormField label="Métier" error={error?.trade} id="sf-trade-d">
        <Select
          id="sf-trade-d"
          name="trade"
          defaultValue={trade}
          error={error?.trade}
        >
          <option value="">Choisissez un métier</option>
          {trades.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField
        label="Zone (facultatif)"
        help="Par défaut : toute la ville"
        id="sf-zone-d"
      >
        <Select id="sf-zone-d" name="zone" defaultValue={zone}>
          <option value="">Toute la ville</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </Select>
      </FormField>
      <Button type="submit" size="lg">
        Rechercher
      </Button>
    </form>
  );
}
