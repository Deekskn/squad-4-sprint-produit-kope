import { useState } from 'react';
import { Phone, Star, User } from 'lucide-react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { BottomNav } from '@/shared/components/ui/BottomNav.jsx';
import { ContactsSection } from '@/features/contacts/components/ContactsSection.jsx';
import { MyReviewsSection } from '@/features/reviews/components/MyReviewsSection.jsx';
import { ClientDashboardSidebar } from './components/ClientDashboardSidebar.jsx';
import { ClientProfileSection } from './components/ClientProfileSection.jsx';

const NAV_ITEMS = [
  { id: 'profil', label: 'Mon profil', shortLabel: 'Profil', icon: User },
  { id: 'avis', label: 'Mes avis', shortLabel: 'Avis', icon: Star },
  { id: 'contacts', label: 'Mes contacts', shortLabel: 'Contacts', icon: Phone },
];

export function ClientDashboardPage() {
  const { user } = useAuthContext();
  const [active, setActive] = useState('profil');

  return (
    <div className="container-kop py-10 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-x-8">
        <ClientDashboardSidebar items={NAV_ITEMS} active={active} onChange={setActive} />

        <div className="lg:col-start-2 lg:row-start-1">
          {active === 'profil' && <ClientProfileSection user={user} />}
          {active === 'avis' && <MyReviewsSection />}
          {active === 'contacts' && <ContactsSection />}
        </div>
      </div>

      <BottomNav
        items={NAV_ITEMS}
        active={active}
        onChange={setActive}
        ariaLabel="Navigation du profil (mobile)"
      />
    </div>
  );
}