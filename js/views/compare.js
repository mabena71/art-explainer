// Zwei Werke vergleichen: erst das zweite Werk wählen, dann erklärt Claude Gemeinsamkeiten und Unterschiede.
import * as db from '../db.js';
import * as api from '../api.js';
import { esc, paras, toast } from '../ui.js';
import { icon } from '../icons.js';

const brief = s => {
  const a = s.analysis || {};
  return { titel: a.titel, kuenstler: a.kuenstler, jahr: a.jahr, epoche: a.epoche, technik: a.technik, kurz: a.kurz, stil: a.stil };
};

export default async function compare(el, { params }) {
  const a = await db.getScan(params.a || '');
  if (!a) { location.hash = '#/sammlung'; return; }
  const back = `<button class="back" data-back>${icon('back')}<span>Zurück</span></button>`;

  // Schritt 1: zweites Werk wählen
  if (!params.b) {
    const others = (await db.allScans()).filter(s => s.id !== a.id);
    el.innerHTML = `<div class="pad-x">${back}
      <h1 class="display page-title">Vergleichen</h1>
      <p>Mit welchem Werk möchtest du <strong>${esc(a.analysis?.titel)}</strong> vergleichen?</p>
      ${others.length ? `<div class="grid">${others.map(s => `
        <a class="card" href="#/vergleich?a=${a.id}&b=${s.id}">
          <img src="${s.thumb || 'icons/icon-192.png'}" alt="" loading="lazy">
          <div class="card-body"><strong>${esc(s.analysis?.titel)}</strong><span class="muted small">${esc([s.analysis?.kuenstler, s.analysis?.jahr].filter(Boolean).join(', '))}</span></div>
        </a>`).join('')}</div>` : '<p class="muted">Du brauchst mindestens ein zweites Werk in der Sammlung.</p>'}
    </div>`;
    el.querySelector('[data-back]').onclick = () => history.back();
    return;
  }

  // Schritt 2: Vergleich anzeigen (wird pro Paar nur einmal erstellt)
  const b = await db.getScan(params.b);
  if (!b) { location.hash = `#/vergleich?a=${a.id}`; return; }
  const key = `compare|${[a.id, b.id].sort().join('|')}`;
  const saved = await db.getArticle(key);
  el.innerHTML = `<div class="pad-x">${back}
    <h1 class="display page-title">Im Vergleich</h1>
    <div class="pair">${[a, b].map(s => `
      <a href="#/w/${s.id}" class="pair-item">
        <img src="${s.thumb || 'icons/icon-192.png'}" alt="">
        <strong>${esc(s.analysis?.titel)}</strong>
        <span class="muted small">${esc([s.analysis?.kuenstler, s.analysis?.jahr].filter(Boolean).join(', '))}</span>
      </a>`).join('<span class="vs">vs.</span>')}</div>
    <section class="box"><div data-text>${saved ? paras(saved.article.text) : '<p class="muted">Claude vergleicht die beiden Werke …</p>'}</div></section>
  </div>`;
  el.querySelector('[data-back]').onclick = () => history.back();
  if (saved) return;
  try {
    const { antwort } = await api.chat({ werk_1: brief(a), werk_2: brief(b) }, [],
      'Vergleiche diese zwei Werke spannend und anschaulich in 3 kurzen Absätzen (mit Leerzeilen getrennt): ' +
      'Was verbindet sie überraschend? Worin unterscheiden sie sich am deutlichsten (Zeit, Stil, Technik, Absicht)? ' +
      'Und worauf soll ich achten, wenn ich die beiden nebeneinander anschaue?');
    await db.putArticle(key, { text: antwort });
    el.querySelector('[data-text]').innerHTML = paras(antwort);
  } catch (e) {
    el.querySelector('[data-text]').innerHTML = `<p class="bad">${esc(e.message || e)}</p>`;
    toast('Vergleich hat nicht geklappt', 'bad');
  }
}
