import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ScanLine,
  Calendar,
  Store,
  Users,
  FileText,
  ShieldAlert,
  BarChart3
} from 'lucide-react';

export const WebSidebar: React.FC = () => {
  const { activeTab, setActiveTab, activeRole } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, roles: ['CONTRIBUYENTE'] },
    { id: 'document_history', label: 'Documentos emitidos', icon: FileText, roles: ['CONTRIBUYENTE'] },
    { id: 'purchases', label: 'Compras & OCR', icon: ScanLine, roles: ['CONTRIBUYENTE'] },
    { id: 'calendar', label: 'Calendario tributario', icon: Calendar, roles: ['CONTRIBUYENTE'] },
    { id: 'marketplace', label: 'Buscar contador', icon: Store, roles: ['CONTRIBUYENTE'] },
    { id: 'notifications', label: 'Notificaciones', icon: ShieldAlert, roles: ['CONTRIBUYENTE', 'CONTADOR_PROFESIONAL'] },
    { id: 'accountant_dashboard', label: 'Resumen profesional', icon: LayoutDashboard, roles: ['CONTADOR_PROFESIONAL'], highlight: true },
    { id: 'accountant_clients', label: 'Mis clientes', icon: Users, roles: ['CONTADOR_PROFESIONAL'] },
    { id: 'marketplace', label: 'Oportunidades', icon: Store, roles: ['CONTADOR_PROFESIONAL'] },
    { id: 'accountant_proposals', label: 'Mis propuestas', icon: FileText, roles: ['CONTADOR_PROFESIONAL'] },
    { id: 'admin_console', label: 'Panorama', icon: LayoutDashboard, roles: ['SUPER_ADMIN'] },
    { id: 'admin_marketplace', label: 'Marketplace', icon: Store, roles: ['SUPER_ADMIN'] },
    { id: 'admin_taxpayers', label: 'Contribuyentes', icon: Users, roles: ['SUPER_ADMIN'] },
    { id: 'admin_accountants', label: 'Contadores', icon: FileText, roles: ['SUPER_ADMIN'] },
    { id: 'admin_activity', label: 'Actividad', icon: BarChart3, roles: ['SUPER_ADMIN'] }
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(activeRole));

  return (
    <aside aria-label="Navegación principal" className="group w-14 hover:w-60 focus-within:w-60 bg-[#f7f9f8] text-slate-600 flex flex-col justify-between shrink-0 border-r border-slate-200/80 select-none transition-[width] duration-200 overflow-hidden">
      {/* Navigation List */}
      <div className="py-4">
        <div className="whitespace-nowrap px-5 mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
          Espacio de trabajo
        </div>
        <nav className="space-y-1 px-2" aria-label="Secciones">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full min-h-11 flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-white text-blue-800 font-semibold shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                } ${item.highlight ? 'ring-1 ring-blue-200/70' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                <span className={`whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 ${isActive ? 'text-blue-800' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

    </aside>
  );
};
