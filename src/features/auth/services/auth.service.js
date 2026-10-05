import { api } from '@/lib/api.js';
import { callApi } from '@/lib/dataSource.js';
import { getDemoUser, setDemoUser } from '@/mocks/appMock.js';
import { setTokens, clearTokens, getRefreshToken, getAccessToken } from '@/lib/authTokens.js';

export function registerClient(payload) {
  return callApi(
    () => api.postJson('/auth/register/client', payload).then((r) => { setTokens(r); return r?.user; }),
    async () => {
      const user = {
        id: Date.now() % 100000,
        role: 'client',
        phone: payload.phone,
        firstName: payload.firstName,
        lastName: payload.lastName,
      };
      setDemoUser(user);
      return user;
    },
  );
}

export function registerProfessional(payload) {
  return callApi(
    () => api.postJson('/auth/register/professional', payload).then((r) => { setTokens(r); return r?.user; }),
    async () => {
      const user = {
        id: Date.now() % 100000,
        role: 'professional',
        phone: payload.phone,
        displayName: payload.displayName,
      };
      setDemoUser(user);
      return user;
    },
  );
}

export function login(payload) {
  return callApi(
    () => api.postJson('/auth/login', payload).then((r) => { setTokens(r); return r?.user; }),
    async () => {
      const user = {
        id: Date.now() % 100000,
        role: 'client',
        phone: payload.phone,
        firstName: 'Démo',
        lastName: 'Utilisateur',
      };
      setDemoUser(user);
      return user;
    },
  );
}

export function logout() {
  return callApi(
    () => api.postJson('/auth/logout', { refreshToken: getRefreshToken() }).finally(() => clearTokens()),
    async () => { clearTokens(); setDemoUser(null);
      return {};
    },
  );
}

export function getCurrentUser() {
  // En mode démo (login mock), l'utilisateur vit dans localStorage et il n'y a
  // pas de jeton : on le restitue directement, sans appeler l'API.
  const demoUser = getDemoUser();
  if (demoUser && !getAccessToken()) {
    return Promise.resolve(demoUser);
  }
  return callApi(
    () => api.get('/auth/me').then((r) => { setTokens(r); return r?.user; }),
    async () => getDemoUser(),
  );
}

export function becomeProfessional(payload) {
  return callApi(
    () => api.postJson('/auth/become-professional', payload).then((r) => { setTokens(r); return r?.user; }),
    async () => {
      const user = {
        ...(getDemoUser() || { id: Date.now() % 100000 }),
        role: 'professional',
        displayName: payload.displayName,
      };
      setDemoUser(user);
      return user;
    },
  );
}

export function updateAccount(payload) {
  return callApi(
    () => api.putJson('/auth/me', payload).then((r) => r?.user),
    async () => {
      const demo = getDemoUser();
      if (demo) setDemoUser({ ...demo, ...payload });
      return demo ? { ...demo, ...payload } : null;
    },
  );
}

export function changePassword(payload) {
  return callApi(
    () => api.putJson('/auth/password', payload),
    async () => ({}),
  );
}

export default {
  registerClient,
  registerProfessional,
  login,
  logout,
  getCurrentUser,
  becomeProfessional,
  updateAccount,
  changePassword,
};
