// Startseite: Kunstwerk fotografieren oder ein Foto vom Handy wählen, dann analysieren lassen.
// Läuft ein Museumsbesuch, werden neue Scans ihm zugeordnet.
import * as db from '../db.js';
import { analyze } from '../api.js';
import { prepare } from '../photo.js';
import * as visit from '../visit.js';
import { newBadges } from '../rewards.js';
import { currentPosition } from './map.js';
import * as api from '../api.js';
import { esc, uid, loadingText, toast, paras } from '../ui.js';
import { icon } from '../icons.js';
import { findMuseums, locateOnce } from '../nearby.js';

const LOADING = [
  'Schaue genau hin …',
  'Vergleiche mit Tausenden Werken …',
  'Suche versteckte Details …',
  'Frage die Kunstgeschichte …',
  'Sortiere spannende Querverweise …',
];

export default async function scan(el) {
  const all = await db.allScans();
  const recent = all.slice(0, 4);
  const v = visit.active();
  const inVisit = v ? all.filter(s => s.visit?.id === v.id).length : 0;

  el.innerHTML = `
    <section class="hero">
      <p class="kicker">Art Explainer</p>
      <h1 class="display">Was siehst du da?</h1>
      <p class="lead">Fotografiere ein Bild, eine Skulptur oder ein Bauwerk – und entdecke, was dahintersteckt.</p>
      ${v ? `
      <div class="visit-banner">
        <div><span class="muted small">Museumsbesuch läuft</span><br><strong>${esc(v.name)}</strong> · ${inVisit} ${inVisit === 1 ? 'Werk' : 'Werke'}</div>
        <div class="row"><button class="btn btn-small btn-ghost" data-tip>${icon('sparkle')}<span>Was als Nächstes?</span></button><button class="btn btn-small btn-ghost" data-end>Beenden</button></div>
      </div>
      <div class="box tip-box" data-tipbox hidden></div>` : ''}
      <label class="btn btn-big">
        ${icon('camera')}<span>Kunstwerk fotografieren</span>
        <input type="file" accept="image/*" capture="environment" hidden data-pick>
      </label>
      <label class="btn btn-ghost">
        ${icon('image')}<span>Foto vom Handy wählen</span>
        <input type="file" accept="image/*" hidden data-pick>
      </label>
      ${v ? '' : `
      <details class="visit-start">
        <summary>${icon('museum')}<span>Museumsbesuch starten</span></summary>
        <form class="ask" data-visit>
          <input name="name" placeholder="Wo bist du? z. B. Kunsthaus Zürich" maxlength="80" autocomplete="off">
          <button class="btn">Los</button>
        </form>
        <button type="button" class="btn btn-small btn-ghost" data-near>${icon('pin')}<span>Museen in meiner Nähe vorschlagen</span></button>
        <div class="chips" data-nearlist hidden></div>
        <p class="muted small">Alle Werke, die du jetzt scannst, landen gemeinsam im Besuch. Am Schluss gibt es eine Zusammenfassung mit deinen Highlights.</p>
      </details>`}
      <p class="muted small tip">Tipp: Möglichst gerade und ganz aufs Werk, ohne Spiegelung. Ein Foto vom Schild daneben hilft auch.</p>
    </section>
    <section id="busy" class="busy" hidden>
      <div class="busy-photo"><img alt=""><div class="scanline"></div></div>
      <p class="busy-text" aria-live="polite"></p>
    </section>
    ${recent.length ? `
    <section class="recent">
      <h2>Zuletzt entdeckt</h2>
      <div class="grid">${recent.map(card).join('')}</div>
    </section>` : ''}`;

  const hero = el.querySelector('.hero');
  const busy = el.querySelector('#busy');
  let stopText = null;

  el.querySelector('[data-visit]')?.addEventListener('submit', e => {
    e.preventDefault();
    const started = visit.startVisit(e.target.name.value);
    toast(`Besuch «${started.name}» gestartet`);
    scan(el);
  });
  // Museen in der Nähe als Vorschläge; Standort erst nach Tipp auf den Knopf, Fehler bleiben still
  el.querySelector('[data-near]')?.addEventListener('click', async e => {
    const b = e.currentTarget, list = el.querySelector('[data-nearlist]'), input = el.querySelector('[data-visit] input[name=name]');
    b.disabled = true;
    b.querySelector('span').textContent = 'Suche …';
    try {
      const found = (await findMuseums(await locateOnce(), 5)).slice(0, 6);
      if (!found.length) throw new Error('keine');
      list.innerHTML = found.map((m, i) => `<button type="button" class="chip" data-i="${i}">${icon('museum')}<span>${esc(m.name)}</span></button>`).join('');
      list.hidden = false;
      b.hidden = true;
      list.onclick = ev => {
        const c = ev.target.closest('[data-i]');
        if (!c) return;
        input.value = found[c.dataset.i].name;
        list.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === c));
      };
    } catch (x) {
      console.warn('Museen in der Nähe:', x);
      b.hidden = true; // still zurück auf das Textfeld
    }
  });
  // Rundgang-Tipp: was im gleichen Museum als Nächstes passen könnte
  el.querySelector('[data-tip]')?.addEventListener('click', async e => {
    const b = e.currentTarget, box = el.querySelector('[data-tipbox]');
    b.disabled = true;
    box.hidden = false;
    box.innerHTML = '<p class="muted">Claude überlegt …</p>';
    const seen = all.filter(s => s.visit?.id === v.id).map(s => ({ titel: s.analysis?.titel, kuenstler: s.analysis?.kuenstler, epoche: s.analysis?.epoche, favorit: !!s.fav }));
    try {
      const { antwort } = await api.chat({ rundgang: v.name, bisher_gesehen: seen }, [],
        `Ich bin gerade im Museum «${v.name}». Was sollte ich mir als Nächstes ansehen? Schlage 2–3 konkrete Werke oder Räume vor, die es dort wirklich gibt und die zu dem passen, was ich bisher gesehen und gemocht habe. ` +
        'Kurz, je ein Satz Begründung. Wenn du die Sammlung dieses Museums nicht sicher kennst, sag das und gib allgemeine Tipps.');
      box.innerHTML = paras(antwort);
    } catch (x) {
      box.innerHTML = `<p class="bad">${esc(x.message || x)}</p>`;
    } finally { b.disabled = false; }
  });
  el.querySelector('[data-end]')?.addEventListener('click', () => {
    const ended = visit.endVisit();
    if (ended && inVisit) location.hash = `#/besuch/${ended.id}`;
    else { toast('Besuch beendet'); scan(el); }
  });

  el.querySelectorAll('[data-pick]').forEach(input => input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    hero.hidden = true;
    el.querySelector('.recent')?.setAttribute('hidden', '');
    busy.hidden = false;
    busy.querySelector('.error')?.remove();
    try {
      const photo = await prepare(file);
      busy.querySelector('img').src = photo.thumb;
      stopText = loadingText(busy.querySelector('.busy-text'), LOADING);
      const where = currentPosition(); // läuft parallel zur Analyse
      const analysis = await analyze(photo.base64, visit.active()?.name || '');
      const pos = await where;
      const id = uid();
      const current = visit.active();
      await db.putScan({
        id, created_at: new Date().toISOString(),
        photo: photo.blob, thumb: photo.thumb, ratio: photo.ratio,
        analysis, chat: [], fav: false, note: '',
        visit: current ? { id: current.id, name: current.name } : null,
        lat: pos?.lat ?? null, lng: pos?.lng ?? null,
      });
      for (const b of newBadges(all, await db.allScans())) toast(`${b.emoji} Neues Abzeichen: ${b.title}`);
      location.hash = `#/w/${id}`;
    } catch (e) {
      console.error(e);
      busy.querySelector('.busy-text').textContent = '';
      busy.insertAdjacentHTML('beforeend', `
        <div class="error">
          <p><strong>Das hat nicht geklappt.</strong><br>${esc(e.message || e)}</p>
          <button class="btn" data-retry>Nochmals versuchen</button>
        </div>`);
      busy.querySelector('[data-retry]').onclick = () => { busy.hidden = true; hero.hidden = false; };
    } finally {
      stopText?.();
    }
  }));

  return () => stopText?.();
}

export function card(s) {
  const a = s.analysis || {};
  return `<a class="card" href="#/w/${s.id}">
    <img src="${s.thumb || 'icons/icon-192.png'}" alt="" loading="lazy">
    <div class="card-body">
      <strong>${esc(a.titel)}</strong>
      <span class="muted small">${esc([a.kuenstler, a.jahr].filter(Boolean).join(', '))}</span>
    </div>
    ${s.fav ? `<span class="fav-dot">${icon('star')}</span>` : ''}
  </a>`;
}
