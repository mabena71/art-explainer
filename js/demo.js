// Demo-Modus: feste Beispielantworten, damit man die App ohne Konto und ohne Kosten ausprobieren kann.
// Egal welches Foto man aufnimmt: Die Demo antwortet immer mit Van Goghs «Sternennacht».

export const DEMO_ANALYSIS = {
  erkannt: true,
  sicherheit: 'hoch',
  art_des_werks: 'Gemälde',
  titel: 'Die Sternennacht (De sterrennacht)',
  kuenstler: 'Vincent van Gogh',
  jahr: '1889',
  epoche: 'Post-Impressionismus',
  technik: 'Öl auf Leinwand, 73,7 × 92,1 cm',
  standort: 'Museum of Modern Art, New York',
  kurz: 'Ein Himmel, der tanzt: Van Gogh malte diese Nacht nicht draussen unter den Sternen, sondern aus dem Gedächtnis – in einer Heilanstalt in Südfrankreich.',
  ueberblick: 'Im Mai 1889 liess sich Vincent van Gogh freiwillig in die Heilanstalt Saint-Paul-de-Mausole bei Saint-Rémy-de-Provence aufnehmen. Aus seinem Fenster sah er nach Osten über ummauerte Felder auf die Hügel der Alpilles. Dieses Motiv malte er immer wieder – die Sternennacht ist die berühmteste Fassung.\n\nDas Dorf im Tal hat er allerdings hinzuerfunden, und der spitze Kirchturm erinnert eher an seine niederländische Heimat als an die Provence. Der Himmel mit seinen Wirbeln, dem leuchtenden Morgenstern und der Mondsichel ist kein Abbild, sondern ein Gefühl: Bewegung, Unruhe und Trost zugleich.',
  wusstest_du: [
    'In seinem Zimmer durfte Van Gogh nicht malen – das Bild entstand tagsüber in einem Atelierraum, aus dem Gedächtnis und aus Skizzen.',
    'Der helle Stern rechts neben der Zypresse ist vermutlich die Venus: Sie war im Juni 1889 vor Sonnenaufgang gut über der Provence zu sehen.',
    'In seinem knappen Jahr in Saint-Rémy schuf Van Gogh rund 150 Gemälde.',
    'Das Museum of Modern Art in New York besitzt das Bild seit 1941.',
    'Don McLeans Lied «Vincent» (1971) wurde von diesem Bild inspiriert.',
  ],
  details: [
    { titel: 'Die Zypresse', text: 'Wie eine dunkle Flamme verbindet sie Erde und Himmel. Zypressen standen in Südeuropa oft auf Friedhöfen – Van Gogh fand sie dagegen «schön wie einen ägyptischen Obelisken».', x: 16, y: 55 },
    { titel: 'Der Morgenstern', text: 'Der grösste Stern mit dem hellen Strahlenkranz – vermutlich die Venus, die Van Gogh in einem Brief an seinen Bruder Theo erwähnt.', x: 28, y: 36 },
    { titel: 'Der grosse Wirbel', text: 'Zwei ineinandergreifende Spiralen in der Bildmitte. Forschende haben 2024 berichtet, dass die Wirbel erstaunlich gut zu den Gesetzen echter Luftturbulenz passen.', x: 46, y: 30 },
    { titel: 'Mond und Sonne in einem', text: 'Die Mondsichel leuchtet in so kräftigem Orange-Gelb, dass sie fast wie eine Sonne wirkt.', x: 87, y: 16 },
    { titel: 'Der Kirchturm', text: 'Spitz und schmal wie in den Niederlanden – ein Stück Heimat, das Van Gogh in die Provence verpflanzt hat.', x: 51, y: 70 },
  ],
  stil: 'Typisch für Van Goghs späte Jahre sind die kurzen, gerichteten Pinselstriche, die wie Fäden um die Formen laufen, und die dicke, pastose Farbe. Leuchtendes Gelb steht gegen tiefes Ultramarin und Preussischblau – Komplementärkontraste, die er bei den Impressionisten und in japanischen Farbholzschnitten studiert hatte. Die Komposition ist kühn: Die Zypresse links bildet eine schwere Senkrechte, gegen die der waagrecht fliessende Himmel anläuft. Hier zeigt sich der Schritt vom Impressionismus, der den Augenblick festhält, zum Expressionismus, der das Innere sichtbar macht.',
  geschichte: 'Im Dezember 1888, nach einem heftigen Streit mit Paul Gauguin in Arles, verletzte sich Van Gogh am Ohr. Es folgten Wochen im Spital, Anfeindungen aus der Nachbarschaft und die Angst vor neuen Anfällen. Im Mai 1889 ging er nach Saint-Rémy, in die Stille der Heilanstalt. Dort bekam er zwei Räume: einen zum Schlafen, einen zum Malen.\n\nMorgens, vor Sonnenaufgang, sah er aus dem Fenster die Felder, die Hügel und den Morgenstern. Im Juni malte er daraus diese Nacht. Er selbst sah sie nicht als Hauptwerk und schickte sie mit anderen Bildern zu seinem Bruder Theo nach Paris. Ein gutes Jahr später, im Juli 1890, starb Van Gogh in Auvers-sur-Oise. Erst danach begann der Ruhm des Bildes, das heute zu den bekanntesten der Welt gehört.',
  zeitleiste: [
    { jahr: '1888', ereignis: 'Van Gogh malt in Arles die «Sternennacht über der Rhone» – ein ruhigeres Gegenstück.' },
    { jahr: '1889', ereignis: 'Der Eiffelturm wird zur Weltausstellung in Paris eröffnet.' },
    { jahr: '1889', ereignis: 'In Kyoto wird Nintendo gegründet – als Hersteller von Spielkarten.' },
    { jahr: '1889', ereignis: 'Das Moulin Rouge öffnet in Paris seine Türen.' },
    { jahr: '1890', ereignis: 'Van Gogh stirbt im Juli in Auvers-sur-Oise.' },
  ],
  querverweise: [
    { art: 'werk', titel: 'Sternennacht über der Rhone (Van Gogh, 1888)', warum: 'Der ruhigere Vorläufer: dieselbe Faszination für den Nachthimmel, ein Jahr früher in Arles.' },
    { art: 'werk', titel: 'Caféterrasse am Abend (Van Gogh, 1888)', warum: 'Sein erstes Bild mit Sternenhimmel – gemalt direkt vor Ort, unter Gaslaternen.' },
    { art: 'kuenstler', titel: 'Paul Gauguin', warum: 'Freund und Rivale: Ihr Streit in Arles führte direkt zum Aufenthalt in Saint-Rémy.' },
    { art: 'epoche', titel: 'Post-Impressionismus', warum: 'Die Bewegung, die nach dem Impressionismus Farbe und Form ganz neu dachte.' },
    { art: 'ort', titel: 'Saint-Rémy-de-Provence', warum: 'Die Heilanstalt kann man heute besuchen – samt nachgebautem Zimmer.' },
    { art: 'werk', titel: 'Der Schrei (Edvard Munch, 1893)', warum: 'Auch hier wird der Himmel zum Gefühl – nur vier Jahre später, im hohen Norden.' },
    { art: 'thema', titel: 'Der Nachthimmel in der Kunst', warum: 'Von Giotto bis zu James Turrell – warum Künstler immer wieder nach oben schauen.' },
  ],
  kinder: {
    text: 'Vincent schaute frühmorgens, als es noch dunkel war, gern aus dem Fenster. Er malte den Himmel so, wie er sich anfühlte: alles dreht sich und leuchtet! Unten schläft ein kleines Dorf. Und links wächst ein Baum wie eine grosse, dunkle Flamme.',
    suchaufgabe: 'Zähl die Sterne! Wie viele findest du? (Tipp: Es sind elf – und dazu der Mond.)',
  },
};

export function demoArticle(titel, art) {
  return {
    titel,
    untertitel: 'Beispiel-Artikel im Demo-Modus',
    text: `Im Demo-Modus gibt es noch keine echten Artikel. Sobald die App mit Claude verbunden ist, steht hier ein kurzer, spannender Text über «${titel}» – mit Bezug zu dem Werk, von dem du kommst.\n\nVon hier aus kannst du endlos weiterstöbern: Jeder Artikel hat wieder eigene Querverweise.`,
    wusstest_du: ['Jeder Artikel wird nur einmal erstellt und danach auf dem Gerät gespeichert – ein zweiter Besuch kostet nichts.'],
    querverweise: DEMO_ANALYSIS.querverweise.filter(q => q.titel !== titel).slice(0, 4),
  };
}

export function demoChat(frage) {
  return {
    antwort: `Gute Frage! Im Demo-Modus kann ich noch nicht wirklich antworten. Mit Claude verbunden bekommst du hier eine kurze, persönliche Antwort auf «${frage}» – zum Beispiel, warum der Himmel so wirbelt oder was Van Gogh seinem Bruder darüber schrieb.`,
  };
}
