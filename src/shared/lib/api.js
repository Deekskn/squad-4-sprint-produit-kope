import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './authTokens.js';

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
  if (contentType.includes('application/json')) 
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
  
  if (!res.ok) {
    const message = payload?.message || `Erreur ${res.status}`;
    throw new ApiError(res.status, message, payload?.errors);
  }
  return payload;
}

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) 
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error('no-refresh-token');
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: JSON_HEADERS,
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) throw new Error('refresh-failed');
      const data = await res.json();
      setTokens(data);
      return data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  
  return refreshPromise;
}

export async function fetchApi(url, options = {}, retry = true) {
  const { headers, ...rest } = options;
  const token = getAccessToken();
  const res = await fetch(resolveUrl(url), {
    credentials: 'include',
    headers: { ...DEFAULT_HEADERS, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    ...rest,
  });
  if (res.status === 401 && retry && !url.includes('/auth/refresh') && !url.includes('/auth/login')) 
    try {
      await refreshAccessToken();
      return fetchApi(url, options, false);
    } catch {
      clearTokens();
    }
  
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
