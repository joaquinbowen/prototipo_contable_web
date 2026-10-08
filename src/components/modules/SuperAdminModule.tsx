import React from 'react';
import { Activity, Database, FileCheck2, FileClock, FileText, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateAdminStats } from '../../domain/adminStats';

const demoUsers = [
  { role: 'CONTRIBUYENTE' as const },
  { role: 'CONTRIBUYENTE' as const },
  { role: 'CONTADOR_PROFESIONAL' as const },
  { role: 'SUPER_ADMIN' as const },
];

export const SuperAdminModule: React.FC = () => {
  const { invoices, marketplaceRequests, ocrReconciliations, profile, vaultDocuments } = useApp();
  const stats = calculateAdminStats({
    users: demoUsers,
    documents: invoices,
    marketplace: marketplaceRequests,
    ocrReconciliations,
    vaultUsed: vaultDocuments.length,
    vaultLimit: profile.storageLimit,
    services: [{ status: 'available' }, { status: 'available' }, { status: 'available' }],
  });
  const documentTotal = invoices.length;
  const share = (count: number) => documentTotal ? `${Math.round((count / documentTotal) * 100)}%` : '0%';

  const cards = [
    { label: 'Contribuyentes', value: stats.usersByRole.CONTRIBUYENTE, detail: 'Perfiles de la muestra', Icon: Users },
    { label: 'Contadores', value: stats.usersByRole.CONTADOR_PROFESIONAL, detail: 'Perfiles de la muestra', Icon: Users },
    { label: 'Comprobantes procesados', value: documentTotal, detail: `${stats.documentsByStatus.PENDIENTE_SRI} pendientes de aprobación`, Icon: FileText },
    { label: 'Propuestas de marketplace', value: stats.marketplaceOffers, detail: `${marketplaceRequests.length} solicitudes demo`, Icon: Activity },
    { label: 'Compras OCR conciliadas', value: stats.ocrReconciliations, detail: 'Cambios locales contabilizados', Icon: FileCheck2 },
    { label: 'Uso de bóveda', value: `${stats.vaultUsagePercent}%`, detail: `${vaultDocuments.length} / ${profile.storageLimit} documentos`, Icon: Database },
  ];

  return <div className="space-y-6">
    <header className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600"><Activity className="h-4 w-4"/>Administración de plataforma · demo</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Resumen operativo</h1>
      <p className="mt-1 text-xs text-slate-500">Indicadores calculados desde datos locales de ejemplo. No representan usuarios, actividad ni conexiones reales.</p>
    </header>

    <section aria-label="Estadísticas principales" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ label, value, detail, Icon }) => <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><span className="text-xs font-medium text-slate-600">{label}</span><Icon className="h-4 w-4 text-slate-500"/></div><strong className="mt-2 block font-mono text-2xl tabular-nums text-slate-900">{value}</strong><span className="mt-1 block text-[11px] text-slate-500">{detail}</span></article>)}
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2"><FileClock className="h-4 w-4 text-slate-600"/><div><h2 className="text-sm font-bold text-slate-900">Ciclo de comprobantes</h2><p className="text-[11px] text-slate-500">Conteos de la muestra local</p></div></div>
        {([
          ['Pendiente por aprobación del SRI', stats.documentsByStatus.PENDIENTE_SRI, 'bg-amber-500'],
          ['Aprobado por el SRI y enviado', stats.documentsByStatus.APROBADO_ENVIADO, 'bg-emerald-600'],
          ['Borrador', stats.documentsByStatus.BORRADOR, 'bg-slate-400'],
          ['Devuelto', stats.documentsByStatus.DEVUELTO, 'bg-rose-500'],
        ] as const).map(([label, count, color]) => <div key={label} className="mb-3 last:mb-0"><div className="mb-1 flex justify-between gap-3 text-xs"><span className="text-slate-700">{label}</span><strong className="font-mono">{count}</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${color}`} style={{ width: share(count) }}/></div></div>)}
      </article>
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-slate-600"/><div><h2 className="text-sm font-bold text-slate-900">Servicios e integraciones</h2><p className="text-[11px] text-slate-500">Estados de interfaz, no monitoreo de red</p></div></div>
        {['Aprobación de comprobantes SRI', 'Lectura OCR', 'Firma electrónica'].map((name) => <div key={name} className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 p-3 last:mb-0"><span className="text-xs font-medium text-slate-700">{name}</span><span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700">Simulado</span></div>)}
        <p className="mt-3 text-[11px] leading-5 text-slate-500">Sin conexiones activas con el SRI ni validación criptográfica.</p>
      </article>
    </section>
  </div>;
};
