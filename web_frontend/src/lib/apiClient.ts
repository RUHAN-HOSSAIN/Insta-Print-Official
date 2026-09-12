import {
  getActiveSupabaseClient,
  refreshSupabaseSessionIfNeeded,
} from './supabase';

const AUTH_EXPIRED_EVENT = 'auth:expired';

export async function getAccessToken(): Promise<string> {
  const client = getActiveSupabaseClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (!data.session) {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    throw new Error('No active session found. Please sign in again.');
  }

  return data.session.access_token;
}

export async function refreshAndRetryIfNeeded<T>(
  request: () => Promise<T>,
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    if (!message.toLowerCase().includes('session') && !message.toLowerCase().includes('unauthorized')) {
      throw new Error(message, { cause: error });
    }

    const refreshed = await refreshSupabaseSessionIfNeeded();
    if (!refreshed) {
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
      throw new Error('Your session has expired. Please sign in again.', { cause: error });
    }

    return await request();
  }
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers ?? {});

  if (!headers.has('Authorization')) {
    const token = await getAccessToken();
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestOptions: RequestInit = {
    ...init,
    headers,
  };

  const response = await fetch(input, requestOptions);

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshSupabaseSessionIfNeeded();
  if (!refreshed) {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    throw new Error('Your session has expired. Please sign in again.');
  }

  const retryHeaders = new Headers(init.headers ?? {});
  retryHeaders.set('Authorization', `Bearer ${refreshed}`);

  return fetch(input, {
    ...init,
    headers: retryHeaders,
  });
}
