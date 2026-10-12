import { useState } from 'react';
import type { InterviewAppointment, InterviewSlot } from './verificationRules';

type Filter = 'RESERVADAS' | 'REALIZADAS' | 'DISPONIBLES' | 'TODAS';
const time = (value: string) => new Date(value).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
const dayKey = (value: string) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export function ManagerAppointmentList({ slots, appointments }: { slots: InterviewSlot[]; appointments: InterviewAppointment[] }) {
  const [filter, setFilter] = useState<Filter>('RESERVADAS');
  const [page, setPage] = useState(0);
  const groups = new Map<string, InterviewSlot[]>();
  for (const slot of slots) {
    const day = dayKey(slot.startsAt);
    groups.set(day, [...(groups.get(day) || []), slot]);
  }
  const booked = appointments.filter((item) => filter === 'TODAS' || (filter === 'RESERVADAS' && !item.completed) || (filter === 'REALIZADAS' && item.completed))
    .sort((a, b) => filter === 'REALIZADAS' ? b.startsAt.localeCompare(a.startsAt) : a.startsAt.localeCompare(b.startsAt));
  const freeDays = filter === 'DISPONIBLES' || filter === 'TODAS' ? [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)) : [];
  const rows = [
    ...booked.map((appointment) => ({ kind: 'appointment' as const, id: appointment.id, appointment })),
    ...freeDays.map(([day, available]) => ({ kind: 'day' as const, id: day, available })),
  ];
  const pageCount = Math.max(1, Math.ceil(rows.length / 6));
  const currentPage = Math.min(page, pageCount - 1);
  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'RESERVADAS', label: 'Reservadas', count: appointments.filter((item) => !item.completed).length },
    { id: 'REALIZADAS', label: 'Realizadas', count: appointments.filter((item) => item.completed).length },
    { id: 'DISPONIBLES', label: 'Disponibles', count: groups.size },
    { id: 'TODAS', label: 'Todas', count: appointments.length + groups.size },
  ];
  return <section className="mt-6 border-t pt-5" aria-label="Lista de citas">
    <h3 className="font-semibold">Citas y disponibilidad</h3>
    <p className="mt-1 text-xs text-slate-500">Revisa primero las reservas. Los horarios libres se resumen por día; abre una fecha para consultar sus horas.</p>
    <div className="mt-4 flex flex-wrap gap-2" aria-label="Filtrar lista de citas">{filters.map((option) => <button type="button" key={option.id} onClick={() => { setFilter(option.id); setPage(0); }} aria-pressed={filter === option.id} className={`rounded-full border px-3 py-2 text-xs font-semibold ${filter === option.id ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>{option.label}{option.id !== 'TODAS' && <span className="ml-1 opacity-75">{option.count}{option.id === 'DISPONIBLES' ? ' días' : ''}</span>}</button>)}</div>
    <div className="mt-3 space-y-2">{rows.slice(currentPage * 6, currentPage * 6 + 6).map((row) => row.kind === 'appointment' ? <article key={`appointment-${row.id}`} className={`flex flex-wrap items-start justify-between gap-2 rounded-xl border p-3 text-sm ${row.appointment.modality === 'VIRTUAL' ? 'border-blue-200 bg-blue-50' : 'border-violet-200 bg-violet-50'}`}>
      <div><strong>{new Date(row.appointment.startsAt).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })} · {row.appointment.modality === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</strong><p className="mt-1 text-xs text-slate-600">{row.appointment.accountantName} · {row.appointment.place}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.appointment.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{row.appointment.completed ? 'Realizada' : 'Reservada'}</span>
    </article> : <details key={`${filter}-day-${row.id}`} className="rounded-xl border border-slate-200 bg-white p-3 text-sm"><summary className="cursor-pointer font-semibold"><span>{new Date(`${row.id}T12:00:00`).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}</span><span className="ml-2 text-xs font-normal text-slate-500">{row.available.length} horarios libres</span></summary><div className="mt-3 space-y-3">{(['VIRTUAL', 'PRESENCIAL'] as const).map((modality) => {
      const available = row.available.filter((slot) => slot.modality === modality);
      return available.length > 0 && <div key={modality}><p className={`mb-2 text-xs font-semibold ${modality === 'VIRTUAL' ? 'text-blue-800' : 'text-violet-800'}`}>{modality === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</p><div className="flex flex-wrap gap-2">{available.map((slot) => <span key={slot.id} title={slot.place} className={`rounded-lg px-2 py-1 text-xs ${modality === 'VIRTUAL' ? 'bg-blue-50 text-blue-900' : 'bg-violet-50 text-violet-900'}`}>{time(slot.startsAt)}</span>)}</div></div>;
    })}</div></details>)}{!rows.length && <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{filter === 'RESERVADAS' ? 'No hay entrevistas reservadas. Puedes consultar los horarios libres en Disponibles.' : 'No hay registros en esta categoría.'}</p>}</div>
    {pageCount > 1 && <div className="mt-4 flex items-center justify-between text-sm"><button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Anterior</button><span className="text-xs text-slate-500">Página {currentPage + 1} de {pageCount}</span><button type="button" disabled={currentPage === pageCount - 1} onClick={() => setPage(currentPage + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Siguiente</button></div>}
  </section>;
}
