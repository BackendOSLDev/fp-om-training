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
  const name = String(o.name || '').toUpperCase(), ns = name.length > 24 ? 30 : 40;
  let c = '';
  c += '0.6 0.6 0.6 RG 0.8 w 18 18 756 576 re S\n0.8 0.8 0.8 RG 0.6 w 30 30 732 552 re S\n';
  c += red + ' rg 0 0 14 612 re f\n';
  c += txt(60, 538, 'F2', 16, ink, 'BCB PARTNERS', 0.5) + '0.7 0.7 0.7 RG 0.6 w 214 534 m 214 554 l S\n' + txt(224, 539, 'F1', 9, gray, 'ACADEMY', 1.6);
  c += red + ' RG 1.6 w ' + circle(690, 516, 46);
  c += txt(680, 530, 'F2', 7.5, red, 'BCB', 1.2) + txt(664.5, 513, 'F2', 7.5, red, 'PARTNERS', 1.2) + txt(665, 496, 'F2', 7.5, red, 'CERTIFIED', 1.2);
  c += txt(60, 448, 'F1', 9, gray, 'THIS CERTIFIES THAT', 1.6);
  c += txt(60, 400, 'F2', ns, ink, name, 0.5);
  c += txt(60, 370, 'F1', 9, gray, 'COMPLETED THE TRAINING AND PASSED EVERY CHECK FOR', 1.6);
  c += txt(60, 338, 'F2', 20, red, 'FIELDPULSE OFFICE OPERATIONS', 0.6);
  wrap(o.what, 104).forEach((l, i) => { c += txt(60, 308 - i * 15, 'F1', 10.5, '0.3 0.3 0.3', l, 0); });
  c += '0.8 0.8 0.8 RG 0.6 w 60 176 m 732 176 l S\n';
  [[60, 'ISSUED', o.issued], [260, 'CERTIFICATE ID', o.certId], [460, 'VERIFY AT', o.verify]].forEach(([x, l, v]) => { c += txt(x, 154, 'F1', 8, gray, l, 1.6) + txt(x, 136, 'F1', 10, ink, v, 0); });
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    '<< /Length ' + c.length + ' >>\nstream\n' + c + 'endstream',
    '<< /Title (' + asc(o.title || 'Certificate') + ') /Producer (BCB Academy) >>'
  ];
  let pdf = '%PDF-1.4\n'; const off = [];
  objs.forEach((b, i) => { off.push(pdf.length); pdf += (i + 1) + ' 0 obj\n' + b + '\nendobj\n'; });
  const x = pdf.length;
  pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + off.map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('');
  pdf += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R /Info 7 0 R >>\nstartxref\n' + x + '\n%%EOF\n';
  const u = new Uint8Array(pdf.length); for (let i = 0; i < pdf.length; i++) u[i] = pdf.charCodeAt(i) & 255; return u;
}
