import { describe, expect, it } from 'vitest';
import { toPdfRect } from './pdfCoordinates';

describe('posición de marca en PDF', () => {
  it('convierte una selección de pantalla al origen inferior del PDF', () => {
    const rect = toPdfRect({ convertToPdfPoint: (x, y) => [x, 800 - y] as [number, number] }, { x: 100, y: 200, width: 120, height: 40 });
    expect(rect).toEqual({ x: 100, y: 560, width: 120, height: 40 });
  });

  it('normaliza las esquinas también cuando la página está rotada', () => {
    const rect = toPdfRect({ convertToPdfPoint: (x, y) => [y, 600 - x] as [number, number] }, { x: 10, y: 20, width: 100, height: 30 });
    expect(rect).toEqual({ x: 20, y: 490, width: 30, height: 100 });
  });
});
