import { api } from '@/lib/api.js';
import { callApi } from '@/lib/dataSource.js';
import { getDemoUser, setDemoUser } from '@/mocks/appMock.js';

export function registerClient(payload) {
  return callApi(
    () => api.postJson('/auth/register/client', payload).then((r) => r?.user),
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
    () => api.postJson('/auth/register/professional', payload).then((r) => r?.user),
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
    () => api.postJson('/auth/login', payload).then((r) => r?.user),
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
    () => api.postJson('/auth/logout', {}),
    async () => {
      setDemoUser(null);
      return {};
    },
  );
}

export function getCurrentUser() {
  return callApi(
    () => api.get('/auth/me').then((r) => r?.user),
    async () => getDemoUser(),
  );
}

export function becomeProfessional(payload) {
  return callApi(
    () => api.postJson('/auth/become-professional', payload).then((r) => r?.user),
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

export default {
  registerClient,
  registerProfessional,
  login,
  logout,
  getCurrentUser,
  becomeProfessional,
};
