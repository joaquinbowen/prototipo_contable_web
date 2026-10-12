import { describe, expect, it } from 'vitest';
import { breakEven, summarizeBusiness, type FinancialEntry } from './metrics';

const entry = (id: string, kind: FinancialEntry['kind'], cents: number, date = '2026-10-05'): FinancialEntry => ({ id, kind, cents, date, category: 'General', sourceId: id });

describe('resumen financiero para el negocio', () => {
  it('separa ventas, costo, gastos y cobros con filtro de fechas', () => {
    const result = summarizeBusiness([
      entry('s1', 'SALE', 100_000), entry('refund', 'CREDIT', 10_000), entry('cost', 'COGS', 20_000),
      entry('rent', 'FIXED_EXPENSE', 30_000), entry('utility', 'VARIABLE_EXPENSE', 5_000),
      entry('receipt', 'RECEIPT', 40_000), entry('other-month', 'SALE', 500_000, '2026-09-25')
    ], { from: '2026-10-01', to: '2026-10-31' });
    expect(result).toMatchObject({ salesCents: 90_000, costsCents: 20_000, expensesCents: 35_000, resultCents: 35_000, receiptsCents: 40_000 });
  });

  it('evita contar dos veces el mismo origen y calcula equilibrio', () => {
    const result = summarizeBusiness([entry('ocr-1', 'FIXED_EXPENSE', 60_000), { ...entry('ocr-2', 'FIXED_EXPENSE', 60_000), sourceId: 'ocr-1' }], { from: '2026-10-01', to: '2026-10-31' });
    expect(result.expensesCents).toBe(60_000);
    expect(breakEven(60_000, 200_000, 80_000)).toBe(100_000);
    expect(breakEven(60_000, 0, 0)).toBeNull();
  });
});
