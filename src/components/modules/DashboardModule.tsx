import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Receipt,
  FileCheck2,
  CalendarClock,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Eye,
  AlertTriangle,
  FileText
} from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const {
    profile,
    invoices,
    taxDeadlines,
    setActiveTab,
    startNewDocument,
    setActivePurchaseSection,
    profileSetupComplete,
    setActiveRideInvoice,
    triggerSamplePushAlert
  } = useApp();
  const [showNewMenu, setShowNewMenu] = useState(false);
  const documentOptions = [
    ['FACTURA', 'Factura'], ['NOTA_CREDITO', 'Nota de crédito'], ['NOTA_DEBITO', 'Nota de débito'],
    ['RETENCION', 'Comprobante de retención'], ['GUIA_REMISION', 'Guía de remisión'], ['LIQUIDACION_COMPRA', 'Liquidación de compra']
  ] as const;

  const totalFacturado = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalIva = invoices.reduce((acc, inv) => acc + inv.iva15, 0);
  const authorizedCount = invoices.filter((inv) => inv.status === 'APROBADO_ENVIADO').length;
  const urgentDeadline = taxDeadlines.find((d) => d.estado === 'URGENTE') || taxDeadlines[0];

  return (
    <div className="space-y-5 lg:space-y-6">
      {!profileSetupComplete && <button onClick={() => setActiveTab('profile')} className="w-full rounded-2xl border border-amber-300/80 bg-amber-50/80 p-4 text-left text-sm text-amber-950 transition-colors hover:bg-amber-50"><strong className="block">Completa la configuración del negocio</strong><span className="mt-1 block text-xs leading-5">Carga el RUC y revisa el estado de la firma digital para terminar la configuración.</span></button>}
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-slate-500 mb-2">
            <span className="text-blue-700">RESUMEN DEL NEGOCIO</span>
            <span aria-hidden="true">·</span>
            <span>Régimen: <strong className="text-slate-800">{profile.regimen}</strong></span>
            <span>·</span>
            <span>RUC: <strong className="text-slate-800 font-mono">{profile.ruc}</strong></span>
            <span>·</span>
            <span>IVA: <strong className="text-blue-700 font-bold">15%</strong></span>
          </div>
          <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 tracking-tight [text-wrap:balance]">
            {profile.razonSocial}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Resumen de actividad y obligaciones · Datos de demostración, sin conexión al SRI.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button aria-expanded={showNewMenu} aria-haspopup="menu" onKeyDown={(event) => { if (event.key === 'Escape') setShowNewMenu(false); }} onClick={() => setShowNewMenu((open) => !open)} className="flex min-h-11 items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm cursor-pointer transition-colors"><Plus className="w-4 h-4"/><span>Nuevo</span></button>
            {showNewMenu && <div role="menu" aria-label="Crear documento o administrar productos" className="absolute left-0 right-auto sm:left-auto sm:right-0 z-20 mt-2 w-64 max-w-[calc(100vw-5rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"><p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Emitir documento · demo</p>{documentOptions.map(([type,label])=><button role="menuitem" key={type} onClick={()=>{startNewDocument(type);setShowNewMenu(false);}} className="block min-h-10 w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-blue-50">{label}</button>)}<div className="my-1 border-t"/><button role="menuitem" onClick={()=>{setActivePurchaseSection('inventory');setActiveTab('purchases');setShowNewMenu(false);}} className="block min-h-10 w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-blue-50">Producto e inventario</button></div>}
          </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="flex min-h-11 items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{profileSetupComplete ? 'Ver perfil' : 'Completar perfil'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Ventas Facturadas</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              ${totalFacturado.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +14.2%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">Periodo fiscal Octubre 2026</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Comprobantes de ejemplo</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {authorizedCount}
            </span>
            <span className="text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-xs font-semibold">
              Datos de ejemplo
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">Esquema XML XSD v2.1.0</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>IVA Cobrado (15%)</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              ${totalIva.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-normal">Cálculo local</span>
          </div>
          <span className="text-[11px] text-slate-400 block">A liquidar en formulario 104A</span>
        </div>

        {/* Metric 4 */}
        <button type="button" onClick={() => setActiveTab('calendar')} className="w-full text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 transition-colors hover:border-amber-300 hover:bg-amber-50/30 focus-visible:outline-amber-700">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Próximo Vencimiento</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-900 font-mono tabular-nums">
              {urgentDeadline ? `${urgentDeadline.diasRestantes} días` : 'Al día'}
            </span>
          </div>
          <span className="text-[11px] text-amber-700 truncate block font-medium">
            {urgentDeadline ? urgentDeadline.titulo : 'Sin obligaciones urgentes'}
          </span>
        </button>
      </div>

      {/* Middle Grid: Preventive Alert & Visual Tax Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Left: SRI Preventive Notification Banner */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Cumplimiento tributario
            </h3>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm font-medium">
              Estado de ejemplo
            </span>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Regla del 9no Dígito del RUC (Dígito: 9)
            </div>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              La agenda de esta demo usa el noveno dígito (<strong>9</strong>) para mostrar un vencimiento de ejemplo el día <strong>26</strong>. Verifica tus fechas reales con el SRI.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
              >
                Abrir Calendario Tributario Completo
              </button>
              <button
                onClick={() => triggerSamplePushAlert()}
                className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Simular Alerta Preventiva
              </button>
            </div>
          </div>

          {/* Simple Financial Summary Bar */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Proporción Subtotal Base 15% vs IVA</span>
              <span className="font-mono tabular-nums font-semibold">${(totalFacturado - totalIva).toFixed(2)} base / ${totalIva.toFixed(2)} iva</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden">
              <div className="bg-blue-600 h-full" style={{ width: '85%' }} title="Subtotal Base Imponible" />
              <div className="bg-indigo-400 h-full" style={{ width: '15%' }} title="IVA 15%" />
            </div>
          </div>
        </div>

        {/* Right: Quick Document Status & Certificate Health */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Firma digital</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Entidad de Certificación:</span>
                <span className="font-semibold text-slate-800">{profile.signatureCertIssuer}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Vigencia del Certificado:</span>
                <span className="font-mono text-emerald-600 font-semibold">{profile.signatureExpiryDays} días restantes</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Estado:</span>
                <span className={`font-semibold ${profile.signatureConfigured ? 'text-emerald-700' : 'text-amber-700'}`}>{profile.signatureConfigured ? 'Configurada en la demo' : 'Pendiente de configurar'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Esquema XML:</span>
                <span className="font-mono text-slate-700">Factura v2.1.0 (XSD)</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveTab('profile')}
              className="w-full min-h-11 py-2 px-3 text-sm font-semibold text-blue-800 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer text-center"
            >
              Revisar en Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Comprobantes Electrónicos Emitidos Recientes</h3>
            <p className="text-xs text-slate-500">Abre la vista previa local. Las claves y estados son datos de ejemplo.</p>
          </div>
          <button
            onClick={() => setActiveTab('document_history')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Ver historial completo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="p-3.5">No. Comprobante</th>
                <th className="p-3.5">Cliente / RUC</th>
                <th className="p-3.5">Fecha Emisión</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5 text-right">Subtotal</th>
                <th className="p-3.5 text-right">IVA (15%)</th>
                <th className="p-3.5 text-right">Total</th>
                <th className="p-3.5 text-center">Estado de ejemplo</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-mono font-medium text-slate-900">{inv.id}</td>
                  <td className="p-3.5">
                    <span className="font-medium text-slate-800 block truncate max-w-[200px]">{inv.clientRucName}</span>
                    <span className="font-mono text-[11px] text-slate-400">{inv.clientRuc}</span>
                  </td>
                  <td className="p-3.5 text-slate-600">{inv.date}</td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-xs">
                      {inv.type}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono tabular-nums text-slate-700">
                    ${inv.subtotal15.toFixed(2)}
                  </td>
                  <td className="p-3.5 text-right font-mono tabular-nums text-blue-600">
                    ${inv.iva15.toFixed(2)}
                  </td>
                  <td className="p-3.5 text-right font-mono tabular-nums font-bold text-slate-900">
                    ${inv.total.toFixed(2)}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {inv.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setActiveRideInvoice(inv)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver RIDE</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
