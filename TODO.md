# TODO – Art Explainer

App: https://mabena71.github.io/art-explainer/ · Demo (nur für einen Aufruf): `?demo` · Repo: https://github.com/mabena71/art-explainer · Übergabe: [CLAUDE.md](CLAUDE.md)
Neue Nummern fortlaufend (zuletzt 28) · Aufwand = Schätzung in Minuten · Modell = empfohlenes Claude-Modell (Opus = knifflig, Sonnet = Routine, Haiku = Kleinigkeiten, – = Aufgabe von Maurice)

## Offene Punkte

| Nr | Phase | Thema | Details | Wer | Modell | Aufwand | Prio | Status | Abhängig von |
|---|---|---|---|---|---|---|---|---|---|
| 25 | 1 | Abgleich testen | Angemeldet (ohne gelben Demo-Balken) einen Scan machen, dann auf dem zweiten Gerät (Handy/PC) unter Sammlung prüfen, ob er erscheint (Foto, Texte, Favorit, Löschen). Echte Aufrufe prüft die Leitstelle mit SQL auf `art_usage`/`art_scans` | Maurice | – | 5 | hoch | offen | – |
| 24 | 1 | Installation auf Xiaomi/Poco | Chrome meldet «bereits installiert», öffnen schlägt fehl, kein Symbol; Berechtigung «Startbildschirm-Verknüpfungen» bei HyperOS nicht einstellbar. Zwischenlösung: Lesezeichen. Nächstes: Neustart, «Verknüpfung erstellen», sonst Ursache suchen (WebAPK) | Maurice + Claude | Sonnet | 20 | hoch | offen | – |
| 6 | 1 | Testscans im Museum | Sternennacht, Rodins Denker, Werk im Kunsthaus Zürich, unbekanntes Bild; Erkennung, Unsicherheit, Details-Punkte, Museums-Modus, Rundgang-Tipp, Museen in der Nähe prüfen | Maurice | – | 60 | hoch | offen | 25 |
| 8 | 2 | Audioguide mit ElevenLabs | Hörprobe 2–3 Stimmen, Kostenfreigabe, Function-Aktion `speak` mit Zwischenspeicher (heute: Browser-Stimme) | Maurice + Claude | Sonnet | 60 | mittel | offen | – |
| 9 | 2 | Design-Etappe | Farben, Logo/Symbol mit Maurice festlegen (Name steht: Art Explainer; Symbol heute Platzhalter Rahmen + Lupe) | Maurice + Claude | Sonnet | 30 | mittel | in Arbeit (Untersitzung nr9-design) | – |
| 18 | 2 | Geschmacksprofil + Ausstellungstipps | Vorlieben aus der Sammlung, aktuelle Ausstellungen in Museen in der Nähe (Claude mit Web-Suche); braucht neue Function-Version (Maurice fügt Code ein) | Claude | Sonnet | 60 | niedrig | Idee | – |
| 20 | 2 | Familien-Feed | Freiwillig geteilte Scans der Familie sehen | Claude | Sonnet | 60 | niedrig | Idee | 25 |
| 21 | 3 | Öffentlich machen | Registrierung, Limits, Kostenschutz, Datenschutz-Text, Impressum | Maurice + Claude | Opus | 120 | niedrig | später | 23 |
| 23 | 3 | Eigenes Supabase-Projekt | Läuft vorerst in bena-fit mit (Tabellen `art_…`, Function-Slug `smooth-api`). Für «öffentlich» umziehen | Maurice + Claude | Opus | 45 | niedrig | später | – |
| 22 | 4 | Anthropic-Schlüssel erneuern | Schlüssel «art-explainer» läuft am 31.12.2027 ab; neuen erzeugen und Secret `ANTHROPIC_API_KEY` in bena-fit ersetzen | Maurice | – | 10 | niedrig | später | – |

## Erledigt

| Nr | Thema | Details | Erledigt am |
|---|---|---|---|
| 28 | Übergabe an Leitstelle | `CLAUDE.md` als Übergabe, Leitstelle + Untersitzungen eingeführt, To-do-Format von Roundabout Hunter übernommen | 20.10.2026 |
| 26 | Demo-Falle entschärft | `?demo` gilt nur noch einmalig (neuer Schlüssel `kunst.modus`), Demo-Balken knallgelb und antippbar zur Anmeldung | 19.10.2026 |
| 27 | Museen in der Nähe | Auf der Kunst-Karte: Museen/Galerien aus OpenStreetMap (Overpass), Umkreis 2–25 km, Filter «Nur Kunst», Liste mit Distanz, Öffnungszeiten (deutsch), Webseite, Weg. Mit Testkoordinaten Zürich geprüft (126 Kunstorte in 10 km) | 19.10.2026 |
| 10 | Damals und heute | Erster Querverweis in jedem Werk führt zu einem Artikel über früher und heute | 19.10.2026 |
| 12 | Rundgang-Tipp | Während eines Besuchs: «Was als Nächstes?» schlägt passende Werke im gleichen Museum vor (über `chat`) | 19.10.2026 |
| 17 | Kunst-Karte | Leaflet/OpenStreetMap, Standort beim Scannen nur nach Einwilligung, Fotos als Kartenpunkte | 19.10.2026 |
| 14 | Vergleichen | Zweites Werk wählen, Claude vergleicht (einmal pro Paar, auf dem Gerät gespeichert) | 19.10.2026 |
| 15 | Quiz | Bis 5 Fragen zu Künstler, Epoche, Entstehungszeit aus der eigenen Sammlung, Bestwert | 19.10.2026 |
| 19 | Teilen als Bildkarte | Foto, Titel, Fun Fact als PNG, Teilen-Menü (Handy) oder Download (PC) | 19.10.2026 |
| 16 | Abzeichen | 12 Abzeichen mit Fortschritt, Meldung bei neuem Abzeichen, Reiter «Erfolge» | 19.10.2026 |
| 11 | Museums-Modus | Besuch starten/beenden, Scans gruppiert, Zusammenfassung mit Highlights von Claude, Reiter «Besuche» | 19.10.2026 |
| 7 | Sammlung abgleichen | Tabelle `art_scans` (+ `visit`, `lat`/`lng`, `synced_at` per Trigger), Fotos im Bucket `art-photos`, Abgleich beim Start/alle 5 Min./nach Änderungen, Datenbank pro Person, alte Scans übernommen. Test mit Login: Nr. 25 | 19.10.2026 |
| 5 | Online gestellt | GitHub-Repo `mabena71/art-explainer`, GitHub Pages | 18.10.2026 |
| 3/4 | Claude angeschlossen | Anthropic-Schlüssel, Tabellen `art_usage`/`art_scans`, Bucket `art-photos` in bena-fit, Edge Function (Slug `smooth-api`, Anzeigename «Art Explainer», Verify JWT aus), Secret gesetzt; erster echter Scan, Nachfrage und Stöbern erfolgreich | 18.10.2026 |
| 2/13 | Grundversion | PWA, Scan, Werk-Ansicht mit versteckten Details, Stil, Geschichte, Zeitleiste, Querverweise/Stöbern, Nachfragen-Chat, Vorlesen (Browser-Stimme), Kinder-Modus (Nr. 13), Schalter «Kurz \| Ausführlich», Demo-Modus | 18.10.2026 |
| 1 | Plan und Name | Zweck, Funktionen, Ideen ausgewählt («Mal es wie» nicht gewünscht); Name «Art Explainer» | 18.10.2026 |

## Reihenfolge (Stand 20.10.2026)

1. Nr. 25 Abgleich testen, Nr. 24 Xiaomi-Installation lösen
2. Nr. 6 Testscans im Museum, Fehler beheben
3. Nr. 8 Audioguide, Nr. 9 Design
4. Später: Nr. 18, 20, dann Veröffentlichung (Nr. 23, 21)

## Kosten (ohne Claude-Abo)

| Dienst | Wofür | Plan | Bisher bezahlt | Laufend |
|---|---|---|---|---|
| Anthropic API | Erkennung und Texte (Edge Function) | Guthaben, ca. 5–10 Rp. pro Scan, 1–3 Rp. pro Nachfrage/Artikel | 17.16 $ Guthaben vorhanden (Stand 18.10.2026) | nach Verbrauch, Tageslimit 40 Abfragen/Person |
| Supabase | Login, Sammlung, Fotos, Function | Free (im Projekt bena-fit) | CHF 0 | 0 |
| GitHub Pages | Hosting der App | Free | CHF 0 | 0 |
| OpenStreetMap | Karte, Museen in der Nähe | frei | CHF 0 | 0 |
| ElevenLabs (geplant, Nr. 8) | Natürliche Vorlese-Stimme | noch offen | – | nur nach Freigabe |

## Phasen

| Phase | Name | Inhalt |
|---|---|---|
| 1 | Familie testet | Abgleich, Handy-Installation, Testscans im Museum, Fehler beheben |
| 2 | Erlebnis ausbauen | Audioguide, Design, Geschmacksprofil, Familien-Feed |
| 3 | Veröffentlichung | Eigenes Supabase-Projekt, Registrierung, Limits, Datenschutz |
| 4 | Betrieb | Schlüssel erneuern, Kosten im Blick |
