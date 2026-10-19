// Ein Museumsbesuch: alle Werke des Besuchs und eine Zusammenfassung mit Highlights (von Claude).
import * as db from '../db.js';
import * as api from '../api.js';
import { groupVisits } from '../visit.js';
import { esc, paras, fmtDay, toast } from '../ui.js';
import { icon } from '../icons.js';
import { card } from './scan.js';

export default async function visitView(el, { args: [id] }) {
  const v = groupVisits(await db.allScans()).find(x => x.id === id);
  if (!v) { el.innerHTML = '<div class="pad"><p>Diesen Besuch gibt es nicht (mehr).</p><a class="btn" href="#/sammlung?tab=besuche">Zu den Besuchen</a></div>'; return; }
  const key = `visit|${id}|${v.scans.length}`;
  const saved = await db.getArticle(key);

  el.innerHTML = `
    <div class="pad-x">
      <button class="back" data-back>${icon('back')}<span>Zurück</span></button>
      <p class="kicker">Museumsbesuch · ${esc(fmtDay(v.date))}</p>
      <h1 class="display page-title">${esc(v.name)}</h1>
      <p class="muted">${v.scans.length} ${v.scans.length === 1 ? 'Werk' : 'Werke'} entdeckt${v.scans.some(s => s.fav) ? ` · ${v.scans.filter(s => s.fav).length} Favorit(en)` : ''}</p>
      <section class="box summary">
        <h2>${icon('sparkle')} Dein Besuch in Kürze</h2>
        <div data-summary>${saved ? paras(saved.article.text) : `
          <p class="muted small">Claude fasst deinen Besuch zusammen: rote Fäden, Highlights und ein Tipp für den nächsten Besuch.</p>
          <button class="btn" data-make>Zusammenfassung erstellen</button>`}</div>
      </section>
      <h2>Die Werke</h2>
      <div class="grid">${v.scans.map(card).join('')}</div>
    </div>`;

  el.querySelector('[data-back]').onclick = () => history.back();
  el.querySelector('[data-make]')?.addEventListener('click', async e => {
    e.target.disabled = true;
    e.target.textContent = 'Claude schreibt …';
    const werke = v.scans.map(s => ({
      titel: s.analysis?.titel, kuenstler: s.analysis?.kuenstler, jahr: s.analysis?.jahr, epoche: s.analysis?.epoche,
      favorit: !!s.fav, notiz: s.note || undefined, nachfragen: (s.chat || []).filter(m => m.role === 'user').map(m => m.text),
    }));
    try {
      const { antwort } = await api.chat({ museumsbesuch: v.name, datum: v.date.slice(0, 10), werke }, [],
        'Fasse meinen Museumsbesuch persönlich und lebendig zusammen (2–3 kurze Absätze, mit Leerzeilen getrennt): ' +
        'Welche roten Fäden und Kontraste verbinden die Werke? Was waren meine Highlights (Favoriten und Werke, zu denen ich nachgefragt habe)? ' +
        'Schliesse mit einem konkreten Tipp, was ich mir als Nächstes ansehen könnte.');
      await db.putArticle(key, { text: antwort });
      el.querySelector('[data-summary]').innerHTML = paras(antwort);
    } catch (x) {
      toast(x.message || String(x), 'bad');
      e.target.disabled = false;
      e.target.textContent = 'Nochmals versuchen';
    }
  });
}
