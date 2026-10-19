# Art Explainer – Übergabe für neue Sitzungen

Diese Datei liest jede neue Claude-Sitzung in diesem Ordner automatisch. Sie ersetzt den langen Gründungs-Chat (18.–20.10.2026).
Aufgabenliste: [TODO.md](TODO.md) – sie ist die einzige Quelle für offene Arbeiten.

## Was die App ist
Kunstwerk (Bild, Skulptur, Bauwerk) mit dem Handy fotografieren → Claude erkennt es und erklärt: Überblick, «Wusstest du?»,
versteckte Details als nummerierte Punkte im Foto, Stil und Technik, Geschichte dahinter, Zeitleiste, Querverweise zum
endlosen Stöbern, Nachfragen-Chat, Vorlesen (Browser-Stimme), Kinder-Modus, Schalter «Kurz | Ausführlich».
Dazu: Sammlung (zwischen Geräten abgeglichen), Museums-Modus mit Zusammenfassung und Rundgang-Tipp, 12 Abzeichen,
Quiz, Vergleichen, Teilen als Bildkarte, Kunst-Karte mit «Museen in meiner Nähe» (OpenStreetMap), «Damals und heute».

- Online: https://mabena71.github.io/art-explainer/ · Demo nur für einen Aufruf: `?demo`
- Repo: https://github.com/mabena71/art-explainer (öffentlich, Branch `main`, GitHub Pages aus Root). Pushen per Git-Credential-Manager geht; `gh` ist nicht installiert.
- Nutzer: Maurice, Sabine, Remy – mit ihren **BENA-Fit-Konten** (gleiches Supabase-Projekt). Später evtl. öffentlich (TODO Nr. 21).

## Technik
- PWA ohne Build-Schritt: `index.html`, `styles.css`, `sw.js`, `js/*.js`, Ansichten in `js/views/`. Router per Hash in `js/app.js`.
- Gerätespeicher IndexedDB (`js/db.js`), **eine Datenbank pro Person** (`kunst-<user_id>`), Demo getrennt (`kunst-demo`).
  Jede Änderung wird `dirty` markiert; `js/sync.js` lädt hoch und holt nach `synced_at` (Serverzeit per Trigger). Löschen = Markierung `deleted_at`.
- KI: Supabase Edge Function, Code in `supabase/functions/art/index.ts`, Aktionen `analyze` (JSON-Schema), `explore`, `chat`.
  Museumsbesuch, Vergleich und Rundgang-Tipp laufen über `chat` (kein Neubereitstellen nötig). Modell `claude-opus-5-5`
  (Secret `CLAUDE_MODEL` überschreibt), `fallbacks: "default"`, Tageslimit 40 Abfragen/Person (`DAILY_LIMIT`).
- Supabase-Projekt **bena-fit** (`slvrawfomzgmyytzdnfx`), weil der Gratis-Plan nur 2 Projekte erlaubt. Alles mit Präfix `art`:
  Tabellen `art_usage`, `art_scans`, Funktion `art_bump_usage`, Trigger `art_scans_synced`, Bucket `art-photos`. Schema: `supabase/schema.sql`.
- **Edge-Function-Slug ist `smooth-api`** (beim Anlegen automatisch vergeben, Anzeigename «Art Explainer»), «Verify JWT» ist AUS – die Function prüft das Login selbst. Die App ruft sie über `ART_FUNCTION` in `js/config.js`.
- Secret `ANTHROPIC_API_KEY` gesetzt (Schlüssel «art-explainer», Standard-Arbeitsbereich, läuft 31.12.2027 ab). Schlüssel nie in Chat oder Dateien.
- Vor jedem Push: `python scripts/bump-version.py` (Version + Cache-Name im Service Worker). Neue JS-Dateien in `sw.js` (SHELL) eintragen.
- Lokal testen: `python -m http.server <port>` und im Browser-Pane öffnen; bei geänderten Modulen einen **neuen Port** nehmen (Browser-Cache). Demo per `?demo`.

## Stolpersteine (schon erlebt)
- **Demo-Falle:** Maurice hat zweimal «getestet», war aber im Demo-Modus (jede Antwort = «Sternennacht»). Echte Aufrufe prüfen: SQL `select * from art_usage` bzw. `art_scans` im Supabase-SQL-Editor. Seit Version 2026.10.19-3 gilt `?demo` nur noch einmalig, Demo-Balken ist knallgelb.
- **Supabase-Editor im Browser-Pane:** Tippen in den Code-Editor verfälscht Klammern/Einrückung bei mehrzeiligem Code. SQL einzeilig pro Anweisung tippen geht. Function-Code muss **Maurice selbst einfügen** (Code per PowerShell `Set-Clipboard` in die Zwischenablage legen, er macht Ctrl+A, Ctrl+V). Danach Slug prüfen!
- Supabase-Warnung «destructive operations» kommt schon bei `drop … if exists`.
- In Python-Hilfsskripten Regex mit `\b` nur in Raw-Strings (`r"..."`) einsetzen, sonst entstehen Steuerzeichen.
- Xiaomi/Poco (HyperOS): App-Installation hängt (TODO Nr. 24). Links aus WhatsApp/Claude öffnen einen eingebetteten Browser – zuerst «In Chrome öffnen».
- Anmeldung, Passwörter, Zahlungen und API-Schlüssel macht immer Maurice selbst.

## Arbeitsweise mit Maurice
- Immer Deutsch, Schweizer Schreibweise (ss, nie ß), einfache Schritt-für-Schritt-Anleitungen mit nummerierten Listen und konkreten Links.
- Vorschläge/Ideen als Auswahl-Abfrage (Mehrfachauswahl) vorlegen, nicht als langer Fliesstext.
- Er arbeitet oft per Handy (Remote Control) – kurze Nachrichten, Fragen am Ende klar stellen.
- Kosten: Anthropic-Guthaben ca. 17 $ (Stand 18.10.), ein Scan ca. 5–10 Rappen. Neue kostenpflichtige Dienste (z. B. ElevenLabs) nur mit Hörprobe und Kostenfreigabe.

## Leitstelle und Untersitzungen
- **Leitstelle** = die Hauptsitzung: plant, priorisiert, pflegt `TODO.md`, startet Untersitzungen, prüft deren Ergebnis (Diff, Demo-Test) und führt sie zusammen. Sie programmiert selbst nur Kleinigkeiten.
- **Untersitzung** = eine Aufgabe aus `TODO.md` (Nr. im Titel), eigener Worktree/Branch, liest diese Datei, testet im Demo-Modus, committet auf ihren Branch, pusht **nicht** auf `main`. Am Ende: kurzer Bericht (was geändert, was getestet, was offen).
- Nie zwei Untersitzungen gleichzeitig an denselben Dateien (z. B. `js/views/work.js`, `styles.css`).
- Nach jedem Abschluss: `TODO.md` nachführen (Zeile von «Offen» nach «Erledigt» mit Datum), Version erhöhen, pushen, Online-Version prüfen.
