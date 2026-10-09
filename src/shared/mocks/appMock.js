// Données mock Utilisées quand le backend/DB est indisponible
import what1 from '@/shared/assets/what1.png';
import what2 from '@/shared/assets/what2.png';
import what3 from '@/shared/assets/what3.png';
import user1 from '@/shared/assets/user1.png';
import user2 from '@/shared/assets/user2.png';
import hero from '@/shared/assets/hero.png';

const IMAGES = [what1, what2, what3, user1, user2, hero];

export const MOCK_TRADE_CATEGORIES = [
  { id: 1, name: 'Bâtiment & gros œuvre' },
  { id: 2, name: 'Électricité & plomberie' },
  { id: 3, name: 'Bois & finitions' },
  { id: 4, name: 'Services & entretien' },
  { id: 5, name: 'Autre' },
];

export const MOCK_TRADES = [
  { id: 1, name: 'Plombier', categoryId: 2, createdAt: '2025-11-04T09:15:00.000Z' },
  { id: 2, name: 'Électricien', categoryId: 2, createdAt: '2025-12-18T14:40:00.000Z' },
  { id: 3, name: 'Maçon', categoryId: 1, createdAt: '2026-01-22T08:05:00.000Z' },
  { id: 4, name: 'Menuisier', categoryId: 3, createdAt: '2026-02-09T17:30:00.000Z' },
];

export const MOCK_CITIES = [
  { id: 1, name: 'Brazzaville' },
  { id: 2, name: 'Pointe-Noire' },
  { id: 3, name: 'Dolisie' },
  { id: 4, name: 'Nkayi' },
];

export const MOCK_ZONES = [
  { id: 1, name: 'Makélékélé', cityId: 1, createdAt: '2025-10-02T08:00:00.000Z' },
  { id: 2, name: 'Bacongo', cityId: 1, createdAt: '2025-10-02T08:05:00.000Z' },
  { id: 3, name: 'Poto-Poto', cityId: 1, createdAt: '2025-10-02T08:10:00.000Z' },
  { id: 4, name: 'Moungali', cityId: 1, createdAt: '2025-10-02T08:15:00.000Z' },
  { id: 5, name: 'Ouenzé', cityId: 1, createdAt: '2025-10-02T08:20:00.000Z' },
  { id: 6, name: 'Talangaï', cityId: 1, createdAt: '2025-10-02T08:25:00.000Z' },
  { id: 7, name: 'Mfilou', cityId: 1, createdAt: '2025-10-02T08:30:00.000Z' },
  { id: 8, name: 'Madibou', cityId: 1, createdAt: '2025-10-02T08:35:00.000Z' },
  { id: 9, name: 'Djiri', cityId: 1, createdAt: '2025-10-02T08:40:00.000Z' },
  { id: 10, name: 'Koundzi', cityId: 2, createdAt: '2026-01-12T10:00:00.000Z' },
  { id: 11, name: 'Maya-Maya', cityId: 2, createdAt: '2026-01-12T10:10:00.000Z' },
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
    city: 'Brazzaville',
    country: 'Congo',
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
    client: {
      firstName: FIRST[(proId + i) % FIRST.length],
      lastName: LAST[(proId + i + 2) % LAST.length],
      avatarUrl: IMAGES[(proId + i + 5) % IMAGES.length],
    },
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

export function searchMock({ trade, zone, q, available, minRating, minExperience, page = 1, pageSize = 10 } = {}) {
  let rows = MOCK_PROS.filter((p) => !p.isHidden);
  if (trade) rows = rows.filter((p) => String(p.tradeId) === String(trade));
  if (zone) rows = rows.filter((p) => p.zones.some((z) => String(z.id) === String(zone)));
  if (typeof available === 'boolean') rows = rows.filter((p) => p.isAvailable === available);
  if (minExperience != null) rows = rows.filter((p) => (p.yearsExperience ?? 0) >= Number(minExperience));
  if (minRating != null) rows = rows.filter((p) => (p.ratingAverage ?? 0) >= Number(minRating));
  if (q) {
    const qNorm = String(q).trim().toLowerCase();
    rows = rows.filter((p) =>
      p.displayName.toLowerCase().includes(qNorm) ||
      p.trade.toLowerCase().includes(qNorm) ||
      p.zones.some((z) => z.name.toLowerCase().includes(qNorm)),
    );
  }
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

// ---------- Admin mock ----------

const MOCK_CLIENTS = Array.from({ length: 6 }, (_, i) => ({
  id: 100 + i,
  role: 'client',
  firstName: FIRST[(i + 2) % FIRST.length],
  lastName: LAST[(i + 5) % LAST.length],
  displayName: null,
  avatarUrl: i % 2 ? null : IMAGES[(i + 2) % IMAGES.length],
  phone: `+24206${String(5000000 + i * 321654).slice(0, 7)}`,
  createdAt: new Date(Date.now() - (i + 1) * 86400000 * 5).toISOString(),
  blockedAt: null,
}));

function paginateMock(items, page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize) || 1,
  };
}

function proStatus(p) {
  if (p.isHidden) return 'hidden';
  const complete = p.description && p.zones?.length && p.photos?.length;
  return complete ? 'published' : 'incomplete';
}

export function mockAdminProfessionals({ page = 1, pageSize = 20, query = '', status, sort, city, country } = {}) {
  const q = String(query || '').trim().toLowerCase();
  let rows = MOCK_PROS.map((p) => ({
    id: p.id,
    displayName: p.displayName,
    trade: p.trade,
    phone: p.phone,
    avatarUrl: p.avatarUrl,
    city: p.city,
    country: p.country,
    status: proStatus(p),
    createdAt: new Date(Date.now() - (p.id + 1) * 86400000).toISOString(),
  }));
  if (q) rows = rows.filter((p) => p.displayName.toLowerCase().includes(q) || (p.trade || '').toLowerCase().includes(q) || p.phone.includes(q));
  if (status) rows = rows.filter((p) => p.status === status);
  if (city) rows = rows.filter((p) => p.city === city);
  if (country) rows = rows.filter((p) => p.country === country);
  rows = [...rows].sort((a, b) =>
    sort === 'recent'
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : a.displayName.localeCompare(b.displayName),
  );
  return paginateMock(rows, page, pageSize);
}

export function mockAdminReviews({ page = 1, pageSize = 20, hidden, query = '' } = {}) {
  const q = String(query || '').trim().toLowerCase();
  let all = MOCK_PROS.flatMap((p) =>
    mockReviewsFor(p.id).map((r) => ({
      ...r,
      professional: {
        id: p.id,
        displayName: p.displayName,
        firstName: p.firstName,
        lastName: p.lastName,
        avatarUrl: p.avatarUrl,
      },
    })),
  );
  if (typeof hidden === 'boolean') all = all.filter((r) => r.isHidden === hidden);
  if (q) {
    const rows = all.filter((r) => {
      const client = `${r.client?.firstName || ''} ${r.client?.lastName || ''}`.toLowerCase();
      return (
        client.includes(q) ||
        (r.professional?.displayName || '').toLowerCase().includes(q) ||
        String(r.comment || '').toLowerCase().includes(q)
      );
    });
    return paginateMock(rows, page, pageSize);
  }
  return paginateMock(all, page, pageSize);
}

const MOCK_ADMINS = [
  {
    id: 1,
    role: 'admin',
    firstName: 'Admin',
    lastName: 'Kopé',
    displayName: null,
    phone: '+242060000000',
    avatarUrl: null,
    createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
    blockedAt: null,
  },
];

export function mockAdminUsers({ page = 1, pageSize = 20, role, query = '' } = {}) {
  const pros = MOCK_PROS.map((p) => ({
    id: p.id,
    role: 'professional',
    firstName: null,
    lastName: null,
    displayName: p.displayName,
    avatarUrl: p.avatarUrl,
    phone: p.phone,
    createdAt: new Date(Date.now() - (p.id + 1) * 86400000 * 3).toISOString(),
    blockedAt: null,
  }));
  let rows = [...pros, ...MOCK_CLIENTS, ...MOCK_ADMINS].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const q = String(query || '').trim().toLowerCase();
  if (role) rows = rows.filter((u) => u.role === role);
  if (q)
    rows = rows.filter((u) =>
      [u.firstName, u.lastName, u.displayName, u.phone].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)),
    );
  return paginateMock(rows, page, pageSize);
}

function findMockUser(id) {
  const target = Number(id);
  if (MOCK_ADMINS.some((u) => u.id === target)) return MOCK_ADMINS.find((u) => u.id === target);
  const pro = MOCK_PROS.find((p) => p.id === target);
  if (pro) return { ...pro, firstName: null, lastName: null, role: 'professional' };
  const client = MOCK_CLIENTS.find((c) => c.id === target);
  return client ? { ...client, role: 'client' } : null;
}

export function mockSetUserBlocked(actorId, id, blocked) {
  if (Number(actorId) === Number(id)) throw new Error('Vous ne pouvez pas bloquer votre propre compte');
  const user = findMockUser(id);
  if (!user) throw new Error('Utilisateur introuvable');

  const persist = user.role === 'admin' ? MOCK_ADMINS : user.role === 'client' ? MOCK_CLIENTS : null;
  if (blocked && user.role === 'admin') {
    const others = MOCK_ADMINS.filter((a) => a.id !== Number(id) && !a.blockedAt);
    if (others.length === 0) throw new Error('Impossible de bloquer le dernier administrateur actif');
  }
  if (persist) persist.find((u) => u.id === Number(id)).blockedAt = blocked ? new Date().toISOString() : null;
  return { id: Number(id), role: user.role, blockedAt: blocked ? new Date().toISOString() : null };
}

export function mockCreateAdmin({ firstName, lastName, phone }) {
  const clean = String(phone || '').trim();
  const exists =
    MOCK_ADMINS.some((a) => a.phone === clean) ||
    MOCK_CLIENTS.some((c) => c.phone === clean) ||
    MOCK_PROS.some((p) => p.phone === clean);
  if (exists) throw new Error('Ce numéro est déjà utilisé');

  const id = Math.max(0, ...MOCK_ADMINS.map((a) => a.id)) + 500;
  const created = {
    id,
    role: 'admin',
    firstName: String(firstName || '').trim(),
    lastName: String(lastName || '').trim(),
    displayName: null,
    phone: clean,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    blockedAt: null,
  };
  MOCK_ADMINS.push(created);
  return created;
}

export function mockAdminStats() {  const published = MOCK_PROS.filter((p) => proStatus(p) === 'published').length;
  const hidden = MOCK_PROS.filter((p) => p.isHidden).length;
  const incomplete = MOCK_PROS.length - published - hidden;
  const reviews = MOCK_PROS.flatMap((p) => mockReviewsFor(p.id));
  const ratings = reviews.filter((r) => !r.isHidden).map((r) => r.rating);
  const ratingAverage = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : 0;
  return {
    users: MOCK_PROS.length + MOCK_CLIENTS.length + 1,
    clients: MOCK_CLIENTS.length,
    professionals: MOCK_PROS.length,
    published,
    hidden,
    incomplete,
    reviews: reviews.length,
    reviewsHidden: reviews.filter((r) => r.isHidden).length,
    ratingAverage,
    contacts: 2,
    recentProfessionals: [...MOCK_PROS]
      .slice(-5)
      .reverse()
      .map((p) => ({ id: p.id, displayName: p.displayName, trade: p.trade, createdAt: new Date(Date.now() - p.id * 86400000).toISOString() })),
  };
}

export function mockListTrades() {
  return {
    items: MOCK_TRADES.map((t) => ({
      ...t,
      category: MOCK_TRADE_CATEGORIES.find((c) => c.id === t.categoryId)?.name ?? null,
      professionals: MOCK_PROS.filter((p) => p.tradeId === t.id).length,
    })),
  };
}

export function mockListTradeCategories() {
  return {
    items: MOCK_TRADE_CATEGORIES.map((c) => ({
      ...c,
      trades: MOCK_TRADES.filter((t) => t.categoryId === c.id).length,
    })),
  };
}

export function mockCreateTradeCategory(payload) {
  const { name } = payload || {};
  const clean = String(name || '').trim();
  if (MOCK_TRADE_CATEGORIES.some((c) => c.name.toLowerCase() === clean.toLowerCase()))
    throw new Error('Cette catégorie existe déjà');
  const id = Math.max(0, ...MOCK_TRADE_CATEGORIES.map((c) => c.id)) + 1;
  const item = { id, name: clean, trades: 0 };
  MOCK_TRADE_CATEGORIES.push({ id, name: clean });
  return item;
}

export function mockUpdateTradeCategory(id, payload) {
  const { name } = payload || {};
  const category = MOCK_TRADE_CATEGORIES.find((c) => c.id === Number(id));
  if (!category) throw new Error('Catégorie introuvable');
  if (name != null) category.name = String(name).trim();
  return { id: category.id, name: category.name };
}

export function mockDeleteTradeCategory(id) {
  const target = Number(id);
  if (MOCK_TRADES.some((t) => t.categoryId === target))
    throw new Error('Déplacez les métiers de cette catégorie avant de la supprimer');
  const index = MOCK_TRADE_CATEGORIES.findIndex((c) => c.id === target);
  if (index < 0) throw new Error('Catégorie introuvable');
  MOCK_TRADE_CATEGORIES.splice(index, 1);
  return { id: target };
}

export function mockReorderTradeCategories(ids) {
  const order = ids.map(Number);
  MOCK_TRADE_CATEGORIES.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return { ids: order };
}

export function mockCreateTrade(payload) {
  const { name, categoryId = null } = payload || {};
  const id = Math.max(0, ...MOCK_TRADES.map((t) => t.id)) + 1;
  const createdAt = new Date().toISOString();
  const item = { id, name: String(name).trim(), categoryId: categoryId == null ? null : Number(categoryId), createdAt, professionals: 0 };
  MOCK_TRADES.push({ id, name: item.name, categoryId: item.categoryId, createdAt });
  return item;
}

export function mockUpdateTrade(id, payload) {
  const { name, categoryId } = payload || {};
  const trade = MOCK_TRADES.find((t) => t.id === Number(id));
  if (!trade) throw new Error('Métier introuvable');
  if (name != null) trade.name = String(name).trim();
  if (categoryId !== undefined) trade.categoryId = categoryId == null ? null : Number(categoryId);
  return { id: trade.id, name: trade.name, categoryId: trade.categoryId };
}

export function mockReorderTrades(ids) {
  const order = ids.map(Number);
  MOCK_TRADES.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return { ids: order };
}

export function mockDeleteTrade(id) {
  const target = Number(id);
  if (MOCK_PROS.some((p) => p.tradeId === target))
    throw new Error('Ce métier est utilisé par des professionnels');
  const index = MOCK_TRADES.findIndex((t) => t.id === target);
  if (index < 0) throw new Error('Métier introuvable');
  MOCK_TRADES.splice(index, 1);
  return { id };
}

export function mockListZones() {
  return {
    items: MOCK_ZONES.map((z) => ({
      ...z,
      city: MOCK_CITIES.find((c) => c.id === z.cityId)?.name ?? null,
      professionals: MOCK_PROS.filter((p) => p.zones.some((z2) => z2.id === z.id)).length,
    })),
  };
}

export function mockListCities() {
  return {
    items: MOCK_CITIES.map((c) => ({
      ...c,
      zones: MOCK_ZONES.filter((z) => z.cityId === c.id).length,
    })),
  };
}

export function mockCreateCity(payload) {
  const { name } = payload || {};
  const clean = String(name || '').trim();
  if (MOCK_CITIES.some((c) => c.name.toLowerCase() === clean.toLowerCase()))
    throw new Error('Cette ville existe déjà');
  const id = Math.max(0, ...MOCK_CITIES.map((c) => c.id)) + 1;
  MOCK_CITIES.push({ id, name: clean });
  return { id, name: clean, zones: 0 };
}

export function mockUpdateCity(id, payload) {
  const { name } = payload || {};
  const city = MOCK_CITIES.find((c) => c.id === Number(id));
  if (!city) throw new Error('Ville introuvable');
  if (name != null) city.name = String(name).trim();
  return { id: city.id, name: city.name };
}

export function mockDeleteCity(id) {
  const target = Number(id);
  if (MOCK_ZONES.some((z) => z.cityId === target))
    throw new Error('Déplacez les arrondissements de cette ville avant de la supprimer');
  const index = MOCK_CITIES.findIndex((c) => c.id === target);
  if (index < 0) throw new Error('Ville introuvable');
  MOCK_CITIES.splice(index, 1);
  return { id: target };
}

export function mockReorderCities(ids) {
  const order = ids.map(Number);
  MOCK_CITIES.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return { ids: order };
}

export function mockCreateZone(payload) {
  const { name, cityId = null } = payload || {};
  const id = Math.max(0, ...MOCK_ZONES.map((z) => z.id)) + 1;
  const createdAt = new Date().toISOString();
  const item = {
    id,
    name: String(name).trim(),
    cityId: cityId == null ? null : Number(cityId),
    createdAt,
  };
  MOCK_ZONES.push(item);
  return { ...item };
}

export function mockUpdateZone(id, payload) {
  const { name, cityId } = payload || {};
  const zone = MOCK_ZONES.find((z) => z.id === Number(id));
  if (!zone) throw new Error('Zone introuvable');
  if (name != null) zone.name = String(name).trim();
  if (cityId !== undefined) zone.cityId = cityId == null ? null : Number(cityId);
  return { id: zone.id, name: zone.name, cityId: zone.cityId };
}

export function mockReorderZones(ids) {
  const order = ids.map(Number);
  MOCK_ZONES.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return { ids: order };
}

export function mockDeleteZone(id) {
  const numeric = Number(id);
  if (MOCK_PROS.some((p) => p.zones?.some((z) => z.id === numeric)))
    throw new Error('Cette zone est utilisée par des professionnels');
  const index = MOCK_ZONES.findIndex((z) => z.id === numeric);
  if (index < 0) throw new Error('Zone introuvable');
  MOCK_ZONES.splice(index, 1);
  return { id: numeric };
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
