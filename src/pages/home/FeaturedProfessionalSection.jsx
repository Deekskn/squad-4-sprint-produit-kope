import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { SectionHeader } from '@/components/sections/SectionHeader.jsx';
import { ProfessionalCard } from '@/features/professionals/components/ProfessionalCard.jsx';
import { ROUTES } from '@/lib/constants.js';
import { FEATURED } from '@/mocks/homeData.js';

export function FeaturedProfessionalSection() {
  return (
    <section className="bg-[#CDD0D8] py-16">
      <div className="container-kop">
        <SectionHeader
          eyebrow="Faites connaissance"
          title="Des visages derrière chaque métier."
          intro="Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les professionnels de votre quartier et échangez directement avec eux."
        >
          <Button as={Link} to={ROUTES.SEARCH} variant="outline" size="md" className="bg-transparent! border-gray-400!">
            Explorer les professionnels <ArrowRight size={16} aria-hidden className="inline" />
          </Button>
        </SectionHeader>
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
