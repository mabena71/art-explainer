// Kleine Helfer für Oberfläche und Formatierung.
import { prefs } from './state.js';

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Text mit Leerzeilen → Absätze. Im Kurz-Modus ist nur der erste Absatz sichtbar. */
export const paras = text => String(text || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  .map((p, i) => `<p${i ? ' class="long-only"' : ''}>${esc(p)}</p>`).join('');

/** Liste, von der im Kurz-Modus nur die ersten n Einträge sichtbar sind. */
export const factList = (items, n = 3) => `<ul>${(items || []).map((f, i) => `<li${i >= n ? ' class="long-only"' : ''}>${esc(f)}</li>`).join('')}</ul>`;

/** Abschnitt, der im Kurz-Modus zugeklappt ist (antippen zum Öffnen). */
export const fold = (title, body, cls = '') => `<section class="${cls}"><details class="fold"><summary><h2>${title}</h2></summary>${body}</details></section>`;

/** Schalter «Kurz | Ausführlich» (HTML). */
export function lengthSwitch() {
  const short = prefs.short;
  return `<div class="seg" role="group" aria-label="Textmenge">
    <button data-len="short" class="${short ? 'on' : ''}" aria-pressed="${short}">Kurz</button>
    <button data-len="long" class="${short ? '' : 'on'}" aria-pressed="${!short}">Ausführlich</button>
  </div>`;
}

/** Macht Schalter und zuklappbare Abschnitte in el lebendig. */
export function bindLength(el) {
  const apply = () => {
    const short = prefs.short;
    document.body.classList.toggle('short', short);
    el.querySelectorAll('details.fold').forEach(d => { d.open = !short; });
    el.querySelectorAll('[data-len]').forEach(b => {
      const on = (b.dataset.len === 'short') === short;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
    });
  };
  el.querySelectorAll('[data-len]').forEach(b => b.addEventListener('click', () => { prefs.short = b.dataset.len === 'short'; apply(); }));
  apply();
}

const dfDay = new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
export const fmtDay = d => dfDay.format(new Date(d));

export function toast(msg, kind = '') {
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = msg;
  document.getElementById('toasts').append(el);
  setTimeout(() => el.classList.add('out'), 3200);
  setTimeout(() => el.remove(), 3700);
}

export const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const KIND_LABEL = { werk: 'Werk', kuenstler: 'Künstler·in', epoche: 'Epoche', ort: 'Ort', thema: 'Thema' };

/** Kärtchen für Querverweise; führen zur Stöber-Ansicht. */
export function linkCards(list, from = '') {
  return `<div class="links">${(list || []).map(q => `
    <a class="link-card" href="#/explore?art=${encodeURIComponent(q.art)}&t=${encodeURIComponent(q.titel)}${from ? `&from=${encodeURIComponent(from)}` : ''}">
      <span class="kind kind-${esc(q.art)}">${esc(KIND_LABEL[q.art] || q.art)}</span>
      <strong>${esc(q.titel)}</strong>
      <span class="muted small">${esc(q.warum)}</span>
    </a>`).join('')}</div>`;
}

/** Lade-Anzeige mit wechselnden Sätzen; gibt eine Stopp-Funktion zurück. */
export function loadingText(el, lines) {
  let i = 0;
  el.textContent = lines[0];
  const t = setInterval(() => { i = (i + 1) % lines.length; el.textContent = lines[i]; }, 2600);
  return () => clearInterval(t);
}
