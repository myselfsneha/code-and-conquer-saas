/**
 * Reusable API service for React Native (fetch-based).
 */

function normalizeBaseUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function createApiService({ baseUrl }) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  if (!normalizedBaseUrl) {
    throw new Error('API baseUrl is required');
  }

  async function request(path, options = {}) {
    const response = await fetch(`${normalizedBaseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const payload = await response.json();

    if (!response.ok) {
      const message = payload?.message || 'API request failed';
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  }

  function login({ email, password, role, tenant_id }) {
    return request('/login', {
      method: 'POST',
      body: { email, password, role, tenant_id },
    });
  }

  return { login, request };
}

module.exports = { createApiService };
