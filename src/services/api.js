const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiRequest = async (
  endpoint,
  options = {},
  getToken = null
) => {
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const url = `${BASE_URL}${normalizedEndpoint}`;

  const headers = new Headers(options.headers || {});

  if (getToken) {
    const token = await getToken();

    if (!token) {
      throw new Error('You must be signed in to perform this action.');
    }

    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      data?.error ||
      `API error: ${response.status}`;

    throw new Error(errorMessage);
  }

  return data;
};