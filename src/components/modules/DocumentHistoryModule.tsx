import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentType } from '../../types';
import { FileText, Plus, Receipt, TrendingUp, Eye } from 'lucide-react';
import { getDocumentStatusLabel } from '../../domain/documentStatus';

const documentOptions: [DocumentType, string][] = [
  ['FACTURA', 'Factura'], ['NOTA_CREDITO', 'Nota de crédito'], ['NOTA_DEBITO', 'Nota de débito'],
  ['RETENCION', 'Comprobante de retención'], ['GUIA_REMISION', 'Guía de remisión'], ['LIQUIDACION_COMPRA', 'Liquidación de compra']
];

export const DocumentHistoryModule: React.FC = () => {
  const { invoices, startNewDocument, setActiveRideInvoice } = useApp();
  const [showNewMenu, setShowNewMenu] = useState(false);
  const count = (type: DocumentType) => invoices.filter((invoice) => invoice.type === type).length;
  const sales = invoices.filter((invoice) => invoice.type === 'FACTURA').reduce((sum, invoice) => sum + invoice.total, 0);
  const credits = invoices.filter((invoice) => invoice.type === 'NOTA_CREDITO').reduce((sum, invoice) => sum + invoice.total, 0);
  const debits = invoices.filter((invoice) => invoice.type === 'NOTA_DEBITO').reduce((sum, invoice) => sum + invoice.total, 0);
  const iva = invoices.filter((invoice) => invoice.type !== 'RETENCION').reduce((sum, invoice) => sum + invoice.iva15, 0);
  const netSales = sales - credits + debits;
  const labels: Record<DocumentType, string> = Object.fromEntries(documentOptions) as Record<DocumentType, string>;

  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
      <div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Documentos emitidos · demo</p><h1 className="mt-1 text-2xl font-bold">Historial y efecto contable</h1><p className="mt-1 text-sm text-slate-600">Consulta tus comprobantes y su impacto resumido en ventas e IVA. No conectado al SRI.</p></div>
      <div className="relative"><button onClick={() => setShowNewMenu((open) => !open)} aria-haspopup="menu" onKeyDown={(event) => { if (event.key === 'Escape') setShowNewMenu(false); }} aria-expanded={showNewMenu} className="flex min-h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-800"><Plus className="h-4 w-4"/>Nuevo</button>
        {showNewMenu && <div role="menu" aria-label="Tipo de documento" className="absolute left-0 right-auto sm:left-auto sm:right-0 z-20 mt-2 w-64 max-w-[calc(100vw-5rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"><p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">¿Qué documento emitir?</p>{documentOptions.map(([type, label]) => <button role="menuitem" key={type} onClick={() => { startNewDocument(type); setShowNewMenu(false); }} className="block min-h-10 w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-blue-50">{label}</button>)}</div>}
      </div>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><span className="text-xs text-slate-500">Facturas emitidas</span><strong className="mt-1 block text-2xl font-mono tabular-nums">{count('FACTURA')}</strong><span className="text-xs text-slate-500">Ventas brutas · ${sales.toFixed(2)}</span></article>
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><span className="text-xs text-slate-500">Notas de crédito y débito</span><strong className="mt-1 block text-2xl font-mono tabular-nums">{count('NOTA_CREDITO') + count('NOTA_DEBITO')}</strong><span className="text-xs text-slate-500">−${credits.toFixed(2)} / +${debits.toFixed(2)}</span></article>
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><span className="text-xs text-slate-500">Ventas netas estimadas</span><strong className="mt-1 block text-2xl font-mono tabular-nums">${netSales.toFixed(2)}</strong><span className="text-xs text-slate-500">Facturas menos notas de crédito más débito</span></article>
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><span className="text-xs text-slate-500">IVA asociado · demo</span><strong className="mt-1 block text-2xl font-mono tabular-nums">${iva.toFixed(2)}</strong><span className="text-xs text-slate-500">No representa una declaración</span></article>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b p-4"><FileText className="h-4 w-4 text-blue-600"/><div><h2 className="font-bold">Historial de documentos</h2><p className="text-xs text-slate-500">Abre un comprobante para revisar su vista previa.</p></div></div>
      {invoices.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">Aún no hay documentos en el historial. Usa “Nuevo” para iniciar una emisión simulada.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3">Documento</th><th className="p-3">Cliente / receptor</th><th className="p-3">Fecha</th><th className="p-3">Total</th><th className="p-3">Estado demo</th><th className="p-3 text-right">Vista</th></tr></thead><tbody className="divide-y">{[...invoices].reverse().map((invoice) => <tr key={invoice.id} className="hover:bg-slate-50"><td className="p-3"><strong className="block">{labels[invoice.type]}</strong><span className="font-mono text-xs text-slate-500">{invoice.id}</span></td><td className="p-3">{invoice.clientRucName}</td><td className="p-3 text-slate-600">{invoice.date}</td><td className="p-3 font-mono">${invoice.total.toFixed(2)}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${invoice.status === 'PENDIENTE_SRI' ? 'bg-amber-50 text-amber-800' : invoice.status === 'DEVUELTO' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>{getDocumentStatusLabel(invoice.status)}</span></td><td className="p-3 text-right"><button onClick={() => setActiveRideInvoice(invoice)} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"><Eye className="h-3.5 w-3.5"/>Ver</button></td></tr>)}</tbody></table></div>}
    </section>
    <p className="flex items-center gap-2 text-xs text-slate-500"><TrendingUp className="h-4 w-4"/><Receipt className="h-4 w-4"/> Los totales son una lectura simplificada de los comprobantes de ejemplo y no sustituyen la contabilidad ni una declaración.</p>
  </div>;
};
