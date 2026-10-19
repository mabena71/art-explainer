// Mehr: Konto, Kinder-Modus, Vorlesen, Demo, Daten, Version.
import * as db from '../db.js';
import { state, prefs } from '../state.js';
import { cloudConfigured } from '../config.js';
import { signOut } from '../cloud.js';
import * as sync from '../sync.js';
import { setDemo } from '../app.js';
import { APP_VERSION } from '../version.js';
import { esc, toast } from '../ui.js';
import * as voice from '../speak.js';

export default async function settings(el) {
  const rate = localStorage.getItem('kunst.rate') || '1';
  el.innerHTML = `
    <div class="pad-x settings">
      <h1 class="display page-title">Mehr</h1>

      <section class="box">
        <h2>Konto</h2>
        ${state.demo
          ? `<p>Du bist im <strong>Demo-Modus</strong>. Jedes Foto wird als Van Goghs «Sternennacht» erkannt; es entstehen keine Kosten.</p>
             ${cloudConfigured() ? '<button class="btn" data-demo-off>Mit Konto anmelden</button>' : '<p class="muted small">Die Verbindung zu Claude ist noch nicht eingerichtet (siehe TODO.md).</p>'}`
          : state.session
            ? `<p>Angemeldet als <strong>${esc(state.session.user.email)}</strong>.</p>
               <button class="btn btn-ghost" data-logout>Abmelden</button>
               <button class="btn btn-ghost" data-demo-on>Demo ansehen</button>`
            : '<a class="btn" href="#/login">Anmelden</a>'}
      </section>

      <section class="box">
        <h2>Darstellung</h2>
        <label class="switch"><input type="checkbox" data-kids ${prefs.kids ? 'checked' : ''}><span>Kinder-Modus: einfache Erklärung und Suchaufgabe zu jedem Werk</span></label>
      </section>

      <section class="box">
        <h2>Design ausprobieren</h2>
        <div class="themes">
          ${[['', 'Bisher', 'icons/favicon.png'], ['1', '1 Bunt', 'icons/k1-fav-64.png'], ['2', '2 Dunkel, edel', 'icons/k2-fav-64.png'], ['3', '3 Hell, minimal', 'icons/k3-fav-64.png'], ['4', '4 Natürlich', 'icons/k4-fav-64.png']]
            .map(([v, l, img]) => `<button class="theme-pick ${(document.documentElement.dataset.theme || '') === v ? 'on' : ''}" data-theme-pick="${v}"><img src="${img}" alt=""><span>${l}</span></button>`).join('')}
        </div>
        <p class="muted small">Vorübergehend zum Testen. Hell/Dunkel folgt dem Handy.</p>
      </section>

      ${voice.supported() ? `
      <section class="box">
        <h2>Vorlesen</h2>
        <label class="field"><span>Tempo</span>
          <select data-rate>
            ${[['0.85', 'gemütlich'], ['1', 'normal'], ['1.15', 'zügig']].map(([v, l]) => `<option value="${v}" ${v === rate ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </label>
        <button class="btn btn-ghost" data-test-voice>Probe hören</button>
        <p class="muted small">Vorläufig mit der Stimme des Geräts. Eine natürlichere Stimme folgt.</p>
      </section>` : ''}

      <section class="box">
        <h2>Daten</h2>
        ${!state.demo && state.session ? `
        <p class="muted small">Die Sammlung ist in deinem Konto gespeichert und erscheint auf all deinen Geräten.</p>
        <button class="btn btn-ghost" data-sync>Jetzt abgleichen</button>
        <button class="btn btn-ghost" data-wipe>Gerätespeicher neu laden</button>` : `
        <p class="muted small">Die Sammlung ist auf diesem Gerät gespeichert.</p>
        <button class="btn btn-ghost btn-danger" data-wipe>Sammlung auf diesem Gerät löschen</button>`}
      </section>

      <p class="muted small center">Art Explainer · Version ${APP_VERSION}</p>
    </div>`;

  el.querySelectorAll('[data-theme-pick]').forEach(b => b.onclick = () => {
    try { localStorage.setItem('kunst.theme', b.dataset.themePick); } catch {}
    location.reload();
  });
  el.querySelector('[data-kids]').onchange = e => { prefs.kids = e.target.checked; toast(e.target.checked ? 'Kinder-Modus an' : 'Kinder-Modus aus'); };
  el.querySelector('[data-rate]')?.addEventListener('change', e => localStorage.setItem('kunst.rate', e.target.value));
  el.querySelector('[data-test-voice]')?.addEventListener('click', () => voice.speak('Grüezi! So klinge ich, wenn ich dir ein Kunstwerk erkläre.'));
  el.querySelector('[data-demo-off]')?.addEventListener('click', () => setDemo(false));
  el.querySelector('[data-demo-on]')?.addEventListener('click', () => setDemo(true));
  el.querySelector('[data-logout]')?.addEventListener('click', async () => {
    await signOut();
    state.session = null;
    location.hash = '#/login';
  });
  el.querySelector('[data-sync]')?.addEventListener('click', async e => {
    e.target.disabled = true;
    const n = await sync.sync();
    e.target.disabled = false;
    toast(n ? `${n} Änderung(en) geholt` : 'Alles auf dem neuesten Stand');
  });
  el.querySelector('[data-wipe]').onclick = async () => {
    if (!state.demo && state.session) {
      // Noch nicht hochgeladene Änderungen zuerst sichern, dann alles frisch vom Konto holen
      await sync.sync();
      await db.wipe();
      sync.resetPull();
      const n = await sync.sync();
      toast(`${n} Werke neu geladen`);
      return;
    }
    if (!confirm('Alle Werke dieser Sammlung auf diesem Gerät löschen? Das lässt sich nicht rückgängig machen.')) return;
    await db.wipe();
    toast('Sammlung gelöscht');
  };
}
