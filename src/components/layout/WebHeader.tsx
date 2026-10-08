import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Bell, ChevronDown, Check, X } from 'lucide-react';

export const WebHeader: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    setActiveTab,
    signOutDemo,
    profile,
    accountantProfile,
    toasts,
    dismissToast,
    impersonatedClientId,
    setImpersonatedClientId,
    accountantClients
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roles: { id: UserRole; label: string; desc: string; badge: string }[] = [
    {
      id: 'CONTRIBUYENTE',
      label: 'Contribuyente',
      desc: 'Empresa o persona natural obligada o no a contabilidad (RIMPE / General)',
      badge: 'Cliente'
    },
    {
      id: 'CONTADOR_PROFESIONAL',
      label: 'Contador Profesional',
      desc: 'Firma contable con cartera de clientes y feed de oportunidades',
      badge: 'CPA / Estudio'
    },
    {
      id: 'SUPER_ADMIN',
      label: 'Super Admin',
      desc: 'Consola global de CONT MARJO, telemetría y salud de enlaces SRI',
      badge: 'Plataforma'
    }
  ];

  const currentClient = accountantClients.find((c) => c.id === impersonatedClientId);

  return (
    <header className="h-[72px] bg-white/95 backdrop-blur border-b border-slate-200/80 px-3 sm:px-5 lg:px-7 flex items-center justify-between gap-3 shrink-0 sticky top-0 z-30">
      {/* Brand wordmark, profile & context indicator */}
      <div className="flex items-center gap-4">
        <button onClick={() => setActiveTab(activeRole === 'SUPER_ADMIN' ? 'admin_console' : activeRole === 'CONTADOR_PROFESIONAL' ? 'accountant_dashboard' : 'dashboard')} className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-blue-800 text-white flex items-center justify-center font-black text-sm shadow-sm">
            360
          </span>
          <span className="hidden md:inline font-extrabold text-slate-900 tracking-tight">CONT MARJO</span>
          <span className="hidden xl:inline text-[10px] font-semibold text-slate-500 font-mono tracking-[0.14em]">SRI ECUADOR</span>
        </button>
        {/* Impersonation Indicator if Accountant is viewing a client */}
        {activeRole === 'CONTADOR_PROFESIONAL' && impersonatedClientId && (
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Auditando cliente: <strong>{currentClient?.razonSocial || 'Cliente'}</strong></span>
            <button
              onClick={() => { setImpersonatedClientId(null); setActiveTab('accountant_dashboard'); }}
              className="ml-1 text-amber-700 hover:text-amber-900 text-[11px] underline cursor-pointer"
            >
              Volver a mi cartera
            </button>
          </div>
        )}
      </div>

      {/* Demo role switcher */}
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        {/* Global Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            aria-expanded={showRoleMenu}
            aria-haspopup="menu"
            onKeyDown={(event) => { if (event.key === 'Escape') setShowRoleMenu(false); }}
          >
            <span className="text-slate-500 font-normal hidden sm:inline">Demo:</span>
            <span>
              {activeRole === 'CONTRIBUYENTE' && 'Contribuyente'}
              {activeRole === 'CONTADOR_PROFESIONAL' && 'Contador CPA'}
              {activeRole === 'SUPER_ADMIN' && 'Super Admin'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showRoleMenu && (
          <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Perfil de demostración
              </div>
              <div className="space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setActiveRole(r.id);
                      setImpersonatedClientId(null);
                      setActiveTab(r.id === 'SUPER_ADMIN' ? 'admin_console' : r.id === 'CONTADOR_PROFESIONAL' ? 'accountant_dashboard' : 'dashboard');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs flex items-start justify-between transition-colors cursor-pointer ${
                      activeRole === r.id
                        ? 'bg-blue-50/80 text-blue-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{r.label}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-xs">
                          {r.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">{r.desc}</p>
                    </div>
                    {activeRole === r.id && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
              <button onClick={() => { setShowRoleMenu(false); signOutDemo(); }} className="mt-2 w-full border-t px-2 pt-3 text-left text-xs font-semibold text-slate-600 hover:text-red-700">Cerrar sesión de demostración</button>
            </div>
          )}
        </div>
      </div>

      {/* Push Alert trigger and notifications */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="grid h-10 w-10 place-items-center text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors relative cursor-pointer"
            aria-label="Ver notificaciones del SRI"
            aria-expanded={showNotifications}
            aria-haspopup="dialog"
            onKeyDown={(event) => { if (event.key === 'Escape') setShowNotifications(false); }}
          >
            <Bell className="w-4 h-4" />
            {toasts.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-800">Alertas Preventivas SRI</span>
                <span className="text-[10px] text-slate-400">{toasts.length} activas</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {toasts.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No hay alertas pendientes</p>
                ) : (
                  toasts.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">{t.title}</span>
                          <span className="text-[10px] text-slate-400">{t.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">{t.message}</p>
                      </div>
                      <button
                        onClick={() => dismissToast(t.id)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button onClick={() => setActiveTab('profile')} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-1.5 sm:px-2 py-1.5 text-left hover:bg-blue-50 transition-colors" aria-label="Abrir perfil y configuración">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{activeRole === 'CONTRIBUYENTE' ? profile.razonSocial.slice(0, 2) : activeRole === 'CONTADOR_PROFESIONAL' ? accountantProfile.displayName.slice(0, 2) : 'SA'}</span>
          <span className="hidden sm:block"><span className="block max-w-[150px] truncate text-xs font-bold text-slate-800">{activeRole === 'CONTRIBUYENTE' ? profile.razonSocial : activeRole === 'CONTADOR_PROFESIONAL' ? accountantProfile.displayName : 'Super Admin'}</span><span className="block text-[10px] text-slate-500">Perfil y configuración</span></span>
        </button>

      </div>
    </header>
  );
};
