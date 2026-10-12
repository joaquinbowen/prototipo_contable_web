import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseForm } from './ExpenseForm';
import { PayablesPanel } from './PayablesPanel';
import { formatUsd, summarizeBusiness, type FinancialEntry } from './metrics';
import { businessTrend } from './businessTrend';
import { Distribution, TrendChart, panel } from './BusinessCharts';

const input = 'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm';
const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const total = (items: { cents: number }[]) => items.reduce((sum, item) => sum + item.cents, 0);
function groupAmounts(entries: FinancialEntry[], by: 'category' | 'counterparty') {
  const grouped = new Map<string, number>();
  for (const entry of entries) {
    const name = entry[by] || 'Sin clasificar';
    grouped.set(name, (grouped.get(name) || 0) + (entry.kind === 'CREDIT' ? -entry.cents : entry.cents));
  }
  return [...grouped].map(([name, cents]) => ({ name, cents })).sort((a, b) => b.cents - a.cents);
}

export function BusinessOverview() {
  const { invoices, expenses, payables, inventory, profile } = useApp();
  const today = localDate(new Date());
  const monthStart = `${today.slice(0, 7)}-01`;
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [view, setView] = useState<'summary' | 'sales' | 'expenses'>('summary');
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('TODAS');
  const [customer, setCustomer] = useState('TODOS');
  const [fixed, setFixed] = useState('600');
  const [variablePercent, setVariablePercent] = useState('40');
  const entries = useMemo<FinancialEntry[]>(() => [
    ...invoices.filter((item) => item.status === 'APROBADO_ENVIADO' && ['FACTURA', 'NOTA_CREDITO'].includes(item.type)).map((item) => ({ id: item.id, sourceId: item.id, date: item.date, kind: (item.type === 'NOTA_CREDITO' ? 'CREDIT' : 'SALE') as FinancialEntry['kind'], cents: Math.round((item.subtotal15 + item.subtotal0) * 100), category: item.type, counterparty: item.clientRucName })),
    ...expenses.map((item) => ({ id: item.id, sourceId: item.id, date: item.fecha, kind: 'FIXED_EXPENSE' as const, cents: Math.round(item.monto * 100), category: item.categoria, counterparty: item.proveedor })),
  ], [invoices, expenses]);
  const validPeriod = !!from && !!to && from <= to;
  const summary = summarizeBusiness(validPeriod ? entries : [], { from, to });
  const expenseById = new Map(expenses.map((item) => [item.id, item]));
  const categories = [...new Set(expenses.map((item) => item.categoria))].sort();
  const customers = [...new Set(entries.filter((item) => item.kind === 'SALE' || item.kind === 'CREDIT').map((item) => item.counterparty || ''))].sort();
  const sales = summary.entries.filter((item) => ['SALE', 'CREDIT'].includes(item.kind) && (customer === 'TODOS' || item.counterparty === customer));
  const periodExpenses = summary.entries.filter((item) => item.kind.includes('EXPENSE'));
  const visibleExpenses = periodExpenses.filter((item) => (category === 'TODAS' || item.category === category) && `${item.counterparty} ${expenseById.get(item.id)?.concepto || ''}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const trend = businessTrend(summary.entries, { from, to });
  const salesNet = sales.reduce((sum, item) => sum + (item.kind === 'CREDIT' ? -item.cents : item.cents), 0);
  const pending = payables.filter((item) => item.estado === 'PENDIENTE');
  const payableCents = pending.reduce((sum, item) => sum + Math.round(item.monto * 100), 0);
  const overdueCents = pending.filter((item) => item.fechaVence < today).reduce((sum, item) => sum + Math.round(item.monto * 100), 0);
  const inventoryCents = Math.round(inventory.reduce((sum, item) => sum + item.stock * item.costoPromedio, 0) * 100);
  const fixedCents = Math.round(Number(fixed) * 100);
  const percentage = Number(variablePercent);
  const equilibrium = fixed.trim() && variablePercent.trim() && Number.isFinite(fixedCents) && fixedCents >= 0 && Number.isFinite(percentage) && percentage >= 0 && percentage < 100 ? Math.round(fixedCents / (1 - percentage / 100)) : null;
  const setPreset = (months: number) => { const start = new Date(); start.setDate(1); start.setMonth(start.getMonth() - months + 1); setFrom(localDate(start)); setTo(today); };

  return <div className="mx-auto max-w-[1440px] space-y-5 pb-6 text-slate-900">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500">{profile.razonSocial}</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Mi negocio</h1><p className="mt-1 text-sm text-slate-500">Tus números en orden, para decidir con más claridad.</p></div><span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Datos de demostración · USD</span></header>
    <nav aria-label="Vistas de Mi negocio" className="flex gap-1 border-b border-slate-200">{([['summary', 'Resumen'], ['sales', 'Ventas'], ['expenses', 'Gastos y pagos']] as const).map(([key, label]) => <button key={key} aria-current={view === key ? 'page' : undefined} onClick={() => setView(key)} className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${view === key ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>{label}</button>)}</nav>
    <section aria-label="Periodo de ventas y gastos" className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><div className="mr-auto"><p className="text-sm font-semibold">{view === 'expenses' ? 'Periodo de gastos' : 'Periodo de análisis'}</p><p className="mt-1 text-xs text-slate-500">{view === 'expenses' ? 'Las cuentas por pagar tienen sus propios filtros debajo.' : 'Se aplica a ventas, gastos y gráficos.'}</p></div><label className="text-xs font-medium text-slate-500">Desde<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className={input}/></label><label className="text-xs font-medium text-slate-500">Hasta<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className={input}/></label><div className="flex gap-1 pb-0.5">{[[1, 'Este mes'], [3, '3 meses'], [12, '12 meses']].map(([months, label]) => <button key={months} onClick={() => setPreset(Number(months))} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium hover:bg-blue-50 hover:text-blue-700">{label}</button>)}</div></section>
    {!validPeriod && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">Selecciona ambas fechas y verifica que Desde no sea posterior a Hasta.</p>}

    {view === 'summary' && <>
      <section className="grid gap-3 md:grid-cols-3" aria-label="Indicadores del periodo">{[
        { label: 'Ventas netas', value: summary.salesCents, help: 'Ventas sin IVA, menos devoluciones.', accent: 'border-t-blue-500' },
        { label: 'Gastos registrados', value: summary.expensesCents, help: 'Importes registrados, incluidos sus impuestos.', accent: 'border-t-amber-500' },
        { label: 'Resultado estimado', value: summary.resultCents, help: 'Ventas menos gastos. No es dinero en caja.', accent: summary.resultCents < 0 ? 'border-t-rose-500' : 'border-t-emerald-500' },
      ].map((item) => <article key={item.label} className={`${panel} border-t-[3px] ${item.accent}`}><h2 className="text-sm font-medium text-slate-500">{item.label}</h2><strong className={`my-2 block text-3xl font-semibold tracking-tight tabular-nums ${item.value < 0 ? 'text-rose-700' : 'text-slate-900'}`}>{validPeriod ? formatUsd(item.value) : '—'}</strong><p className="text-xs text-slate-500">{item.help}</p></article>)}</section>
      <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]"><section className={panel}><h2 className="font-bold">Cómo va tu negocio</h2><p className="mb-5 mt-1 text-sm text-slate-500">Compara lo que vendes con lo que gastas durante el periodo.</p><TrendChart data={trend}/></section><section className={panel}><h2 className="font-bold">En qué estás gastando</h2><p className="mb-5 mt-1 text-sm text-slate-500">Categorías con mayor peso en tus gastos.</p><div className="max-h-72 overflow-auto pr-1"><Distribution items={groupAmounts(periodExpenses, 'category')}/></div></section></div>
      <div className="grid items-start gap-5 xl:grid-cols-[1.2fr_1fr]">
        <section className={panel}><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">Cuánto necesitas vender al mes</h2><span className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700">Simulador mensual</span></div><p className="mt-2 text-sm text-slate-500">Calcula tu punto de equilibrio: las ventas que cubren tus costos, sin ganar ni perder.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold">Costos fijos al mes (USD)<input type="number" min="0" step="0.01" value={fixed} onChange={(event) => setFixed(event.target.value)} className={input}/><span className="mt-1 block font-normal text-slate-500">Ej. alquiler, internet y sueldos.</span></label><label className="text-xs font-semibold">Costo por cada $100 vendidos (%)<input type="number" min="0" max="99.99" step="0.1" value={variablePercent} onChange={(event) => setVariablePercent(event.target.value)} className={input}/><span className="mt-1 block font-normal text-slate-500">Ej. mercadería, materiales y comisiones.</span></label></div>{equilibrium !== null ? <div className="mt-5 rounded-xl bg-indigo-50 p-4"><p className="text-xs font-medium text-indigo-700">Tu meta para cubrir costos</p><strong className="mt-1 block text-2xl font-semibold text-indigo-950">{formatUsd(equilibrium)} <span className="text-sm font-normal">/ mes</span></strong><div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white" role="img" aria-label={`Composición de las ventas necesarias: ${100 - percentage}% para costos fijos, ${percentage}% para costos variables`}><div className="bg-indigo-600" style={{ width: `${100 - percentage}%` }}/><div className="bg-indigo-300" style={{ width: `${percentage}%` }}/></div><div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-indigo-900"><span>Fijos: {formatUsd(fixedCents)}</span><span>Variables: {formatUsd(equilibrium - fixedCents)}</span></div></div> : <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Ingresa costos desde cero y un porcentaje entre 0 y menos de 100.</p>}<p className="mt-3 text-xs text-slate-500">Es una simulación independiente del periodo. No modifica tus registros.</p></section>
        <section className={panel}><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">Lo que tienes y lo que debes</h2><span className="text-xs text-slate-500">Saldos actuales</span></div><p className="mt-2 text-sm text-slate-500">Una primera mirada a los recursos y compromisos registrados.</p><dl className="mt-4 divide-y divide-slate-100"><div className="flex justify-between gap-3 py-4"><dt className="text-sm text-slate-600">Valor de tu inventario</dt><dd className="font-semibold tabular-nums">{formatUsd(inventoryCents)}</dd></div><div className="flex justify-between gap-3 py-4"><dt className="text-sm text-slate-600">Pagos pendientes <span className="block text-xs text-slate-400">{pending.length} cuentas por pagar</span></dt><dd className="font-semibold tabular-nums">{formatUsd(payableCents)}</dd></div><div className="flex justify-between gap-3 py-4"><dt className="text-sm text-slate-600">De esos pagos, ya vencidos</dt><dd className={`font-semibold tabular-nums ${overdueCents ? 'text-rose-700' : 'text-slate-600'}`}>{formatUsd(overdueCents)}</dd></div></dl><p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">Balance parcial de todas las fechas. Faltan caja, bancos, cobros y saldos iniciales para conocer el patrimonio completo.</p></section>
      </div>
      <p className="text-xs leading-5 text-slate-500">Las cifras dependen de lo que has registrado. El resultado es orientativo: ventas sin IVA y gastos por su importe registrado; no representa utilidad contable definitiva ni efectivo disponible.</p>
    </>}

    {view === 'sales' && <>
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-bold">Tus ventas, de un vistazo</h2><p className="mt-1 text-sm text-slate-500">El filtro de cliente se aplica a las cifras, los gráficos y el detalle.</p></div><label className="text-xs font-semibold">Cliente<select value={customer} onChange={(event) => setCustomer(event.target.value)} className={input}><option value="TODOS">Todos los clientes</option>{customers.map((name) => <option key={name}>{name}</option>)}</select></label></div>
      <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]"><section className={panel}><div className="mb-4"><p className="text-sm text-slate-500">Ventas netas del periodo</p><strong className="text-2xl font-semibold">{formatUsd(salesNet)}</strong><p className="mt-1 text-xs text-slate-500">{sales.length} documentos · sin IVA · devoluciones descontadas</p></div><TrendChart data={businessTrend(sales, { from, to })} salesOnly/></section><section className={panel}><h2 className="font-bold">Ventas por cliente</h2><p className="mb-5 mt-1 text-xs text-slate-500">Importes netos. Un valor negativo indica más devoluciones que ventas.</p><div className="max-h-80 overflow-auto pr-1"><Distribution items={groupAmounts(sales, 'counterparty')} color="bg-blue-500" empty="No hay ventas con estos filtros."/></div></section></div>
      <section className={panel}><h2 className="font-bold">Detalle de ventas</h2><div className="mt-4 max-h-[440px] overflow-auto"><table className="w-full min-w-[480px] text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="pb-3">Cliente</th><th>Fecha</th><th>Documento</th><th className="text-right">Importe sin IVA</th></tr></thead><tbody>{[...sales].sort((a, b) => b.date.localeCompare(a.date)).map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="py-4 font-medium">{item.counterparty}</td><td>{item.date}</td><td>{item.kind === 'CREDIT' ? 'Nota de crédito' : 'Factura'}</td><td className="text-right tabular-nums">{formatUsd(item.kind === 'CREDIT' ? -item.cents : item.cents)}</td></tr>)}</tbody></table>{!sales.length && <p className="py-8 text-center text-sm text-slate-500">No hay ventas con estos filtros.</p>}</div></section>
    </>}

    {view === 'expenses' && <>
      <section className={panel}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">Gastos</h2><p className="mt-1 text-sm text-slate-500">Registros manuales y compras conciliadas desde OCR.</p></div><button onClick={() => setAdding(true)} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">+ Agregar gasto manual</button></div>
        {notice && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
        <div className="my-5 flex flex-wrap items-end gap-3"><label className="min-w-48 flex-1 text-xs font-semibold">Buscar gasto<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Proveedor o concepto" className={input}/></label><label className="text-xs font-semibold">Categoría<select value={category} onChange={(event) => setCategory(event.target.value)} className={input}><option value="TODAS">Todas las categorías</option>{categories.map((name) => <option key={name}>{name}</option>)}</select></label><div className="ml-auto text-right"><p className="text-xs text-slate-500">{visibleExpenses.length} gastos con estos filtros</p><strong className="text-xl tabular-nums">{formatUsd(total(visibleExpenses))}</strong></div></div>
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(230px,1fr)]"><div className="max-h-[440px] overflow-auto"><table className="w-full min-w-[440px] text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="pb-3">Proveedor / concepto</th><th>Fecha</th><th className="text-right">Importe</th></tr></thead><tbody>{[...visibleExpenses].sort((a, b) => b.date.localeCompare(a.date)).map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="py-3 pr-3"><strong className="font-medium">{item.counterparty}</strong><p className="mt-1 text-xs text-slate-500">{expenseById.get(item.id)?.concepto}</p><span className="mt-1 inline-block text-xs text-slate-400">{item.category}</span></td><td>{item.date}</td><td className="text-right font-medium tabular-nums">{formatUsd(item.cents)}</td></tr>)}</tbody></table>{!visibleExpenses.length && <p className="py-8 text-center text-sm text-slate-500">No hay gastos con estos filtros.</p>}</div><aside className="rounded-xl bg-slate-50 p-4"><h3 className="mb-4 text-sm font-semibold">Distribución de estos gastos</h3><div className="max-h-80 overflow-auto"><Distribution items={groupAmounts(visibleExpenses, 'category')}/></div></aside></div>
      </section>
      <PayablesPanel/>
    </>}
    {adding && view === 'expenses' && <ExpenseForm onClose={() => setAdding(false)} onSaved={(date) => { setAdding(false); setCategory('TODAS'); setSearch(''); setFrom((current) => !current || date < current ? date : current); setTo((current) => !current || date > current ? date : current); setNotice('Gasto guardado. Tus cifras ya incluyen este registro.'); }}/>}
  </div>;
}

