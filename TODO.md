# To-do Art Explainer

Aufwand in Minuten = Schätzung. Modell = Empfehlung für den jeweiligen Auftrag.
App: https://mabena71.github.io/art-explainer/ · Demo: https://mabena71.github.io/art-explainer/?demo · Repo: https://github.com/mabena71/art-explainer
Plan: Foto von Bild oder Skulptur → Erkennung durch Claude → Erklärung, versteckte Details, Querverweise, Nachfragen, Vorlesen, Sammlung.

## Offen

| Nr | Thema | Details | Wer | Modell | Aufwand (Min.) | Prio | Status | Abhängig von |
|---|---|---|---|---|---|---|---|---|
| 6 | Testscans im Museum | Sternennacht, Rodins Denker, Werk im Kunsthaus Zürich, unbekanntes Bild; Erkennung, Unsicherheit, Details-Punkte prüfen | Maurice | — | 30 | hoch | offen | — |
| 7 | Sammlung abgleichen | Scans (Foto + Analyse) in Supabase speichern, auf Handy und PC gleich | Claude | Opus | 60 | mittel | offen | — |
| 8 | Audioguide mit ElevenLabs | Hörprobe 2–3 Stimmen, Kostenfreigabe, Function `speak` mit Zwischenspeicher (jetzt: Browser-Stimme) | Claude + Maurice | Opus | 60 | mittel | offen | — |
| 9 | Design-Etappe | Farben, Logo/Symbol mit Maurice festlegen (Name steht: Art Explainer) | Maurice + Claude | Opus | 30 | mittel | offen | 1 |
| 10 | Damals und heute | Früherer Zustand, Restaurierungen, Ortsgeschichte (über Stöbern) | Claude | Sonnet | 30 | mittel | Idee | — |
| 11 | Museums-Modus | Scans zu Besuch gruppieren, Abschluss-Zusammenfassung mit Highlights | Claude | Opus | 60 | mittel | Idee | 7 |
| 12 | Rundgang-Vorschlag | «Dir gefiel X, schau dir als Nächstes Y an» innerhalb des Museums | Claude | Sonnet | 30 | mittel | Idee | 11 |
| 14 | Vergleichen | Zwei Scans nebeneinander, Claude erklärt Unterschiede | Claude | Sonnet | 40 | mittel | Idee | — |
| 15 | Quiz aus Sammlung | «Wer hat das gemalt?» mit eigenen Scans | Claude | Sonnet | 40 | niedrig | Idee | — |
| 16 | Abzeichen | Erster Impressionist, 10 Museen, Schweizer Künstler (Muster BENA Fit `js/rewards.js`) | Claude | Sonnet | 45 | niedrig | Idee | — |
| 17 | Kunst-Karte | Scans auf Karte (Leaflet/OSM), Museen in der Nähe | Claude | Opus | 60 | niedrig | Idee | — |
| 18 | Geschmacksprofil + Ausstellungstipps | Vorlieben aus der Sammlung, aktuelle Ausstellungen Schweiz (Claude mit Web-Suche) | Claude | Opus | 60 | niedrig | Idee | — |
| 19 | Teilen als Karte | Werk + Fun Fact als Bild, Web Share API (WhatsApp) | Claude | Sonnet | 40 | niedrig | Idee | — |
| 20 | Familien-Feed | Freiwillig geteilte Scans der Familie sehen | Claude | Opus | 60 | niedrig | Idee | 7 |
| 21 | Öffentlich machen | Registrierung, Limits, Kostenschutz, Datenschutz-Text | Claude + Maurice | Opus | 120 | niedrig | Idee | 7 |
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
