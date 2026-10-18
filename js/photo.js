// Fotos verkleinern: für Claude (max. 1568 px, empfohlene Grösse) und als Vorschaubild für die Sammlung.

async function loadBitmap(file) {
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { /* Fallback unten */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally { URL.revokeObjectURL(url); }
}

function draw(src, maxSide) {
  const w = src.width, h = src.height;
  const f = Math.min(1, maxSide / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * f); c.height = Math.round(h * f);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return c;
}

const toBlob = (canvas, q) => new Promise(r => canvas.toBlob(r, 'image/jpeg', q));

/** Liefert { blob, thumb, base64 } aus einer Bilddatei. */
export async function prepare(file) {
  const bmp = await loadBitmap(file);
  const big = draw(bmp, 1568);
  const blob = await toBlob(big, 0.85);
  const thumb = draw(bmp, 480).toDataURL('image/jpeg', 0.75);
  const base64 = big.toDataURL('image/jpeg', 0.85).split(',')[1];
  return { blob, thumb, base64, ratio: big.width / big.height };
}
