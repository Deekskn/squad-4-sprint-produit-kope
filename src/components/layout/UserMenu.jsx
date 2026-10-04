import { Link } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { ROUTES, ROLES } from '@/lib/constants.js';
import { Button } from '@/components/ui/Button.jsx';
import { cn, initials } from '@/lib/utils.js';
import { useState } from 'react';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';

function avatarFor(user) {
  if (!user) return '?';
  if (user.role === ROLES.PRO) return initials(user.displayName || '', '');
  return initials(user.firstName, user.lastName);
}

function displayNameFor(user) {
  if (!user) return null;
  if (user.role === ROLES.PRO) return user.displayName;
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || `#${user.id}`;
}

function roleLabel(role) {
  return {
    [ROLES.CLIENT]: 'Client',
    [ROLES.PRO]: 'Professionnel',
    [ROLES.ADMIN]: 'Administrateur',
  }[role] || role;
}

function dashboardHref(role) {
  if (role === ROLES.CLIENT) return ROUTES.DASHBOARD_CLIENT;
  if (role === ROLES.PRO) return ROUTES.DASHBOARD_PRO;
  if (role === ROLES.ADMIN) return ROUTES.ADMIN;
  return ROUTES.HOME;
}

export function UserMenu({ onNavigate }) {
  const { user, loading, logout, hasRole } = useAuthContext();
  const { open: openModal } = useAuthModal();
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  if (loading) {
    return <div className="h-9 w-24 rounded-lg bg-gray-100 animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => { onNavigate?.(); openModal('login'); }}>
          Connexion
        </Button>
        <Button variant="primary" size="sm" onClick={() => { onNavigate?.(); openModal('register-client'); }}>
          S'inscrire
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 focus-ring"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-800 text-sm font-semibold ring-1 ring-primary-200">
          {avatarFor(user)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-gray-800 leading-4">
            {displayNameFor(user)}
          </span>
          <span className="block text-[11px] text-gray-500">{roleLabel(user.role)}</span>
        </span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={close} aria-hidden />
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[var(--shadow-pop)] animate-scale-in"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-gray-800">{displayNameFor(user)}</p>
              <p className="text-xs text-gray-500">{roleLabel(user.role)}</p>
            </div>
            <div className="flex flex-col p-1.5 gap-0.5">
              {(hasRole(ROLES.CLIENT) || hasRole(ROLES.PRO) || hasRole(ROLES.ADMIN)) && (
                <Link
                  to={dashboardHref(user.role)}
                  role="menuitem"
                  onClick={close}
                  className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {hasRole(ROLES.PRO) ? 'Mon profil' : hasRole(ROLES.ADMIN) ? 'Administration' : 'Mon espace'}
                </Link>
              )}
              {hasRole(ROLES.PRO) && (
                <Link
                  to={ROUTES.PROFESSIONAL(user.id)}
                  role="menuitem"
                  onClick={close}
                  className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Voir ma fiche publique
                </Link>
              )}
            </div>
            <div className="border-t border-gray-100 p-1.5">
              <button
                role="menuitem"
                onClick={() => {
                  close();
                  logout();
                }}
                className={cn(
                  'w-full text-left rounded-md px-3 py-2 text-sm',
                  'text-danger-600 hover:bg-rose-50',
                )}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
