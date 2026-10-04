import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { SearchFilters } from '@/features/search/components/SearchFilters.jsx';
import { ProfessionalCard } from '@/features/professionals/components/ProfessionalCard.jsx';
import { useReferenceData } from '@/features/reference/hooks/useReferenceData.js';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { ROUTES } from '@/lib/constants.js';
import {  Handshake, Search, Star,  User, Phone, ArrowRight, Shield, ArrowUpRight, Plus } from 'lucide-react';
import { CATEGORIES, FEATURED, STEPS, FAQ } from '@/mocks/homeData.js';
import { mockImage, PRO_CTA_IMAGE_PROMPT, HERO_IMAGE_PROMPT } from '@/mocks/images.js';
import { cn } from '@/lib/utils.js';
import hero from '@/assets/hero.png';


function HeroSection() {
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
            <div className="absolute right-2 bottom-2  bg-white/92 rounded-sm px-4 py-3  backdrop-blur-sm">
              <p className="text-[12px] font-semibold text-gray-900 leading-tight">Les mains qui font votre quartier</p>
              <p className="text-[11px] text-gray-500">Des professionnels, près de chez vous.</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. SEARCH WIDGET */}
      <aside className="container-kop   relative -space-y-px">
        <p className="bg-[#F5F6F6] rounded-t-sm border border-[#B9C2BE]  px-4 py-2 inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
          <span className="inline-flex items-center gap-2"><Search size={14} aria-hidden /> Recherche par mot-clé</span>
        </p>
        <div className="bg-white rounded-r-[16px] rounded-bl-[16px] border border-[#B9C2BE] p-3 sm:p-5">

          <SearchFilters variant="home" />

        </div>
      </aside>
      <p className="container-kop -mt-4  text-[11px] text-gray-500">
        Une recherche simple : un métier, un quartier, puis une rencontre.
      </p>
    </section>
  )
}

function CategorySection() {
  return (
    <section className="container-kop py-16">
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pour vos petits et vos grands projets</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            De quoi avez-vous besoin ?
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-gray-600">
            Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les
            professionnels de votre quartier et échangez directement avec eux.
          </p>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link key={c.id} to={`${ROUTES.SEARCH}?trade=${encodeURIComponent(c.name)}`} className="group">
            <Card className="overflow-hidden h-full flex flex-col transition ">
              <div className="relative aspect-4/5.5 overflow-hidden">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute right-2 left-2 bottom-2 rounded-sm bg-white/92 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center "><c.icon size={24} strokeWidth={1.5} aria-hidden /></span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{c.name}</p>
                    <p className="text-[11px] text-gray-500">{c.sub}</p>
                  </div>
                </div>
              </div>

            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

function FeaturedProfessionalSection() {

  return (
    <section className="bg-[#CDD0D8] py-16">
      <div className=" container-kop mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Faites connaissance</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Des visages derrière chaque métier.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-gray-600">
            Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les
            professionnels de votre quartier et échangez directement avec eux.
          </p>
        </div>
        <Button as={Link} to={ROUTES.SEARCH} variant="outline" size="md" className="bg-transparent! border-gray-400!">
          Explorer les professionnels <ArrowRight size={16} aria-hidden className="inline" />
        </Button>
      </div>
      <div className=" container-kop grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED.map((f) => (
          <div key={f.id} className="flex h-full flex-col">
            <ProfessionalCard mode="grid" item={f} featuredPrompt={f.prompt} image={f.image}/>
          </div>
        ))}
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section className="container-kop py-16">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Simple, du début à la rencontre</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Votre projet commence ici.
        </h2>
        <p className="mt-2 text-sm leading-7 text-gray-600">
          Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les
          professionnels de votre quartier et échangez directement avec eux.
        </p>
      </div>
      <div className="md:flex gap-3 items-center">
        {STEPS.map((s, index) => (
          <>
            <Card key={s.n} className={`${s.tone} flex-1 aspect-4/4.5 bg-primary-600! p-2 border-0! shadow-none! flex flex-col justify-between`}>
              <div className='px-4'>
                <h3 className="mt-5 text-xl font-medium text-gray-200!">{s.title}</h3>
                <p className="mt-2 text-sm leading-12 text-gray-300">{s.body}</p>
              </div>
              <div className={cn('h-45.5 rounded-sm flex items-center justify-center', s.tone)}>
                <span className="text-9xl font-extrabold text-gray-900/70 tracking-tight">{s.n}</span>
              </div>
            </Card>
            <ul className={`space-1 flex opacity-25  ${index === (STEPS.length - 1) ? 'hidden' : ''}`}  >
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="border-l  w-1 h-88 " ></li>
              ))}
            </ul>
          </>
        ))}
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section className=" py-16 bg-kop-mint ">
      <aside className="container-kop grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative rounded-[16px] overflow-hidden  ">
          <img
            src={mockImage(HERO_IMAGE_PROMPT)}
            alt="Artisanne KOP"
            className="w-full h-85 sm:h-100 object-cover bg-accent-500/30"
          />
          <div className="absolute left-2 bottom-2  bg-white/92 rounded-sm px-4 py-3  backdrop-blur-sm">
            <p className="text-[12px] font-semibold text-gray-900 leading-tight">Les mains qui font votre quartier</p>
            <p className="text-[11px] text-gray-500">Des professionnels, près de chez vous.</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Un service à taille humaine</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            La confiance se construit en échangeant.
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            À portée facilite la première rencontre. Vous restez libre de discuter de votre
            besoin et de vos conditions directement avec le professionnel.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-gray-700">
            {[
              [<User key="i" size={24} aria-hidden strokeWidth={1.5} />, 'Des profils détaillés', 'Le métier, des zones d\'intervention et des réalisations.'],
              [<Star key="i" size={24} aria-hidden strokeWidth={1.5} />, 'Des avis vérifiés', 'De retours clients pour éclairer votre choix.'],
              [<Shield key="i" size={24} aria-hidden strokeWidth={1.5} />, 'Vos coordonnées au bon moment', 'Téléphone et WhatsApp visibles sur chaque fiche publique.'],
            ].map(([ic, t, b]) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 leading-none">{ic}</span>
                <div>
                  <p className="font-semibold text-gray-900">{t}</p>
                  <p className="text-gray-600 text-[13px] leading-6">{b}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </section>
  )
}


function ZoneSection() {
  const { zones, loading: loadingZones } = useReferenceData();
  return (
    <section className="container-kop py-16">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Ici, à côté</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Votre quartier, leurs savoir-faire.
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            Affichez par zone ou explorez toute la ville pour élargir vos possibilités.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 w-full">
          {loadingZones ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
            ))
          ) : (
            zones.map((z, index) => (
              <Link
                key={z.id}
                to={`${ROUTES.SEARCH}?zone=${encodeURIComponent(z.id)}`}
                hidden={index >= 6}
                className="flex items-center justify-between rounded-sm border border-gray-200 bg-white p-3  font-semibold text-gray-800  hover:bg-primary-50 hover:text-primary-700 transition group"
              >
                <span>{z.name}</span>
                <ArrowUpRight size={16} aria-hidden className="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-primary-500" />
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function ProCTA() {
  const { open: openModal } = useAuthModal();
  return (
    <section className="bg-[#183E30] py-16">
      <div className="container-kop">
        <div className=" text-white overflow-hidden relative">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-mint-200">Vous avez le savoir-faire</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tighter sm:leading-15 sm:text-5xl text-white!">
                Faites-vous connaître près de chez vous.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/80">
                Prenez votre métier, vos réalisations et vos zones d'intervention.
                Rendez-vous visible aux clients de votre ville et recevez-les directement sur votre fiche publique.
              </p>
              <div className="mt-7">
                <Button
                  onClick={() => openModal('register-pro')}
                  variant="secondary"
                  size="lg"
                  className="bg-white! text-gray-900! hover:bg-gray-100! border-white!"
                >
                  Créer mon profil professionnel
                </Button>
              </div>
            </div>
            <div className="relative max-w-115 lg:ml-auto">
              <div className="rounded-[16px] overflow-hidden ">
                <img
                  src={mockImage(PRO_CTA_IMAGE_PROMPT)}
                  alt="Devenir prestataire KOP"
                  className="w-full h-88 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section className="container-kop py-16">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Avant de vous lancer</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            On vous répond.
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            Quelques réponses pour utiliser KOP en toute simplicité.
          </p>
        </div>
        <div className="space-y-1 grid-cols-2 col-span-2">
          {FAQ.map(({ q, a }, i) => (
            <div key={q} className=" border-b border-gray-300  overflow-hidden ">
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                className="w-full flex items-center cursor-pointer justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-ring"
                aria-expanded={openIdx === i}
              >
                <span>{q}</span>
                <span className={cn('text-primary-600 transition-transform text-lg leading-none', openIdx === i && 'rotate-45')}>
                  <Plus size={16} aria-hidden />
                </span>
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 animate-fade-in">
                  <p className="text-sm leading-7 text-gray-600">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function FinalCTA(){
  return (
     <section className=" bg-kop-mint py-16">
        <div className=" container-kop   flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="">
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Un projet en tête ? Le quartier a du talent.
            </h2>
            <p className="mt-2 text-sm leading-7 text-gray-700">
              Commencez par trouver le bon professionnel.
            </p>
          </div>
          <Button as={Link} to={ROUTES.SEARCH} size="lg">
            Trouver un professionnel <Search size={16} aria-hidden className="inline" />
          </Button>
        </div>
      </section>
  )
}

export function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedProfessionalSection />
      <HowItWorksSection />
      <TrustSection />
      <ZoneSection />
      <ProCTA />
      <FAQSection />
      <FinalCTA />     
    </>
  );
}


