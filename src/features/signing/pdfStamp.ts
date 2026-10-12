import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

type Rect = { x: number; y: number; width: number; height: number };

export async function stampDemoPdf(bytes: Uint8Array | ArrayBuffer, pageIndex: number, rect: Rect, signer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(bytes);
  if (!Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex >= pdf.getPageCount()) throw new Error('La página seleccionada no existe.');
  const page = pdf.getPage(pageIndex);
  const size = page.getSize();
  if (![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) || rect.x < 0 || rect.y < 0 || rect.width < 30 || rect.height < 20 || rect.x + rect.width > size.width + 0.5 || rect.y + rect.height > size.height + 0.5) throw new Error('La marca debe quedar dentro de la página.');
  if (!signer.trim()) throw new Error('Escribe el nombre del firmante.');
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const asciiName = signer.trim().slice(0, 80).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '');
  const disclosure = 'FIRMA SIMULADA - SIN VALIDEZ CRIPTOGRAFICA';
  const nameSize = Math.min(11, Math.max(2, (rect.width - 10) / font.widthOfTextAtSize(asciiName, 1)));
  const disclosureSize = Math.min(7, Math.max(2, (rect.width - 10) / font.widthOfTextAtSize(disclosure, 1)));
  page.drawRectangle({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, borderWidth: 1, borderColor: rgb(0.1, 0.35, 0.6), color: rgb(0.94, 0.97, 1) });
  page.drawText(asciiName, { x: rect.x + 5, y: rect.y + rect.height - nameSize - 5, size: nameSize, font, color: rgb(0.05, 0.2, 0.4) });
  page.drawText(disclosure, { x: rect.x + 5, y: rect.y + 5, size: disclosureSize, font, color: rgb(0.15, 0.35, 0.55) });
  return pdf.save();
}
