// Startseite: Kunstwerk fotografieren oder aus der Galerie wählen, dann analysieren lassen.
import * as db from '../db.js';
import { analyze } from '../api.js';
import { prepare } from '../photo.js';
import { esc, uid, loadingText } from '../ui.js';
import { icon } from '../icons.js';

const LOADING = [
  'Schaue genau hin …',
  'Vergleiche mit Tausenden Werken …',
  'Suche versteckte Details …',
  'Frage die Kunstgeschichte …',
  'Sortiere spannende Querverweise …',
];

export default async function scan(el) {
  const recent = (await db.allScans()).slice(0, 4);
  el.innerHTML = `
    <section class="hero">
      <p class="kicker">Art Explainer</p>
      <h1 class="display">Was siehst du da?</h1>
      <p class="lead">Fotografiere ein Bild, eine Skulptur oder ein Bauwerk – und entdecke, was dahintersteckt.</p>
      <label class="btn btn-big">
        ${icon('camera')}<span>Kunstwerk fotografieren</span>
        <input type="file" accept="image/*" capture="environment" hidden data-pick>
      </label>
      <label class="btn btn-ghost">
        ${icon('image')}<span>Aus der Galerie wählen</span>
        <input type="file" accept="image/*" hidden data-pick>
      </label>
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
      const analysis = await analyze(photo.base64);
      const id = uid();
      await db.putScan({
        id, created_at: new Date().toISOString(),
        photo: photo.blob, thumb: photo.thumb, ratio: photo.ratio,
        analysis, chat: [], fav: false, note: '',
      });
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
    <img src="${s.thumb}" alt="" loading="lazy">
    <div class="card-body">
      <strong>${esc(a.titel)}</strong>
      <span class="muted small">${esc([a.kuenstler, a.jahr].filter(Boolean).join(', '))}</span>
    </div>
    ${s.fav ? `<span class="fav-dot">${icon('star')}</span>` : ''}
  </a>`;
}
