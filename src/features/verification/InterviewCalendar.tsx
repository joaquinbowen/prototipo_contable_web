import { useMemo, useState } from 'react';
import type { InterviewAppointment, InterviewModality, InterviewSlot } from './verificationRules';
import { getMonthDates } from './interviewScheduling';

const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const modalityName = (modality: InterviewModality) => modality === 'VIRTUAL' ? 'Virtual' : 'Presencial';
const availableStyle = (modality: InterviewModality) => modality === 'VIRTUAL'
  ? 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100'
  : 'border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100';
const reservedStyle = (modality: InterviewModality) => modality === 'VIRTUAL'
  ? 'border-blue-500 bg-blue-100 text-blue-950'
  : 'border-violet-500 bg-violet-100 text-violet-950';

type InterviewCalendarProps = {
  slots: InterviewSlot[];
  appointments: InterviewAppointment[];
  onBook?: (slotId: string) => void;
  bookedStartsAt?: string;
};

export function InterviewCalendar({ slots, appointments, onBook, bookedStartsAt }: InterviewCalendarProps) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(() => dayKey(new Date()));
  const dates = getMonthDates(month.getFullYear(), month.getMonth());
  const slotsByDay = useMemo(() => groupByDay(slots), [slots]);
  const appointmentsByDay = useMemo(() => groupByDay(appointments), [appointments]);
  const selectedSlots = slotsByDay[selectedDay] || [];
  const selectedAppointments = appointmentsByDay[selectedDay] || [];

  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="font-semibold">Calendario de entrevistas</h3><p className="text-sm text-slate-500">Elige un día para consultar horarios disponibles y citas concertadas.</p></div>
      <div className="flex items-center gap-2"><button type="button" aria-label="Mes anterior" onClick={() => setMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))} className="rounded-lg border px-3 py-2">‹</button><strong className="min-w-36 text-center capitalize">{month.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })}</strong><button type="button" aria-label="Mes siguiente" onClick={() => setMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))} className="rounded-lg border px-3 py-2">›</button></div>
    </div>
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs"><span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-blue-600"/>Virtual</span><span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-violet-600"/>Presencial</span><span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-slate-600"/>Cita concertada</span></div>
    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs">{['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map((day) => <div key={day} className="py-2 font-semibold text-slate-500">{day}</div>)}{dates.map((date) => {
      const key = dayKey(date);
      const available = slotsByDay[key] || [];
      const booked = appointmentsByDay[key] || [];
      const modalities = new Set([...available.map((item) => item.modality), ...booked.map((item) => item.modality)]);
      const outsideMonth = date.getMonth() !== month.getMonth();
      return <button type="button" key={key} onClick={() => setSelectedDay(key)} aria-label={`${date.toLocaleDateString('es-EC', { day: 'numeric', month: 'long' })}${available.length ? `, ${available.length} horarios disponibles` : ''}${booked.length ? `, ${booked.length} citas concertadas` : ''}`} className={`relative flex min-h-12 flex-col items-center justify-center rounded-lg border text-sm ${outsideMonth ? 'text-slate-300' : 'text-slate-800'} ${selectedDay === key ? 'border-blue-600 bg-blue-50 font-bold' : 'border-transparent hover:bg-slate-50'}`}>
        <span>{date.getDate()}</span><span className="mt-1 flex h-1.5 gap-1">{modalities.has('VIRTUAL') && <i className="h-1.5 w-1.5 rounded-full bg-blue-600"/>}{modalities.has('PRESENCIAL') && <i className="h-1.5 w-1.5 rounded-full bg-violet-600"/>}{booked.length > 0 && <i className="h-1.5 w-1.5 rounded-full bg-slate-700"/>}</span>
      </button>;
    })}</div>
    <div className="mt-4 rounded-xl bg-slate-50 p-4"><h4 className="font-semibold">{new Date(`${selectedDay}T12:00:00`).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
      {selectedAppointments.map((appointment) => <div key={appointment.id} className={`mt-2 rounded-lg border p-3 text-sm ${reservedStyle(appointment.modality)}`}><strong>{formatTime(appointment.startsAt)} · {modalityName(appointment.modality)} · {appointment.completed ? 'Realizada' : 'Reservada'}</strong><p className="mt-0.5 text-xs">{appointment.accountantName || 'Postulante'} · {appointment.place}</p></div>)}
      {selectedSlots.length ? <details key={selectedDay} open={onBook ? true : undefined} className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-slate-600">{selectedSlots.length} horarios libres · Ver horas</summary><div className="mt-2 grid gap-2 sm:grid-cols-2">{selectedSlots.map((slot) => <div key={slot.id} className={`flex items-center justify-between gap-2 rounded-lg border p-3 text-sm ${availableStyle(slot.modality)}`}><span><strong>{formatTime(slot.startsAt)} · {modalityName(slot.modality)}</strong><span className="block text-xs">Disponible · {slot.place}</span></span>{onBook && <button type="button" onClick={() => onBook(slot.id)} className="shrink-0 rounded-md bg-white/80 px-3 py-1.5 text-xs font-bold">Elegir</button>}</div>)}</div></details> : selectedAppointments.length === 0 ? <p className="mt-1 text-sm text-slate-500">No hay horarios disponibles ni citas para este día.</p> : <p className="mt-2 text-sm text-slate-500">No quedan horarios disponibles para este día.</p>}
      {bookedStartsAt && <p className="mt-3 text-sm font-semibold text-emerald-800">Tu entrevista ya está agendada para el {new Date(bookedStartsAt).toLocaleString('es-EC')}.</p>}
    </div>
  </div>;
}

function groupByDay<T extends { startsAt: string }>(items: T[]): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = dayKey(new Date(item.startsAt));
    (groups[key] ||= []).push(item);
    return groups;
  }, {});
}

function formatTime(startsAt: string) {
  return new Date(startsAt).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}
