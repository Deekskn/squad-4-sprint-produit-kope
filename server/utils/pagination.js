/**
 * Les requêtes paginées ajoutent `COUNT(*) OVER()::int AS total` à chaque ligne.
 * Cette fonction sort le total des lignes et construit la réponse paginée.
 */
export function paginate(rows, { page, pageSize }) {
  const total = rows[0]?.total ?? 0;
  const items = rows.map(({ total: _total, ...rest }) => rest);
  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

export function offsetOf({ page, pageSize }) {
  return (page - 1) * pageSize;
}
