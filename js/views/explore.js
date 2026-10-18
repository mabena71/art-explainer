// Stöbern: Kurzartikel zu einem Querverweis, mit weiteren Querverweisen (endlos weiter).
import { explore as loadArticle } from '../api.js';
import { esc, paras, linkCards, KIND_LABEL, loadingText, factList, lengthSwitch, bindLength } from '../ui.js';
import { icon } from '../icons.js';

export default async function explore(el, { params }) {
  const art = params.art || 'thema';
  const titel = params.t || '';
  const from = params.from || '';
  el.innerHTML = `
    <div class="article">
      <button class="back" data-back>${icon('back')}<span>Zurück</span></button>
      <p class="kicker">${esc(KIND_LABEL[art] || art)}</p>
      <h1 class="display">${esc(titel)}</h1>
      <div class="body"><p class="muted loading-line"></p></div>
    </div>`;
  el.querySelector('[data-back]').onclick = () => history.back();

  const stop = loadingText(el.querySelector('.loading-line'), ['Blättere im Archiv …', 'Schreibe einen kurzen Artikel …', 'Suche weitere Verbindungen …']);
  try {
    const a = await loadArticle(art, titel, from);
    el.querySelector('.display').textContent = a.titel || titel;
    el.querySelector('.body').innerHTML = `
      ${a.untertitel ? `<p class="byline">${esc(a.untertitel)}</p>` : ''}
      ${lengthSwitch()}
      ${paras(a.text)}
      ${a.wusstest_du?.length ? `<section class="facts"><h2>Wusstest du?</h2>${factList(a.wusstest_du, 2)}</section>` : ''}
      <section><h2>Weiterstöbern</h2>${linkCards(a.querverweise, a.titel || titel)}</section>`;
    bindLength(el);
  } catch (e) {
    el.querySelector('.body').innerHTML = `<div class="error"><p><strong>Das hat nicht geklappt.</strong><br>${esc(e.message || e)}</p><button class="btn" data-retry>Nochmals versuchen</button></div>`;
    el.querySelector('[data-retry]').onclick = () => explore(el, { params });
  } finally {
    stop();
  }
}
