import { Handshake, Search, User, Phone } from 'lucide-react';
import { SearchFilters } from '@/features/search/components/SearchFilters.jsx';
import { FloatingCaption } from '@/components/ui/FloatingCaption.jsx';
import hero from '@/assets/hero.png';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-kop-mint space-y-8 py-16">
      <div className="container-kop relative z-10  grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <p className='text-primary-500 font-semibold'><Handshake size={16} aria-hidden className="inline" /> LES SAVOIR-FAIRE DU CONGO </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
            Le bon artisan.
            Tout près de vous.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
            Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les
            professionnels de votre quartier et échangez directement avec eux.
          </p>
          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2 border border-gray-400  font-medium px-3 py-1.5 rounded-full"><User size={16} aria-hidden />Des profils à découvrir</li>
            <li className="flex items-center gap-2 border border-gray-400 font-medium px-3 py-1.5 rounded-full"><Phone size={16} aria-hidden />Un contact direct</li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-130">
          <div className="rounded-[16px] overflow-hidden  ">
            <img
              src={hero}
              alt="Artisanne KOP"
              className="w-full h-85 sm:h-100 object-cover bg-accent-500/30"
            />
            <FloatingCaption
              align="right"
              title="Les mains qui font votre quartier"
              subtitle="Des professionnels, près de chez vous."
            />
          </div>

        </div>
      </div>

      {/* 2. SEARCH WIDGET */}
      <aside className="container-kop   relative -space-y-px">
        <p className="hidden md:inline-flex bg-[#F5F6F6] rounded-t-sm border border-[#B9C2BE] px-4 py-2 items-center gap-2 text-xs font-semibold text-gray-600">
          <span className="inline-flex items-center gap-2"><Search size={14} aria-hidden /> Recherche par mot-clé</span>
        </p>
        <div className="bg-white rounded-tl-[16px] md:rounded-tl-none rounded-r-[16px] rounded-bl-[16px] border border-[#B9C2BE] p-3 sm:p-5">

          <SearchFilters variant="home" />

        </div>
      </aside>
      <p className="container-kop -mt-4  text-[11px] text-gray-500">
        Une recherche simple : un métier, un quartier, puis une rencontre.
      </p>
    </section>
  )
}
