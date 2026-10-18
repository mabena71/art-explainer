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

export const putScan = scan => tx('scans', 'readwrite', s => s.put({ ...scan, updated_at: new Date().toISOString() }));
export const getScan = id => tx('scans', 'readonly', s => s.get(id));
export const deleteScan = id => tx('scans', 'readwrite', s => s.delete(id));
export async function allScans() {
  const list = await tx('scans', 'readonly', s => s.getAll());
  return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export const getArticle = key => tx('articles', 'readonly', s => s.get(key));
export const putArticle = (key, article) => tx('articles', 'readwrite', s => s.put({ key, article, created_at: new Date().toISOString() }));

export async function wipe() {
  await tx('scans', 'readwrite', s => s.clear());
  await tx('articles', 'readwrite', s => s.clear());
}

/** Bittet den Browser, die Daten nicht automatisch zu löschen. */
export function persist() {
  try { navigator.storage?.persist?.(); } catch { /* egal */ }
}
