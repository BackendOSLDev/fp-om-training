function bcbCertPdf(o) {
  /* WinAnsi text: plain ASCII as is, Latin letters like ñ, é, ü as octal codes, other letters without their accent, anything else as ? */
  const WA = { '\u2018': "'", '\u2019': "'", '\u201C': '"', '\u201D': '"', '\u2013': '-', '\u2014': '-', '\u20AC': '\\200', '\u2026': '...' };
  const asc = (t) => Array.from(String(t)).map((ch) => {
    if (WA[ch]) return WA[ch];
    const c = ch.charCodeAt(0);
    if (ch.length === 1 && c >= 0x20 && c <= 0x7E) return /[\\()]/.test(ch) ? '\\' + ch : ch;
    if (ch.length === 1 && c >= 0xA0 && c <= 0xFF) return '\\' + c.toString(8).padStart(3, '0');
    const base = ch.normalize ? ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : ch;
    return /^[\x20-\x7E]$/.test(base) ? base : '?';
  }).join('');
  const W = 792, H = 612, red = '0.776 0.227 0.180', ink = '0.043 0.043 0.043', gray = '0.45 0.45 0.45';
  const txt = (x, y, font, size, color, s, sp) => 'BT ' + color + ' rg /' + font + ' ' + size + ' Tf ' + (sp || 0) + ' Tc ' + x + ' ' + y + ' Td (' + asc(s) + ') Tj ET\n';
  const circle = (cx, cy, r) => { const k = 0.5523 * r;
    return (cx + r) + ' ' + cy + ' m ' + (cx + r) + ' ' + (cy + k) + ' ' + (cx + k) + ' ' + (cy + r) + ' ' + cx + ' ' + (cy + r) + ' c ' +
      (cx - k) + ' ' + (cy + r) + ' ' + (cx - r) + ' ' + (cy + k) + ' ' + (cx - r) + ' ' + cy + ' c ' +
      (cx - r) + ' ' + (cy - k) + ' ' + (cx - k) + ' ' + (cy - r) + ' ' + cx + ' ' + (cy - r) + ' c ' +
      (cx + k) + ' ' + (cy - r) + ' ' + (cx + r) + ' ' + (cy - k) + ' ' + (cx + r) + ' ' + cy + ' c S\n'; };
  const wrap = (s, n) => { const out = []; let line = ''; s.split(' ').forEach(w => { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }); if (line.trim()) out.push(line.trim()); return out; };
  const name = String(o.name || '').toUpperCase(), ns = Math.max(16, Math.min(40, Math.floor(640 / (Math.max(name.length, 1) * 0.72))));
  let c = '';
  c += '0.6 0.6 0.6 RG 0.8 w 18 18 756 576 re S\n0.8 0.8 0.8 RG 0.6 w 30 30 732 552 re S\n';
  c += red + ' rg 0 0 14 612 re f\n';
  c += txt(60, 538, 'F2', 16, ink, 'BCB PARTNERS', 0.5) + '0.7 0.7 0.7 RG 0.6 w 214 534 m 214 554 l S\n' + txt(224, 539, 'F1', 9, gray, 'ACADEMY', 1.6);
  c += red + ' RG 1.6 w ' + circle(690, 516, 46);
  c += txt(680, 530, 'F2', 7.5, red, 'BCB', 1.2) + txt(664.5, 513, 'F2', 7.5, red, 'PARTNERS', 1.2) + txt(665, 496, 'F2', 7.5, red, 'CERTIFIED', 1.2);
  c += txt(60, 448, 'F1', 9, gray, 'THIS CERTIFIES THAT', 1.6);
  /* A name with any letter the PDF fonts can't show as written (for example Chinese, Arabic, Cyrillic, or ą, ş, ễ) is drawn by the browser
     and placed as a picture, so it prints exactly right. If the browser can't draw it, the name falls back to text. */
  let img = null;
  const needImg = typeof document !== 'undefined' && Array.from(name).some((ch) => { const n = ch.codePointAt(0); return !(n >= 0x20 && n <= 0x7E) && !(n >= 0xA0 && n <= 0xFF) && !WA[ch]; });
  if (needImg) {
    try {
      const fam = 'px Helvetica, Arial, "Noto Sans", "Noto Sans CJK SC", "Noto Sans Arabic", sans-serif';
      const cv = document.createElement('canvas'); let g = cv.getContext('2d'); let px = 160; g.font = 'bold ' + px + fam;
      const mw = g.measureText(name).width; if (mw > 7900) px = Math.max(20, Math.floor(px * 7900 / mw));   /* keep the picture inside every browser's canvas limit */
      const font = 'bold ' + px + fam; g.font = font;
      const tw = Math.ceil(g.measureText(name).width) + 40, th = Math.ceil(px * 1.35);
      cv.width = tw; cv.height = th; g = cv.getContext('2d');
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, tw, th); g.font = font; g.fillStyle = 'rgb(11,11,11)'; g.textBaseline = 'alphabetic'; g.fillText(name, 20, px);
      /* a blank picture (a browser that blocks drawing) is not used */
      const pix = g.getImageData(0, 0, tw, th).data; let dark = 0; for (let i = 0; i < pix.length; i += 16) if (pix[i] < 128) { dark++; if (dark > 20) break; }
      if (dark <= 20) throw new Error('blank');
      const data = atob(cv.toDataURL('image/jpeg', 0.92).split(',')[1]);
      let k = ns / px; if (tw * k > 672) k = 672 / tw;
      const w = (tw * k).toFixed(2), h = (th * k).toFixed(2), x = (60 - 20 * k).toFixed(2), y = (400 - (th - px) * k).toFixed(2);
      img = { tw, th, data }; c += 'q ' + w + ' 0 0 ' + h + ' ' + x + ' ' + y + ' cm /Im1 Do Q\n';
    } catch (e) { img = null; }
  }
  if (!img) c += txt(60, 400, 'F2', ns, ink, name, 0.5);
  c += txt(60, 370, 'F1', 9, gray, 'COMPLETED THE TRAINING AND PASSED EVERY LESSON CHECK FOR', 1.6);
  c += txt(60, 338, 'F2', 20, red, 'FIELDPULSE OFFICE OPERATIONS', 0.6);
  wrap(o.what, 104).forEach((l, i) => { c += txt(60, 308 - i * 15, 'F1', 10.5, '0.3 0.3 0.3', l, 0); });
  c += '0.8 0.8 0.8 RG 0.6 w 60 176 m 732 176 l S\n';
  [[60, 'ISSUED', o.issued], [260, 'CERTIFICATE ID', o.certId], [460, 'VERIFY AT', o.verify]].forEach(([x, l, v]) => { c += txt(x, 154, 'F1', 8, gray, l, 1.6) + txt(x, 136, 'F1', 10, ink, v, 0); });
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /Font << /F1 4 0 R /F2 5 0 R >>' + (img ? ' /XObject << /Im1 8 0 R >>' : '') + ' >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    '<< /Length ' + c.length + ' >>\nstream\n' + c + 'endstream',
    '<< /Title (' + asc(o.title || 'Certificate') + ') /Producer (BCB Academy) >>'
  ];
  if (img) objs.push('<< /Type /XObject /Subtype /Image /Width ' + img.tw + ' /Height ' + img.th + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + img.data.length + ' >>\nstream\n' + img.data + '\nendstream');
  let pdf = '%PDF-1.4\n'; const off = [];
  objs.forEach((b, i) => { off.push(pdf.length); pdf += (i + 1) + ' 0 obj\n' + b + '\nendobj\n'; });
  const x = pdf.length;
  pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + off.map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('');
  pdf += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R /Info 7 0 R >>\nstartxref\n' + x + '\n%%EOF\n';
  const u = new Uint8Array(pdf.length); for (let i = 0; i < pdf.length; i++) u[i] = pdf.charCodeAt(i) & 255; return u;
}
