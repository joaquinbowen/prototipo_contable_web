import { postedEntries } from './journal';
import type { AccountKind, AccountingBook, JournalEntry, LedgerAccount } from './types';

export interface TrialBalanceRow {
  account: LedgerAccount;
  openingCents: number;
  debitCents: number;
  creditCents: number;
  closingCents: number;
}

export const entriesInRange = (book: AccountingBook, from: string, to: string): JournalEntry[] => postedEntries(book).filter((entry) => entry.date >= from && entry.date <= to).sort((a, b) => a.date.localeCompare(b.date) || a.number.localeCompare(b.number));

export function getTrialBalance(book: AccountingBook, from: string, to: string): TrialBalanceRow[] {
  return book.accounts.filter((account) => account.postable).map((account) => {
    const linesBefore = postedEntries(book).filter((entry) => entry.date < from).flatMap((entry) => entry.lines.filter((line) => line.accountId === account.id));
    const linesNow = entriesInRange(book, from, to).flatMap((entry) => entry.lines.filter((line) => line.accountId === account.id));
    const openingCents = linesBefore.reduce((sum, line) => sum + line.debitCents - line.creditCents, 0);
    const debitCents = linesNow.reduce((sum, line) => sum + line.debitCents, 0);
    const creditCents = linesNow.reduce((sum, line) => sum + line.creditCents, 0);
    return { account, openingCents, debitCents, creditCents, closingCents: openingCents + debitCents - creditCents };
  }).sort((a, b) => a.account.code.localeCompare(b.account.code, 'es', { numeric: true }));
}

export function getLedger(book: AccountingBook, accountId: string, from: string, to: string) {
  const openingCents = postedEntries(book).filter((entry) => entry.date < from).flatMap((entry) => entry.lines.filter((line) => line.accountId === accountId)).reduce((sum, line) => sum + line.debitCents - line.creditCents, 0);
  let balanceCents = openingCents;
  const rows = entriesInRange(book, from, to).flatMap((entry) => entry.lines.filter((line) => line.accountId === accountId).map((line) => { balanceCents += line.debitCents - line.creditCents; return { entry, line, balanceCents }; }));
  return { openingCents, rows, closingCents: balanceCents };
}

export function getProfitAndLoss(book: AccountingBook, from: string, to: string) {
  const operational = entriesInRange(book, from, to).filter(entry => entry.sourceKind !== 'CLOSING');
  const rows = book.accounts.filter(account => account.postable && (account.kind === 'INCOME' || account.kind === 'EXPENSE')).map(account => {
    const lines = operational.flatMap(entry => entry.lines.filter(line => line.accountId === account.id));
    const debitCents = lines.reduce((sum, line) => sum + line.debitCents, 0);
    const creditCents = lines.reduce((sum, line) => sum + line.creditCents, 0);
    return { account, amountCents: account.kind === 'INCOME' ? creditCents - debitCents : debitCents - creditCents };
  }).filter(row => row.amountCents !== 0);
  const incomeCents = rows.filter((row) => row.account.kind === 'INCOME').reduce((sum, row) => sum + row.amountCents, 0);
  const expenseCents = rows.filter((row) => row.account.kind === 'EXPENSE').reduce((sum, row) => sum + row.amountCents, 0);
  return { rows, incomeCents, expenseCents, profitCents: incomeCents - expenseCents };
}

export function getBalanceSheet(book: AccountingBook, asOf: string) {
  const rows = getTrialBalance(book, '0000-01-01', asOf).filter((row) => row.closingCents !== 0);
  const byKind = (kind: AccountKind) => rows.filter((row) => row.account.kind === kind).map((row) => ({ account: row.account, amountCents: kind === 'ASSET' || kind === 'EXPENSE' ? row.closingCents : -row.closingCents }));
  const total = (kind: AccountKind) => byKind(kind).reduce((sum, row) => sum + row.amountCents, 0);
  const assetsCents = total('ASSET');
  const liabilitiesCents = total('LIABILITY');
  const baseEquityCents = total('EQUITY');
  const currentProfitCents = total('INCOME') - total('EXPENSE');
  const equityCents = baseEquityCents + currentProfitCents;
  return { assets: byKind('ASSET'), liabilities: byKind('LIABILITY'), equity: byKind('EQUITY'), assetsCents, liabilitiesCents, baseEquityCents, currentProfitCents, equityCents, differenceCents: assetsCents - liabilitiesCents - equityCents };
}
