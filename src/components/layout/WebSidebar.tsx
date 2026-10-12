import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ScanLine, Calendar, Store, Users, FileText, ShieldAlert, Package, BarChart3, CalendarDays, PenLine, UserRound, BriefcaseBusiness } from 'lucide-react';
import type { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { useVerification } from '../../features/verification/VerificationContext';

type NavItem = { id: string; label: string; icon: LucideIcon };
type NavSection = { title: string; items: NavItem[] };

const navigation: Record<UserRole, NavSection[]> = {
  CONTRIBUYENTE: [
    { title: 'Tu negocio', items: [
      { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
      { id: 'business', label: 'Mi negocio', icon: BarChart3 },
    ] },
    { title: 'Facturación y compras', items: [
      { id: 'document_history', label: 'Documentos emitidos', icon: FileText },
      { id: 'purchases', label: 'Compras y OCR', icon: ScanLine },
      { id: 'inventory', label: 'Inventario', icon: Package },
    ] },
    { title: 'Trámites y firma', items: [
      { id: 'calendar', label: 'Calendario tributario', icon: Calendar },
      { id: 'sign_pdf', label: 'Firmar PDF', icon: PenLine },
    ] },
    { title: 'Servicios contables', items: [
      { id: 'marketplace', label: 'Buscar contador', icon: Store },
      { id: 'work', label: 'Mis trabajos', icon: BriefcaseBusiness },
    ] },
    { title: 'Mi cuenta', items: [
      { id: 'notifications', label: 'Notificaciones', icon: ShieldAlert },
      { id: 'profile', label: 'Mi perfil', icon: UserRound },
    ] },
  ],
  CONTADOR_PROFESIONAL: [
    { title: 'Perfil profesional', items: [
      { id: 'accountant_dashboard', label: 'Resumen profesional', icon: LayoutDashboard },
      { id: 'verification', label: 'Mi verificación', icon: FileText },
    ] },
    { title: 'Marketplace', items: [
      { id: 'marketplace', label: 'Oportunidades', icon: Store },
      { id: 'accountant_proposals', label: 'Mis propuestas', icon: FileText },
    ] },
    { title: 'Clientes y trabajos', items: [
      { id: 'accountant_clients', label: 'Mis clientes', icon: Users },
      { id: 'work', label: 'Mis trabajos', icon: BriefcaseBusiness },
    ] },
    { title: 'Mi cuenta', items: [
      { id: 'notifications', label: 'Notificaciones', icon: ShieldAlert },
      { id: 'profile', label: 'Mi perfil', icon: UserRound },
    ] },
  ],
  GESTOR_CONTADORES: [
    { title: 'Seguimiento', items: [
      { id: 'manager_dashboard', label: 'Panel general', icon: LayoutDashboard },
    ] },
    { title: 'Verificación', items: [
      { id: 'manager_applications', label: 'Expedientes', icon: Users },
      { id: 'manager_interviews', label: 'Agenda de entrevistas', icon: CalendarDays },
    ] },
  ],
  SUPER_ADMIN: [
    { title: 'Plataforma', items: [
      { id: 'admin_console', label: 'Panorama', icon: LayoutDashboard },
      { id: 'admin_activity', label: 'Actividad', icon: BarChart3 },
    ] },
    { title: 'Usuarios', items: [
      { id: 'admin_taxpayers', label: 'Contribuyentes', icon: Users },
      { id: 'admin_accountants', label: 'Contadores', icon: FileText },
    ] },
    { title: 'Servicios', items: [
      { id: 'admin_marketplace', label: 'Marketplace', icon: Store },
    ] },
  ],
};

export const WebSidebar: React.FC = () => {
  const { activeTab, setActiveTab, activeRole } = useApp();
  const { application } = useVerification();
  const isAccountantPending = activeRole === 'CONTADOR_PROFESIONAL' && application.status !== 'VERIFICADO';
  const sections = navigation[activeRole].map((section) => ({
    ...section,
    items: section.items.filter((item) => !isAccountantPending || item.id === 'verification' || item.id === 'profile'),
  })).filter((section) => section.items.length > 0);

  return <aside aria-label="Navegación principal" className="group flex w-14 shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#f7f9f8] text-slate-600 transition-[width] duration-200 hover:w-60 focus-within:w-60">
    <nav className="min-h-0 space-y-3 overflow-y-auto overflow-x-hidden px-2 py-4" aria-label="Secciones">
      {sections.map((section, index) => <section key={section.title} aria-label={section.title} className={index > 0 ? 'border-t border-slate-200 pt-3' : ''}>
        <h2 className="mb-1.5 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{section.title}</h2>
        <div className="space-y-0.5">{section.items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return <button type="button" key={item.id} onClick={() => setActiveTab(item.id)} title={`${section.title} · ${item.label}`} aria-label={item.label} aria-current={isActive ? 'page' : undefined} className={`flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${isActive ? 'border border-slate-200/80 bg-white font-semibold text-blue-800 shadow-sm' : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'}`}>
            <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-400'}`}/><span className="whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{item.label}</span>
          </button>;
        })}</div>
      </section>)}
    </nav>
  </aside>;
};
