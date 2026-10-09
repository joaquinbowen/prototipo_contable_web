import { useState } from 'react';
import { BadgeCheck, ChevronDown, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { DocumentType } from '../../types';

const documents: [DocumentType, string][] = [
  ['FACTURA', 'Factura'], ['NOTA_CREDITO', 'Nota de crédito'],
  ['NOTA_DEBITO', 'Nota de débito'], ['RETENCION', 'Retención'],
  ['GUIA_REMISION', 'Guía de remisión'], ['LIQUIDACION_COMPRA', 'Liquidación de compra'],
];

const titles: Record<string, string> = {
  dashboard: 'Inicio', document_history: 'Documentos emitidos', invoicing: 'Emisión',
  purchases: 'Compras y proveedores', calendar: 'Calendario tributario',
  marketplace: 'Marketplace', accountant_dashboard: 'Resumen profesional',
  accountant_proposals: 'Mis propuestas', accountant_clients: 'Mis clientes',
  client_workspace: 'Auditar cliente', admin_console: 'Panorama', admin_marketplace: 'Marketplace', admin_taxpayers: 'Contribuyentes', admin_accountants: 'Contadores', admin_activity: 'Actividad',
  profile: 'Mi perfil', onboarding: 'Datos tributarios', vault: 'Firma y bóveda',
  notifications: 'Notificaciones',
  accounting: 'Registro contable', accounting_register: 'Registro contable', accounting_books: 'Libros contables', accounting_statements: 'Estados financieros', accounting_banks: 'Bancos', accounting_closing: 'Cierres', accounting_tax: 'Tributación', accounting_reports: 'Reportes contables',
};

export function ContextBar() {
  const { activeRole, activeTab, profile, accountantProfile, startNewDocument } = useApp();
  const [open, setOpen] = useState(false);
  const ownName = activeRole === 'CONTADOR_PROFESIONAL' ? accountantProfile.displayName : activeRole === 'SUPER_ADMIN' ? 'Administración de plataforma' : profile.razonSocial;
  const ownId = activeRole === 'CONTADOR_PROFESIONAL' ? accountantProfile.professionalLicense : activeRole === 'SUPER_ADMIN' ? 'CONT MARJO 360' : profile.ruc;
  return <div className="relative z-20 flex min-h-14 shrink-0 flex-wrap items-center gap-3 border-b border-blue-200 bg-blue-50 px-4 py-2 shadow-sm sm:px-7">
    <strong className="text-sm text-slate-900">{titles[activeTab] || 'Inicio'}</strong>
    <span className="hidden h-6 w-px bg-slate-200 sm:block"/>
    <div className="flex min-w-0 items-center gap-2 text-sm text-blue-800"><span className="truncate font-semibold">{ownId ? `${ownId} · ` : ''}{ownName}</span><BadgeCheck className="h-4 w-4 shrink-0 text-teal-500" aria-label="Perfil de demostración"/></div>
    {activeRole === 'CONTRIBUYENTE' && <div className="relative ml-auto"><button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu" className="flex min-h-10 items-center gap-1 rounded-full bg-rose-50 px-4 text-sm font-bold text-rose-700 hover:bg-rose-100"><Plus className="h-4 w-4"/>Nuevo<ChevronDown className="h-4 w-4"/></button>
      {open && <div role="menu" aria-label="Emitir documento" className="absolute right-0 top-12 z-40 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">{documents.map(([type, label]) => <button key={type} role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-blue-50" onClick={() => { startNewDocument(type); setOpen(false); }}>{label}</button>)}</div>}</div>}
  </div>;
}
