import React, { useState } from 'react';
import { useVerification } from './VerificationContext';
import type { VerificationAction } from './verificationRules';
import { ApplicationRecord, ApplicationHistory } from './ApplicationRecord';

const labels: Record<VerificationAction, string> = {
  SUBMIT: 'Enviar expediente', REQUEST_CHANGES: 'Solicitar correcciones', READY_INTERVIEW: 'Habilitar entrevista',
  SCHEDULE: 'Agendar', COMPLETE_INTERVIEW: 'Simular entrevista', APPROVE: 'Aprobar contador definitivamente',
  REJECT: 'Rechazar postulación', SUSPEND: 'Suspender contador'
};
const statusLabels: Record<string, string> = {
  BORRADOR: 'Borrador', EN_REVISION: 'En revisión', REQUIERE_CAMBIOS: 'Requiere correcciones',
  HABILITADO_PARA_ENTREVISTA: 'Listo para entrevista', ENTREVISTA_AGENDADA: 'Entrevista agendada',
  PENDIENTE_DECISION: 'Pendiente de aprobación', VERIFICADO: 'Contador verificado', RECHAZADO: 'Rechazado', SUSPENDIDO: 'Suspendido'
};

export function ManagerInbox() {
  const { applications } = useVerification();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('TODOS');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const category = (status: string) => ['VERIFICADO', 'RECHAZADO', 'SUSPENDIDO'].includes(status) ? 'REVISADOS' : ['EN_REVISION', 'PENDIENTE_DECISION'].includes(status) ? 'PENDIENTES' : 'SEGUIMIENTO';
  const visible = applications.filter((record) => (filter === 'TODOS' || category(record.status) === filter) && `${record.fullName} ${record.email}`.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es')));
  if (selectedId && applications.some((record) => record.id === selectedId)) return <ManagerApplicationDetail key={selectedId} id={selectedId} onBack={() => setSelectedId(null)}/>;
  return <div className="mx-auto max-w-5xl space-y-5">
    <header className="rounded-2xl border bg-white p-6"><p className="text-xs font-bold uppercase text-blue-700">Gestión de postulaciones</p><h1 className="mt-2 text-2xl font-bold">Expedientes de contadores</h1><p className="mt-2 text-sm text-slate-600">Selecciona un contador para revisar sus documentos, continuar la evaluación o consultar sus decisiones anteriores.</p></header>
    <section className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap items-center gap-3"><label className="min-w-48 flex-1 text-sm">Buscar contador<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre o correo electrónico" className="mt-1 w-full rounded-lg border px-3 py-2"/></label><div className="flex gap-2" aria-label="Presentación de expedientes">{(['grid', 'list'] as const).map((mode) => <button type="button" key={mode} aria-pressed={view === mode} onClick={() => setView(mode)} className={`rounded-lg border px-3 py-2 text-sm ${view === mode ? 'bg-blue-50 text-blue-800' : ''}`}>{mode === 'grid' ? 'Cuadrícula' : 'Lista'}</button>)}</div></div>
      <div className="my-4 flex flex-wrap gap-2">{[['TODOS', 'Todos'], ['PENDIENTES', 'Por revisar'], ['SEGUIMIENTO', 'En seguimiento'], ['REVISADOS', 'Revisados']].map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${filter === value ? 'bg-blue-700 text-white' : 'bg-white text-slate-600'}`}>{label} · {applications.filter((record) => value === 'TODOS' || category(record.status) === value).length}</button>)}</div>
      <div className={view === 'grid' ? 'grid gap-3 sm:grid-cols-2' : 'space-y-3'}>{visible.map((record) => <button type="button" key={record.id} onClick={() => setSelectedId(record.id)} className={`rounded-xl border p-4 text-left hover:border-blue-400 hover:bg-blue-50/30 ${view === 'list' ? 'flex w-full flex-wrap items-center justify-between gap-3' : ''}`}><div><h2 className="font-bold">{record.fullName || 'Nombre pendiente'}</h2><p className="mt-1 break-all text-sm text-slate-500">{record.email}</p><p className="mt-2 text-xs text-slate-500">{record.city || 'Ciudad pendiente'} · {record.history.length} acciones registradas</p>{record.history.at(-1) && <p className="mt-1 text-xs text-slate-500">Última actualización: {new Date(record.history.at(-1)!.at).toLocaleString('es-EC')}</p>}</div><div className="mt-3"><span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${record.status === 'VERIFICADO' ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'}`}>{statusLabels[record.status]}</span><span className="mt-3 block text-xs font-semibold text-blue-700">Ver expediente →</span></div></button>)}</div>{!visible.length && <p className="py-8 text-center text-sm text-slate-500">No hay expedientes que coincidan con estos filtros.</p>}
    </section>
  </div>;
}

function ManagerApplicationDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { applications, actOnApplication } = useVerification();
  const application = applications.find((record) => record.id === id)!;
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const perform = (action: VerificationAction) => {
    try { actOnApplication(id, action, note); setNote(''); setError(''); } catch (cause) { setError((cause as Error).message); }
  };
  const actions: VerificationAction[] = application.status === 'EN_REVISION' ? ['REQUEST_CHANGES', 'READY_INTERVIEW'] : application.status === 'ENTREVISTA_AGENDADA' ? ['COMPLETE_INTERVIEW'] : application.status === 'PENDIENTE_DECISION' ? ['APPROVE', 'REJECT'] : application.status === 'VERIFICADO' ? ['SUSPEND'] : [];
  return <div className="mx-auto max-w-5xl space-y-5">
    <button type="button" onClick={onBack} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-blue-800">← Volver a expedientes</button>
    <header className="rounded-2xl border bg-white p-6"><p className="text-xs font-bold uppercase text-blue-700">Gestión de postulaciones</p><h1 className="mt-2 text-2xl font-bold">Expedientes de contadores</h1><p className="mt-2 text-sm text-slate-600">Revisa cada respaldo, simula la entrevista agendada y registra la aprobación final para habilitar al contador en el marketplace.</p></header>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Ficha profesional</p><h2 className="mt-1 text-xl font-bold">{application.fullName || 'Nombre pendiente'}</h2><p className="mt-1 text-sm text-slate-600">{application.email}</p></div><span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue-900">{statusLabels[application.status]}</span></div>
    <ApplicationRecord application={application}/>
    <section className="rounded-2xl border bg-white p-5 sm:p-6"><h2 className="font-bold">Revisión y decisión del gestor</h2>
      {application.interview && <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm"><strong>Entrevista:</strong> {new Date(application.interview.startsAt).toLocaleString('es-EC')} · {application.interview.modality === 'VIRTUAL' ? 'Virtual' : application.interview.modality === 'PRESENCIAL' ? 'Presencial' : 'Modalidad pendiente'}{application.interview.place && ` · ${application.interview.place}`} · {application.interview.completed ? 'Simulación realizada' : 'Pendiente de realizar'}</div>}
      {actions.length > 0 && <div className="mt-5 border-t pt-4"><label className="block text-sm font-medium">{application.status === 'ENTREVISTA_AGENDADA' ? 'Resultado de la entrevista simulada' : 'Observación o motivo'}<textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder={application.status === 'ENTREVISTA_AGENDADA' ? 'Registra el resultado para habilitar la aprobación final' : 'Explica la revisión o decisión'}/></label><div className="mt-3 flex flex-wrap gap-2">{actions.map((action) => <button key={action} type="button" onClick={() => perform(action)} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${action === 'APPROVE' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-blue-700 hover:bg-blue-800'}`}>{labels[action]}</button>)}</div></div>}{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
    <ApplicationHistory application={application}/>
  </div>;
}
