const DEFAULT_HEADERS = { Accept: 'application/json' };
const JSON_HEADERS = { ...DEFAULT_HEADERS, 'Content-Type': 'application/json' };

export class ApiError extends Error {
  constructor(status, message, errors = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

function resolveUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `/api${normalized}`;
}

async function parseResponse(res) {
  let payload = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
  }
  if (!res.ok) {
    const message = payload?.message || `Erreur ${res.status}`;
    throw new ApiError(res.status, message, payload?.errors);
  }
  return payload;
}

export async function fetchApi(url, options = {}) {
  const { headers, ...rest } = options;
  const res = await fetch(resolveUrl(url), {
    credentials: 'include',
    headers: { ...DEFAULT_HEADERS, ...headers },
    ...rest,
  });
  return parseResponse(res);
}

export const api = {
  get: (url, params) => {
    const fullUrl = params ? `${url}?${new URLSearchParams(params).toString()}` : url;
    return fetchApi(fullUrl, { method: 'GET' });
  },
  postJson: (url, body) =>
    fetchApi(url, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) }),
  putJson: (url, body) =>
    fetchApi(url, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(body) }),
  patchJson: (url, body) =>
    fetchApi(url, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) }),
  del: (url) => fetchApi(url, { method: 'DELETE' }),
  postFormData: (url, formData) =>
    fetchApi(url, { method: 'POST', body: formData }),
};
