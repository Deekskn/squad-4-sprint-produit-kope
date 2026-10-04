import { api } from '@/lib/api.js';

export function registerClient(payload) {
  return api.postJson('/auth/register/client', payload).then((r) => r?.user);
}
export function registerProfessional(payload) {
  return api.postJson('/auth/register/professional', payload).then((r) => r?.user);
}
export function login(payload) {
  return api.postJson('/auth/login', payload).then((r) => r?.user);
}
export function logout() {
  return api.postJson('/auth/logout', {});
}
export function getCurrentUser() {
  return api.get('/auth/me').then((r) => r?.user);
}
export function becomeProfessional(payload) {
  return api.postJson('/auth/become-professional', payload).then((r) => r?.user);
}

export default {
  registerClient,
  registerProfessional,
  login,
  logout,
  getCurrentUser,
  becomeProfessional,
};
