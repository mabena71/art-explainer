// Login und Aufrufe der Edge Function "art" über Supabase.
import { SUPABASE_URL, SUPABASE_ANON_KEY, ART_FUNCTION, cloudConfigured } from './config.js';

const SUPABASE_ESM = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
let client = null;

export async function getClient() {
  if (client) return client;
  if (!cloudConfigured()) throw new Error('Supabase ist noch nicht eingerichtet.');
  const { createClient } = await import(SUPABASE_ESM);
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'art-explainer-auth' } });
  return client;
}

export async function currentSession() {
  if (!cloudConfigured()) return null;
  const { data } = await (await getClient()).auth.getSession();
  return data.session || null;
}

export async function signIn(email, password) {
  const { data, error } = await (await getClient()).auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message === 'Invalid login credentials' ? 'E-Mail oder Passwort stimmt nicht.' : error.message);
  return data.session;
}

export async function signOut() {
  if (client) await client.auth.signOut();
}

/** Ruft die Edge Function auf und liefert die Antwort oder wirft einen verständlichen Fehler. */
export async function callArt(payload) {
  const c = await getClient();
  const { data, error } = await c.functions.invoke(ART_FUNCTION, { body: payload });
  if (error) {
    let msg = error.message;
    try { const j = await error.context.json(); if (j?.error) msg = j.error; } catch { /* keine Details */ }
    if (/Failed to send|fetch/i.test(msg)) msg = 'Keine Verbindung. Bist du online?';
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
