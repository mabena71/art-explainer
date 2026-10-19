// Museums-Modus: Ein laufender Besuch sammelt alle neuen Scans unter einem Namen (z. B. «Kunsthaus Zürich»).
import { uid } from './ui.js';

const KEY = 'kunst.visit';

export function active() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}

export function startVisit(name) {
  const v = { id: uid(), name: name.trim() || 'Museumsbesuch', started_at: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(v));
  return v;
}

export function endVisit() {
  const v = active();
  localStorage.removeItem(KEY);
  return v;
}

/** Gruppiert Scans nach Besuch, neuester Besuch zuerst. */
export function groupVisits(scans) {
  const map = new Map();
  for (const s of scans) {
    if (!s.visit?.id) continue;
    if (!map.has(s.visit.id)) map.set(s.visit.id, { id: s.visit.id, name: s.visit.name, scans: [] });
    map.get(s.visit.id).scans.push(s);
  }
  const list = [...map.values()];
  for (const v of list) {
    v.scans.sort((a, b) => a.created_at.localeCompare(b.created_at));
    v.date = v.scans[0].created_at;
  }
  return list.sort((a, b) => b.date.localeCompare(a.date));
}
