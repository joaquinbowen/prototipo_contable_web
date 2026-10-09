import type { ReactNode } from 'react';
import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAccounting } from '../../../context/AccountingContext';
import type { AccountingModuleProps } from './AccountingUi';
import { box, field, StatusBadge } from './AccountingUi';

type Props = { title: string; description: string; children: (context: AccountingModuleProps) => ReactNode };

export function AccountingShell({ title, description, children }: Props) {
  const { accountantClients, profile, invoices, parsedPurchases } = useApp();
  const { books, selectedEntityId, selectEntity, selectedMonth, selectMonth, changeBook } = useAccounting();
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const entities = [...accountantClients];
  if (profile.ruc && !entities.some(item => item.ruc === profile.ruc)) {
    entities.unshift({ ...entities[0], id: 'own', ruc: profile.ruc, razonSocial: profile.razonSocial });
  }
  const entity = entities.find(item => item.ruc === selectedEntityId) || entities[0];
  const book = books[entity?.ruc];
  const period = book?.periods.find(item => item.start.slice(0, 7) === selectedMonth) || book?.periods[0];
  const act: AccountingModuleProps['act'] = (operation, success) => {
    if (!entity) return false;
    try { changeBook(entity.ruc, operation); setMessage({ text: success, error: false }); return true; }
    catch (error) { setMessage({ text: error instanceof Error ? error.message : 'No se pudo completar la operación.', error: true }); return false; }
  };

  if (!entity || !book || !period) return <div className={box}>Preparando los libros de demostración…</div>;
  const sales = entity.ruc === profile.ruc ? invoices : [];
  const purchases = entity.ruc === profile.ruc ? parsedPurchases : [];

  return <div className="accounting-workspace space-y-3">
    <header className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3">
      <div className="grid items-center gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="mt-1 flex flex-wrap items-center gap-2"><h1 className="text-xl font-bold text-slate-900">{title}</h1><StatusBadge tone={period.status === 'CLOSED' ? 'slate' : 'green'}>{period.status === 'CLOSED' ? 'Período cerrado' : 'Período abierto'}</StatusBadge></div>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_160px]">
          <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-600">Contribuyente
            <select className={field} value={entity.ruc} onChange={event => { selectEntity(event.target.value); setMessage(null); }}>
              {entities.map(item => <option key={item.ruc} value={item.ruc}>{item.razonSocial} · {item.ruc}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-600">Período
            <select className={field} value={period.start.slice(0, 7)} onChange={event => { selectMonth(event.target.value); setMessage(null); }}>
              {book.periods.map(item => <option key={item.id} value={item.start.slice(0, 7)}>{item.start.slice(0, 7)} · {item.status === 'CLOSED' ? 'Cerrado' : 'Abierto'}</option>)}
            </select>
          </label>
        </div>
      </div>
    </header>
    {message?.text && <div role={message.error ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${message.error ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-blue-200 bg-blue-50 text-blue-900'}`}>{message.text}</div>}
    <div key={`${entity.ruc}:${period.id}`}>{children({ book, period, sales, purchases, act })}</div>
  </div>;
}
