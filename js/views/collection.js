// Sammlung mit drei Reitern: Werke (Suche, Filter), Besuche (Museums-Modus), Erfolge (Abzeichen).
import * as db from '../db.js';
import { groupVisits } from '../visit.js';
import { badges } from '../rewards.js';
import { esc, fmtDay } from '../ui.js';
import { icon } from '../icons.js';
import { card } from './scan.js';

const TABS = [['werke', 'Werke'], ['besuche', 'Besuche'], ['erfolge', 'Erfolge']];

export default async function collection(el, { params }) {
  const all = await db.allScans();
  const tab = TABS.some(([k]) => k === params.tab) ? params.tab : 'werke';

  el.innerHTML = `
    <div class="pad-x">
      <h1 class="display page-title">Meine Sammlung</h1>
      <div class="seg tabs" role="tablist">
        ${TABS.map(([k, l]) => `<a role="tab" href="#/sammlung?tab=${k}" class="${k === tab ? 'on' : ''}" aria-selected="${k === tab}">${l}</a>`).join('')}
      </div>
      <div data-body></div>
    </div>`;
  const body = el.querySelector('[data-body]');
  if (tab === 'besuche') return renderVisits(body, all);
  if (tab === 'erfolge') return renderBadges(body, all);
  return renderWorks(body, all);
}

function renderWorks(el, all) {
  if (!all.length) {
    el.innerHTML = `<div class="empty"><p>Noch nichts entdeckt.</p><a class="btn" href="#/">${icon('camera')}<span>Erstes Kunstwerk fotografieren</span></a></div>`;
    return;
  }
  const epochs = [...new Set(all.map(s => s.analysis?.epoche).filter(Boolean))].sort();
  let q = '', filter = '';
  el.innerHTML = `
    <label class="search">${icon('search')}<input type="search" placeholder="Titel, Künstler, Ort, Notiz …" data-q></label>
    <div class="chips scroll-x">
      <button class="chip on" data-f="">Alle (${all.length})</button>
      <button class="chip" data-f="fav">${icon('star')} Favoriten</button>
      ${epochs.map(e => `<button class="chip" data-f="e:${esc(e)}">${esc(e)}</button>`).join('')}
    </div>
    <div class="grid" data-list></div>`;
  const list = el.querySelector('[data-list]');
  const render = () => {
    const needle = q.toLowerCase();
    const shown = all.filter(s => {
      const a = s.analysis || {};
      if (filter === 'fav' && !s.fav) return false;
      if (filter.startsWith('e:') && a.epoche !== filter.slice(2)) return false;
      if (!needle) return true;
      return [a.titel, a.kuenstler, a.epoche, a.standort, a.jahr, s.note, s.visit?.name].join(' ').toLowerCase().includes(needle);
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

function renderVisits(el, all) {
  const visits = groupVisits(all);
  if (!visits.length) {
    el.innerHTML = `<div class="empty"><p>Noch keine Museumsbesuche.</p><p class="muted small">Starte auf der Startseite einen Besuch – alle Werke, die du dann scannst, landen hier gemeinsam.</p><a class="btn" href="#/">${icon('museum')}<span>Zur Startseite</span></a></div>`;
    return;
  }
  el.innerHTML = `<div class="visits">${visits.map(v => `
    <a class="visit-card" href="#/besuch/${v.id}">
      <div class="thumbs">${v.scans.slice(0, 3).map(s => `<img src="${s.thumb || 'icons/icon-192.png'}" alt="" loading="lazy">`).join('')}</div>
      <div><strong>${esc(v.name)}</strong><br><span class="muted small">${esc(fmtDay(v.date))} · ${v.scans.length} ${v.scans.length === 1 ? 'Werk' : 'Werke'}</span></div>
    </a>`).join('')}</div>`;
}

function renderBadges(el, all) {
  const list = badges(all);
  const done = list.filter(b => b.done).length;
  el.innerHTML = `
    <p class="muted">${done} von ${list.length} Abzeichen</p>
    <div class="badges">${list.map(b => `
      <div class="badge ${b.done ? 'done' : ''}">
        <span class="emoji">${b.emoji}</span>
        <strong>${esc(b.title)}</strong>
        <span class="muted small">${esc(b.desc)}</span>
        ${b.done ? '' : `<span class="bar"><span style="width:${Math.round(100 * b.progress / b.goal)}%"></span></span><span class="muted small">${b.progress} / ${b.goal}</span>`}
      </div>`).join('')}</div>`;
}
