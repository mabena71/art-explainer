// Kunst-Karte: alle Scans mit Standort auf einer Landkarte (Leaflet + OpenStreetMap).
// Der Standort wird nur gespeichert, wenn die Person das unter «Karte» eingeschaltet hat.
import * as db from '../db.js';
import { prefs } from '../state.js';
import { esc, toast } from '../ui.js';
import { icon } from '../icons.js';
import { findMuseums, locateOnce } from '../nearby.js';

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

export default async function mapView(el, { params = {} } = {}) {
  const scans = await db.allScans();
  const placed = scans.filter(s => typeof s.lat === 'number' && typeof s.lng === 'number');
  el.innerHTML = `<div class="pad-x">
    <button class="back" data-back>${icon('back')}<span>Zurück</span></button>
    <h1 class="display page-title">Kunst-Karte</h1>
    <div class="row nearby-bar">
      <button class="btn" data-near>${icon('museum')}<span>Museen in meiner Nähe</span></button>
      <select data-radius aria-label="Umkreis">
        ${[2, 5, 10, 25].map(r => `<option value="${r}" ${r === 10 ? 'selected' : ''}>${r} km</option>`).join('')}
      </select>
      <label class="switch small"><input type="checkbox" data-artonly checked><span>Nur Kunst</span></label>
    </div>
    <div id="map" class="map"></div>
    <p class="muted small">${placed.length} von ${scans.length} Werken mit Standort${scans.length > placed.length ? ' – Scans ohne Standort erscheinen nicht.' : '.'}</p>
    <section data-nearlist></section>
    ${prefs.geo ? '' : `
    <div class="box">
      <p>Damit deine eigenen Werke auf der Karte erscheinen, speichert die App beim Scannen deinen ungefähren Standort. Er bleibt in deiner Sammlung und wird nicht an Claude geschickt.</p>
      <button class="btn btn-ghost" data-geo>${icon('pin')}<span>Standort beim Scannen speichern</span></button>
    </div>`}
  </div>`;
  el.querySelector('[data-back]').onclick = () => history.back();
  el.querySelector('[data-geo]')?.addEventListener('click', () => {
    if (!navigator.geolocation) { toast('Dieses Gerät kann keinen Standort liefern', 'bad'); return; }
    navigator.geolocation.getCurrentPosition(
      () => { prefs.geo = true; toast('Standort wird ab jetzt beim Scannen gespeichert'); mapView(el, { params }); },
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

  // Museen in der Nähe
  const nearLayer = L.layerGroup().addTo(map);
  const listEl = el.querySelector('[data-nearlist]');
  const btn = el.querySelector('[data-near]');
  let pos = params.lat && params.lng ? { lat: Number(params.lat), lng: Number(params.lng) } : null; // feste Koordinaten zum Testen
  const fmtKm = km => km < 1 ? `${Math.round(km * 1000 / 10) * 10} m` : `${km.toFixed(km < 10 ? 1 : 0).replace('.', ',')} km`;

  async function showNearby() {
    btn.disabled = true;
    listEl.innerHTML = '<p class="muted">Suche Museen …</p>';
    try {
      pos = pos || await locateOnce();
      const radius = Number(el.querySelector('[data-radius]').value);
      const artOnly = el.querySelector('[data-artonly]').checked;
      const list = (await findMuseums(pos, radius)).filter(m => !artOnly || m.art);
      nearLayer.clearLayers();
      L.circleMarker([pos.lat, pos.lng], { radius: 8, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).bindPopup('Du bist hier').addTo(nearLayer);
      for (const m of list) {
        L.marker([m.lat, m.lng], { icon: L.divIcon({ className: `museum-pin${m.art ? ' art' : ''}`, html: '🏛', iconSize: [30, 30], iconAnchor: [15, 15] }) })
          .bindPopup(`<strong>${esc(m.name)}</strong><br>${esc(m.kind)} · ${fmtKm(m.km)}`).addTo(nearLayer);
      }
      map.fitBounds(L.featureGroup([L.marker([pos.lat, pos.lng]), ...list.slice(0, 15).map(m => L.marker([m.lat, m.lng]))]).getBounds().pad(0.15), { maxZoom: 15 });
      const route = m => `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`;
      listEl.innerHTML = list.length ? `
        <h2>${list.length} ${list.length === 1 ? 'Ort' : 'Orte'} im Umkreis von ${radius} km</h2>
        <ul class="near-list">${list.slice(0, 40).map(m => `
          <li>
            <div class="grow"><strong>${esc(m.name)}</strong>${m.art && !el.querySelector('[data-artonly]').checked ? ' <span class="kind kind-werk">Kunst</span>' : ''}<br>
              <span class="muted small">${esc(m.kind)} · ${fmtKm(m.km)}${m.hours ? ` · ${esc(m.hours)}` : ''}</span></div>
            <div class="row">
              ${m.website ? `<a class="btn btn-small btn-ghost" href="${esc(m.website)}" target="_blank" rel="noopener">Webseite</a>` : ''}
              <a class="btn btn-small btn-ghost" href="${route(m)}" target="_blank" rel="noopener">Weg</a>
            </div>
          </li>`).join('')}</ul>
        <p class="muted small">Daten: © OpenStreetMap-Mitwirkende. Öffnungszeiten ohne Gewähr.</p>` :
        `<p>Keine Museen im Umkreis von ${radius} km gefunden. Versuch einen grösseren Umkreis.</p>`;
    } catch (e) {
      listEl.innerHTML = `<p class="bad">${esc(e.message || e)}</p>`;
    } finally { btn.disabled = false; }
  }
  btn.onclick = showNearby;
  el.querySelector('[data-radius]').onchange = () => { if (pos) showNearby(); };
  el.querySelector('[data-artonly]').onchange = () => { if (pos) showNearby(); };
  if (pos) showNearby();
  return () => map.remove();
}
