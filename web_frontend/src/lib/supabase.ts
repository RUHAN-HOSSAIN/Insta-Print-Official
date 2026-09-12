import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env vars are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable session persistence and refresh.',
  );
}

const makeClient = (rememberMe: boolean) =>
  createClient(
    supabaseUrl ?? 'https://placeholder.supabase.co',
    supabaseAnonKey ?? 'placeholder-key',
    {
      auth: {
        persistSession: rememberMe,
        autoRefreshToken: true,
        storage: rememberMe ? localStorage : sessionStorage,
        detectSessionInUrl: true,
      },
    },
  );

export const supabasePersistent = makeClient(true);
export const supabaseSessionOnly = makeClient(false);

export const getRememberMePreference = (): boolean => {
  return localStorage.getItem('auth_remember_me') === 'true';
};

export const setRememberMePreference = (rememberMe: boolean) => {
  localStorage.setItem('auth_remember_me', String(rememberMe));
};

export const clearRememberMePreference = () => {
  localStorage.removeItem('auth_remember_me');
};

export const getActiveSupabaseClient = () => {
  return getRememberMePreference() ? supabasePersistent : supabaseSessionOnly;
};

export async function refreshSupabaseSessionIfNeeded() {
  const client = getActiveSupabaseClient();
  const { data, error } = await client.auth.getSession();

  if (error || !data.session) {
    return null;
  }

  const expiresAtMs = (data.session.expires_at ?? 0) * 1000;
  if (Date.now() >= expiresAtMs - 30_000) {
    const refreshed = await client.auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) {
      return null;
    }
    return refreshed.data.session.access_token;
  }

  return data.session.access_token;
}
