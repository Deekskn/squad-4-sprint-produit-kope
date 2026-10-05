import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { AuthModal } from '@/features/auth/components/AuthModal.jsx';
import { useMockMode } from '@/lib/dataSource.js';

export function RootLayout() {
  const demo = useMockMode();
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className=" animate-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer />
      <AuthModal />
      {demo && (
        <div className="fixed bottom-4 left-1/2 z-80 -translate-x-1/2 rounded-full bg-gray-900/90 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
          Mode démo — données factices (backend indisponible)
        </div>
      )}
    </div>
  );
}
