import { postEntry, createDraft } from './journal';
import { getBalanceSheet, getTrialBalance } from './reports';
import { newId, type AccountingBook } from './types';

export function getCloseChecklist(book: AccountingBook, periodId: string) {
  const period = book.periods.find(item => item.id === periodId);
  if (!period) throw new Error('No existe el período.');
  const drafts = book.entries.filter(item => item.status === 'DRAFT' && item.date >= period.start && item.date <= period.end).length;
  const unmatched = book.movements.filter(item => !item.matchedEntryId && item.date >= period.start && item.date <= period.end).length;
  const rows = getTrialBalance(book, period.start, period.end);
  const difference = rows.reduce((sum, row) => sum + row.debitCents - row.creditCents, 0);
  return { period, drafts, unmatched, difference, ready: drafts === 0 && unmatched === 0 && difference === 0 };
}

export function closePeriod(book: AccountingBook, periodId: string): AccountingBook {
  const check = getCloseChecklist(book, periodId);
  if (check.period.status === 'CLOSED') throw new Error('El período ya está cerrado.');
  if (!check.ready) throw new Error(`Resuelve ${check.drafts} borradores, ${check.unmatched} movimientos bancarios y la diferencia contable de ${check.difference / 100} USD.`);
  return { ...book, periods: book.periods.map(item => item.id === periodId ? { ...item, status: 'CLOSED', closedAt: new Date().toISOString() } : item), audit: [{ id: newId('AUD'), entityId: book.entityId, at: new Date().toISOString(), action: 'CIERRE_MENSUAL', detail: check.period.start }, ...book.audit] };
}

export function reopenPeriod(book: AccountingBook, periodId: string, reason: string): AccountingBook {
  if (!reason.trim()) throw new Error('Indica el motivo de reapertura.');
  const period = book.periods.find(item => item.id === periodId);
  if (!period || period.status !== 'CLOSED') throw new Error('Selecciona un período cerrado.');
  return { ...book, periods: book.periods.map(item => item.id === periodId ? { ...item, status: 'OPEN', closedAt: undefined, reopenedReason: reason.trim() } : item), audit: [{ id: newId('AUD'), entityId: book.entityId, at: new Date().toISOString(), action: 'REAPERTURA', detail: `${period.start}: ${reason.trim()}` }, ...book.audit] };
}

export function closeYear(book: AccountingBook, year: number): AccountingBook {
  const december = book.periods.find(item => item.start === `${year}-12-01`);
  if (!december || december.status !== 'OPEN') throw new Error('Diciembre debe estar abierto y configurado.');
  const earlierOpen = book.periods.filter(item => item.start.startsWith(`${year}-`) && item.start < december.start && item.status !== 'CLOSED');
  if (earlierOpen.length) throw new Error('Cierra primero los meses anteriores configurados de ese año.');
  if (book.entries.some(item => item.sourceKind === 'CLOSING' && item.sourceId === `YEAR-${year}`)) throw new Error('El año ya tiene un asiento de cierre.');
  const balances = getTrialBalance(book, '0000-01-01', december.end).filter(row => (row.account.kind === 'INCOME' || row.account.kind === 'EXPENSE') && row.closingCents !== 0);
  const lines = balances.map(row => ({ id: newId('LIN'), accountId: row.account.id, debitCents: Math.max(0, -row.closingCents), creditCents: Math.max(0, row.closingCents) }));
  const net = lines.reduce((sum, line) => sum + line.debitCents - line.creditCents, 0);
  const retained = book.accounts.find(item => item.code === '3.02' && item.active && item.postable);
  if (!retained) throw new Error('Falta la cuenta de resultados acumulados.');
  if (net) lines.push({ id: newId('LIN'), accountId: retained.id, debitCents: Math.max(0, -net), creditCents: Math.max(0, net) });
  let next = book;
  if (lines.length >= 2) {
    next = createDraft(next, { date: december.end, description: `Cierre de resultados ${year}`, sourceKind: 'CLOSING', sourceId: `YEAR-${year}`, lines });
    next = postEntry(next, next.entries[0].id);
  }
  if (getBalanceSheet(next, december.end).differenceCents !== 0) throw new Error('El balance no cuadra después del cierre.');
  return closePeriod(next, december.id);
}
