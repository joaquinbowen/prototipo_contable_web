import { summarizeBusiness, type DateFilter, type FinancialEntry } from './metrics';

const day = 86_400_000;
const timestamp = (date: string) => Date.parse(`${date}T00:00:00Z`);
export function businessTrend(entries: FinancialEntry[], filter: DateFilter) {
  const first = timestamp(filter.from);
  const last = timestamp(filter.to);
  if (!Number.isFinite(first) || !Number.isFinite(last) || first > last) return [];
  const days = Math.round((last - first) / day) + 1;
  const count = Math.min(6, days);
  const buckets = Array.from({ length: count }, (_, index) => ({
    from: new Date(first + Math.ceil(index * days / count) * day).toISOString().slice(0, 10),
    to: new Date(first + (Math.ceil((index + 1) * days / count) - 1) * day).toISOString().slice(0, 10),
    sales: 0, expenses: 0,
  }));
  for (const entry of summarizeBusiness(entries, filter).entries) {
    const offset = Math.round((timestamp(entry.date) - first) / day);
    if (!Number.isFinite(offset)) continue;
    const bucket = buckets[Math.min(count - 1, Math.floor(offset * count / days))];
    if (entry.kind === 'SALE') bucket.sales += entry.cents;
    if (entry.kind === 'CREDIT') bucket.sales -= entry.cents;
    if (entry.kind.includes('EXPENSE') || entry.kind === 'COGS') bucket.expenses += entry.cents;
  }
  return buckets;
}
