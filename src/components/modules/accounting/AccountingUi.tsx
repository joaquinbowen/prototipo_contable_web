import type { ReactNode } from 'react';
import type { AccountKind, AccountingBook } from '../../../domain/accounting/types';
import type { useApp } from '../../../context/AppContext';

export type AccountingAction = (operation: (book: AccountingBook) => AccountingBook, success: string) => void;
export type AccountingModuleProps = {
  book: AccountingBook;
  period: AccountingBook['periods'][number];
  sales: ReturnType<typeof useApp>['invoices'];
  purchases: ReturnType<typeof useApp>['parsedPurchases'];
  act: AccountingAction;
};

export const kinds: [AccountKind, string][] = [['ASSET', 'Activo'], ['LIABILITY', 'Pasivo'], ['EQUITY', 'Patrimonio'], ['INCOME', 'Ingresos'], ['EXPENSE', 'Gastos']];
export const box = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm';
export const field = 'min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900';
export const primary = 'rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50';
export const secondary = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50';

export function download(name: string, content: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob(['\uFEFF', content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function csv(rows: (string | number)[][]) {
  return rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{children}</p>;
}
