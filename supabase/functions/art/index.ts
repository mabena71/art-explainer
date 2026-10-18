// Edge Function "art": alle KI-Aufrufe der App an einer Stelle.
// POST { action: 'analyze', image: <base64 JPEG>, kids?: boolean }  → Analyse des Werks (JSON)
// POST { action: 'explore', art, titel, kontext? }                   → Kurzartikel zu einem Querverweis (JSON)
// POST { action: 'chat', werk: <Analyse>, verlauf: [{role, text}], frage } → Antwort als Text
// Nur mit Login der App. "Verify JWT" darf eingeschaltet bleiben.
// Secrets: ANTHROPIC_API_KEY (Pflicht), optional CLAUDE_MODEL (Standard claude-opus-5-5), DAILY_LIMIT (Standard 40 Aufrufe pro Person und Tag).
import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const claude = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });
const MODEL = Deno.env.get('CLAUDE_MODEL') || 'claude-opus-5-5';
const DAILY_LIMIT = Number(Deno.env.get('DAILY_LIMIT') || 40);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const STIL = `Schreibe auf Deutsch in Schweizer Schreibweise: nie «ß», immer «ss». Anführungszeichen «so».
Schreibe lebendig, anschaulich und konkret wie eine gute Museumsführerin, ohne Floskeln. Fakten müssen stimmen:
Was du nicht sicher weisst, kennzeichnest du («vermutlich», «wird oft … zugeschrieben») oder lässt es weg. Erfinde nie Titel, Daten, Masse oder Standorte.`;

// Gemeinsamer Baustein: Querverweise zum Antippen
const QUERVERWEISE = {
  type: 'array',
  description: '5–8 spannende Querverweise zum Weiterstöbern, möglichst abwechslungsreich (Werke, Künstler, Epochen, Orte, Themen).',
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['art', 'titel', 'warum'],
    properties: {
      art: { type: 'string', enum: ['werk', 'kuenstler', 'epoche', 'ort', 'thema'] },
      titel: { type: 'string', description: 'Kurzer Name, z. B. «Der Schrei (Edvard Munch, 1893)» oder «Post-Impressionismus»' },
      warum: { type: 'string', description: 'Ein Satz: was die Verbindung so spannend macht' },
    },
  },
};

const ANALYSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['erkannt', 'sicherheit', 'art_des_werks', 'titel', 'kuenstler', 'jahr', 'epoche', 'technik', 'standort', 'kurz', 'ueberblick', 'wusstest_du', 'details', 'stil', 'geschichte', 'zeitleiste', 'querverweise', 'kinder'],
  properties: {
    erkannt: { type: 'boolean', description: 'true, wenn du das konkrete Werk identifizieren kannst' },
    sicherheit: { type: 'string', enum: ['hoch', 'mittel', 'niedrig'] },
    art_des_werks: { type: 'string', description: 'z. B. Gemälde, Skulptur, Zeichnung, Fotografie, Wandbild, Installation, Gebäude' },
    titel: { type: 'string', description: 'Titel auf Deutsch (Originaltitel in Klammern, falls anders); bei unbekanntem Werk eine kurze Beschreibung wie «Unbekanntes Stillleben mit Zitronen»' },
    kuenstler: { type: 'string', description: 'Name oder «unbekannt» bzw. «vermutlich …»' },
    jahr: { type: 'string', description: 'Jahr oder Zeitraum, sonst geschätzt mit «um …»' },
    epoche: { type: 'string', description: 'Epoche oder Stilrichtung' },
    technik: { type: 'string', description: 'Material und Technik, falls bekannt mit Massen' },
    standort: { type: 'string', description: 'Museum und Stadt, leer wenn unbekannt' },
    kurz: { type: 'string', description: 'Neugierig machender Einstieg, 1–2 Sätze' },
    ueberblick: { type: 'string', description: 'Das Wichtigste in 1–2 Absätzen (Absätze mit Leerzeile trennen)' },
    wusstest_du: { type: 'array', items: { type: 'string' }, description: '3–5 überraschende, belegbare Fakten' },
    details: {
      type: 'array',
      description: '3–6 versteckte oder leicht übersehene Details, die man auf DIESEM Foto sehen kann. x/y = Position im Foto in Prozent (0 = links/oben, 100 = rechts/unten).',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['titel', 'text', 'x', 'y'],
        properties: { titel: { type: 'string' }, text: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' } },
      },
    },
    stil: { type: 'string', description: 'Stil-Analyse: Farbe, Licht, Pinselführung bzw. Bearbeitung, Komposition, Einflüsse; funktioniert auch bei unbekannten Werken' },
    geschichte: { type: 'string', description: 'Die Geschichte hinter dem Werk als kleine Erzählung (ca. 120–180 Wörter): Lebenssituation, Anlass, was danach geschah. Bei unbekanntem Werk: die Geschichte der Gattung oder des Motivs.' },
    zeitleiste: {
      type: 'array',
      description: '4–6 Ereignisse aus der Entstehungszeit (Kunst, Musik, Politik, Wissenschaft, Alltag), chronologisch',
      items: { type: 'object', additionalProperties: false, required: ['jahr', 'ereignis'], properties: { jahr: { type: 'string' }, ereignis: { type: 'string' } } },
    },
    querverweise: QUERVERWEISE,
    kinder: {
      type: 'object',
      additionalProperties: false,
      required: ['text', 'suchaufgabe'],
      properties: {
        text: { type: 'string', description: 'Erklärung für Kinder von 7–10 Jahren, 3–4 kurze Sätze' },
        suchaufgabe: { type: 'string', description: 'Eine Suchaufgabe zum Bild, z. B. «Findest du den kleinen Hund?»' },
      },
    },
  },
};

const ARTIKEL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['titel', 'untertitel', 'text', 'wusstest_du', 'querverweise'],
  properties: {
    titel: { type: 'string' },
    untertitel: { type: 'string', description: 'Eine Zeile: Lebensdaten, Datierung, Ort oder Zeitraum' },
    text: { type: 'string', description: '2–4 Absätze (mit Leerzeile getrennt), spannend erzählt' },
    wusstest_du: { type: 'array', items: { type: 'string' }, description: '2–4 überraschende Fakten' },
    querverweise: QUERVERWEISE,
  },
};

/** Ein Aufruf an Claude. Bei einer Ablehnung durch die Sicherheitsfilter springt automatisch ein anderes Modell ein (fallbacks). */
async function ask(params: Record<string, unknown>) {
  // deno-lint-ignore no-explicit-any
  const res: any = await claude.beta.messages.create({
    model: MODEL,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    ...params,
  // deno-lint-ignore no-explicit-any
  } as any);
  if (res.stop_reason === 'refusal') throw Object.assign(new Error('Claude hat diese Anfrage abgelehnt.'), { status: 422 });
  if (res.stop_reason === 'max_tokens') throw Object.assign(new Error('Die Antwort wurde zu lang und ist abgebrochen. Bitte nochmals versuchen.'), { status: 502 });
  // deno-lint-ignore no-explicit-any
  return res.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
}

async function analyze(body: Record<string, unknown>) {
  const image = String(body.image || '');
  if (!image || image.length > 7_000_000) throw Object.assign(new Error('Kein oder zu grosses Bild.'), { status: 400 });
  const text = await ask({
    max_tokens: 16000,
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: ANALYSE_SCHEMA } },
    system: `Du bist eine begeisterte, sehr kenntnisreiche Kunsthistorikerin. Jemand steht vor einem Kunstwerk (Bild, Skulptur, Bauwerk, Street Art …) und hat es fotografiert.
Erkenne das Werk, wenn möglich, und erzähle so, dass man es danach mit anderen Augen sieht.
Ist das Werk nicht sicher bestimmbar, sag das ehrlich (erkannt=false oder sicherheit niedrig) und analysiere trotzdem Stil, Motiv, mögliche Einflüsse und Epoche.
Bei «details» beziehst du dich auf das, was auf diesem Foto tatsächlich zu sehen ist, mit möglichst genauen Positionen.
${STIL}`,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
        { type: 'text', text: 'Was ist das für ein Werk? Erzähl mir alles Spannende dazu.' },
      ],
    }],
  });
  return JSON.parse(text);
}

async function explore(body: Record<string, unknown>) {
  const titel = String(body.titel || '').slice(0, 200);
  const art = String(body.art || 'thema').slice(0, 20);
  const kontext = String(body.kontext || '').slice(0, 300);
  if (!titel) throw Object.assign(new Error('Thema fehlt.'), { status: 400 });
  const text = await ask({
    max_tokens: 8000,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: ARTIKEL_SCHEMA } },
    system: `Du bist eine begeisterte, sehr kenntnisreiche Kunsthistorikerin und schreibst kurze Artikel für eine Kunst-App, in der man von Werk zu Werk stöbert.\n${STIL}`,
    messages: [{
      role: 'user',
      content: `Schreib einen Kurzartikel über: ${titel} (Art: ${art}).${kontext ? `\nDie Person kommt von: ${kontext}. Knüpfe daran an.` : ''}`,
    }],
  });
  return JSON.parse(text);
}

async function chat(body: Record<string, unknown>) {
  const frage = String(body.frage || '').slice(0, 1000);
  if (!frage) throw Object.assign(new Error('Frage fehlt.'), { status: 400 });
  const werk = JSON.stringify(body.werk || {}).slice(0, 20000);
  const verlauf = (Array.isArray(body.verlauf) ? body.verlauf : []).slice(-12)
    // deno-lint-ignore no-explicit-any
    .map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.text || '').slice(0, 4000) }));
  const text = await ask({
    max_tokens: 4000,
    output_config: { effort: 'low' },
    system: `Du bist eine begeisterte, sehr kenntnisreiche Kunsthistorikerin. Die Person hat ein Kunstwerk fotografiert und stellt Nachfragen dazu.
Antworte kurz (meist 2–5 Sätze), konkret und gesprächig, ohne Überschriften oder Aufzählungen, ausser sie helfen wirklich.
${STIL}
Das bisherige Wissen zum Werk (aus der Analyse des Fotos):
${werk}`,
    messages: [...verlauf, { role: 'user', content: frage }],
  });
  return { antwort: text };
}

/** Zählt Aufrufe pro Person und Tag; über dem Limit gibt es eine freundliche Absage. */
async function countUsage(userId: string, action: string) {
  const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zurich' }).format(new Date());
  const { data, error } = await db.rpc('art_bump_usage', { p_user: userId, p_day: day, p_action: action });
  if (error) throw error;
  if (Number(data) > DAILY_LIMIT) throw Object.assign(new Error(`Tageslimit von ${DAILY_LIMIT} Abfragen erreicht. Morgen geht es weiter.`), { status: 429 });
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Nur POST' }, 405);
  try {
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer /, '');
    const { data: { user } } = await db.auth.getUser(token);
    if (!user) return json({ error: 'Bitte zuerst anmelden.' }, 401);

    const body = await req.json();
    const action = String(body.action || '');
    const handler = ({ analyze, explore, chat } as Record<string, (b: Record<string, unknown>) => Promise<unknown>>)[action];
    if (!handler) return json({ error: 'Unbekannte Aktion' }, 400);

    await countUsage(user.id, action);
    return json(await handler(body));
  } catch (e) {
    // deno-lint-ignore no-explicit-any
    const err = e as any;
    if (err instanceof Anthropic.RateLimitError) return json({ error: 'Claude ist gerade überlastet. Bitte in einer Minute nochmals.' }, 429);
    if (err instanceof Anthropic.AuthenticationError) return json({ error: 'Der Anthropic-Schlüssel stimmt nicht (Supabase-Secret ANTHROPIC_API_KEY prüfen).' }, 500);
    if (err instanceof Anthropic.APIError) return json({ error: `Fehler bei Claude (${err.status}): ${err.message}` }, 502);
    console.error(err);
    return json({ error: err?.message || String(err) }, err?.status || 500);
  }
});
