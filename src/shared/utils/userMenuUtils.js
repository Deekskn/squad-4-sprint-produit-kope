import { ROUTES, ROLES } from '@/shared/lib/constants.js';
import { initials } from '@/shared/lib/utils.js';

export function avatarFor(user) {
  if (!user) return '?';
  if (user.role === ROLES.PRO) return initials(user.displayName || '', '');
  return initials(user.firstName, user.lastName);
}

export function displayNameFor(user) {
  if (!user) return null;
  if (user.role === ROLES.PRO) return user.displayName;
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || `#${user.id}`;
}

export function roleLabel(role) {
  return {
    [ROLES.CLIENT]: 'Client',
    [ROLES.PRO]: 'Professionnel',
    [ROLES.ADMIN]: 'Administrateur',
  }[role] || role;
}

export function dashboardHref(role) {
  if (role === ROLES.CLIENT) return ROUTES.DASHBOARD_CLIENT;
  if (role === ROLES.PRO) return ROUTES.DASHBOARD_PRO;
  if (role === ROLES.ADMIN) return ROUTES.ADMIN;
  return ROUTES.HOME;
}
