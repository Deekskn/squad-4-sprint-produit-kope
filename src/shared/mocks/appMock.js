// Données mock Utilisées quand le backend/DB est indisponible
import what1 from '@/shared/assets/what1.png';
import what2 from '@/shared/assets/what2.png';
import what3 from '@/shared/assets/what3.png';
import user1 from '@/shared/assets/user1.png';
import user2 from '@/shared/assets/user2.png';
import hero from '@/shared/assets/hero.png';

const IMAGES = [what1, what2, what3, user1, user2, hero];

export const MOCK_TRADES = [
  { id: 1, name: 'Plombier' },
  { id: 2, name: 'Électricien' },
  { id: 3, name: 'Maçon' },
  { id: 4, name: 'Menuisier' },
];

export const MOCK_ZONES = [
  { id: 1, name: 'Makélékélé' },
  { id: 2, name: 'Bacongo' },
  { id: 3, name: 'Poto-Poto' },
  { id: 4, name: 'Moungali' },
  { id: 5, name: 'Ouenzé' },
  { id: 6, name: 'Talangaï' },
  { id: 7, name: 'Mfilou' },
  { id: 8, name: 'Madibou' },
  { id: 9, name: 'Djiri' },
];

const FIRST = ['Julien', 'Thomas', 'Sarah', 'Moussa', 'Amina', 'David', 'Grace', 'Patrick', 'Clarisse', 'Jean', 'Rod', 'Ruth'];
const LAST = ['Morel', 'Rivière', 'Le Goff', 'Okamba', 'Itoua', 'Malonga', 'Mpassi', 'Kengue', 'Loufoua', 'Makaya', 'Ngoma', 'Okou'];

function makePro(i) {
  const trade = MOCK_TRADES[i % MOCK_TRADES.length];
  const zoneIds = [(i % MOCK_ZONES.length) + 1, ((i + 3) % MOCK_ZONES.length) + 1];
  const zones = MOCK_ZONES.filter((z) => zoneIds.includes(z.id));
  const ratingCount = (i * 3) % 14;
  return {
    id: i + 1,
    displayName: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
    trade: trade.name,
    tradeId: trade.id,
    tradeName: trade.name,
    zones,
    yearsExperience: (i % 15) + 2,
    isAvailable: i % 3 !== 0,
    isHidden: false,
    description:
      'Artisan expérimenté basé à Brazzaville. Devis gratuit, travail soigné et garantie sur les interventions réalisées dans votre quartier.',
    phone: `+24206${String(1000000 + i * 137913).slice(0, 7)}`,
    whatsapp: null,
    image: IMAGES[i % IMAGES.length],
    avatarUrl: IMAGES[(i + 3) % IMAGES.length],
    ratingAverage: ratingCount ? Math.round((3.5 + ((i * 7) % 15) / 10) * 10) / 10 : null,
    ratingCount,
    photos: [0, 1, 2].map((k) => ({
      id: i * 10 + k + 1,
      url: IMAGES[(i + k) % IMAGES.length],
      thumbUrl: IMAGES[(i + k) % IMAGES.length],
      caption: k === 0 ? 'Chantier récent' : k === 1 ? 'Réalisation' : 'Prestation',
      title: k === 0 ? 'Chantier récent' : k === 1 ? 'Réalisation' : 'Prestation',
      description:
        k === 0
          ? 'Intervention complète réalisée en une journée, avec nettoyage du chantier et contrôle final.'
          : k === 1
            ? 'Prestation réalisée dans les règles de l\'art, client satisfait et recommandation reçue.'
            : 'Installation soignée et mise en service, avec conseils d\'entretien remis au client.',
      createdAt: new Date(Date.now() - (i + k) * 86400000).toISOString(),
    })),
  };
}

export const MOCK_PROS = Array.from({ length: 12 }, (_, i) => makePro(i));

const REVIEWS_POOL = [
  { rating: 5, comment: 'Un échange clair et une intervention soignée. Julien a pris le temps de m\'expliquer l\'origine de la fuite.' },
  { rating: 5, comment: 'Très bon contact pour le remplacement de ma robinetterie. Travail propre et conseils utiles.' },
  { rating: 4, comment: 'Punctuel, efficace et courtois. Je recommande.' },
  { rating: 5, comment: 'Devis détaillé, respect des délais, résultat impeccable.' },
];

export function mockReviewsFor(proId) {
  return REVIEWS_POOL.map((r, i) => ({
    id: proId * 100 + i,
    rating: r.rating,
    comment: r.comment,
    isHidden: false,
    createdAt: new Date(Date.now() - (proId + i) * 86400000 * 3).toISOString(),
    client: { firstName: FIRST[(proId + i) % FIRST.length], lastName: LAST[(proId + i + 2) % LAST.length] },
  }));
}

export function toSearchItem(p) {
  return {
    id: p.id,
    displayName: p.displayName,
    trade: p.trade,
    zones: p.zones.map((z) => z.name),
    yearsExperience: p.yearsExperience,
    isAvailable: p.isAvailable,
    rating: { average: p.ratingAverage, count: p.ratingCount },
    image: p.image,
  };
}

export function searchMock({ trade, zone, page = 1, pageSize = 10 } = {}) {
  let rows = MOCK_PROS.filter((p) => !p.isHidden);
  if (trade) rows = rows.filter((p) => String(p.tradeId) === String(trade));
  if (zone) rows = rows.filter((p) => p.zones.some((z) => String(z.id) === String(zone)));
  rows = [...rows].sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable) || (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0));
  const total = rows.length;
  const items = rows.slice((page - 1) * pageSize, page * pageSize).map(toSearchItem);
  return { items, total, page, pageSize };
}

export function getProDetailMock(id) {
  const p = MOCK_PROS.find((x) => String(x.id) === String(id));
  if (!p) return null;
  const tagsByTrade = {
    1: ['Recherche de fuites', 'Robinetterie', 'Salle de bains'],
    2: ['Installation de tableaux', 'Mise en sécurité', 'Luminaires'],
    3: ['Béton', 'Fondations', 'Ravalement'],
    4: ['Menuiseries sur mesure', 'Rangements', 'Volets'],
  };
  return {
    profile: {
      id: p.id,
      displayName: p.displayName,
      trade: { id: p.tradeId, name: p.tradeName },
      description: p.description,
      yearsExperience: p.yearsExperience,
      isAvailable: p.isAvailable,
      phone: p.phone,
      avatarUrl: p.avatarUrl,
      whatsapp: p.whatsapp ?? p.phone,
      zones: p.zones,
      tags: tagsByTrade[p.tradeId] ?? [],
      updatedAt: new Date(Date.now() - p.id * 86400000).toISOString(),
    },
    photos: p.photos,
    rating: { average: p.ratingAverage ?? 0, count: p.ratingCount },
  };
}

// ---------- Contacts mock ----------

export function mockMyContacts({ page = 1, pageSize = 20 } = {}) {
  const items = [
    {
      id: 9001,
      message: 'Bonjour, je recherche un devis pour une rénovation de salle de bain.',
      status: 'new',
      outgoing: false,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      userId: 42,
      role: 'client',
      phone: '+242061234567',
      avatarUrl: null,
      firstName: 'Abel',
      lastName: 'Bouanga',
      displayName: 'Abel Bouanga',
      tradeName: null,
    },
    {
      id: 9002,
      message: 'Bonjour, êtes-vous disponible la semaine prochaine pour un chantier ?',
      status: 'seen',
      outgoing: true,
      createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
      userId: 7,
      role: 'professional',
      phone: '+242069876543',
      avatarUrl: null,
      firstName: null,
      lastName: null,
      displayName: 'Atelier Kengo',
      tradeName: 'Menuiserie',
    },
  ];
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  };
}

// ---------- Session mock  ----------

const SESSION_KEY = 'kop_demo_user';

export function getDemoUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setDemoUser(user) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
