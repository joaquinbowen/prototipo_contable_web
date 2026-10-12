import React, { useState } from 'react';
import { InterviewCalendar } from './InterviewCalendar';
import { ManagerAppointmentList } from './ManagerAppointmentList';
import { useVerification } from './VerificationContext';

const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function ManagerAvailability() {
  const { application, interviewSlots, weeklyAvailability, appointments, addWeeklyAvailability, removeWeeklyAvailability } = useVerification();
  const [configOpen, setConfigOpen] = useState(false);
  const [weekday, setWeekday] = useState(1);
  const [startsAt, setStartsAt] = useState('09:00');
  const [endsAt, setEndsAt] = useState('12:00');
  const [modality, setModality] = useState<'VIRTUAL' | 'PRESENCIAL'>('VIRTUAL');
  const [place, setPlace] = useState('');
  const [error, setError] = useState('');
  const addAvailability = (event: React.FormEvent) => {
    event.preventDefault();
    try { addWeeklyAvailability({ weekday, startsAt, endsAt, modality, place }); setPlace(''); setError(''); }
    catch (cause) { setError((cause as Error).message); }
  };
  const calendarAppointments = [...appointments];
  if (application.interview && !calendarAppointments.some((item) => item.startsAt === application.interview?.startsAt)) {
    calendarAppointments.push({
      id: `current-${application.id}`, startsAt: application.interview.startsAt,
      modality: application.interview.modality || 'VIRTUAL', place: application.interview.place || 'Lugar por definir',
      accountantName: application.fullName, accountantEmail: application.email, completed: application.interview.completed,
    });
  }

  return <div className="mx-auto max-w-5xl space-y-5">
    <header className="rounded-2xl border bg-white p-6"><p className="text-xs font-bold uppercase text-blue-700">Agenda del gestor · Demostración</p><h1 className="mt-2 text-2xl font-bold">Disponibilidad y entrevistas</h1><p className="mt-2 text-sm text-slate-600">Consulta el calendario, filtra las citas y administra las franjas semanales.</p></header>
    <section className="rounded-2xl border bg-white p-5"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Agenda de entrevistas</h2><p className="mt-1 text-sm text-slate-600">Horarios disponibles y citas concertadas.</p></div><button type="button" onClick={() => { setConfigOpen(true); setError(''); }} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Configurar franjas</button></div>
      <InterviewCalendar slots={interviewSlots} appointments={calendarAppointments}/>
      <ManagerAppointmentList slots={interviewSlots} appointments={calendarAppointments}/>
    </section>
    {configOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfigOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="availability-title" onKeyDown={(event) => { if (event.key === 'Escape') setConfigOpen(false); }} className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Configuración semanal</p><h2 id="availability-title" className="mt-1 text-xl font-bold">Franjas para entrevistas</h2><p className="mt-1 text-sm text-slate-600">Cada franja genera horarios de 30 minutos todas las semanas.</p></div><button type="button" onClick={() => setConfigOpen(false)} aria-label="Cerrar configuración" className="rounded-lg border px-3 py-2 text-sm font-semibold">Cerrar</button></div>
      <form onSubmit={addAvailability} className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-sm">Día<select value={weekday} onChange={(event) => setWeekday(Number(event.target.value))} className="mt-1 w-full rounded-lg border p-2.5">{weekdays.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label><label className="text-sm">Modalidad<select value={modality} onChange={(event) => setModality(event.target.value as 'VIRTUAL' | 'PRESENCIAL')} className="mt-1 w-full rounded-lg border p-2.5"><option value="VIRTUAL">Virtual</option><option value="PRESENCIAL">Presencial</option></select></label><label className="text-sm">Desde<input required type="time" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label><label className="text-sm">Hasta<input required type="time" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label><label className="text-sm sm:col-span-2">{modality === 'VIRTUAL' ? 'Enlace de reunión' : 'Dirección o lugar'}<input required value={place} onChange={(event) => setPlace(event.target.value)} placeholder={modality === 'VIRTUAL' ? 'Enlace que se compartirá con el postulante' : 'Dirección de la entrevista'} className="mt-1 w-full rounded-lg border p-2.5"/></label><button className="w-fit rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Guardar franja</button></form>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <h3 className="mt-6 border-t pt-5 font-semibold">Franjas configuradas</h3><ul className="mt-3 space-y-2 text-sm">{weeklyAvailability.length ? weeklyAvailability.map((rule) => <li key={rule.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3"><span><strong>{weekdays[rule.weekday]}</strong> · {rule.startsAt} a {rule.endsAt} · <span className={rule.modality === 'VIRTUAL' ? 'font-semibold text-blue-800' : 'font-semibold text-violet-800'}>{rule.modality === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</span> · {rule.place}</span><button type="button" onClick={() => removeWeeklyAvailability(rule.id)} className="text-sm font-semibold text-red-700">Quitar</button></li>) : <li className="text-slate-500">Todavía no defines franjas semanales.</li>}</ul></section></div>}
  </div>;
}
