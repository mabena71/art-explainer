// Sammlung: alle Scans mit Suche und Filtern (Epoche, Favoriten).
import * as db from '../db.js';
import { esc } from '../ui.js';
import { icon } from '../icons.js';
import { card } from './scan.js';

export default async function collection(el) {
  const all = await db.allScans();
  const epochs = [...new Set(all.map(s => s.analysis?.epoche).filter(Boolean))].sort();
  let q = '', filter = '';

  el.innerHTML = `
    <div class="pad-x">
      <h1 class="display page-title">Meine Sammlung</h1>
      ${all.length ? `
      <label class="search">${icon('search')}<input type="search" placeholder="Titel, Künstler, Ort, Notiz …" data-q></label>
      <div class="chips scroll-x">
        <button class="chip on" data-f="">Alle (${all.length})</button>
        <button class="chip" data-f="fav">${icon('star')} Favoriten</button>
        ${epochs.map(e => `<button class="chip" data-f="e:${esc(e)}">${esc(e)}</button>`).join('')}
      </div>
      <div class="grid" data-list></div>` : `
      <div class="empty">
        <p>Noch nichts entdeckt.</p>
        <a class="btn" href="#/">${icon('camera')}<span>Erstes Kunstwerk fotografieren</span></a>
      </div>`}
    </div>`;
  if (!all.length) return;

  const list = el.querySelector('[data-list]');
  const render = () => {
    const needle = q.toLowerCase();
    const shown = all.filter(s => {
      const a = s.analysis || {};
      if (filter === 'fav' && !s.fav) return false;
      if (filter.startsWith('e:') && a.epoche !== filter.slice(2)) return false;
      if (!needle) return true;
      return [a.titel, a.kuenstler, a.epoche, a.standort, a.jahr, s.note].join(' ').toLowerCase().includes(needle);
    });
    list.innerHTML = shown.length ? shown.map(card).join('') : '<p class="muted">Nichts gefunden.</p>';
  };
  render();

  el.querySelector('[data-q]').addEventListener('input', e => { q = e.target.value; render(); });
  el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
    filter = b.dataset.f;
    el.querySelectorAll('[data-f]').forEach(x => x.classList.toggle('on', x === b));
    render();
  });
}
