import { Link } from 'react-router-dom';
import { Card } from '@/shared/components/ui/Card.jsx';
import { SectionHeader } from '@/shared/components/sections/SectionHeader.jsx';
import { FloatingCaption } from '@/shared/components/ui/FloatingCaption.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { CATEGORIES } from '@/shared/mocks/homeData.js';

export function CategorySection() {
  return (
    <section className="container-kop py-8 lg:py-16">
      <SectionHeader
        eyebrow="Pour vos petits et vos grands projets"
        title="De quoi avez-vous besoin ?"
        intro="Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les professionnels de votre quartier et échangez directement avec eux."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link key={c.id} to={`${ROUTES.SEARCH}?trade=${encodeURIComponent(c.tradeId)}`} className="group">
            <Card className="overflow-hidden h-full flex flex-col transition ">
              <div className="relative aspect-4/5.5 overflow-hidden">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <FloatingCaption title={c.name} subtitle={c.sub} icon={c.icon} wide />
              </div>

            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
