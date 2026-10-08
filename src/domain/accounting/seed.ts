import type { AccountKind, AccountingBook, JournalEntry, JournalLine, LedgerAccount } from './types';

const makeDate = (year: number, month: number, day: number) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export function seedAccountingBook(entityId: string, variant = 1, now = new Date()): AccountingBook {
  const code = (value: string) => `${entityId}:${value}`;
  const definitions: [string, string, AccountKind, string?][] = [
    ['1', 'Activo', 'ASSET'], ['1.01', 'Bancos', 'ASSET', '1'], ['1.02', 'Cuentas por cobrar', 'ASSET', '1'], ['1.03', 'IVA crédito tributario', 'ASSET', '1'], ['1.04', 'Inventario', 'ASSET', '1'],
    ['2', 'Pasivo', 'LIABILITY'], ['2.01', 'Cuentas por pagar', 'LIABILITY', '2'], ['2.02', 'IVA por pagar', 'LIABILITY', '2'],
    ['3', 'Patrimonio', 'EQUITY'], ['3.01', 'Capital', 'EQUITY', '3'], ['3.02', 'Resultados acumulados', 'EQUITY', '3'],
    ['4', 'Ingresos', 'INCOME'], ['4.01', 'Ventas y servicios', 'INCOME', '4'],
    ['5', 'Gastos', 'EXPENSE'], ['5.01', 'Compras y gastos', 'EXPENSE', '5'], ['5.02', 'Comisiones bancarias', 'EXPENSE', '5'],
  ];
  const accounts: LedgerAccount[] = definitions.map(([accountCode, name, kind, parent]) => ({ id: code(accountCode), entityId, code: accountCode, name, kind, parentId: parent ? code(parent) : undefined, postable: Boolean(parent), active: true }));
  const date = (day: number) => makeDate(now.getFullYear(), now.getMonth() + 1, day);
  const line = (account: string, debitCents = 0, creditCents = 0): JournalLine => ({ id: `${entityId}-${account}-${debitCents}-${creditCents}-${Math.random().toString(36).slice(2, 7)}`, accountId: code(account), debitCents, creditCents });
  const entry = (number: number, day: number, description: string, lines: JournalLine[]): JournalEntry => ({ id: `${entityId}-SEED-${number}`, entityId, date: date(day), number: `ASI-${String(number).padStart(4, '0')}`, description, status: 'POSTED', lines, sourceKind: 'MANUAL', createdAt: `${date(day)}T09:00:00`, postedAt: `${date(day)}T09:05:00` });
  const scale = Math.max(1, variant);
  const entries = [
    entry(1, 1, 'Saldo inicial de demostración', [line('1.01', 500_000 * scale), line('3.01', 0, 500_000 * scale)]),
    entry(2, 2, 'Venta de servicios de demostración', [line('1.02', 57_500 * scale), line('4.01', 0, 50_000 * scale), line('2.02', 0, 7_500 * scale)]),
    entry(3, 3, 'Compra de suministros de demostración', [line('5.01', 20_000 * scale), line('1.03', 3_000 * scale), line('2.01', 0, 23_000 * scale)]),
    entry(4, 5, 'Cobro de factura de demostración', [line('1.01', 57_500 * scale), line('1.02', 0, 57_500 * scale)]),
  ];
  const periods = Array.from({ length: 18 }, (_, index) => { const first = new Date(now.getFullYear(), now.getMonth() - 9 + index, 1); const last = new Date(first.getFullYear(), first.getMonth() + 1, 0); return { id: `${entityId}-${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}`, entityId, start: makeDate(first.getFullYear(), first.getMonth() + 1, 1), end: makeDate(last.getFullYear(), last.getMonth() + 1, last.getDate()), status: 'OPEN' as const }; });
  return {
    entityId, accounts, entries,
    bankAccounts: [{ id: `${entityId}-BANK-1`, entityId, name: 'Cuenta corriente principal', accountNumber: `****${String(1400 + scale)}`, ledgerAccountId: code('1.01') }],
    movements: [
      { id: `${entityId}-MOV-1`, entityId, bankAccountId: `${entityId}-BANK-1`, date: date(5), description: 'Transferencia cobro cliente', amountCents: 57_500 * scale, fingerprint: `${entityId}-seed-deposit`, matchedEntryId: entries[3].id },
      { id: `${entityId}-MOV-2`, entityId, bankAccountId: `${entityId}-BANK-1`, date: date(6), description: 'Comisión por mantenimiento', amountCents: -1_200, fingerprint: `${entityId}-seed-fee` },
    ],
    periods, publications: [], audit: [], taxReviews: [],
  };
}
