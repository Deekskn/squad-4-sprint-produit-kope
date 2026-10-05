import { Card } from '@/components/ui/Card.jsx';
import { SectionHeader } from '@/components/sections/SectionHeader.jsx';
import { cn } from '@/lib/utils.js';
import { STEPS } from '@/mocks/homeData.js';

export function HowItWorksSection() {
  return (
    <section className="container-kop py-16">
      <SectionHeader
        eyebrow="Simple, du début à la rencontre"
        title="Votre projet commence ici."
        intro="Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les professionnels de votre quartier et échangez directement avec eux."
      />
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
