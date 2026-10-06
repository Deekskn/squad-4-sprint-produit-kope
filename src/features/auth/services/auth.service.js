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
    async () => {
      try {
        await api.postJson('/auth/logout', { refreshToken: getRefreshToken() });
      } finally {
        clearTokens();
        // Le compte démo local nuit aussi à la déconnexion : on le purge.
        setDemoUser(null);
      }
      return {};
    },
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

export function uploadAvatar(file, onProgress) {
  const fd = new FormData();
  fd.append('avatar', file);
  return callApi(
    () =>
      new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/auth/avatar');
        xhr.withCredentials = true;
        const token = getAccessToken();
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          try {
            const payload = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(payload?.avatarUrl ?? null);
            } else {
              reject(new Error(payload?.message || `Erreur ${xhr.status}`));
            }
          } catch {
            reject(new Error('Réponse invalide'));
          }
        };
        xhr.onerror = () => reject(new TypeError('Échec réseau'));
        xhr.send(fd);
      }),
    async () => {
      if (file) {
        if (onProgress) onProgress(100);
        const avatarUrl = URL.createObjectURL(file);
        const demo = getDemoUser();
        if (demo) setDemoUser({ ...demo, avatarUrl });
        return avatarUrl;
      }
      return null;
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
  updateAccount,
  changePassword,
};
