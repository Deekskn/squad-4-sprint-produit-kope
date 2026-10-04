import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { AuthModal } from '@/features/auth/components/AuthModal.jsx';

export function RootLayout() {
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
    </div>
  );
}
