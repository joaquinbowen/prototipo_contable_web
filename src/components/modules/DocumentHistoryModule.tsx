import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentType } from '../../types';
import { FileText, Receipt, TrendingUp, Eye } from 'lucide-react';
import { getDocumentStatusLabel } from '../../domain/documentStatus';

const documentOptions: [DocumentType, string][] = [
  ['FACTURA', 'Factura'], ['NOTA_CREDITO', 'Nota de crédito'], ['NOTA_DEBITO', 'Nota de débito'],
  ['RETENCION', 'Comprobante de retención'], ['GUIA_REMISION', 'Guía de remisión'], ['LIQUIDACION_COMPRA', 'Liquidación de compra']
];

export const DocumentHistoryModule: React.FC = () => {
  const { invoices, setActiveRideInvoice } = useApp();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [establishment, setEstablishment] = useState('');
  const [emissionPoint, setEmissionPoint] = useState('');
  const filtered = invoices.filter((invoice) => (!type || invoice.type === type) && (!status || invoice.status === status) && (!from || invoice.date >= from) && (!to || invoice.date <= to) && (!establishment || invoice.establecimiento === establishment) && (!emissionPoint || invoice.puntoEmision === emissionPoint) && (!search || `${invoice.id} ${invoice.clientRucName} ${invoice.clientRuc}`.toLowerCase().includes(search.toLowerCase())));
  const count = (type: DocumentType) => invoices.filter((invoice) => invoice.type === type).length;
  const sales = invoices.filter((invoice) => invoice.type === 'FACTURA').reduce((sum, invoice) => sum + invoice.total, 0);
  const credits = invoices.filter((invoice) => invoice.type === 'NOTA_CREDITO').reduce((sum, invoice) => sum + invoice.total, 0);
  const debits = invoices.filter((invoice) => invoice.type === 'NOTA_DEBITO').reduce((sum, invoice) => sum + invoice.total, 0);
  const iva = invoices.filter((invoice) => invoice.type !== 'RETENCION').reduce((sum, invoice) => sum + invoice.iva15, 0);
  const netSales = sales - credits + debits;
  const labels: Record<DocumentType, string> = Object.fromEntries(documentOptions) as Record<DocumentType, string>;

  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
      <div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Documentos emitidos · demo</p><h1 className="mt-1 text-2xl font-bold">Documentos emitidos</h1><p className="mt-1 text-sm text-slate-600">Consulta y filtra tus comprobantes y su impacto resumido en ventas e IVA.</p></div>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><span className="text-xs text-slate-500">Facturas emitidas</span><strong className="mt-1 block text-2xl font-mono tabular-nums">{count('FACTURA')}</strong><span className="text-xs text-slate-500">Ventas brutas · ${sales.toFixed(2)}</span></article>
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><span className="text-xs text-slate-500">Notas de crédito y débito</span><strong className="mt-1 block text-2xl font-mono tabular-nums">{count('NOTA_CREDITO') + count('NOTA_DEBITO')}</strong><span className="text-xs text-slate-500">−${credits.toFixed(2)} / +${debits.toFixed(2)}</span></article>
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><span className="text-xs text-slate-500">Ventas netas estimadas</span><strong className="mt-1 block text-2xl font-mono tabular-nums">${netSales.toFixed(2)}</strong><span className="text-xs text-slate-500">Facturas menos notas de crédito más débito</span></article>
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><span className="text-xs text-slate-500">IVA asociado · demo</span><strong className="mt-1 block text-2xl font-mono tabular-nums">${iva.toFixed(2)}</strong><span className="text-xs text-slate-500">No representa una declaración</span></article>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="grid gap-2 border-b bg-blue-50/40 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-semibold">Tipo<select aria-label="Tipo" value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full border px-3"><option value="">Todos</option>{documentOptions.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-xs font-semibold">Estado<select aria-label="Estado" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full border px-3"><option value="">Todos</option>{['BORRADOR','PENDIENTE_SRI','APROBADO_ENVIADO','DEVUELTO'].map((value) => <option key={value} value={value}>{getDocumentStatusLabel(value as typeof invoices[number]['status'])}</option>)}</select></label>
        <label className="text-xs font-semibold">Desde<input aria-label="Fecha desde" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full border px-3"/></label>
        <label className="text-xs font-semibold">Hasta<input aria-label="Fecha hasta" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full border px-3"/></label>
        <label className="text-xs font-semibold">Establecimiento<select aria-label="Establecimiento" value={establishment} onChange={(e) => setEstablishment(e.target.value)} className="mt-1 w-full border px-3"><option value="">Todos</option>{[...new Set(invoices.map((item) => item.establecimiento))].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="text-xs font-semibold">Punto de emisión<select aria-label="Punto de emisión" value={emissionPoint} onChange={(e) => setEmissionPoint(e.target.value)} className="mt-1 w-full border px-3"><option value="">Todos</option>{[...new Set(invoices.map((item) => item.puntoEmision))].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="text-xs font-semibold">Buscar<input aria-label="Buscar documento o cliente" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Documento, cliente o RUC" className="mt-1 w-full border px-3"/></label>
        <button onClick={() => {setType('');setStatus('');setFrom('');setTo('');setEstablishment('');setEmissionPoint('');setSearch('');}} className="self-end rounded-xl border bg-white px-3 py-2 text-sm font-semibold">Limpiar filtros</button>
      </div>
      <p className="px-4 pt-3 text-xs text-slate-500">{filtered.length} de {invoices.length} documentos</p>
      {filtered.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No hay documentos para estos filtros.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3">Documento</th><th className="p-3">Cliente / receptor</th><th className="p-3">Fecha</th><th className="p-3">Total</th><th className="p-3">Estado demo</th><th className="p-3 text-right">Vista</th></tr></thead><tbody className="divide-y">{[...filtered].reverse().map((invoice) => <tr key={invoice.id} className="hover:bg-slate-50"><td className="p-3"><strong className="block">{labels[invoice.type]}</strong><span className="font-mono text-xs text-slate-500">{invoice.id}</span></td><td className="p-3">{invoice.clientRucName}</td><td className="p-3 text-slate-600">{invoice.date}</td><td className="p-3 font-mono">${invoice.total.toFixed(2)}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${invoice.status === 'PENDIENTE_SRI' ? 'bg-amber-50 text-amber-800' : invoice.status === 'DEVUELTO' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>{getDocumentStatusLabel(invoice.status)}</span></td><td className="p-3 text-right"><button onClick={() => setActiveRideInvoice(invoice)} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"><Eye className="h-3.5 w-3.5"/>Ver</button></td></tr>)}</tbody></table></div>}
    </section>
    <p className="flex items-center gap-2 text-xs text-slate-500"><TrendingUp className="h-4 w-4"/><Receipt className="h-4 w-4"/> Los totales son una lectura simplificada de los comprobantes de ejemplo y no sustituyen la contabilidad ni una declaración.</p>
  </div>;
};
