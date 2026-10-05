import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { UserMenu } from './UserMenu.jsx';
import { avatarFor, displayNameFor, roleLabel, dashboardHref } from './userMenuUtils.js';
import { ROUTES } from '@/lib/constants.js';
import { cn } from '@/lib/utils.js';
import { Button } from '@/components/ui/Button.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { Sheet } from '@/components/ui/Sheet.jsx';
import { Drill, Search, CircleHelp, Briefcase, LogOut } from 'lucide-react';

const NAV = [
  { to: ROUTES.SEARCH,         label: 'Trouver un professionnel', icon: Search },
  { to: ROUTES.HOW_IT_WORKS,   label: 'Comment ça marche',      icon: CircleHelp },
  { to: ROUTES.REGISTER_PRO,   label: 'Devenir Prestataire',    icon: Briefcase },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuthContext();
  const { open: openModal } = useAuthModal();

  // Un utilisateur déjà pro (ou admin) ne peut/ne doit pas devenir prestataire
  const showBecomePro = !user || (user.role !== 'professional' && user.role !== 'admin');
  const navItems = showBecomePro ? NAV : NAV.filter((item) => item.to !== ROUTES.REGISTER_PRO);

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
          {navItems.map((item) =>
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

      <Sheet open={open} onOpenChange={setOpen}>
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-100 px-5 pb-5 pt-6">
            <Link to={ROUTES.HOME} onClick={() => setOpen(false)} className="flex items-center gap-2 text-primary-500">
              <Drill size={20} aria-hidden />
              <span className="font-extrabold moo-lah-lah-regular tracking-tight text-[24px]">KOP</span>
            </Link>
          </div>
          <nav aria-label="Navigation mobile" className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) =>
              item.to === ROUTES.REGISTER_PRO ? (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => { setOpen(false); openModal('register-pro'); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon size={18} aria-hidden className="text-gray-400" />
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
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                    )
                  }
                >
                  <item.icon size={18} aria-hidden className={cn('text-gray-400')} />
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>
          <div className="border-t border-gray-100 p-4">
            {loading ? (
              <div className="h-10 w-full rounded-lg bg-gray-100 animate-pulse" />
            ) : !user ? (
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="md" className="w-full" onClick={() => { setOpen(false); openModal('login'); }}>Se connecter</Button>
                <Button variant="primary" size="md" className="w-full" onClick={() => { setOpen(false); openModal('register-client'); }}>S'inscrire</Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800 ring-1 ring-gray-300">
                  {avatarFor(user)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">{displayNameFor(user)}</p>
                  <p className="text-xs text-gray-500">{roleLabel(user.role)}</p>
                </div>
                <Link to={dashboardHref(user.role)} onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm">Mon espace</Button>
                </Link>
                <button
                  type="button"
                  aria-label="Se déconnecter"
                  onClick={() => { setOpen(false); logout(); }}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-rose-50 hover:text-danger-500"
                >
                  <LogOut size={18} aria-hidden />
                </button>
              </div>
            )}
          </div>
        </div>
      </Sheet>
    </header>
  );
}
