export interface ApiRequestOptions {
  fetchFn?: typeof fetch;
  cookieHeader?: string | null;
  baseUrl?: string;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function getDefaultBaseUrl(isServer: boolean): string {
  if (!isServer) return '';
  return process.env.API_INTERNAL_URL || 'http://localhost:3001';
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {}
): Promise<T> {
  const isServer = typeof window === 'undefined';
  const fetchFn = options.fetchFn ?? fetch;
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl(isServer);
  const url = `${baseUrl}${path}`;

  const headers = new Headers(init.headers);
  if (isServer && options.cookieHeader) {
    headers.set('cookie', options.cookieHeader);
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const response = await fetchFn(url, {
    ...init,
    headers,
    credentials: 'include'
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}`);
    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}
