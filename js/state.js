// Gemeinsamer Zustand der App (Demo oder echter Betrieb, angemeldete Person).
export const state = {
  demo: false,
  session: null,
};

export const prefs = {
  get kids() { return localStorage.getItem('kunst.kids') === '1'; },
  set kids(v) { localStorage.setItem('kunst.kids', v ? '1' : '0'); },
  /** Standort beim Scannen speichern (für die Kunst-Karte) */
  get geo() { return localStorage.getItem('kunst.geo') === '1'; },
  set geo(v) { localStorage.setItem('kunst.geo', v ? '1' : '0'); },
  /** Textmenge: true = kurz (Wichtigstes sichtbar, Rest aufklappbar), false = ausführlich */
  get short() { return localStorage.getItem('kunst.short') === '1'; },
  set short(v) { localStorage.setItem('kunst.short', v ? '1' : '0'); },
};
