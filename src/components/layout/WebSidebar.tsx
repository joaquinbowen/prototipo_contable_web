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
  ExternalLink
} from 'lucide-react';

export const WebSidebar: React.FC = () => {
  const { activeTab, setActiveTab, activeRole, impersonatedClientId } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: activeRole === 'CONTADOR_PROFESIONAL' ? 'Panel del contador' : 'Inicio',
      icon: LayoutDashboard,
      roles: ['CONTRIBUYENTE']
    },
    { id: 'document_history', label: 'Historial de documentos', icon: FileText, roles: ['CONTRIBUYENTE'] },
    {
      id: 'purchases',
      label: 'Compras & OCR',
      icon: ScanLine,
      roles: ['CONTRIBUYENTE']
    },
    {
      id: 'calendar',
      label: 'Calendario Tributario',
      icon: Calendar,
      roles: ['CONTRIBUYENTE']
    },
    {
      id: 'marketplace',
      label: activeRole === 'CONTADOR_PROFESIONAL' ? 'Oportunidades' : 'Buscar contador',
      icon: Store,
      roles: ['CONTRIBUYENTE', 'CONTADOR_PROFESIONAL']
    },
    {
      id: 'accountant_dashboard',
      label: 'Resumen profesional',
      icon: Users,
      roles: ['CONTADOR_PROFESIONAL'],
      highlight: true
    },
    { id: 'accountant_proposals', label: 'Mis propuestas', icon: FileText, roles: ['CONTADOR_PROFESIONAL'] },
    { id: 'accountant_clients', label: 'Mis clientes', icon: Users, roles: ['CONTADOR_PROFESIONAL'] },
    {
      id: 'admin_console',
      label: 'Consola Super Admin',
      icon: ShieldAlert,
      roles: ['SUPER_ADMIN'],
      highlight: true
    }
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(activeRole) && (item.id !== 'accountant_dashboard' || !impersonatedClientId));
  if (activeRole === 'CONTADOR_PROFESIONAL' && impersonatedClientId) visibleItems.unshift({ id: 'client_workspace', label: 'Cliente en revisión', icon: Users, roles: ['CONTADOR_PROFESIONAL'] });

  return (
    <aside aria-label="Navegación principal" className="w-14 md:w-56 xl:w-64 bg-[#f7f9f8] text-slate-600 flex flex-col justify-between shrink-0 border-r border-slate-200/80 select-none">
      {/* Navigation List */}
      <div className="py-4">
        <div className="hidden md:block px-5 mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Espacio de trabajo
        </div>
        <nav className="space-y-1 px-2 md:px-3" aria-label="Secciones">
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
                className={`w-full min-h-11 flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-white text-blue-800 font-semibold shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                } ${item.highlight ? 'ring-1 ring-blue-200/70' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                <span className={`hidden md:inline truncate ${isActive ? 'text-blue-800' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* External SRI link */}
      <div className="hidden md:block p-4 border-t border-slate-200/80 space-y-3">
        {/* SRI Link */}
        <a
          href="https://srienlinea.sri.gob.ec"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-[11px] text-slate-500 hover:text-blue-800 transition-colors pt-1 px-1"
        >
          <span>Portal SRI en Línea</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
};
