// Kunst-Karte: alle Scans mit Standort auf einer Landkarte (Leaflet + OpenStreetMap).
// Der Standort wird nur gespeichert, wenn die Person das unter «Karte» eingeschaltet hat.
import * as db from '../db.js';
import { prefs } from '../state.js';
import { esc, toast } from '../ui.js';
import { icon } from '../icons.js';

const LEAFLET = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/';

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (!document.querySelector('link[data-leaflet]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = `${LEAFLET}leaflet.min.css`; css.dataset.leaflet = '1';
    document.head.append(css);
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `${LEAFLET}leaflet.min.js`;
    s.onload = () => resolve(window.L);
    s.onerror = () => reject(new Error('Die Karte konnte nicht geladen werden. Bist du online?'));
    document.head.append(s);
  });
}

/** Aktuellen Standort holen (für neue Scans); null, wenn nicht erlaubt oder nicht möglich. */
export function currentPosition(timeout = 6000) {
  if (!prefs.geo || !navigator.geolocation) return Promise.resolve(null);
  return new Promise(resolve => navigator.geolocation.getCurrentPosition(
    p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
    () => resolve(null),
    { enableHighAccuracy: false, timeout, maximumAge: 10 * 60 * 1000 },
  ));
}

export default async function mapView(el) {
  const scans = await db.allScans();
  const placed = scans.filter(s => typeof s.lat === 'number' && typeof s.lng === 'number');
  el.innerHTML = `<div class="pad-x">
    <button class="back" data-back>${icon('back')}<span>Zurück</span></button>
    <h1 class="display page-title">Kunst-Karte</h1>
    ${prefs.geo ? '' : `
    <div class="box">
      <p>Damit deine Werke auf der Karte erscheinen, speichert die App beim Scannen deinen ungefähren Standort. Er bleibt in deiner Sammlung und wird nicht an Claude geschickt.</p>
      <button class="btn" data-geo>${icon('pin')}<span>Standort beim Scannen speichern</span></button>
    </div>`}
    <div id="map" class="map"></div>
    <p class="muted small">${placed.length} von ${scans.length} Werken mit Standort${scans.length > placed.length ? ' – ältere Scans ohne Standort erscheinen nicht.' : '.'}</p>
  </div>`;
  el.querySelector('[data-back]').onclick = () => history.back();
  el.querySelector('[data-geo]')?.addEventListener('click', () => {
    if (!navigator.geolocation) { toast('Dieses Gerät kann keinen Standort liefern', 'bad'); return; }
    navigator.geolocation.getCurrentPosition(
      () => { prefs.geo = true; toast('Standort wird ab jetzt beim Scannen gespeichert'); mapView(el); },
      () => toast('Standort wurde nicht erlaubt. Du kannst das in den Browser-Einstellungen ändern.', 'bad'),
      { timeout: 10000 },
    );
  });

  let L;
  try { L = await loadLeaflet(); } catch (e) { el.querySelector('#map').innerHTML = `<p class="pad">${esc(e.message)}</p>`; return; }
  const map = L.map(el.querySelector('#map'), { scrollWheelZoom: false }).setView([46.8, 8.2], 7); // Schweiz
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  const markers = placed.map(s => L.marker([s.lat, s.lng], {
    icon: L.divIcon({ className: 'map-pin', html: `<img src="${s.thumb || 'icons/icon-192.png'}" alt="">`, iconSize: [44, 44], iconAnchor: [22, 22] }),
  }).bindPopup(`<a href="#/w/${s.id}"><strong>${esc(s.analysis?.titel)}</strong></a><br>${esc(s.analysis?.kuenstler || '')}`).addTo(map));
  if (markers.length) map.fitBounds(L.featureGroup(markers).getBounds().pad(0.3), { maxZoom: 15 });
  return () => map.remove();
}
