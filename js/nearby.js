// Museen und Galerien in der Nähe, aus OpenStreetMap (Overpass-API, gratis, ohne Schlüssel).
const OVERPASS = 'https://overpass-api.de/api/interpreter';

/** Entfernung in km (Haversine). */
export function distanceKm(a, b) {
  const R = 6371, rad = x => x * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const DAYS = { Mo: 'Mo', Tu: 'Di', We: 'Mi', Th: 'Do', Fr: 'Fr', Sa: 'Sa', Su: 'So', PH: 'Feiertage' };
/** OSM-Öffnungszeiten lesbarer machen: «Tu off» → «Di geschlossen». */
function germanHours(h) {
  return h.replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su|PH)\b/g, d => DAYS[d]).replace(/\b(off|closed)\b/gi, 'geschlossen').replace(/;\s*/g, '; ').replace(/"/g, '');
}

const KIND = { museum: 'Museum', gallery: 'Galerie', arts_centre: 'Kunstzentrum' };

/** Sucht im Umkreis (km); Ergebnis wird pro Ort und Umkreis eine Stunde zwischengespeichert. */
export async function findMuseums(pos, radiusKm = 10) {
  const key = `kunst.nearby.${pos.lat.toFixed(2)},${pos.lng.toFixed(2)},${radiusKm}`;
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (hit && Date.now() - hit.at < 3600e3) return hit.list;
  } catch { /* kein Zwischenspeicher */ }

  const r = Math.round(radiusKm * 1000);
  const query = `[out:json][timeout:25];(
    nwr["tourism"~"^(museum|gallery)$"](around:${r},${pos.lat},${pos.lng});
    nwr["amenity"="arts_centre"](around:${r},${pos.lat},${pos.lng});
  );out center tags 200;`;
  const res = await fetch(OVERPASS, { method: 'POST', body: new URLSearchParams({ data: query }) });
  if (!res.ok) throw new Error(res.status === 429 ? 'Der Kartendienst ist gerade ausgelastet. Bitte in einer Minute nochmals.' : `Kartendienst antwortet nicht (${res.status}).`);
  const json = await res.json();

  const seen = new Set();
  const list = [];
  for (const e of json.elements || []) {
    const t = e.tags || {};
    const name = t['name:de'] || t.name;
    const lat = e.lat ?? e.center?.lat, lng = e.lon ?? e.center?.lon;
    if (!name || lat == null) continue;
    const dup = `${name.toLowerCase()}|${lat.toFixed(3)}|${lng.toFixed(3)}`;
    if (seen.has(dup)) continue;
    seen.add(dup);
    list.push({
      name, lat, lng,
      kind: KIND[t.tourism] || KIND[t.amenity] || 'Museum',
      art: t.tourism === 'gallery' || t.amenity === 'arts_centre' || /\bart\b|kunst|galerie|gallery|beaux-arts/i.test(`${t.museum || ''} ${t['museum:type'] || ''} ${name}`),
      website: t.website || t['contact:website'] || t.url || '',
      hours: germanHours(t.opening_hours || ''),
      km: distanceKm(pos, { lat, lng }),
    });
  }
  list.sort((a, b) => a.km - b.km);
  try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), list })); } catch { /* egal */ }
  return list;
}

/** Ein Mal den aktuellen Standort holen (unabhängig von der Einstellung für Scans). */
export function locateOnce() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Dieses Gerät kann keinen Standort liefern.')); return; }
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      e => reject(new Error(e.code === 1 ? 'Standort wurde nicht erlaubt. Du kannst das in den Browser-Einstellungen ändern.' : 'Standort konnte nicht bestimmt werden.')),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 5 * 60 * 1000 },
    );
  });
}
