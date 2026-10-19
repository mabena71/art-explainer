// Speicher auf dem Gerät (IndexedDB): Sammlung und zwischengespeicherte Stöber-Artikel.
// Demo und echter Betrieb haben getrennte Datenbanken.
const VERSION = 1;
let dbp = null;
let dbName = null;

export function open(name) {
  if (dbp && dbName === name) return dbp;
  dbName = name;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(name, VERSION);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains('scans')) d.createObjectStore('scans', { keyPath: 'id' }).createIndex('created_at', 'created_at');
      if (!d.objectStoreNames.contains('articles')) d.createObjectStore('articles', { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

async function tx(store, mode, fn) {
  const d = await dbp;
  return new Promise((resolve, reject) => {
    const t = d.transaction(store, mode);
    const r = fn(t.objectStore(store));
    t.oncomplete = () => resolve(r && 'result' in r ? r.result : undefined);
    t.onerror = () => reject(t.error);
  });
}

// Jede eigene Änderung wird als «dirty» markiert und vom Abgleich (sync.js) hochgeladen.
const listeners = new Set();
export const onChange = fn => listeners.add(fn);
const changed = () => listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });

export async function putScan(scan) {
  await tx('scans', 'readwrite', s => s.put({ ...scan, updated_at: new Date().toISOString(), dirty: true }));
  changed();
}
/** Speichert einen Scan unverändert (für Daten vom Server oder nach dem Hochladen). */
export const putRaw = scan => tx('scans', 'readwrite', s => s.put(scan));
export async function getScan(id) {
  const scan = await tx('scans', 'readonly', s => s.get(id));
  return scan && !scan.deleted_at ? scan : null;
}
/** Löschen hinterlässt eine Markierung, damit auch die anderen Geräte davon erfahren. */
export async function deleteScan(id) {
  const old = await tx('scans', 'readonly', s => s.get(id));
  const now = new Date().toISOString();
  await tx('scans', 'readwrite', s => s.put({ id, created_at: old?.created_at || now, updated_at: now, deleted_at: now, dirty: true, photo_path: old?.photo_path || null }));
  changed();
}
async function rawAll() { return tx('scans', 'readonly', s => s.getAll()); }
export async function allScans() {
  const list = (await rawAll()).filter(s => !s.deleted_at);
  return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
}
// dirty fehlt bei Scans aus der Zeit vor dem Abgleich: die gehören auch hochgeladen
export const dirtyScans = async () => (await rawAll()).filter(s => s.dirty !== false);
export const getRaw = id => tx('scans', 'readonly', s => s.get(id));

export const getArticle = key => tx('articles', 'readonly', s => s.get(key));
export const putArticle = (key, article) => tx('articles', 'readwrite', s => s.put({ key, article, created_at: new Date().toISOString() }));

/** Übernimmt einmalig die Scans aus einer älteren Datenbank (z. B. «kunst» vor den Konten pro Person). */
export async function adoptFrom(oldName) {
  const dbs = await indexedDB.databases?.().catch(() => null);
  if (dbs && !dbs.some(d => d.name === oldName)) return 0;
  const old = await new Promise((resolve, reject) => {
    const req = indexedDB.open(oldName, VERSION);
    req.onupgradeneeded = () => req.transaction.abort(); // gab es nicht: nichts anlegen
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
  if (!old || !old.objectStoreNames.contains('scans')) { old?.close(); return 0; }
  const scans = await new Promise(r => { const q = old.transaction('scans').objectStore('scans').getAll(); q.onsuccess = () => r(q.result); q.onerror = () => r([]); });
  old.close();
  for (const sc of scans) if (!(await getRaw(sc.id))) await putRaw({ ...sc, dirty: true });
  return scans.length;
}

export async function wipe() {
  await tx('scans', 'readwrite', s => s.clear());
  await tx('articles', 'readwrite', s => s.clear());
}

/** Bittet den Browser, die Daten nicht automatisch zu löschen. */
export function persist() {
  try { navigator.storage?.persist?.(); } catch { /* egal */ }
}
