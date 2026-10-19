// Werk-Ansicht: Foto mit versteckten Details, Erklärungen, Querverweise, Vorlesen und Nachfragen.
import * as db from '../db.js';
import * as api from '../api.js';
import * as voice from '../speak.js';
import { prefs } from '../state.js';
import { esc, paras, fmtDay, toast, linkCards, factList, fold, lengthSwitch, bindLength } from '../ui.js';
import { icon } from '../icons.js';
import { shareCard } from '../share.js';

const SICHERHEIT = {
  hoch: '',
  mittel: 'Ziemlich sicher erkannt – aber nicht ganz.',
  niedrig: 'Nicht sicher erkannt. Die Angaben sind Vermutungen; Stil und Bildanalyse gelten trotzdem.',
};

const FRAGEN = ['Warum ist das Werk so berühmt?', 'Was wollte der Künstler damit sagen?', 'Wo kann ich mehr davon sehen?'];

export default async function work(el, { args: [id] }) {
  const scan = await db.getScan(id);
  if (!scan) { el.innerHTML = '<div class="pad"><p>Dieses Werk gibt es nicht mehr.</p><a class="btn" href="#/sammlung">Zur Sammlung</a></div>'; return; }
  const a = scan.analysis;
  const photoUrl = scan.photo ? URL.createObjectURL(scan.photo) : scan.thumb;
  const unsure = SICHERHEIT[a.sicherheit] || '';
  const meta = [['Technik', a.technik], ['Standort', a.standort], ['Epoche', a.epoche], ['Entdeckt', fmtDay(scan.created_at)]].filter(([, v]) => v).map(([k, v]) => [k, esc(v)]);
  if (scan.visit?.id) meta.push(['Besuch', `<a href="#/besuch/${esc(scan.visit.id)}">${esc(scan.visit.name)}</a>`]);

  el.innerHTML = `
    <div class="work">
      <figure class="photo" style="aspect-ratio:${scan.ratio || 'auto'}">
        <img src="${photoUrl}" alt="${esc(a.titel)}">
        ${(a.details || []).map((d, i) => `<button class="hotspot" style="left:${clamp(d.x)}%;top:${clamp(d.y)}%" data-detail="${i}" aria-label="Detail ${i + 1}: ${esc(d.titel)}">${i + 1}</button>`).join('')}
      </figure>

      <header class="work-head">
        <p class="kicker">${esc([a.art_des_werks, a.epoche].filter(Boolean).join(' · '))}</p>
        <h1 class="display">${esc(a.titel)}</h1>
        <p class="byline">${esc([a.kuenstler, a.jahr].filter(Boolean).join(', '))}</p>
        ${unsure ? `<p class="note-unsure">${esc(unsure)}</p>` : ''}
        <div class="row actions">
          ${voice.supported() ? `<button class="btn btn-small" data-read>${icon('play')}<span>Vorlesen</span></button>` : ''}
          <button class="btn btn-small btn-ghost ${scan.fav ? 'on' : ''}" data-fav aria-pressed="${scan.fav}">${icon('star')}<span>Favorit</span></button>
          <button class="btn btn-small btn-ghost" data-share>${icon('share')}<span>Teilen</span></button>
        </div>
        ${lengthSwitch()}
      </header>

      <p class="lead">${esc(a.kurz)}</p>

      ${prefs.kids && a.kinder ? `
      <section class="kids">
        <h2>Für Kinder</h2>
        <p>${esc(a.kinder.text)}</p>
        <p class="task">${icon('search')} ${esc(a.kinder.suchaufgabe)}</p>
      </section>` : ''}

      <section><h2>Überblick</h2>${paras(a.ueberblick)}</section>

      ${a.wusstest_du?.length ? `<section class="facts"><h2>Wusstest du?</h2>${factList(a.wusstest_du)}</section>` : ''}

      ${a.details?.length ? `
      <section><h2>Genau hinschauen</h2>
        <p class="muted small">Tippe auf die Nummern im Foto.</p>
        <ol class="details">${a.details.map((d, i) => `<li id="detail-${i}" data-detail="${i}"><span class="num">${i + 1}</span><div><strong>${esc(d.titel)}</strong><p>${esc(d.text)}</p></div></li>`).join('')}</ol>
      </section>` : ''}

      ${fold('Stil und Technik', paras(a.stil))}

      ${fold('Die Geschichte dahinter', paras(a.geschichte), 'story')}

      ${a.zeitleiste?.length ? fold('Was sonst geschah',
        `<ol class="timeline">${a.zeitleiste.map(t => `<li><span class="year">${esc(t.jahr)}</span><span>${esc(t.ereignis)}</span></li>`).join('')}</ol>`) : ''}

      <section><h2>Weiterstöbern</h2>${linkCards(a.querverweise, a.titel)}</section>

      <section class="chat"><h2>Frag nach</h2>
        <div class="msgs" aria-live="polite"></div>
        <div class="chips">${FRAGEN.map(f => `<button class="chip" data-q="${esc(f)}">${esc(f)}</button>`).join('')}</div>
        <form class="ask">
          <input name="q" placeholder="Deine Frage zum Werk …" autocomplete="off" maxlength="500">
          <button class="btn btn-icon" aria-label="Senden">${icon('send')}</button>
        </form>
      </section>

      <section><h2>Angaben</h2>
        <dl class="meta">${meta.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
        <label class="field"><span>Meine Notiz</span><textarea data-note rows="3" placeholder="z. B. mit wem, wo, was mir gefiel">${esc(scan.note)}</textarea></label>
        <button class="btn btn-ghost btn-danger" data-delete>${icon('trash')}<span>Aus der Sammlung löschen</span></button>
      </section>
    </div>`;

  bindLength(el);

  // Versteckte Details: Nummer im Foto ↔ Text
  el.querySelectorAll('[data-detail]').forEach(b => b.addEventListener('click', () => {
    const i = b.dataset.detail;
    el.querySelectorAll('.active-detail').forEach(x => x.classList.remove('active-detail'));
    el.querySelector(`.hotspot[data-detail="${i}"]`)?.classList.add('active-detail');
    const li = el.querySelector(`#detail-${i}`);
    li.classList.add('active-detail');
    if (b.classList.contains('hotspot')) li.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else el.querySelector('.photo').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  // Vorlesen
  const readBtn = el.querySelector('[data-read]');
  if (readBtn) readBtn.onclick = () => {
    if (voice.speaking()) { voice.stop(); return; }
    const text = prefs.short
      ? [a.titel, a.kurz, String(a.ueberblick || '').split(/\n\s*\n/)[0]].join('\n\n')
      : [a.titel, a.kurz, a.ueberblick, 'Die Geschichte dahinter.', a.geschichte].join('\n\n');
    readBtn.innerHTML = `${icon('stop')}<span>Stopp</span>`;
    voice.speak(text, () => { readBtn.innerHTML = `${icon('play')}<span>Vorlesen</span>`; });
  };

  // Teilen als Bildkarte
  el.querySelector('[data-share]').onclick = async e => {
    const b = e.currentTarget;
    b.disabled = true;
    try {
      const r = await shareCard(scan);
      if (r === 'downloaded') toast('Bildkarte gespeichert');
    } catch (x) {
      toast(x.message || String(x), 'bad');
    } finally { b.disabled = false; }
  };

  // Favorit, Notiz, Löschen
  el.querySelector('[data-fav]').onclick = async e => {
    scan.fav = !scan.fav;
    e.currentTarget.classList.toggle('on', scan.fav);
    e.currentTarget.setAttribute('aria-pressed', scan.fav);
    await db.putScan(scan);
  };
  let noteTimer;
  el.querySelector('[data-note]').addEventListener('input', e => {
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => { scan.note = e.target.value; db.putScan(scan); }, 500);
  });
  el.querySelector('[data-delete]').onclick = async () => {
    if (!confirm('Dieses Werk wirklich aus der Sammlung löschen?')) return;
    await db.deleteScan(scan.id);
    toast('Gelöscht');
    location.hash = '#/sammlung';
  };

  // Nachfragen
  const msgs = el.querySelector('.msgs');
  const form = el.querySelector('.ask');
  const renderChat = () => {
    msgs.innerHTML = scan.chat.map(m => `<div class="msg ${m.role}">${m.role === 'assistant' ? paras(m.text) : esc(m.text)}</div>`).join('');
  };
  renderChat();
  async function ask(q) {
    q = q.trim();
    if (!q) return;
    const verlauf = scan.chat.slice();
    scan.chat.push({ role: 'user', text: q });
    renderChat();
    msgs.insertAdjacentHTML('beforeend', '<div class="msg assistant typing"><span></span><span></span><span></span></div>');
    form.q.disabled = true;
    try {
      const { antwort } = await api.chat(a, verlauf, q);
      scan.chat.push({ role: 'assistant', text: antwort });
      await db.putScan(scan);
    } catch (e) {
      scan.chat.pop();
      form.q.value = q;
      toast(e.message || String(e), 'bad');
    } finally {
      form.q.disabled = false;
      renderChat();
    }
  }
  form.onsubmit = e => { e.preventDefault(); const q = form.q.value; form.q.value = ''; ask(q); };
  el.querySelectorAll('[data-q]').forEach(b => b.onclick = () => ask(b.dataset.q));

  return () => { clearTimeout(noteTimer); if (scan.photo) URL.revokeObjectURL(photoUrl); };
}

const clamp = v => Math.max(3, Math.min(97, Number(v) || 50));
