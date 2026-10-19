// Quiz aus der eigenen Sammlung: 5 Fragen zu Künstler, Epoche und Entstehungszeit, mit Bild.
import * as db from '../db.js';
import { esc, toast } from '../ui.js';
import { icon } from '../icons.js';

const ROUND = 5;
// Falls die Sammlung zu wenig verschiedene Antworten hergibt, kommen diese als falsche Antworten dazu
const FILL = {
  kuenstler: ['Claude Monet', 'Rembrandt van Rijn', 'Frida Kahlo', 'Pablo Picasso', 'Paul Klee', 'Ferdinand Hodler', 'Leonardo da Vinci', 'Gustav Klimt', 'Alberto Giacometti', 'Johannes Vermeer'],
  epoche: ['Renaissance', 'Barock', 'Romantik', 'Impressionismus', 'Expressionismus', 'Kubismus', 'Surrealismus', 'Pop Art', 'Gotik', 'Klassizismus'],
};

const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const norm = x => String(x || '').trim().toLowerCase();
const yearOf = j => { const m = String(j || '').match(/\d{3,4}/); return m ? Number(m[0]) : null; };
const known = v => v && !/unbekannt|vermutlich/i.test(v);

function options(right, pool, fill) {
  const wrong = shuffle([...new Set([...pool, ...fill].filter(x => known(x) && norm(x) !== norm(right)))]).slice(0, 3);
  return shuffle([right, ...wrong]);
}

/** Baut bis zu 5 Fragen aus der Sammlung. */
function makeQuestions(scans) {
  const qs = [];
  const artists = scans.map(s => s.analysis?.kuenstler).filter(known);
  const epochs = scans.map(s => s.analysis?.epoche).filter(known);
  for (const s of shuffle(scans)) {
    const a = s.analysis || {};
    const kinds = shuffle(['kuenstler', 'epoche', 'jahr']).filter(k => (k === 'jahr' ? yearOf(a.jahr) : known(a[k])));
    const kind = kinds[0];
    if (!kind) continue;
    if (kind === 'kuenstler') qs.push({ scan: s, q: 'Wer hat dieses Werk geschaffen?', right: a.kuenstler, opts: options(a.kuenstler, artists, FILL.kuenstler) });
    if (kind === 'epoche') qs.push({ scan: s, q: 'Zu welcher Epoche gehört dieses Werk?', right: a.epoche, opts: options(a.epoche, epochs, FILL.epoche) });
    if (kind === 'jahr') {
      const y = yearOf(a.jahr);
      const right = `um ${Math.round(y / 10) * 10}`;
      const spread = shuffle([-150, -80, -40, 40, 80, 150]).slice(0, 3).map(d => `um ${Math.round((y + d) / 10) * 10}`);
      qs.push({ scan: s, q: 'Wann ist dieses Werk ungefähr entstanden?', right, opts: shuffle([right, ...spread]) });
    }
    if (qs.length === ROUND) break;
  }
  return qs;
}

export default async function quiz(el) {
  const scans = await db.allScans();
  if (scans.length < 3) {
    el.innerHTML = `<div class="pad-x"><button class="back" data-back>${icon('back')}<span>Zurück</span></button>
      <h1 class="display page-title">Quiz</h1>
      <p>Für ein Quiz brauchst du mindestens <strong>3 Werke</strong> in deiner Sammlung. Du hast ${scans.length}.</p>
      <a class="btn" href="#/">${icon('camera')}<span>Kunstwerk fotografieren</span></a></div>`;
    el.querySelector('[data-back]').onclick = () => history.back();
    return;
  }
  const qs = makeQuestions(scans);
  let i = 0, score = 0;

  const render = () => {
    if (i >= qs.length) {
      const best = Number(localStorage.getItem('kunst.quizBest') || 0);
      if (score > best) localStorage.setItem('kunst.quizBest', String(score));
      el.innerHTML = `<div class="pad-x quiz">
        <h1 class="display page-title">Geschafft!</h1>
        <p class="score">${score} von ${qs.length}</p>
        <p class="lead">${score === qs.length ? 'Perfekt – du kennst deine Sammlung!' : score >= qs.length / 2 ? 'Gut gemacht!' : 'Da geht noch was – nochmals?'}</p>
        <p class="muted small">Bester Durchgang: ${Math.max(score, best)} von ${qs.length}</p>
        <div class="row"><button class="btn" data-again>Nochmals spielen</button><a class="btn btn-ghost" href="#/sammlung">Zur Sammlung</a></div>
      </div>`;
      el.querySelector('[data-again]').onclick = () => quiz(el);
      return;
    }
    const q = qs[i];
    el.innerHTML = `<div class="pad-x quiz">
      <div class="row spread"><button class="back" data-back>${icon('back')}<span>Abbrechen</span></button><span class="muted small">Frage ${i + 1} von ${qs.length} · ${score} Punkte</span></div>
      <img class="quiz-img" src="${q.scan.thumb || 'icons/icon-192.png'}" alt="">
      <h2>${esc(q.q)}</h2>
      <div class="answers">${q.opts.map(o => `<button class="answer" data-a="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      <p class="feedback" data-fb></p>
    </div>`;
    el.querySelector('[data-back]').onclick = () => history.back();
    el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const ok = norm(b.dataset.a) === norm(q.right);
      if (ok) score++;
      el.querySelectorAll('[data-a]').forEach(x => {
        x.disabled = true;
        if (norm(x.dataset.a) === norm(q.right)) x.classList.add('right');
      });
      if (!ok) b.classList.add('wrong');
      el.querySelector('[data-fb]').innerHTML = `${ok ? '✓ Richtig!' : `✗ Richtig wäre: ${esc(q.right)}`}<br><span class="muted small">${esc(q.scan.analysis?.titel)}</span>
        <br><button class="btn" data-next>${i + 1 < qs.length ? 'Weiter' : 'Ergebnis'}</button>`;
      el.querySelector('[data-next]').onclick = () => { i++; render(); };
    });
  };
  if (qs.length < 3) { toast('Zu wenig Angaben für ein Quiz'); history.back(); return; }
  render();
}
