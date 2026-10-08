import type { ElectronicInvoice, TaxpayerProfile } from '../types';

// Styled, multipage A4 RIDE for the local demo. PDF commands stay ASCII for reliable Blob output.
const ascii = (value: string | undefined) => (value || '').replace(/[\r\n]+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, '?');
const winAnsi: Record<string, number> = { 'á': 225, 'é': 233, 'í': 237, 'ó': 243, 'ú': 250, 'ñ': 241, 'ü': 252, 'Á': 193, 'É': 201, 'Í': 205, 'Ó': 211, 'Ú': 218, 'Ñ': 209, 'Ü': 220, '¿': 191, '¡': 161, '€': 128 };
const esc = (value: string) => (value || '').replace(/[\r\n]+/g, ' ').split('').map((char) => winAnsi[char] ? `\\${winAnsi[char].toString(8).padStart(3,'0')}` : /[\\()]/.test(char) ? `\\${char}` : /[\x20-\x7e]/.test(char) ? char : '?').join('');
const usd = (value: number) => `$${value.toFixed(2)}`;
const wrap = (value: string, width: number) => {
  const words = (value || '').replace(/[\r\n]+/g, ' ').split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (line && `${line} ${word}`.length > width) { lines.push(line); line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
};

export function buildRidePdf(invoice: ElectronicInvoice, profile: TaxpayerProfile): string {
  const rows = invoice.items.flatMap((item) => wrap(item.description, 44).map((description, index) => ({
    code: index ? '' : item.code || '', description, quantity: index ? '' : String(item.quantity),
    unit: index ? '' : usd(item.unitPrice), discount: index ? '' : usd(item.discount || 0), total: index ? '' : usd(item.total),
  })));
  const chunks: typeof rows[] = [];
  for (let index = 0; index < rows.length; index += 18) chunks.push(rows.slice(index, index + 18));
  if (!chunks.length) chunks.push([]);
  const navy = '0.09 0.22 0.34';
  const blue = '0.11 0.38 0.63';
  const pale = '0.91 0.95 0.99';
  const ink = '0.13 0.19 0.25';
  const muted = '0.37 0.43 0.48';
  const ops: string[] = [];
  const fill = (x: number, y: number, w: number, h: number, color: string) => ops.push(`${color} rg ${x} ${y} ${w} ${h} re f`);
  const line = (x1: number, y1: number, x2: number, y2: number) => ops.push(`0.82 0.86 0.89 RG 0.6 w ${x1} ${y1} m ${x2} ${y2} l S`);
  const label = (x: number, y: number, value: string, size = 9, bold = false, color = ink) => ops.push(`BT /${bold ? 'Bold' : 'Regular'} ${size} Tf ${color} rg 1 0 0 1 ${x} ${y} Tm (${esc(value)}) Tj ET`);
  const right = (x: number, y: number, value: string, size = 9, bold = false, color = ink) => label(x - ascii(value).length * size * (bold ? 0.57 : 0.51), y, value, size, bold, color);
  const sections: string[] = [];

  chunks.forEach((chunk, pageIndex) => {
    ops.length = 0;
    fill(0, 786, 595, 56, navy);
    label(32, 812, 'CONT MARJO 360', 15, true, '1 1 1');
    label(32, 796, 'COMPROBANTE ELECTRONICO  /  DEMOSTRACION', 8, false, '0.78 0.89 0.98');
    right(562, 806, `${invoice.establecimiento}-${invoice.puntoEmision}-${invoice.secuencial}`, 10, true, '1 1 1');
    label(32, 767, invoice.type.replaceAll('_',' '), 14, true, navy);
    right(562, 767, `Pagina ${pageIndex + 1} de ${chunks.length}`, 9, false, muted);

    if (pageIndex === 0) {
      fill(32, 636, 258, 117, pale);
      fill(298, 636, 264, 117, '0.96 0.97 0.98');
      label(42, 736, 'EMISOR', 8, true, blue);
      wrap(profile.razonSocial, 39).slice(0,2).forEach((item,index) => label(42, 716 - index * 13, item, 10, true));
      label(42, 681, `RUC: ${profile.ruc}`, 9);
      label(42, 666, `Regimen: ${profile.regimen}`, 8);
      label(42, 651, `Establecimiento: ${invoice.establecimiento}`, 8);
      label(308, 736, 'DATOS DEL COMPROBANTE', 8, true, blue);
      label(308, 718, `No. ${invoice.id}`, 10, true);
      label(308, 702, `Fecha: ${invoice.date}`, 9);
      label(308, 687, `Estado: ${invoice.status.replaceAll('_',' ')}`, 8);
      label(308, 672, `Punto de emision: ${invoice.puntoEmision}`, 8);
      label(308, 654, 'AMBIENTE DE DEMOSTRACION', 8, true, blue);
      fill(32, 564, 530, 62, '0.98 0.99 1');
      line(32, 626, 562, 626); line(32, 564, 562, 564);
      label(42, 610, 'RECEPTOR', 8, true, blue);
      label(42, 592, invoice.clientRucName, 10, true);
      label(42, 576, `RUC / CI: ${invoice.clientRuc}`, 8);
      label(306, 592, `Correo: ${invoice.clientEmail || 'No registrado'}`, 8);
      label(306, 576, `Direccion: ${ascii(invoice.clientAddress || 'No registrada').slice(0, 48)}`, 8);
      label(32, 549, `CLAVE DE ACCESO: ${invoice.claveAcceso || 'PENDIENTE'}`, 7, false, muted);
    }
    const tableTop = pageIndex === 0 ? 534 : 747;
    fill(32, tableTop - 23, 530, 23, navy);
    label(39, tableTop - 16, 'CODIGO', 8, true, '1 1 1');
    label(103, tableTop - 16, 'DESCRIPCION', 8, true, '1 1 1');
    right(375, tableTop - 16, 'CANT.', 8, true, '1 1 1');
    right(440, tableTop - 16, 'P.UNIT.', 8, true, '1 1 1');
    right(505, tableTop - 16, 'DTO.', 8, true, '1 1 1');
    right(553, tableTop - 16, 'TOTAL', 8, true, '1 1 1');
    chunk.forEach((row, index) => {
      const y = tableTop - 23 - (index + 1) * 19;
      if (index % 2 === 0) fill(32, y, 530, 19, '0.97 0.98 0.99');
      label(39, y + 6, row.code.slice(0, 12), 7);
      label(103, y + 6, row.description, 8);
      right(375, y + 6, row.quantity, 8);
      right(440, y + 6, row.unit, 8);
      right(505, y + 6, row.discount, 8);
      right(553, y + 6, row.total, 8, true);
    });
    const bottom = tableTop - 23 - chunk.length * 19;
    line(32, bottom, 562, bottom);
    if (pageIndex === chunks.length - 1) {
      const totalsTop = Math.min(bottom - 18, 520);
      fill(343, totalsTop - 82, 219, 82, pale);
      label(353, totalsTop - 17, 'SUBTOTAL 15%', 9, true);
      right(551, totalsTop - 17, usd(invoice.subtotal15), 9, true);
      label(353, totalsTop - 35, 'SUBTOTAL 0%', 9);
      right(551, totalsTop - 35, usd(invoice.subtotal0), 9);
      label(353, totalsTop - 53, 'IVA 15%', 9);
      right(551, totalsTop - 53, usd(invoice.iva15), 9);
      fill(343, totalsTop - 106, 219, 24, blue);
      label(353, totalsTop - 99, 'TOTAL', 10, true, '1 1 1');
      right(551, totalsTop - 99, usd(invoice.total), 10, true, '1 1 1');
      label(32, totalsTop - 16, 'FORMA DE PAGO', 8, true, blue);
      wrap(invoice.formaPago, 45).slice(0,2).forEach((item,index) => label(32, totalsTop - 33 - index * 12, item, 8));
      if (invoice.observaciones) { label(32, totalsTop - 64, 'OBSERVACIONES', 8, true, blue); wrap(invoice.observaciones, 53).slice(0,2).forEach((item,index) => label(32, totalsTop - 77 - index * 11, item, 7)); }
    }
    line(32, 44, 562, 44);
    label(32, 30, 'Documento generado localmente para demostracion. Sin validez tributaria.', 7, false, muted);
    sections.push(ops.join('\n'));
  });

  const objects: string[] = [];
  const add = (value: string) => { objects.push(value); return objects.length; };
  const catalog = add('');
  const tree = add('');
  const regular = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const bold = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const pages: number[] = [];
  sections.forEach((stream) => {
    const content = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    pages.push(add(`<< /Type /Page /Parent ${tree} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /Regular ${regular} 0 R /Bold ${bold} 0 R >> >> /Contents ${content} 0 R >>`));
  });
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${tree} 0 R >>`;
  objects[tree - 1] = `<< /Type /Pages /Kids [${pages.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10,'0')} 00000 n \n`; });
  return pdf + `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
}
