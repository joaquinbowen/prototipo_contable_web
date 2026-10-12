import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatUsd } from './metrics';

export function PayablesPanel() {
  const { payables, setPayableStatus } = useApp();
  const [status, setStatus] = useState('PENDIENTE');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const today = new Date().toLocaleDateString('en-CA');
  const items = payables.filter((item) => (status === 'TODAS' || (status === 'VENCIDAS' ? item.estado === 'PENDIENTE' && item.fechaVence < today : item.estado === status)) && item.proveedor.toLocaleLowerCase().includes(search.toLocaleLowerCase()) && (!from || item.fechaVence >= from) && (!to || item.fechaVence <= to)).sort((a, b) => a.fechaVence.localeCompare(b.fechaVence));
  const input = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm';
  return <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-bold">Cuentas por pagar</h2><p className="mt-1 text-sm text-slate-500">Organiza tus próximos pagos. Marcar un pago no vuelve a registrar el gasto.</p>
    <div className="my-4 flex flex-wrap items-end gap-3"><label className="text-xs font-semibold">Proveedor<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar proveedor" className={`${input} mt-1 block`}/></label><label className="text-xs font-semibold">Estado<select value={status} onChange={(event) => setStatus(event.target.value)} className={`${input} mt-1 block`}><option value="PENDIENTE">Pendientes</option><option value="VENCIDAS">Vencidas</option><option value="PAGADO">Pagadas</option><option value="TODAS">Todas</option></select></label><label className="text-xs font-semibold">Vence desde<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className={`${input} mt-1 block`}/></label><label className="text-xs font-semibold">Vence hasta<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className={`${input} mt-1 block`}/></label><button onClick={() => { setSearch(''); setStatus('TODAS'); setFrom(''); setTo(''); }} className={input}>Limpiar filtros</button></div>
    {from && to && from > to && <p role="alert" className="mb-3 text-sm text-red-700">Revisa el rango de vencimientos.</p>}
    <div className="flex justify-between rounded-xl bg-slate-50 p-3 text-sm"><span>{items.length} cuentas en esta vista</span><strong>{formatUsd(Math.round(items.reduce((sum, item) => sum + item.monto, 0) * 100))}</strong></div>
    {message && <p role="status" className="mt-3 text-sm text-emerald-700">{message}</p>}
    <div className="max-h-[520px] overflow-auto"><table className="w-full min-w-[540px] text-left text-sm"><thead><tr className="border-b text-xs text-slate-500"><th className="py-3">Proveedor</th><th>Vencimiento</th><th>Estado</th><th className="text-right">Importe</th><th className="text-right">Acción</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className="py-4 font-medium">{item.proveedor}</td><td>{item.fechaVence}</td><td><span className={`rounded-full px-2 py-1 text-xs ${item.estado === 'PAGADO' ? 'bg-emerald-50 text-emerald-700' : item.fechaVence < today ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'}`}>{item.estado === 'PAGADO' ? 'Pagada' : item.fechaVence < today ? 'Vencida' : 'Pendiente'}</span></td><td className="text-right font-semibold">{formatUsd(Math.round(item.monto * 100))}</td><td className="text-right"><button onClick={() => { setPayableStatus(item.id, item.estado !== 'PAGADO'); setMessage(item.estado === 'PAGADO' ? 'Cuenta devuelta a pendientes.' : 'Pago registrado en el prototipo. Puedes revertirlo desde Pagadas.'); }} className="ml-3 rounded-lg border px-3 py-2 text-xs font-semibold text-blue-700">{item.estado === 'PAGADO' ? 'Deshacer pago' : 'Marcar pagada'}</button></td></tr>)}</tbody></table>{!items.length && <p className="py-10 text-center text-sm text-slate-500">No hay cuentas con estos filtros.</p>}</div>
  </section>;
}
