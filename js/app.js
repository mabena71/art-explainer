// Einstieg: Modus wählen (Demo oder Konto), Datenbank öffnen, Router und Navigation.
import * as db from './db.js';
import { state } from './state.js';
import { cloudConfigured } from './config.js';
import { currentSession } from './cloud.js';
import { stop as stopSpeaking } from './speak.js';
import { icon } from './icons.js';

import scan from './views/scan.js';
import work from './views/work.js';
import explore from './views/explore.js';
import collection from './views/collection.js';
import settings from './views/settings.js';
import login from './views/login.js';

const MODE_KEY = 'kunst.mode';

const routes = [
  [/^\/$/, scan],
  [/^\/w\/([^/]+)$/, work],
  [/^\/explore$/, explore],
  [/^\/sammlung$/, collection],
  [/^\/mehr$/, settings],
  [/^\/login$/, login],
];

const NAV = [
  ['#/', 'camera', 'Scannen', /^\/($|w\/|explore)/],
  ['#/sammlung', 'grid', 'Sammlung', /^\/sammlung/],
  ['#/mehr', 'dots', 'Mehr', /^\/(mehr|login)/],
];

let cleanup = null;

/** Wechselt zwischen Demo und echtem Betrieb und lädt die App neu. */
export function setDemo(on) {
  localStorage.setItem(MODE_KEY, on ? 'demo' : 'cloud');
  location.hash = on ? '#/' : '#/login';
  location.reload();
}

async function decideMode() {
  const params = new URLSearchParams(location.search);
  if (params.has('demo')) localStorage.setItem(MODE_KEY, 'demo');
  if (!cloudConfigured()) { state.demo = true; return; }
  state.demo = localStorage.getItem(MODE_KEY) === 'demo';
  if (!state.demo) {
    try { state.session = await currentSession(); } catch (e) { console.error(e); }
  }
}

function renderNav(path) {
  const nav = document.getElementById('nav');
  nav.hidden = false;
  nav.innerHTML = NAV.map(([href, ic, label, re]) =>
    `<a href="${href}" class="${re.test(path) ? 'active' : ''}">${icon(ic)}<span>${label}</span></a>`).join('');
  document.getElementById('demo-banner').hidden = !state.demo;
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
  await db.open(state.demo ? 'kunst-demo' : 'kunst');
  db.persist();
  window.addEventListener('hashchange', route);
  await route();
  if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('Service Worker:', e));
  }
}

start();
