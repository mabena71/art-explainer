// Anmelden mit E-Mail und Passwort (Konten legt Maurice in Supabase an; Registrierung ist aus).
import { state } from '../state.js';
import { signIn } from '../cloud.js';
import { setDemo } from '../app.js';
import { esc } from '../ui.js';

export default async function login(el) {
  if (state.demo) { location.hash = '#/mehr'; return; }
  el.innerHTML = `
    <div class="pad-x login">
      <p class="kicker">Art Explainer</p>
      <h1 class="display">Willkommen</h1>
      <p class="lead">Melde dich an, um Kunstwerke zu entdecken.</p>
      <form class="stack" data-form>
        <label class="field"><span>E-Mail</span><input type="email" name="email" autocomplete="username" required></label>
        <label class="field"><span>Passwort</span><input type="password" name="password" autocomplete="current-password" required></label>
        <p class="bad small" data-err hidden></p>
        <button class="btn btn-big">Anmelden</button>
      </form>
      <button class="btn btn-ghost" data-demo>Demo ansehen (ohne Claude, jedes Foto = «Sternennacht»)</button>
    </div>`;
  const form = el.querySelector('[data-form]');
  const err = el.querySelector('[data-err]');
  form.onsubmit = async e => {
    e.preventDefault();
    err.hidden = true;
    form.querySelector('button').disabled = true;
    try {
      state.session = await signIn(form.email.value.trim(), form.password.value);
      location.hash = '#/';
    } catch (x) {
      err.innerHTML = esc(x.message || x);
      err.hidden = false;
    } finally {
      form.querySelector('button').disabled = false;
    }
  };
  el.querySelector('[data-demo]').onclick = () => setDemo(true);
}
