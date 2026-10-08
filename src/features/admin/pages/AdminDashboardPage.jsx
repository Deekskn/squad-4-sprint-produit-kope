import { useState } from 'react';
import { Briefcase, Star, Settings } from 'lucide-react';
import { AdminProfessionalsTable } from '../components/AdminProfessionalsTable.jsx';
import { AdminReviewsTable } from '../components/AdminReviewsTable.jsx';
import { AccountSettings } from '@/features/auth/components/AccountSettings.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { SidebarNav } from '@/shared/components/ui/SidebarNav.jsx';
import { BottomNav } from '@/shared/components/ui/BottomNav.jsx';

const TABS = [
  { id: 'pros', label: 'Professionnels', shortLabel: 'Pros', icon: Briefcase },
  { id: 'reviews', label: 'Avis', shortLabel: 'Avis', icon: Star },
  { id: 'compte', label: 'Mon profil', shortLabel: 'Profil', icon: Settings },
];

export function AdminDashboardPage() {
  const [tab, setTab] = useState('pros');
  const { user } = useAuthContext();

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
          <SidebarNav
            items={TABS}
            active={tab}
            onChange={setTab}
            ariaLabel="Navigation admin"
          />
        </aside>

        <main>
          {tab === 'pros' && <AdminProfessionalsTable />}
          {tab === 'reviews' && <AdminReviewsTable />}
          {tab === 'compte' && <AccountSettings user={user} />}
        </main>
      </div>
      <BottomNav items={TABS} active={tab} onChange={setTab} ariaLabel="Navigation admin (mobile)" />
    </div>
  );
}
