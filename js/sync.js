// Abgleich der Sammlung zwischen Geräten über Supabase (Tabelle art_scans, Fotos im Bucket art-photos).
// Prinzip: Alles wird zuerst auf dem Gerät gespeichert (db.js) und als «dirty» markiert.
// sync() lädt diese Scans hoch und holt danach, was andere Geräte seit dem letzten Abruf geändert haben.
// Abgerufen wird nach synced_at (Serverzeit, per Trigger), damit falsch gehende Geräteuhren nichts verschlucken.
// Bei Konflikten gewinnt die jüngere Änderung (updated_at).
import * as db from './db.js';
import { state } from './state.js';
import { getClient } from './cloud.js';
import { thumbFromBlob } from './photo.js';

const BUCKET = 'art-photos';
const COLUMNS = ['id', 'created_at', 'updated_at', 'deleted_at', 'photo_path', 'analysis', 'chat', 'note', 'fav', 'visit', 'lat', 'lng'];

let running = null;
let timer = null;
const listeners = new Set();
export const onSynced = fn => { listeners.add(fn); return () => listeners.delete(fn); };

const lastKey = uid => `kunst.lastPull.${uid}`;
export const resetPull = () => { if (state.session) localStorage.removeItem(lastKey(state.session.user.id)); };

async function push(c, uid) {
  for (const scan of await db.dirtyScans()) {
    let photoPath = scan.photo_path;
    if (!scan.deleted_at && scan.photo && !photoPath) {
      photoPath = `${uid}/${scan.id}.jpg`;
      const { error } = await c.storage.from(BUCKET).upload(photoPath, scan.photo, { upsert: true, contentType: 'image/jpeg' });
      if (error) throw error;
    }
    if (scan.deleted_at && photoPath) await c.storage.from(BUCKET).remove([photoPath]);
    const row = { user_id: uid };
    for (const k of COLUMNS) row[k] = scan[k] ?? null;
    row.photo_path = scan.deleted_at ? null : photoPath;
    if (scan.deleted_at) row.analysis = {};
    row.chat = row.chat || [];
    row.fav = !!row.fav;
    const { error } = await c.from('art_scans').upsert(row);
    if (error) throw error;
    // Nur als erledigt markieren, wenn in der Zwischenzeit nichts mehr geändert wurde
    const now = await db.getRaw(scan.id);
    if (now && now.updated_at === scan.updated_at) await db.putRaw({ ...now, photo_path: photoPath || null, dirty: false });
  }
}

async function pull(c, uid) {
  const since = localStorage.getItem(lastKey(uid)) || '1970-01-01T00:00:00Z';
  const { data, error } = await c.from('art_scans').select('*').gt('synced_at', since).order('synced_at');
  if (error) throw error;
  let newest = since;
  let changed = 0;
  for (const row of data) {
    if (row.synced_at > newest) newest = row.synced_at;
    const local = await db.getRaw(row.id);
    if (local && local.updated_at >= row.updated_at) continue;
    if (local?.dirty) continue; // eigene, noch nicht hochgeladene Änderung hat Vorrang
    changed++;
    if (row.deleted_at) {
      await db.putRaw({ id: row.id, created_at: row.created_at, updated_at: row.updated_at, deleted_at: row.deleted_at, dirty: false });
      continue;
    }
    let photo = local?.photo, thumb = local?.thumb, ratio = local?.ratio;
    if (!photo && row.photo_path) {
      const { data: blob, error: e } = await c.storage.from(BUCKET).download(row.photo_path);
      if (!e && blob) ({ photo, thumb, ratio } = await thumbFromBlob(blob));
    }
    const scan = { dirty: false, photo, thumb, ratio };
    for (const k of COLUMNS) scan[k] = row[k];
    scan.chat = scan.chat || [];
    await db.putRaw(scan);
  }
  localStorage.setItem(lastKey(uid), newest);
  return changed;
}

/** Hochladen und Abholen. Läuft nur mit Anmeldung und nie doppelt. */
export function sync() {
  if (state.demo || !state.session || !navigator.onLine) return Promise.resolve(0);
  if (running) return running;
  running = (async () => {
    try {
      const c = await getClient();
      const uid = state.session.user.id;
      await push(c, uid);
      const changed = await pull(c, uid);
      if (changed) listeners.forEach(fn => { try { fn(changed); } catch (e) { console.error(e); } });
      return changed;
    } catch (e) {
      console.warn('Abgleich fehlgeschlagen:', e);
      return 0;
    } finally {
      running = null;
    }
  })();
  return running;
}

/** Abgleich bald ausführen (mehrere Änderungen werden gebündelt). */
export function soon(ms = 1500) {
  clearTimeout(timer);
  timer = setTimeout(sync, ms);
}

export function start() {
  db.onChange(() => soon());
  window.addEventListener('online', () => soon(500));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') soon(300); });
  setInterval(() => { if (document.visibilityState === 'visible') sync(); }, 5 * 60 * 1000);
  soon(300);
}
