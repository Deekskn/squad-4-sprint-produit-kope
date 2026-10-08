import { Handshake, Search, User, Phone } from 'lucide-react';
import { SearchFilters } from '@/features/search/components/SearchFilters.jsx';
import { FloatingCaption } from '@/components/ui/FloatingCaption.jsx';
import hero from '@/assets/hero.png';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#dfe7e3] py-6 md:py-10">
      <div className="container-kop relative z-10 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div className="space-y-6 py-4 lg:py-8">
          <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.12em] text-primary-500 uppercase">
            <Handshake size={16} aria-hidden className="inline" />
            Les savoir-faire du Congo
          </p>

          <h1 className="max-w-[520px] text-4xl font-extrabold tracking-[-0.06em] text-gray-900 sm:text-5xl lg:text-[58px] lg:leading-[0.98]">
            Le bon artisan.
            <br />
            Tout près de vous.
          </h1>

          <p className="max-w-xl text-base leading-7 text-gray-700 sm:text-lg">
            Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les
            professionnels de votre quartier et échangez directement avec eux.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[#1f473d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173a32]"
            >
              <Search size={16} aria-hidden />
              Je prends rendez-vous
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-white/60 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-white"
            >
              <Phone size={16} aria-hidden />
              Un contact direct
            </button>
          </div>

          <ul className="flex flex-wrap items-center gap-3 pt-2 text-sm text-gray-700">
            <li className="flex items-center gap-2 rounded-full border border-gray-500/70 bg-white/40 px-3 py-1.5 font-medium">
              <User size={16} aria-hidden />
              Des profils à découvrir
            </li>
            <li className="flex items-center gap-2 rounded-full border border-gray-500/70 bg-white/40 px-3 py-1.5 font-medium">
              <Phone size={16} aria-hidden />
              Un contact direct
            </li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[540px] lg:justify-self-end">
          <div className="overflow-hidden rounded-[18px] border border-white/40 bg-white/20 shadow-[0_16px_36px_-20px_rgba(16,42,32,0.55)]">
            <img
              src={hero}
              alt="Artisanne KOP"
              className="h-[360px] w-full object-cover sm:h-[420px] lg:h-[440px]"
            />
            <FloatingCaption
              align="right"
              title="Les mains qui font votre quartier"
              subtitle="Des professionnels, près de chez vous."
            />
          </div>
        </div>
      </div>

      <aside className="container-kop relative z-10 mt-6 lg:mt-8">
        <div className="rounded-[20px] border border-[#c9d2ce] bg-white/80 p-3 shadow-[0_18px_30px_-28px_rgba(24,52,42,0.5)] backdrop-blur-sm sm:p-4">
          <SearchFilters variant="home" className="" />
        </div>
      </aside>

      <p className="container-kop mt-3 text-[11px] text-gray-500">
        Une recherche simple : un métier, un quartier, puis une rencontre.
      </p>
    </section>
  );
}
