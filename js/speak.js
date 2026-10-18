// Vorlesen mit der Stimme des Browsers (vorläufig; später ElevenLabs, siehe TODO Nr. 8).
let current = null;

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  const de = voices.filter(v => v.lang?.toLowerCase().startsWith('de'));
  // natürlicher klingende Stimmen bevorzugen
  return de.find(v => /natural|online|neural/i.test(v.name) && /ch/i.test(v.lang))
    || de.find(v => /natural|online|neural/i.test(v.name))
    || de.find(v => /ch/i.test(v.lang)) || de[0] || null;
}

export const supported = () => 'speechSynthesis' in window;
export const speaking = () => !!current;

/** Liest den Text vor; onEnd wird am Schluss oder beim Abbrechen aufgerufen. */
export function speak(text, onEnd) {
  stop();
  if (!supported()) return;
  const u = new SpeechSynthesisUtterance(text.replace(/[«»]/g, ''));
  const v = pickVoice();
  if (v) u.voice = v;
  u.lang = v?.lang || 'de-CH';
  u.rate = Number(localStorage.getItem('kunst.rate') || 1);
  const done = () => { if (current === u) current = null; onEnd?.(); };
  u.onend = done; u.onerror = done;
  current = u;
  speechSynthesis.speak(u);
}

export function stop() {
  if (!supported()) return;
  const u = current;
  current = null;
  speechSynthesis.cancel();
  u?.onend?.();
}
