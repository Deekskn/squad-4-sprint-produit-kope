import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { ROUTES } from '@/lib/constants.js';

export function FinalCTA() {
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
