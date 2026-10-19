// Teilen als Bildkarte: Foto, Titel, Künstler und ein «Wusstest du?» als Bild (1080 × 1350, gut für WhatsApp und Instagram).
const W = 1080, H = 1350, PAD = 72;
const BG = '#f6f2ea', INK = '#1c1917', MUTED = '#6b625a', ACCENT = '#a8402d', GOLD = '#b88a1b';

function wrap(ctx, text, maxWidth, maxLines) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else line = test;
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + ' …';
  }
  return lines;
}

async function loadImage(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

/** Zeichnet die Karte und gibt sie als PNG-Blob zurück. */
export async function makeCard(scan) {
  const a = scan.analysis || {};
  await Promise.all([document.fonts.load('600 64px Fraunces'), document.fonts.load('400 32px Inter'), document.fonts.load('600 26px Inter')]).catch(() => {});
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

  // Foto oben, zugeschnitten auf die Fläche
  const url = scan.photo ? URL.createObjectURL(scan.photo) : scan.thumb;
  try {
    const img = await loadImage(url);
    const boxH = 720;
    const f = Math.max(W / img.width, boxH / img.height);
    const sw = W / f, sh = boxH / f;
    ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, W, boxH);
  } finally { if (scan.photo) URL.revokeObjectURL(url); }

  let y = 720 + 70;
  ctx.fillStyle = ACCENT;
  ctx.font = '600 26px Inter, sans-serif';
  ctx.fillText([a.art_des_werks, a.epoche].filter(Boolean).join(' · ').toUpperCase().slice(0, 60), PAD, y);

  ctx.fillStyle = INK;
  ctx.font = '600 60px Fraunces, Georgia, serif';
  for (const l of wrap(ctx, a.titel, W - 2 * PAD, 2)) { y += 72; ctx.fillText(l, PAD, y); }

  ctx.fillStyle = MUTED;
  ctx.font = '400 34px Inter, sans-serif';
  y += 56;
  ctx.fillText([a.kuenstler, a.jahr].filter(Boolean).join(', ').slice(0, 60), PAD, y);

  const fact = a.wusstest_du?.[0] || a.kurz;
  if (fact) {
    y += 64;
    ctx.fillStyle = GOLD;
    ctx.font = '600 26px Inter, sans-serif';
    ctx.fillText('✦ WUSSTEST DU?', PAD, y);
    ctx.fillStyle = INK;
    ctx.font = '400 32px Inter, sans-serif';
    for (const l of wrap(ctx, fact, W - 2 * PAD, 4)) { y += 46; ctx.fillText(l, PAD, y); }
  }

  ctx.fillStyle = MUTED;
  ctx.font = '600 24px Inter, sans-serif';
  ctx.fillText('Art Explainer · mabena71.github.io/art-explainer', PAD, H - 50);

  return new Promise(r => c.toBlob(r, 'image/png'));
}

/** Teilt die Karte (Handy) oder lädt sie herunter (PC). */
export async function shareCard(scan) {
  const blob = await makeCard(scan);
  const name = `${(scan.analysis?.titel || 'kunstwerk').replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 40)}.png`;
  const file = new File([blob], name, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: scan.analysis?.titel, text: 'Entdeckt mit Art Explainer' });
      return 'shared';
    } catch (e) {
      if (e.name === 'AbortError') return 'aborted';
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return 'downloaded';
}
