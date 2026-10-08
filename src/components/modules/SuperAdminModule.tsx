import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Server,
  Activity,
  Users,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw
} from 'lucide-react';

export const SuperAdminModule: React.FC = () => {
  const { invoices } = useApp();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] text-blue-700 font-semibold mb-1.5 tracking-wide">
          <ShieldAlert className="w-4 h-4" />
          <span>ADMINISTRACIÓN DE PLATAFORMA · DEMO</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Resumen de la plataforma
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Indicadores de ejemplo. No representan datos en vivo ni conexiones activas con el SRI.
        </p>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs text-slate-500">Contribuyentes · demo</span>
          <span className="text-2xl font-bold text-slate-900 font-mono block tabular-nums">1,482</span>
          <span className="text-[11px] text-emerald-600 font-medium">+18 esta semana</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs text-slate-500">Estudios contables · demo</span>
          <span className="text-2xl font-bold text-slate-900 font-mono block tabular-nums">128</span>
          <span className="text-[11px] text-slate-400">Colegios de Pichincha y Guayas</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs text-slate-500">Comprobantes este mes · demo</span>
          <span className="text-2xl font-bold text-slate-900 font-mono block tabular-nums">48,294</span>
          <span className="text-[11px] text-blue-700 font-medium">Tasa simulada: 99,98%</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs text-slate-500">Certificados configurados · demo</span>
          <span className="text-2xl font-bold text-emerald-600 font-mono block tabular-nums">1,390</span>
          <span className="text-[11px] text-slate-400">Conteo de ejemplo</span>
        </div>
      </div>

      {/* SRI Web Service Gateway Health Monitors */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            Conectividad con el SRI
          </h3>
            <span className="text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Estado de ejemplo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Recepción Comprobantes</span>
            <span className="text-slate-600 font-bold">DEMO</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">cel.sri.gob.ec/recepcion-comprobantes</p>
            <div className="flex justify-between text-[11px] pt-1 text-slate-600">
              <span>Latencia: <strong>320 ms</strong></span>
              <span>Disponibilidad: <strong>99.9%</strong></span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Autorización Comprobantes</span>
            <span className="text-slate-600 font-bold">DEMO</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">cel.sri.gob.ec/autorizacion-comprobantes</p>
            <div className="flex justify-between text-[11px] pt-1 text-slate-600">
              <span>Latencia: <strong>410 ms</strong></span>
              <span>Disponibilidad: <strong>99.8%</strong></span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Validador RUC & Catastro</span>
            <span className="text-slate-600 font-bold">DEMO</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">srienlinea.sri.gob.ec/catastro-api</p>
            <div className="flex justify-between text-[11px] pt-1 text-slate-600">
              <span>Latencia: <strong>195 ms</strong></span>
              <span>Disponibilidad: <strong>100%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Activity Stream */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Actividad de ejemplo</h3>
          <p className="text-xs text-slate-500">Eventos ficticios para visualizar una bitácora operativa.</p>
        </div>

        <div className="p-4 space-y-2.5 text-xs font-mono">
          {[
            {
              time: '17:35:12',
              action: 'SRI_AUTH_SUCCESS',
              detail: 'Clave 0610202601179284759200120010010000001031234567812 autorizada en 420ms.',
              level: 'INFO'
            },
            {
              time: '17:34:00',
              action: 'CRYPTO_PFX_SIGN',
              detail: 'Firma digital X.509 aplicada con certificado Security Data S.A. Hash SHA-256 verificado.',
              level: 'INFO'
            },
            {
              time: '17:32:45',
              action: 'OCR_RUC_PARSED',
              detail: 'Extracción completada para RUC 1792847592001 (EMPRESA DEMO ECUADOR S.A.S. - RIMPE).',
              level: 'SUCCESS'
            },
            {
              time: '17:30:10',
              action: 'MARKETPLACE_BID',
              detail: 'CPA. Carlos Andrés Mendoza envió oferta de $45 USD para REQ-101.',
              level: 'INFO'
            }
          ].map((log, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-400">[{log.time}]</span>
                <span className="font-bold text-blue-700">{log.action}</span>
                <span className="text-slate-700">{log.detail}</span>
              </div>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs font-semibold self-start sm:self-auto">
                {log.level}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
