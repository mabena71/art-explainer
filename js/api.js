// Einheitlicher Zugang zu den KI-Funktionen: im Demo-Modus feste Antworten, sonst die Edge Function.
import { state } from './state.js';
import { callArt } from './cloud.js';
import { DEMO_ANALYSIS, demoArticle, demoChat } from './demo.js';
import * as db from './db.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

export async function analyze(base64) {
  if (state.demo) { await wait(2500); return structuredClone(DEMO_ANALYSIS); }
  return callArt({ action: 'analyze', image: base64 });
}

/** Stöber-Artikel; jeder wird nur einmal erstellt und dann auf dem Gerät gespeichert. */
export async function explore(art, titel, kontext) {
  const key = `${art}|${titel.toLowerCase()}`;
  const hit = await db.getArticle(key);
  if (hit) return hit.article;
  let article;
  if (state.demo) { await wait(1200); article = demoArticle(titel, art); }
  else article = await callArt({ action: 'explore', art, titel, kontext });
  await db.putArticle(key, article);
  return article;
}

export async function chat(werk, verlauf, frage) {
  if (state.demo) { await wait(1000); return demoChat(frage, werk); }
  return callArt({ action: 'chat', werk, verlauf, frage });
}
