import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle2,
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { getDueDayFromRuc } from '../../domain/taxCalendar';

export const TaxCalendarModule: React.FC = () => {
  const { profile, taxDeadlines, markDeadlineDone, triggerSamplePushAlert } = useApp();
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [selectedDay, setSelectedDay] = useState<number>(8);

  // SRI Calendar days calculation based on Ecuador schedule:
  // 9th digit of profile.ruc
  const ninthDigit = /^\d{13}$/.test(profile.ruc) ? parseInt(profile.ruc.charAt(8), 10) : null;
  const dueDay = getDueDayFromRuc(profile.ruc);
  const visibleDeadlines = ninthDigit === null ? [] : taxDeadlines;

  const daysInMonth = 31;
  const startDayOffset = 3;
  const today = 8;
  const selectedDeadlines = visibleDeadlines.filter((deadline) => Number(deadline.fechaVencimiento.slice(-2)) === selectedDay);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>OBLIGACIONES TRIBUTARIAS</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Calendario tributario · Octubre 2026
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {ninthDigit === null ? 'Completa y confirma tu RUC para calcular las fechas.' : <>Fechas base según el noveno dígito del RUC (<strong>{ninthDigit}</strong>): vence el día {dueDay}. Confirma ajustes en el calendario oficial del SRI.</>}
          </p>
        </div>

        {/* View Toggle & Push Simulator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'agenda' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Agenda
            </button>
          </div>

          <button
            onClick={() =>
              triggerSamplePushAlert(
                'Alerta Preventiva SRI',
                'Nuevas reglas del SRI detectadas: Actualice sus facturas emitidas con IVA 15% antes del día 26.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Probar alerta</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar View Area */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-900">Octubre 2026</h2>
              <span className="text-xs text-slate-500 font-mono">Ejercicio Fiscal Anual</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                {ninthDigit === null ? 'RUC pendiente de configurar' : `9no dígito: ${ninthDigit} → vence el ${dueDay}`}
              </span>
            </div>
          </div>

          {viewMode === 'month' ? (
            /* Month Calendar Grid */
            <div className="space-y-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 py-1">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty cells before start of month */}
                {Array.from({ length: startDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-20 bg-slate-50/40 rounded-lg p-1.5 opacity-40 border border-transparent" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayDeadlines = visibleDeadlines.filter((deadline) => Number(deadline.fechaVencimiento.slice(-2)) === dayNum);
                  const isToday = dayNum === today;
                  const isDueDay = dayDeadlines.length > 0;
                  const isMunicipalDay = dayDeadlines.some((deadline) => deadline.tipoObligacion === 'PATENTES');
                  const isSelected = selectedDay === dayNum;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedDay(dayNum)}
                      className={`h-20 rounded-lg p-1.5 text-left transition-all border flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40'
                          : isDueDay
                          ? 'border-amber-300 bg-amber-50/30 hover:bg-amber-50/60'
                          : isMunicipalDay
                          ? 'border-red-200 bg-red-50/30 hover:bg-red-50/60'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold font-mono tabular-nums ${
                            isToday
                              ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold'
                              : isDueDay
                              ? 'text-amber-800 font-bold'
                              : 'text-slate-700'
                          }`}
                        >
                          {dayNum}
                        </span>
                        {isToday && <span className="text-[9px] text-blue-600 font-bold">HOY</span>}
                      </div>

                      {/* Event chips */}
                      <div className="space-y-0.5 overflow-hidden">
                        {dayDeadlines.slice(0, 2).map((deadline) => <div key={deadline.id} className={`text-[10px] font-semibold px-1 py-0.5 rounded-xs truncate ${deadline.tipoObligacion === 'PATENTES' ? 'bg-red-100 text-red-900' : deadline.estado === 'CUMPLIDO' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>{deadline.titulo}</div>)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Agenda List View */
            <div className="space-y-3">
              {visibleDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{deadline.titulo}</span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                        {deadline.codigoImpuesto}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{deadline.descripcion}</p>
                    <span className="text-[11px] text-slate-400">Periodo fiscal: {deadline.periodo}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block">{deadline.fechaVencimiento}</span>
                      <span
                        className={`text-[10px] font-semibold ${
                          deadline.estado === 'URGENTE'
                            ? 'text-red-600'
                            : deadline.estado === 'CUMPLIDO'
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {deadline.estado === 'CUMPLIDO'
                          ? 'Cumplido'
                          : `Vence en ${deadline.diasRestantes} días`}
                      </span>
                    </div>

                    {deadline.estado !== 'CUMPLIDO' && (
                      <button
                        onClick={() => markDeadlineDone(deadline.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Marcar cumplida
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Deadlines Detail Card & SRI Calendar Rules */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Date Details */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Detalle del Día {selectedDay} de Octubre
            </h3>
            {selectedDeadlines.length ? <div className="space-y-2">{selectedDeadlines.map((deadline) => <article key={deadline.id} className="rounded-lg border bg-slate-50 p-3 text-xs"><strong className="block text-slate-900">{deadline.titulo}</strong><span className="mt-1 block text-slate-600">{deadline.codigoImpuesto} · {deadline.estado === 'CUMPLIDO' ? 'Marcada como cumplida' : `Vence en ${deadline.diasRestantes} días`}</span>{deadline.estado !== 'CUMPLIDO' && <button onClick={() => markDeadlineDone(deadline.id)} className="mt-2 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white">Marcar cumplida (demo)</button>}</article>)}</div> : <p className="py-3 text-center text-xs text-slate-500">Sin obligaciones registradas para el día {selectedDay}.</p>}
          </div>

          {/* SRI 9th Digit Reference Table */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800">Tabla Oficial de Vencimientos SRI</h3>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600">
              {[
                { d: '1', date: 'Día 10' },
                { d: '2', date: 'Día 12' },
                { d: '3', date: 'Día 14' },
                { d: '4', date: 'Día 16' },
                { d: '5', date: 'Día 18' },
                { d: '6', date: 'Día 20' },
                { d: '7', date: 'Día 22' },
                { d: '8', date: 'Día 24' },
                { d: '9', date: 'Día 26 (Tu RUC)' },
                { d: '0', date: 'Día 28' },
              ].map((row) => (
                <div
                  key={row.d}
                  className={`p-1.5 rounded-md border flex items-center justify-between font-mono text-[11px] ${
                    row.d === '9'
                      ? 'bg-blue-50 border-blue-300 font-bold text-blue-900'
                      : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <span>Dígito {row.d}:</span>
                  <span className="tabular-nums">{row.date}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight pt-1">
              * Fechas base: si coincide con fin de semana o feriado, valida el ajuste en el calendario oficial del SRI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
