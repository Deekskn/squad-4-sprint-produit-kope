import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { AuthModal } from '@/features/auth/components/AuthModal.jsx';
import { useMockMode } from '@/lib/dataSource.js';
import { ROUTES } from '@/lib/constants.js';
import { cn } from '@/lib/utils.js';

const BOTTOM_NAV_ROUTES = [ROUTES.DASHBOARD_PRO, ROUTES.DASHBOARD_CLIENT];

export function RootLayout() {
  const demo = useMockMode();
  const { pathname } = useLocation();
  const hasBottomNav = BOTTOM_NAV_ROUTES.includes(pathname);
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main id="main-content" className={cn('flex-1', hasBottomNav && 'bg-dots')}>
        <div className=" animate-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer className={hasBottomNav ? 'pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0' : undefined} />
      <AuthModal />
      {demo && (
        <div className={cn(
          'fixed left-1/2 z-80 -translate-x-1/2 rounded-full bg-gray-900/90 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur',
          hasBottomNav ? 'bottom-24 lg:bottom-4' : 'bottom-4',
        )}>
          Mode démo — données factices (backend indisponible)
        </div>
      )}
    </div>
  );
}
