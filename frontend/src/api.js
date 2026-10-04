// Adresse de l'API : modifiable dans le fichier .env (VITE_API_URL)
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ZONES = ['Makélékélé', 'Bacongo', 'Poto-Poto', 'Moungali', 'Ouenzé', 'Talangaï', 'Mfilou', 'Madibou', 'Djiri'];
export const METIERS = ['Plombier', 'Électricien', 'Maçon', 'Peintre', 'Menuisier', 'Carreleur', 'Soudeur', 'Serrurier'];

// Un seul endroit pour envoyer le jeton (à adapter quand l'équipe auth aura décidé)
function entetes() {
  const jeton = localStorage.getItem('token');
  return jeton ? { Authorization: 'Bearer ' + jeton } : {};
}

async function appel(chemin) {
  const reponse = await fetch(API + chemin, { headers: entetes() });
  let donnees = null;
  try { donnees = await reponse.json(); } catch (e) { /* réponse vide */ }
  if (!reponse.ok) {
    const erreur = new Error((donnees && donnees.message) || 'Erreur');
    erreur.status = reponse.status;
    throw erreur;
  }
  return donnees;
}

export function rechercher({ metier, zone }) {
  const q = new URLSearchParams();
  if (metier) q.set('metier', metier);
  if (zone) q.set('zone', zone);
  return appel('/api/recherche?' + q.toString());
}

export const getProfil = (id) => appel('/api/professionnels/' + encodeURIComponent(id));
export const getContact = (id) => appel('/api/professionnels/' + encodeURIComponent(id) + '/contact');

// Les photos sont servies par le back sous /uploads (voir LISEZMOI)
export function urlPhoto(chemin) {
  if (!chemin) return '';
  if (/^https?:/.test(chemin)) return chemin;
  return API + '/uploads/' + chemin.replace(/^\/+/, '');
}

export const initiales = (p) => ((p.prenom || '')[0] || '') + ((p.nom || '')[0] || '');
