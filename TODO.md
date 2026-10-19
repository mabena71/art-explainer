# To-do Art Explainer

Aufwand in Minuten = Schätzung. Modell = Empfehlung für den jeweiligen Auftrag.
App: https://mabena71.github.io/art-explainer/ · Demo: https://mabena71.github.io/art-explainer/?demo · Repo: https://github.com/mabena71/art-explainer
Plan: Foto von Bild oder Skulptur → Erkennung durch Claude → Erklärung, versteckte Details, Querverweise, Nachfragen, Vorlesen, Sammlung.

## Offen

| Nr | Thema | Details | Wer | Modell | Aufwand (Min.) | Prio | Status | Abhängig von |
|---|---|---|---|---|---|---|---|---|
| 25 | Abgleich testen | Angemeldet einen Scan machen, dann auf dem zweiten Gerät (Handy/PC) unter Sammlung prüfen, ob er erscheint (Foto, Texte, Favorit, Löschen) | Maurice | — | 5 | hoch | offen | — |
| 6 | Testscans im Museum | Sternennacht, Rodins Denker, Werk im Kunsthaus Zürich, unbekanntes Bild; Erkennung, Unsicherheit, Details-Punkte prüfen | Maurice | — | 30 | hoch | offen | — |
| 8 | Audioguide mit ElevenLabs | Hörprobe 2–3 Stimmen, Kostenfreigabe, Function `speak` mit Zwischenspeicher (jetzt: Browser-Stimme) | Claude + Maurice | Opus | 60 | mittel | offen | — |
| 9 | Design-Etappe | Farben, Logo/Symbol mit Maurice festlegen (Name steht: Art Explainer) | Maurice + Claude | Opus | 30 | mittel | offen | 1 |
| 18 | Geschmacksprofil + Ausstellungstipps | Vorlieben aus der Sammlung, aktuelle Ausstellungen Schweiz (Claude mit Web-Suche) | Claude | Opus | 60 | niedrig | Idee | — |
| 20 | Familien-Feed | Freiwillig geteilte Scans der Familie sehen | Claude | Opus | 60 | niedrig | Idee | 25 |
| 21 | Öffentlich machen | Registrierung, Limits, Kostenschutz, Datenschutz-Text | Claude + Maurice | Opus | 120 | niedrig | Idee | — |
| 22 | Anthropic-Schlüssel erneuern | Schlüssel «art-explainer» läuft am 31.12.2027 ab; neuen erzeugen und Secret `ANTHROPIC_API_KEY` in bena-fit ersetzen | Maurice | — | 10 | niedrig | offen | — |
| 23 | Eigenes Supabase-Projekt | Läuft vorerst in bena-fit mit (Tabellen `art_…`, Function-Slug `smooth-api`). Für «öffentlich» umziehen in eigenes Projekt | Claude + Maurice | Opus | 45 | niedrig | offen | 21 |
| 24 | Installation auf Xiaomi/Poco | Chrome meldet «bereits installiert», öffnen schlägt fehl, kein Symbol; Berechtigung «Startbildschirm-Verknüpfungen» bei HyperOS nicht einstellbar. Zwischenlösung: Lesezeichen. Nächstes: Neustart, «Verknüpfung erstellen», sonst Ursache suchen (WebAPK) | Maurice + Claude | Opus | 20 | hoch | offen | — |

## Erledigt

| Nr | Thema | Details | Wer | Modell | Datum |
|---|---|---|---|---|---|
| E1 | Planung | Zweck, Funktionen, Ideen ausgewählt («Mal es wie» nicht gewünscht) | Maurice + Claude | Opus | 18.10.2026 |
| E2 | Etappen 1–4 + Teile von 6 gebaut | PWA, Scan, Werk-Ansicht mit versteckten Details, Stil, Geschichte, Zeitleiste, Querverweise/Stöbern, Sammlung (auf dem Gerät), Nachfragen-Chat, Vorlesen (Browser-Stimme), Demo-Modus, Edge Function `art` | Claude | Opus | 18.10.2026 |
| E3 | Name | «Art Explainer» festgelegt | Maurice | — | 18.10.2026 |
| E4 | Claude angeschlossen | Anthropic-Schlüssel (Guthaben vorhanden), Tabellen `art_usage`/`art_scans` und Bucket `art-photos` in bena-fit, Edge Function (Slug `smooth-api`, Anzeigename «Art Explainer», Verify JWT aus), Secret gesetzt; erster echter Scan, Nachfrage und Stöbern erfolgreich | Maurice + Claude | Opus | 18.10.2026 |
| E5 | Textmenge | Schalter «Kurz \| Ausführlich» in Werk- und Stöber-Ansicht | Claude | Opus | 18.10.2026 |
| E6 | Kinder-Modus | Einfache Erklärung + Suchaufgabe pro Werk, Schalter unter «Mehr» | Claude | Opus | 18.10.2026 |
| E7 | Online gestellt | GitHub-Repo `mabena71/art-explainer`, GitHub Pages | Maurice + Claude | Opus | 18.10.2026 |
| E8 | Sammlung abgleichen | Tabelle `art_scans` (+ `visit`, `synced_at` per Trigger), Fotos im Bucket `art-photos`, Abgleich beim Start/alle 5 Min./nach Änderungen, Datenbank pro Person, alte Scans übernommen (Test mit Login offen: Nr. 25) | Claude | Opus | 19.10.2026 |
| E9 | Museums-Modus | Besuch starten/beenden, Scans gruppiert, Zusammenfassung mit Highlights von Claude, Reiter «Besuche» | Claude | Opus | 19.10.2026 |
| E10 | Abzeichen | 12 Abzeichen mit Fortschritt, Meldung bei neuem Abzeichen, Reiter «Erfolge» | Claude | Opus | 19.10.2026 |
| E11 | Teilen als Bildkarte | Foto, Titel, Fun Fact als PNG, Teilen-Menü (Handy) oder Download (PC) | Claude | Opus | 19.10.2026 |
| E12 | Quiz | Bis 5 Fragen zu Künstler, Epoche, Entstehungszeit aus der eigenen Sammlung, Bestwert | Claude | Opus | 19.10.2026 |
| E13 | Vergleichen | Zweites Werk wählen, Claude vergleicht (einmal pro Paar, auf dem Gerät gespeichert) | Claude | Opus | 19.10.2026 |
| E14 | Kunst-Karte | Leaflet/OpenStreetMap, Standort beim Scannen nur nach Einwilligung, Fotos als Kartenpunkte (Museen in der Nähe noch offen) | Claude | Opus | 19.10.2026 |
| E15 | Rundgang-Tipp | Während eines Besuchs: «Was als Nächstes?» schlägt passende Werke im gleichen Museum vor | Claude | Opus | 19.10.2026 |
| E16 | Damals und heute | Erster Querverweis in jedem Werk führt zu einem Artikel über früher und heute | Claude | Opus | 19.10.2026 |
