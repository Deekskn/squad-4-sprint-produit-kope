import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import { getDemoUser, setDemoUser } from '@/shared/mocks/appMock.js';

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
    async () => {
      // Le serveur détruit la session côté serveur et efface le cookie httpOnly.
      try {
        await api.postJson('/auth/logout', {});
      } finally {
        setDemoUser(null);
      }
      return {};
    },
    async () => { setDemoUser(null);
      return {};
    },
  );
}

export function getCurrentUser() {
  const demoUser = getDemoUser();
  if (demoUser) return Promise.resolve(demoUser);

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
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) 
            onProgress(Math.round((e.loaded / e.total) * 100));
          
        };
        xhr.onload = () => {
          try {
            const payload = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) 
              resolve(payload?.avatarUrl ?? null);
             else 
              reject(new Error(payload?.message || `Erreur ${xhr.status}`));
            
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