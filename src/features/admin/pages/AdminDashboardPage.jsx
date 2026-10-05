import { useState } from 'react';
import { AdminProfessionalsTable } from '../components/AdminProfessionalsTable.jsx';
import { AdminReviewsTable } from '../components/AdminReviewsTable.jsx';
import { cn } from '@/lib/utils.js';

const TABS = [
  { id: 'pros', label: 'Professionnels' },
  { id: 'reviews', label: 'Avis' },
];

export function AdminDashboardPage() {
  const [tab, setTab] = useState('pros');

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-16">
      <header className="">
        <p className="text-sm text-gray-500">Espace administrateur</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Tableau de bord de modération
        </h1>
      </header>

      <div className="rounded-md border border-gray-200 bg-white p-1 inline-flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-sm px-4 py-2 text-sm font-medium transition cursor-pointer',
              tab === t.id
                ? 'bg-primary-500 text-white shadow'
                : 'text-gray-600 hover:bg-gray-50',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pros' && <AdminProfessionalsTable />}
      {tab === 'reviews' && <AdminReviewsTable />}
    </div>
  );
}
