import type { ReactNode } from 'react';
import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAccounting } from '../../../context/AccountingContext';
import type { AccountingModuleProps } from './AccountingUi';
import { box, field } from './AccountingUi';

type Props = { title: string; description: string; children: (context: AccountingModuleProps) => ReactNode };

export function AccountingShell({ title, description, children }: Props) {
  const { accountantClients, profile, invoices, parsedPurchases } = useApp();
  const { books, selectedEntityId, selectEntity, selectedMonth, selectMonth, changeBook } = useAccounting();
  const [message, setMessage] = useState('');
  const entities = [...accountantClients];
  if (profile.ruc && !entities.some(item => item.ruc === profile.ruc)) {
    entities.unshift({ ...entities[0], id: 'own', ruc: profile.ruc, razonSocial: profile.razonSocial });
  }
  const entity = entities.find(item => item.ruc === selectedEntityId) || entities[0];
  const book = books[entity?.ruc];
  const period = book?.periods.find(item => item.start.slice(0, 7) === selectedMonth) || book?.periods[0];
  const act: AccountingModuleProps['act'] = (operation, success) => {
    if (!entity) return;
    try { changeBook(entity.ruc, operation); setMessage(success); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo completar la operación.'); }
  };

  if (!entity || !book || !period) return <div className={box}>Preparando los libros de demostración…</div>;
  const sales = entity.ruc === profile.ruc ? invoices : [];
  const purchases = entity.ruc === profile.ruc ? parsedPurchases : [];

  return <div className="space-y-4">
    <header className="rounded-2xl border border-blue-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-700">Contabilidad · demo local</p>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="grid gap-1 text-xs font-semibold text-slate-600">Contribuyente
            <select className={field} value={entity.ruc} onChange={event => { selectEntity(event.target.value); setMessage(''); }}>
              {entities.map(item => <option key={item.ruc} value={item.ruc}>{item.razonSocial} · {item.ruc}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-600">Período
            <select className={field} value={period.start.slice(0, 7)} onChange={event => { selectMonth(event.target.value); setMessage(''); }}>
              {book.periods.map(item => <option key={item.id} value={item.start.slice(0, 7)}>{item.start.slice(0, 7)} · {item.status === 'CLOSED' ? 'Cerrado' : 'Abierto'}</option>)}
            </select>
          </label>
        </div>
      </div>
    </header>
    {message && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">{message}</div>}
    {children({ book, period, sales, purchases, act })}
  </div>;
}
