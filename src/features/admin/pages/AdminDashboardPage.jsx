import { useState } from 'react';
import { Briefcase, Star } from 'lucide-react';
import { AdminProfessionalsTable } from '../components/AdminProfessionalsTable.jsx';
import { AdminReviewsTable } from '../components/AdminReviewsTable.jsx';
import { cn } from '@/lib/utils.js';

const TABS = [
  { id: 'pros', label: 'Professionnels', icon: Briefcase },
  { id: 'reviews', label: 'Avis', icon: Star },
];

export function AdminDashboardPage() {
  const [tab, setTab] = useState('pros');

  return (
    <div className="container-kop py-10 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">Espace administrateur</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Modération
            </h1>
          </div>
          <nav aria-label="Navigation admin" className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition cursor-pointer',
                  tab === id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <Icon size={18} aria-hidden />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main>
          {tab === 'pros' && <AdminProfessionalsTable />}
          {tab === 'reviews' && <AdminReviewsTable />}
        </main>
      </div>
    </div>
  );
}
