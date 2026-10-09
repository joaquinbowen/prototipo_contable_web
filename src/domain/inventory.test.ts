import { describe, expect, it } from 'vitest';
import { suggestInventoryItem } from './inventory';
import type { InventoryItem } from '../types';

const items: InventoryItem[] = [
  { id: 'paper', codigo: 'OF-1', nombre: 'Resma de papel A4', categoria: 'Oficina', stock: 24, costoPromedio: 4.75 },
  { id: 'toner', codigo: 'OF-2', nombre: 'Tóner para impresora', categoria: 'Oficina', stock: 5, costoPromedio: 39.9 },
];

describe('sugerencias OCR de inventario', () => {
  it('reconoce variantes de nombre sin aprobarlas automáticamente', () => {
    expect(suggestInventoryItem('Resmas de Papel Bond Report A4 75g', items)?.item.id).toBe('paper');
    expect(suggestInventoryItem('Cartuchos Tóner HP LaserJet Pro', items)?.item.id).toBe('toner');
  });
  it('no inventa una coincidencia cuando el nombre es distinto', () => {
    expect(suggestInventoryItem('Mobiliario Ergonómico Soporte Monitor', items)).toBeNull();
  });
});
