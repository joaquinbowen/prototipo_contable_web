import type { ReactNode } from 'react';
import type { AccountKind, AccountingBook } from '../../../domain/accounting/types';
import type { useApp } from '../../../context/AppContext';

export type AccountingAction = (operation: (book: AccountingBook) => AccountingBook, success: string) => boolean;
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

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
    <div><h2 className="text-base font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600">{description}</p>}</div>
    {action}
  </div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center"><p className="font-semibold text-slate-800">{title}</p><p className="mt-1 text-sm text-slate-600">{description}</p></div>;
}

export function StatusBadge({ tone, children }: { tone: 'blue' | 'green' | 'amber' | 'slate'; children: ReactNode }) {
  const colors = { blue: 'bg-blue-50 text-blue-800 ring-blue-200', green: 'bg-emerald-50 text-emerald-800 ring-emerald-200', amber: 'bg-amber-50 text-amber-900 ring-amber-200', slate: 'bg-slate-100 text-slate-700 ring-slate-200' };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${colors[tone]}`}>{children}</span>;
}

export function ModuleGuide({ steps }: { steps: [string, string][] }) {
  return <div className="grid gap-2 rounded-2xl border border-blue-200 bg-blue-50/60 p-3 sm:grid-cols-3" aria-label="Cómo trabajar en este módulo">
    {steps.map(([title, detail], index) => <div key={title} className="flex gap-2 rounded-xl bg-white/80 px-3 py-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">{index + 1}</span>
      <div><strong className="block text-xs text-slate-900">{title}</strong><p className="mt-0.5 text-xs leading-4 text-slate-600">{detail}</p></div>
    </div>)}
  </div>;
}

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
