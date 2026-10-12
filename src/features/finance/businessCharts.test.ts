import { expect, it } from 'vitest';
import { businessTrend } from './businessTrend';
import type { FinancialEntry } from './metrics';
const entry = (id: string, date: string, kind: FinancialEntry['kind'], cents: number): FinancialEntry => ({ id, sourceId: id, date, kind, cents, category: 'General' });
it('conserva los totales y los límites del periodo, incluyendo devoluciones y días sin movimientos', () => {
  const result = businessTrend([entry('a', '2026-10-01', 'SALE', 10000), entry('b', '2026-10-31', 'CREDIT', 12000), entry('c', '2026-10-06', 'FIXED_EXPENSE', 3000), entry('x', '2026-09-30', 'SALE', 99000)], { from: '2026-10-01', to: '2026-10-31' });
  expect(result).toHaveLength(6);
  expect(result[0].sales).toBe(10000);
  expect(result[5].sales).toBe(-12000);
  expect(result[0].expenses).toBe(3000);
  expect(result.reduce((sum, item) => sum + item.sales, 0)).toBe(-2000);
  expect(result[1]).toMatchObject({ sales: 0, expenses: 0 });
});
it('admite un día y rechaza periodos inválidos', () => {
  expect(businessTrend([], { from: '2026-10-01', to: '2026-10-01' })).toHaveLength(1);
  expect(businessTrend([], { from: '2026-11-01', to: '2026-10-01' })).toEqual([]);
  expect(businessTrend([], { from: '', to: '' })).toEqual([]);
});

