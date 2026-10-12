import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { stampDemoPdf } from './pdfStamp';

describe('copia PDF con sello de demostración', () => {
  it('conserva todas las páginas al sellar la tercera', async () => {
    const original = await PDFDocument.create();
    original.addPage([300, 400]); original.addPage([300, 400]); original.addPage([300, 400]);
    const bytes = await stampDemoPdf(await original.save(), 2, { x: 25, y: 100, width: 160, height: 60 }, 'Ana Pérez');
    const result = await PDFDocument.load(bytes);
    expect(result.getPageCount()).toBe(3);
    expect(bytes.length).toBeGreaterThan((await original.save()).length);
  });

  it('rechaza página y coordenadas fuera de rango', async () => {
    const original = await PDFDocument.create(); original.addPage([300, 400]);
    const bytes = await original.save();
    await expect(stampDemoPdf(bytes, 1, { x: 0, y: 0, width: 50, height: 30 }, 'Ana')).rejects.toThrow();
    await expect(stampDemoPdf(bytes, 0, { x: 280, y: 10, width: 50, height: 30 }, 'Ana')).rejects.toThrow();
  });
});
