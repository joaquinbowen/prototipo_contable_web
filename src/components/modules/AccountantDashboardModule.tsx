import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientPortfolioItem } from '../../types';
import { useAccounting } from '../../context/AccountingContext';
import {
  Users,
  CheckCircle2,
  Search,
  ChevronRight
} from 'lucide-react';

export const AccountantDashboardModule: React.FC = () => {
  const { selectEntity } = useAccounting();
  const {
    accountantClients,
    impersonatedClientId,
    setImpersonatedClientId,
    setActiveTab,
    triggerSamplePushAlert
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAlert, setFilterAlert] = useState<'ALL' | 'CRITICO' | 'ALERTA' | 'AL_DIA'>('ALL');

  const filteredClients = accountantClients.filter((c) => {
    const matchesSearch =
      c.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ruc.includes(searchTerm);
    const matchesAlert = filterAlert === 'ALL' || c.estadoAlerta === filterAlert;
    return matchesSearch && matchesAlert;
  });

  const totalClientsCount = accountantClients.length;
  const proximasObligacionesCount = accountantClients.filter((client) => client.diasRestantes <= 15 && client.estadoAlerta !== 'AL_DIA').length;
  const porCobrarTotal = accountantClients.filter((client) => client.estadoPago !== 'PAGADO').reduce((sum, client) => sum + client.honorariosMensuales, 0);
  const clientsByAlert = (status: ClientPortfolioItem['estadoAlerta']) => accountantClients.filter((client) => client.estadoAlerta === status);

  const handleImpersonate = (client: ClientPortfolioItem) => {
    setImpersonatedClientId(client.id);
    triggerSamplePushAlert(
      'Sesión Delegada Iniciada',
      `Abriendo el expediente de demostración de: ${client.razonSocial}`
    );
    setActiveTab('client_workspace');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-1">
            <Users className="w-4 h-4" />
            <span>ESPACIO PROFESIONAL · DEMO</span>
          </div>
          <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 tracking-tight">
            Resumen del contador
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Revisa obligaciones de ejemplo, abre expedientes y entrega evidencia de las declaraciones realizadas.
          </p>
        </div>

        {impersonatedClientId && (
          <button
            onClick={() => setImpersonatedClientId(null)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Salir de Vista Delegada de Cliente
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Clientes de ejemplo en cartera</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalClientsCount}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Demo</span>
          </div>
          <span className="text-[11px] text-slate-400 block">Registros locales de demostración</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Obligaciones próximas · demo</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
              {proximasObligacionesCount}
            </span>
            <span className="text-xs text-amber-600 font-medium">Esta quincena</span>
          </div>
          <span className="text-[11px] text-slate-400 block">Confirma vencimientos reales con el SRI</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Honorarios pendientes · demo</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              ${porCobrarTotal.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-mono">USD</span>
          </div>
          <span className="text-[11px] text-slate-400 block">Suma local de clientes no marcados como pagados</span>
        </div>
      </div>

      {/* Alert Heatmap Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Estado de obligaciones de ejemplo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setFilterAlert('CRITICO')}
            className="p-3.5 rounded-lg border border-red-200 bg-red-50/70 text-left hover:bg-red-100/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              {clientsByAlert('CRITICO').length} clientes con alerta crítica
            </div>
            <p className="text-[11px] text-red-700 mt-1">
              {clientsByAlert('CRITICO').map((client) => client.razonSocial).join(', ') || 'No hay clientes en esta categoría.'}
            </p>
          </button>

          <button
            onClick={() => setFilterAlert('ALERTA')}
            className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/70 text-left hover:bg-amber-100/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              {clientsByAlert('ALERTA').length} clientes requieren seguimiento
            </div>
            <p className="text-[11px] text-amber-700 mt-1">
              {clientsByAlert('ALERTA').map((client) => client.razonSocial).join(', ') || 'No hay clientes en esta categoría.'}
            </p>
          </button>

          <button
            onClick={() => setFilterAlert('AL_DIA')}
            className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/70 text-left hover:bg-emerald-100/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {clientsByAlert('AL_DIA').length} clientes al día
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              {clientsByAlert('AL_DIA').map((client) => client.razonSocial).join(', ') || 'No hay clientes en esta categoría.'}
            </p>
          </button>
        </div>
      </div>

      {/* Multi-tenant Client Portfolio Grid & Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Cartera de clientes</h3>
            <p className="text-xs text-slate-500">
              Abre un expediente para revisar sus obligaciones y adjuntar evidencia de declaraciones y anexos entregados.
            </p>
          </div>

          {/* Search bar & filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por Razón Social o RUC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {filterAlert !== 'ALL' && (
              <button
                onClick={() => setFilterAlert('ALL')}
                className="text-xs text-blue-600 hover:underline cursor-pointer"
              >
                Limpiar Filtro
              </button>
            )}
          </div>
        </div>

        {/* Clients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="p-3.5">Cliente / RUC</th>
                <th className="p-3.5">Régimen</th>
                <th className="p-3.5 text-center">9no Dígito</th>
                <th className="p-3.5">Próxima Obligación</th>
                <th className="p-3.5">Vencimiento</th>
                <th className="p-3.5 text-center">Estado Alerta</th>
                <th className="p-3.5 text-right">Honorarios</th>
                <th className="p-3.5 text-right">Multi-Tenant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map((client) => {
                const isImpersonated = impersonatedClientId === client.id;
                return (
                  <tr
                    key={client.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isImpersonated ? 'bg-blue-50/60 font-semibold' : ''
                    }`}
                  >
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block truncate max-w-[220px]">
                        {client.razonSocial}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">{client.ruc}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">{client.regimen}</td>
                    <td className="p-3.5 text-center">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold font-mono inline-flex items-center justify-center">
                        {client.novenoDigito}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">{client.proximaObligacion}</td>
                    <td className="p-3.5">
                      <span className="font-mono text-slate-800 block">{client.fechaVencimiento}</span>
                      <span className="text-[10px] text-slate-400 font-medium">en {client.diasRestantes} días</span>
                    </td>
                    <td className="p-3.5 text-center">
                      {client.estadoAlerta === 'CRITICO' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> Crítico
                        </span>
                      )}
                      {client.estadoAlerta === 'ALERTA' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Alerta
                        </span>
                      )}
                      {client.estadoAlerta === 'AL_DIA' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Al Día
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                      ${client.honorariosMensuales.toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleImpersonate(client)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          isImpersonated
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <span>{isImpersonated ? 'Activo en Bóveda' : 'Auditar Cliente'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { selectEntity(client.ruc); setActiveTab('accounting'); }} className="ml-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100">Abrir contabilidad</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
