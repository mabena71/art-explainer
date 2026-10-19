// Einstieg: Modus wählen (Demo oder Konto), Datenbank öffnen, Router und Navigation.
import * as db from './db.js';
import { state } from './state.js';
import { cloudConfigured } from './config.js';
import { currentSession } from './cloud.js';
import { stop as stopSpeaking } from './speak.js';
import { icon } from './icons.js';
import * as sync from './sync.js';

import scan from './views/scan.js';
import work from './views/work.js';
import explore from './views/explore.js';
import collection from './views/collection.js';
import settings from './views/settings.js';
import login from './views/login.js';
import visitView from './views/visit.js';
import quiz from './views/quiz.js';
import compare from './views/compare.js';
import mapView from './views/map.js';

// Neuer Name: Der alte Schlüssel «kunst.mode» wurde durch Links mit ?demo dauerhaft auf Demo gesetzt
const MODE_KEY = 'kunst.modus';

const routes = [
  [/^\/$/, scan],
  [/^\/w\/([^/]+)$/, work],
  [/^\/explore$/, explore],
  [/^\/sammlung$/, collection],
  [/^\/mehr$/, settings],
  [/^\/login$/, login],
  [/^\/besuch\/([^/]+)$/, visitView],
  [/^\/quiz$/, quiz],
  [/^\/vergleich$/, compare],
  [/^\/karte$/, mapView],
];

const NAV = [
  ['#/', 'camera', 'Scannen', /^\/($|w\/|explore)/],
  ['#/sammlung', 'grid', 'Sammlung', /^\/(sammlung|besuch|quiz|vergleich|karte)/],
  ['#/mehr', 'dots', 'Mehr', /^\/(mehr|login)/],
];

let cleanup = null;

/** Wechselt zwischen Demo und echtem Betrieb und lädt die App neu. */
export function setDemo(on) {
  localStorage.setItem(MODE_KEY, on ? 'demo' : 'cloud');
  // ohne ?demo neu laden, sonst bliebe die Demo aktiv
  location.replace(location.pathname + (on ? '#/' : '#/login'));
}

async function decideMode() {
  const params = new URLSearchParams(location.search);
  if (!cloudConfigured()) { state.demo = true; return; }
  // ?demo gilt nur für diesen Aufruf; dauerhaft nur über «Demo ansehen» in der App
  state.demo = params.has('demo') || localStorage.getItem(MODE_KEY) === 'demo';
  if (!state.demo) {
    try { state.session = await currentSession(); } catch (e) { console.error(e); }
  }
}

function renderNav(path) {
  const nav = document.getElementById('nav');
  nav.hidden = false;
  nav.innerHTML = NAV.map(([href, ic, label, re]) =>
    `<a href="${href}" class="${re.test(path) ? 'active' : ''}">${icon(ic)}<span>${label}</span></a>`).join('');
  const banner = document.getElementById('demo-banner');
  banner.hidden = !state.demo;
  banner.onclick = () => { location.hash = '#/mehr'; };
}

async function route() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  const params = Object.fromEntries(new URLSearchParams(query));

  if (!state.demo && !state.session && path !== '/login' && path !== '/mehr') { location.hash = '#/login'; return; }

  stopSpeaking();
  if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { console.error(e); } }
  cleanup = null;
  renderNav(path);

  const el = document.getElementById('view');
  for (const [re, view] of routes) {
    const m = path.match(re);
    if (!m) continue;
    try {
      cleanup = await view(el, { args: m.slice(1).map(decodeURIComponent), params });
    } catch (e) {
      console.error(e);
      el.innerHTML = `<div class="pad"><h1>Hoppla</h1><p class="muted">${String(e.message || e)}</p><a class="btn" href="#/">Zum Start</a></div>`;
    }
    window.scrollTo(0, 0);
    return;
  }
  location.hash = '#/';
}

async function start() {
  await decideMode();
  // Pro Person eine eigene Datenbank, damit sich Konten auf demselben Gerät nicht mischen
  await db.open(state.demo ? 'kunst-demo' : state.session ? `kunst-${state.session.user.id}` : 'kunst');
  db.persist();
  if (state.session && !localStorage.getItem('kunst.adopted')) {
    try { await db.adoptFrom('kunst'); localStorage.setItem('kunst.adopted', '1'); } catch (e) { console.warn(e); }
  }
  window.addEventListener('hashchange', route);
  await route();
  if (!state.demo && state.session) {
    // Neue Daten von anderen Geräten: Sammlung neu zeichnen (nicht die Startseite, dort könnte gerade ein Scan laufen)
    sync.onSynced(() => { if (location.hash.startsWith('#/sammlung')) route(); });
    sync.start();
  }
  if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('Service Worker:', e));
  }
}

start();
