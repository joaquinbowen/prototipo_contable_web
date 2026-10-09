import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Download, FileSpreadsheet, Landmark, ReceiptText, Search } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { getProfitAndLoss } from '../../../domain/accounting/reports';
import { buildTaxPreview, exportAtsDemoXml } from '../../../domain/accounting/tax';
import { cents, dollars, moneyLabel, newId } from '../../../domain/accounting/types';
import { AccountingShell } from './AccountingShell';
import { box, field, primary, secondary, csv, download, EmptyState, StatusBadge, type AccountingModuleProps } from './AccountingUi';

type TaxView = 'IVA' | 'RENTA' | 'ATS';
type ReviewKind = Exclude<TaxView, 'ATS'>;
type ReviewForm = { adjustment: string; reason: string; evidence: string };
const views = [
  { id: 'IVA', label: 'IVA', hint: 'Documentos y conciliación', icon: ReceiptText },
  { id: 'RENTA', label: 'Renta', hint: 'Resultado y revisión anual', icon: Landmark },
  { id: 'ATS', label: 'ATS', hint: 'Detalle de compras y ventas', icon: FileSpreadsheet },
] as const;

function TaxWorkspace({ book, period, sales, purchases, act }: AccountingModuleProps) {
  const { setActiveTab } = useApp();
  const [view, setView] = useState<TaxView>('IVA');
  const [query, setQuery] = useState('');
  const [documentFilter, setDocumentFilter] = useState('ALL');
  const [formError, setFormError] = useState('');
  const preview = useMemo(() => buildTaxPreview(book, period.start, period.end, sales, purchases), [book, period.start, period.end, sales, purchases]);
  const yearStart = `${period.start.slice(0, 4)}-01-01`;
  const pnl = getProfitAndLoss(book, yearStart, period.end);
  const reviews = book.taxReviews.filter(item => item.periodId === period.id);
  const [forms, setForms] = useState<Record<ReviewKind, ReviewForm>>(() => {
    const initial = (kind: ReviewKind): ReviewForm => {
      const saved = book.taxReviews.find(item => item.periodId === period.id && item.kind === kind);
      return { adjustment: saved ? dollars(saved.adjustmentCents) : '0.00', reason: saved?.reason || '', evidence: saved?.evidence || '' };
    };
    return { IVA: initial('IVA'), RENTA: initial('RENTA') };
  });
  const kind: ReviewKind = view === 'RENTA' ? 'RENTA' : 'IVA';
  const form = forms[kind];
  const savedReview = reviews.find(item => item.kind === kind);
  const hasUnsavedChanges = form.adjustment !== (savedReview ? dollars(savedReview.adjustmentCents) : '0.00') || form.reason !== (savedReview?.reason || '') || form.evidence !== (savedReview?.evidence || '');
  const pendingAnnualEntries = book.entries.filter(item => item.status === 'DRAFT' && item.date >= yearStart && item.date <= period.end).length;
  const issues = view === 'RENTA'
    ? [...(pendingAnnualEntries ? [`${pendingAnnualEntries} asientos en borrador del año aún no forman parte del resultado.`] : []), ...(!pnl.rows.length ? ['No hay movimientos de ingresos o gastos confirmados para este ejercicio.'] : [])]
    : [...preview.issues, ...(!preview.sales.length && !preview.purchases.length ? ['No hay documentos de origen para este período.'] : [])];
  const updateForm = (change: Partial<ReviewForm>) => { setForms(current => ({ ...current, [kind]: { ...current[kind], ...change } })); setFormError(''); };
  const saveReview = (status: 'PENDING' | 'READY') => {
    const amount = cents(Number(form.adjustment));
    if (!/^-?\d+(\.\d{1,2})?$/.test(form.adjustment.trim()) || !Number.isSafeInteger(amount)) { setFormError('Indica un importe válido con hasta dos decimales.'); return; }
    if (amount !== 0 && (!form.reason.trim() || !form.evidence.trim())) { setFormError('El ajuste necesita un motivo y una referencia de evidencia.'); return; }
    if (status === 'READY' && issues.length) { setFormError('Resuelve las observaciones antes de marcar la revisión como lista.'); return; }
    setFormError('');
    act(current => ({
      ...current,
      taxReviews: [{ id: newId('TAX'), entityId: current.entityId, periodId: period.id, kind, adjustmentCents: amount, reason: form.reason.trim(), evidence: form.evidence.trim(), status, updatedAt: new Date().toISOString() }, ...current.taxReviews.filter(item => !(item.periodId === period.id && item.kind === kind))],
      audit: [{ id: newId('AUD'), entityId: current.entityId, at: new Date().toISOString(), action: 'REVISION_TRIBUTARIA', detail: `${kind} ${period.start.slice(0, 7)} · ${status} · ${form.reason.trim()}` }, ...current.audit],
    }), status === 'READY' ? `${kind}: preparado para revisión profesional.` : `Borrador de ${kind} guardado.`);
  };
  const documents = [
    ...preview.sales.map(item => ({ id: `sale-${item.id}`, category: 'SALE', type: item.type === 'NOTA_CREDITO' ? 'Nota de crédito' : item.type === 'NOTA_DEBITO' ? 'Nota de débito' : 'Venta', number: item.secuencial, name: item.clientRucName, ruc: item.clientRuc, date: item.date, base: cents(item.subtotal0 + item.subtotal15), vat: cents(item.iva15), total: cents(item.total) })),
    ...preview.purchases.map(item => ({ id: `purchase-${item.id}`, category: 'PURCHASE', type: 'Compra', number: item.numero, name: item.proveedor, ruc: item.rucProveedor, date: item.fecha, base: cents(item.subtotal), vat: cents(item.iva), total: cents(item.total) })),
  ];
  const filtered = documents.filter(item => (documentFilter === 'ALL' || item.category === documentFilter) && `${item.number} ${item.name} ${item.ruc}`.toLowerCase().includes(query.toLowerCase()));
  const exportSummary = () => {
    const rows: (string | number)[][] = view === 'IVA'
      ? [['Concepto', 'Documentos USD', 'Libro USD'], ['IVA ventas', dollars(preview.saleVatCents), dollars(preview.vatPayableCents)], ['IVA compras', dollars(preview.purchaseVatCents), dollars(preview.vatCreditCents)], ['Diferencia neta de documentos', dollars(preview.estimatedVatCents), '']]
      : view === 'RENTA'
        ? [['Cuenta', 'Nombre', 'USD'], ...pnl.rows.map(row => [row.account.code, row.account.name, dollars(row.amountCents)]), ['', 'Resultado contable', dollars(pnl.profitCents)]]
        : [['Tipo', 'Número', 'Fecha', 'Tercero', 'Identificación', 'Base USD', 'IVA USD', 'Total USD'], ...filtered.map(item => [item.type, item.number, item.date, item.name, item.ruc, dollars(item.base), dollars(item.vat), dollars(item.total)])];
    const reportPeriod = view === 'RENTA' ? `${yearStart} a ${period.end}` : `${period.start} a ${period.end}`;
    rows.unshift(['SIMULACIÓN', book.entityId, reportPeriod]);
    if (view !== 'ATS' && savedReview) rows.push(['Ajuste guardado para revisión (no aplicado)', dollars(savedReview.adjustmentCents), savedReview.reason], ['Evidencia', savedReview.evidence], ['Estado', savedReview.status]);
    download(`${view}-DEMO-${book.entityId}-${period.start.slice(0, 7)}.csv`, csv(rows));
  };

  return <div className="tax-workbench space-y-4">
    <nav className="tax-view-nav" aria-label="Tipo de preparación tributaria">
      {views.map(({ id, label, hint, icon: Icon }) => <button key={id} aria-current={view === id ? 'page' : undefined} onClick={() => { setView(id); setFormError(''); }}>
        <Icon className="h-5 w-5 shrink-0" /><span><strong>{label}</strong><small>{hint}</small></span>
      </button>)}
    </nav>

    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
      <p><span className="mr-2 rounded bg-slate-200 px-2 py-1 font-semibold text-slate-700">SIMULACIÓN</span>Archivos de demostración · sin envío al SRI</p>
      <button className={`${secondary} inline-flex items-center gap-2`} onClick={exportSummary}><Download className="h-4 w-4" />{view === 'ATS' ? 'Exportar listado CSV' : 'Exportar resumen CSV'}</button>
    </div>

    <div className="tax-review-layout">
      <div className="min-w-0 space-y-4">
        {view === 'IVA' && <section className={box}>
          <div className="tax-panel-title"><div><h2>Conciliación de IVA</h2><p>Compara los documentos del mes con los asientos confirmados.</p></div><span className="text-xs text-slate-500">{period.start} — {period.end}</span></div>
          <div className="overflow-x-auto"><table className="min-w-[540px] text-right text-sm"><thead><tr><th className="text-left">Concepto</th><th>Documentos</th><th>Libro contable</th><th>Diferencia</th></tr></thead><tbody>
            {[['IVA de ventas', preview.saleVatCents, preview.vatPayableCents], ['IVA de compras', preview.purchaseVatCents, preview.vatCreditCents]].map(([label, source, ledger]) => {
              const difference = Number(source) - Number(ledger);
              return <tr key={label} className="border-b border-slate-100"><td className="text-left font-medium">{label}</td><td>{moneyLabel(Number(source))}</td><td>{moneyLabel(Number(ledger))}</td><td className={difference ? 'font-semibold text-amber-800' : 'font-semibold text-emerald-700'}>{moneyLabel(difference)}</td></tr>;
            })}
          </tbody></table></div>
          <div className="tax-result"><div><span>IVA de ventas − IVA de compras</span><p>Estimación documental previa a otros ajustes y retenciones.</p></div><strong>{moneyLabel(preview.estimatedVatCents)}</strong></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="tax-source-note"><span>Base de ventas</span><strong>{moneyLabel(preview.saleBaseCents)}</strong><small>{preview.sales.length} documentos</small></div><div className="tax-source-note"><span>Base de compras</span><strong>{moneyLabel(preview.purchaseBaseCents)}</strong><small>{preview.purchases.length} documentos</small></div></div>
          <button className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700" onClick={() => setView('ATS')}>Consultar documentos de respaldo <ArrowRight className="h-4 w-4" /></button>
        </section>}

        {view === 'RENTA' && <section className={box}>
          <div className="tax-panel-title"><div><h2>Resultado del ejercicio</h2><p>Acumulado del {yearStart} al {period.end}, desde asientos confirmados.</p></div><StatusBadge tone="blue">Acumulado anual</StatusBadge></div>
          <div className="overflow-x-auto"><table className="min-w-[430px] text-sm"><thead><tr><th className="text-left">Cuenta</th><th className="text-left">Concepto</th><th className="text-right">Importe USD</th></tr></thead><tbody>
            {(['INCOME', 'EXPENSE'] as const).map(type => <TaxAccountGroup key={type} title={type === 'INCOME' ? 'Ingresos' : 'Gastos'} rows={pnl.rows.filter(row => row.account.kind === type)} total={type === 'INCOME' ? pnl.incomeCents : pnl.expenseCents} />)}
          </tbody></table></div>
          <div className="tax-result"><div><span>Resultado contable acumulado</span><p>Ingresos menos gastos del ejercicio.</p></div><strong>{moneyLabel(pnl.profitCents)}</strong></div>
          <p className="mt-3 text-xs leading-5 text-slate-600">El resultado contable requiere conciliación tributaria. Esta vista no calcula una base imponible ni un impuesto a la renta definitivo.</p>
        </section>}

        {view === 'ATS' && <section className={box}>
          <div className="tax-panel-title"><div><h2>Documentos del anexo</h2><p>{preview.sales.length} ventas y ajustes · {preview.purchases.length} compras del período</p></div><StatusBadge tone="slate">XML de ejemplo</StatusBadge></div>
          <div className="mb-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_170px]"><label className="relative"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><input className={`${field} w-full !pl-9`} value={query} onChange={event => setQuery(event.target.value)} placeholder="Número, tercero o identificación" aria-label="Buscar documento del ATS" /></label><select className={field} value={documentFilter} onChange={event => setDocumentFilter(event.target.value)} aria-label="Tipo de documento"><option value="ALL">Todos los documentos</option><option value="SALE">Ventas y ajustes</option><option value="PURCHASE">Compras</option></select></div>
          {filtered.length ? <div className="max-h-[510px] overflow-auto"><table className="min-w-[760px] text-sm"><thead className="sticky top-0"><tr><th className="text-left">Documento</th><th className="text-left">Tercero</th><th className="text-left">Fecha</th><th className="text-right">Base</th><th className="text-right">IVA</th><th className="text-right">Total</th></tr></thead><tbody>{filtered.map(item => <tr key={item.id} className="border-b border-slate-100"><td><strong className="block text-xs text-blue-800">{item.type}</strong><span className="whitespace-nowrap text-xs">{item.number}</span></td><td><span className="block max-w-[220px] truncate" title={item.name}>{item.name}</span><span className="text-xs text-slate-500">{item.ruc || 'Identificación pendiente'}</span></td><td className="whitespace-nowrap text-xs">{item.date}</td><td className="text-right">{moneyLabel(item.base)}</td><td className="text-right">{moneyLabel(item.vat)}</td><td className="text-right font-semibold">{moneyLabel(item.total)}</td></tr>)}</tbody></table></div> : <EmptyState title="Sin documentos en esta vista" description="Cambia los filtros o selecciona otro período para consultar sus comprobantes." />}
          <p className="mt-3 text-xs text-slate-500">{filtered.length} de {documents.length} documentos visibles. El XML incluye todos los documentos del período.</p>
        </section>}
      </div>

      <aside className="min-w-0 space-y-3">
        <section className={`${box} tax-check-panel`}>
          <div className="mb-3 flex items-center justify-between gap-2"><h2>Control de revisión</h2><StatusBadge tone={issues.length ? 'amber' : 'green'}>{issues.length ? `${issues.length} pendientes` : 'Sin diferencias detectadas'}</StatusBadge></div>
          {issues.length ? <><ul className="space-y-2">{issues.map((issue, index) => <li key={issue} className="flex gap-2 text-sm leading-5 text-slate-700"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-xs font-bold text-amber-900">{index + 1}</span>{issue}</li>)}</ul><button className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700" onClick={() => setActiveTab('accounting_register')}>Abrir registro contable <ArrowRight className="h-4 w-4" /></button></> : <p className="flex items-start gap-2 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{view === 'RENTA' ? 'No hay asientos en borrador en el ejercicio seleccionado.' : 'Los documentos y el libro coinciden en los controles disponibles.'}</p>}
        </section>

        {view !== 'ATS' ? <section className={box}>
          <div className="tax-panel-title"><div><h2>Revisión de {view === 'IVA' ? 'IVA' : 'renta'}</h2><p>{savedReview ? `Último guardado: ${new Date(savedReview.updatedAt).toLocaleString('es-EC')}` : 'Aún no se ha guardado una revisión.'}</p></div></div>
          {savedReview && <div className="mb-3"><StatusBadge tone={savedReview.status === 'READY' ? 'green' : 'slate'}>{savedReview.status === 'READY' ? 'Preparado para revisión' : 'Borrador guardado'}</StatusBadge></div>}
          {hasUnsavedChanges && <p className="mb-3 text-xs font-semibold text-amber-800">Hay cambios sin guardar en esta revisión.</p>}
          <div className="space-y-3"><label className="grid gap-1 text-xs font-semibold text-slate-700">Ajuste propuesto (USD)<input type="number" step="0.01" className={field} value={form.adjustment} onChange={event => updateForm({ adjustment: event.target.value })} /></label><label className="grid gap-1 text-xs font-semibold text-slate-700">Motivo<textarea className="min-h-20 resize-y rounded-lg border border-slate-300 p-2.5 text-sm font-normal" value={form.reason} onChange={event => updateForm({ reason: event.target.value })} placeholder="Describe la observación o el ajuste propuesto" /></label><label className="grid gap-1 text-xs font-semibold text-slate-700">Referencia de evidencia<input className={field} value={form.evidence} onChange={event => updateForm({ evidence: event.target.value })} placeholder="Documento, asiento o expediente" /></label></div>
          <p className="mt-3 text-xs leading-5 text-slate-500">El ajuste se guarda como observación. No modifica las cifras ni los asientos de origen.</p>
          {formError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-800">{formError}</p>}
          <div className="mt-4 grid gap-2"><button className={primary} onClick={() => saveReview('PENDING')}>Guardar borrador de {view === 'IVA' ? 'IVA' : 'renta'}</button><button className={`${secondary} disabled:cursor-not-allowed disabled:opacity-50`} disabled={issues.length > 0} onClick={() => saveReview('READY')}>Marcar preparado para revisión</button></div>
          {issues.length > 0 && <p className="mt-2 text-xs text-amber-800">Resuelve los pendientes para habilitar la revisión.</p>}
        </section> : <section className={box}>
          <FileSpreadsheet className="mb-3 h-7 w-7 text-blue-700" /><h2>Exportar anexo de ejemplo</h2><p className="mt-2 text-sm leading-5 text-slate-600">Incluye {documents.length} documentos del período seleccionado. El archivo no está validado para presentación oficial.</p><button className={`${primary} mt-4 inline-flex w-full items-center justify-center gap-2 disabled:opacity-50`} disabled={!documents.length} onClick={() => download(`ATS-DEMO-${book.entityId}-${period.start.slice(0, 7)}.xml`, exportAtsDemoXml(preview), 'application/xml;charset=utf-8')}><Download className="h-4 w-4" />Descargar XML de demo</button>
        </section>}
      </aside>
    </div>
  </div>;
}

function TaxAccountGroup({ title, rows, total }: { title: string; rows: ReturnType<typeof getProfitAndLoss>['rows']; total: number }) {
  return <><tr className="bg-blue-50/60"><td colSpan={2} className="font-semibold text-blue-900">{title}</td><td className="text-right font-semibold text-blue-900">{moneyLabel(total)}</td></tr>{rows.map(row => <tr key={row.account.id} className="border-b border-slate-100"><td className="font-mono text-xs text-slate-500">{row.account.code}</td><td>{row.account.name}</td><td className="text-right">{moneyLabel(row.amountCents)}</td></tr>)}</>;
}

export function TaxModule() {
  return <AccountingShell title="Tributación" description="Revisión fiscal del contribuyente: cifras, respaldos y preparación de borradores.">{context => <TaxWorkspace {...context} />}</AccountingShell>;
}
