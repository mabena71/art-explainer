// Abzeichen: werden jedes Mal aus der Sammlung berechnet, nichts muss extra gespeichert werden.
import { groupVisits } from './visit.js';

const isSculpture = s => /skulptur|plastik|statue|büste|relief|bildhauer/i.test(`${s.analysis?.art_des_werks} ${s.analysis?.technik}`);
const count = (arr, fn) => arr.filter(fn).length;
const distinct = (arr, fn) => new Set(arr.map(fn).filter(Boolean).map(x => String(x).trim().toLowerCase())).size;
const city = s => (s.analysis?.standort || '').split(',').pop();

const DEFS = [
  { id: 'first', emoji: '👁️', title: 'Erster Blick', desc: 'Dein erstes Kunstwerk entdeckt', goal: 1, value: sc => sc.length },
  { id: 'ten', emoji: '🖼️', title: 'Sammler·in', desc: '10 Werke entdeckt', goal: 10, value: sc => sc.length },
  { id: 'quarter', emoji: '🏛️', title: 'Kurator·in', desc: '25 Werke entdeckt', goal: 25, value: sc => sc.length },
  { id: 'epochs3', emoji: '⏳', title: 'Zeitreise', desc: 'Werke aus 3 Epochen', goal: 3, value: sc => distinct(sc, s => s.analysis?.epoche) },
  { id: 'epochs6', emoji: '🧭', title: 'Epochen-Kenner·in', desc: 'Werke aus 6 Epochen', goal: 6, value: sc => distinct(sc, s => s.analysis?.epoche) },
  { id: 'sculpture', emoji: '🗿', title: 'Rundum-Blick', desc: 'Eine Skulptur entdeckt', goal: 1, value: sc => count(sc, isSculpture) },
  { id: 'mystery', emoji: '🔍', title: 'Rätselfreund·in', desc: 'Ein Werk, das nicht sicher bestimmbar war', goal: 1, value: sc => count(sc, s => s.analysis && (s.analysis.erkannt === false || s.analysis.sicherheit === 'niedrig')) },
  { id: 'visit1', emoji: '🎟️', title: 'Museumsgänger·in', desc: 'Einen Museumsbesuch gemacht', goal: 1, value: sc => groupVisits(sc).length },
  { id: 'visit5', emoji: '🎫', title: 'Stammgast', desc: '5 Museumsbesuche', goal: 5, value: sc => groupVisits(sc).length },
  { id: 'cities', emoji: '🌍', title: 'Weltenbummler·in', desc: 'Werke in 3 verschiedenen Städten', goal: 3, value: sc => distinct(sc, city) },
  { id: 'curious', emoji: '💬', title: 'Neugierig', desc: '10 Nachfragen gestellt', goal: 10, value: sc => sc.reduce((n, s) => n + count(s.chat || [], m => m.role === 'user'), 0) },
  { id: 'favs', emoji: '⭐', title: 'Herzstücke', desc: '5 Favoriten markiert', goal: 5, value: sc => count(sc, s => s.fav) },
];

/** Alle Abzeichen mit Fortschritt. */
export function badges(scans) {
  return DEFS.map(d => {
    const v = d.value(scans);
    return { ...d, progress: Math.min(v, d.goal), done: v >= d.goal };
  });
}

/** Abzeichen, die zwischen zwei Ständen der Sammlung neu dazugekommen sind. */
export function newBadges(before, after) {
  const had = new Set(badges(before).filter(b => b.done).map(b => b.id));
  return badges(after).filter(b => b.done && !had.has(b.id));
}
