import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { UserMenu } from './UserMenu.jsx';
import { ROUTES } from '@/lib/constants.js';
import { cn } from '@/lib/utils.js';
import { Button } from '@/components/ui/Button.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { Drill } from 'lucide-react';

const NAV = [
  { to: ROUTES.SEARCH,         label: 'Trouver un professionnel' },
  { to: ROUTES.HOW_IT_WORKS,   label: 'Comment ça marche' },
  { to: ROUTES.REGISTER_PRO,   label: 'Devenir Prestataire' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuthContext();
  const { open: openModal } = useAuthModal();

  return (
    <header className={`sticky top-0 z-40 border-b  border-gray-100 bg-white/85 backdrop-blur`}>
      <div className="container-kop flex py-4 items-center justify-between gap-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 focus-ring rounded-xl p-1 -ml-1 shrink-0 text-primary-500">
          <span aria-hidden className="flex items-center gap-1.5">
            <Drill size={20} />
            <span className="font-extrabold moo-lah-lah-regular tracking-tight text-[27px]  -ml-0.5">
              KOP
            </span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <nav aria-label="Navigation principale" className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) =>
            item.to === ROUTES.REGISTER_PRO ? (
              <button
                key={item.to}
                type="button"
                onClick={() => openModal('register-pro')}
                className="rounded-[10px] py-2 text-sm font-semibold text-gray-700 transition hover:text-gray-900"
              >
                {item.label}
              </button>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-[10px]  py-2 text-sm font-semibold transition',
                    isActive
                      ? 'text-primary-700'
                      : 'text-gray-700 hover:text-gray-900',
                  )
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
        <span className='opacity-30'>|</span>
          {!loading && !user && (
            <>
              <Button variant="outline" size="sm" onClick={() => openModal('login')}>
                Se connecter
              </Button>
              <Button variant="primary" size="sm" onClick={() => openModal('register-client')}>
                S'inscrire
              </Button>
            </>
          )}
          {(user || loading) && <UserMenu />}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 lg:hidden focus-ring"
          aria-label="Menu"
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            ) : (
              <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-white lg:hidden">
          <div className="container-kop flex flex-col gap-1 py-3">
            {NAV.map((item) =>
              item.to === ROUTES.REGISTER_PRO ? (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => { setOpen(false); openModal('register-pro'); }}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {item.label}
                </button>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-3 py-2.5 text-sm font-semibold',
                      isActive ? 'text-primary-700' : 'text-gray-700 hover:bg-gray-50',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}
            <div className="pt-3 flex items-center gap-2 border-t border-gray-100 mt-2">
              {!user && !loading ? (
                <>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setOpen(false); openModal('login'); }}>Se connecter</Button>
                  <Button variant="primary" size="sm" className="flex-1" onClick={() => { setOpen(false); openModal('register-client'); }}>S'inscrire</Button>
                </>
              ) : (
                <UserMenu onNavigate={() => setOpen(false)} />
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
