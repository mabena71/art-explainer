# Art Explainer

Kunstwerk fotografieren → Claude erkennt Bild, Skulptur oder Bauwerk und erzählt Spannendes dazu:
Überblick, «Wusstest du?», versteckte Details als Nummern im Foto, Stil und Technik, die Geschichte dahinter,
was sonst in jener Zeit geschah, Querverweise zum endlosen Weiterstöbern, Nachfragen-Chat, Vorlesen, Kinder-Modus
und eine Sammlung aller entdeckten Werke.

Offene Arbeiten und Ideen: [TODO.md](TODO.md)

## Aufbau

- PWA ohne Build-Schritt: `index.html`, `styles.css`, `sw.js`, `js/` (Ansichten in `js/views/`)
- Sammlung auf dem Gerät (IndexedDB, `js/db.js`); Demo und echter Betrieb getrennt
- KI über die Supabase Edge Function `supabase/functions/art/index.ts` (Claude, Modell `claude-opus-5-5`, strukturierte JSON-Antworten). Der Anthropic-Schlüssel liegt nur als Supabase-Secret.
- Ohne Supabase-Zugang in `js/config.js` läuft die App automatisch als Demo (jedes Foto = Van Goghs «Sternennacht», keine Kosten). Mit Zugang: Demo per `?demo` in der Adresse.

## Lokal starten

```bash
python -m http.server 8090
```

Dann http://localhost:8090/ öffnen (Service Worker ist auf localhost aus).

## Einrichten (einmalig)

1. **Anthropic**: auf console.anthropic.com Guthaben laden und einen API-Schlüssel erzeugen. Den Schlüssel nicht in den Chat kopieren.
2. **Supabase**: neues Projekt `art-explainer` (Region Zürich/Frankfurt).
   - SQL Editor → Inhalt von `supabase/schema.sql` ausführen.
   - Authentication → Sign In / Providers → «Allow new users to sign up» ausschalten; Konten unter Users → «Add user» anlegen.
   - Project Settings → API: «Project URL» und «anon public key» in `js/config.js` eintragen.
3. **Edge Function**: Edge Functions → «Deploy a new function» → Name `art`, Inhalt von `supabase/functions/art/index.ts` einfügen.
   - Edge Functions → Secrets: `ANTHROPIC_API_KEY` setzen. Optional: `DAILY_LIMIT` (Standard 40 Abfragen pro Person und Tag), `CLAUDE_MODEL` (Standard `claude-opus-5-5`; günstiger z. B. `claude-sonnet-5-5`).
4. Vor jedem Veröffentlichen: `python scripts/bump-version.py`

## Kosten (Richtwert)

Pro Scan mit `claude-opus-5-5` etwa 5–10 Rappen, Stöber-Artikel und Nachfragen je etwa 1–3 Rappen.
Jeder Stöber-Artikel wird nur einmal erstellt und dann auf dem Gerät gespeichert.
