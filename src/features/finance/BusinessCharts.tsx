import React from 'react';
import { formatUsd } from './metrics';
import type { businessTrend } from './businessTrend';

export const panel = 'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6';
export const dateLabel = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export function TrendChart({ data, salesOnly = false }: { data: ReturnType<typeof businessTrend>; salesOnly?: boolean }) {
  const values = data.flatMap((item) => salesOnly ? [item.sales] : [item.sales, item.expenses]);
  const max = Math.max(100, ...values);
  const min = Math.min(0, ...values);
  const y = (value: number) => 195 - (value - min) / (max - min) * 165;
  const zero = y(0);
  const hasData = values.some((value) => value !== 0);
  return <div>
    <div className="mb-2 flex flex-wrap gap-4 text-xs text-slate-600"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-blue-600"/>Ventas netas</span>{!salesOnly && <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-amber-500"/>Gastos registrados</span>}<span>USD · cada grupo reúne las fechas indicadas</span></div>
    {!hasData ? <p className="flex min-h-52 items-center justify-center rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No hay movimientos en este periodo. Prueba con otras fechas.</p> : <div className="overflow-x-auto"><svg viewBox="0 0 680 248" className="w-full min-w-[500px]" role="img" aria-label={salesOnly ? 'Evolución de ventas netas; valores en la tabla siguiente' : 'Comparación de ventas y gastos; valores en la tabla siguiente'}>
      {[min, (min + max) / 2, max].map((value, index) => <g key={index}><line x1="78" x2="668" y1={y(value)} y2={y(value)} stroke="#e2e8f0" strokeDasharray="4 4"/><text x="70" y={y(value) + 4} textAnchor="end" fontSize="11" fill="#64748b">{formatUsd(Math.round(value))}</text></g>)}
      <line x1="78" x2="668" y1={zero} y2={zero} stroke="#94a3b8"/>
      {data.map((item, index) => { const x = 88 + index * (570 / data.length); const width = Math.min(25, 210 / data.length); return <g key={item.from}>
        <rect x={x} y={Math.min(zero, y(item.sales))} width={width} height={Math.abs(y(item.sales) - zero)} rx="3" fill="#2563eb"><title>{dateLabel(item.from)} – {dateLabel(item.to)}: ventas {formatUsd(item.sales)}</title></rect>
        {!salesOnly && <rect x={x + width + 4} y={Math.min(zero, y(item.expenses))} width={width} height={Math.abs(y(item.expenses) - zero)} rx="3" fill="#f59e0b"><title>Gastos: {formatUsd(item.expenses)}</title></rect>}
        <text x={x + width} y="217" textAnchor="middle" fontSize="11" fill="#64748b">{dateLabel(item.from)}</text>{item.to !== item.from && <text x={x + width} y="233" textAnchor="middle" fontSize="10" fill="#94a3b8">al {dateLabel(item.to)}</text>}
      </g>; })}
    </svg></div>}
    {hasData && <details className="mt-2 text-xs text-slate-500"><summary className="cursor-pointer py-1">Ver cifras del gráfico</summary><div className="overflow-auto"><table className="mt-2 w-full text-left"><thead><tr><th className="py-2">Fechas</th><th>Ventas netas</th>{!salesOnly && <th>Gastos</th>}</tr></thead><tbody>{data.map((item) => <tr key={item.from} className="border-t"><td className="py-2">{dateLabel(item.from)} – {dateLabel(item.to)}</td><td>{formatUsd(item.sales)}</td>{!salesOnly && <td>{formatUsd(item.expenses)}</td>}</tr>)}</tbody></table></div></details>}
  </div>;
}

export function Distribution({ items, color = 'bg-amber-500', empty = 'No hay gastos en este periodo.' }: { items: { name: string; cents: number }[]; color?: string; empty?: string }) {
  const max = Math.max(1, ...items.map((item) => Math.abs(item.cents)));
  return <div className="space-y-4">{items.length ? items.map((item) => <div key={item.name}><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="min-w-0 break-words text-slate-600">{item.name}</span><strong className="shrink-0 tabular-nums">{formatUsd(item.cents)}</strong></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.cents < 0 ? 'bg-rose-400' : color}`} style={{ width: `${Math.abs(item.cents) / max * 100}%` }}/></div></div>) : <p className="py-8 text-sm text-slate-500">{empty}</p>}</div>;
}

