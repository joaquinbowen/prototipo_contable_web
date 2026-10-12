export type FinancialEntry = {
  id: string;
  sourceId: string;
  date: string;
  kind: 'SALE' | 'CREDIT' | 'COGS' | 'FIXED_EXPENSE' | 'VARIABLE_EXPENSE' | 'RECEIPT' | 'PAYMENT';
  cents: number;
  category: string;
  counterparty?: string;
};

export type DateFilter = { from: string; to: string };

export function summarizeBusiness(entries: FinancialEntry[], filter: DateFilter) {
  const seen = new Set<string>();
  const filtered = entries.filter((entry) => {
    if (entry.date < filter.from || entry.date > filter.to || !Number.isSafeInteger(entry.cents) || entry.cents < 0) return false;
    const key = `${entry.kind}:${entry.sourceId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const sum = (kind: FinancialEntry['kind']) => filtered.filter((item) => item.kind === kind).reduce((total, item) => total + item.cents, 0);
  const salesCents = sum('SALE') - sum('CREDIT');
  const costsCents = sum('COGS');
  const fixedCents = sum('FIXED_EXPENSE');
  const variableCents = sum('VARIABLE_EXPENSE');
  const expensesCents = fixedCents + variableCents;
  return { salesCents, costsCents, expensesCents, fixedCents, variableCents, resultCents: salesCents - costsCents - expensesCents, receiptsCents: sum('RECEIPT'), paymentsCents: sum('PAYMENT'), entries: filtered };
}

export function breakEven(fixedCents: number, salesCents: number, variableCents: number): number | null {
  if (salesCents <= 0 || fixedCents < 0 || variableCents < 0) return null;
  const margin = (salesCents - variableCents) / salesCents;
  if (margin <= 0) return null;
  return Math.round(fixedCents / margin);
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(cents / 100);
}
