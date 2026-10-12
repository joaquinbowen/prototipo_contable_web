import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useVerification } from './VerificationContext';

const statusLabels: Record<string, string> = {
  BORRADOR: 'Perfil en preparación', EN_REVISION: 'En revisión', REQUIERE_CAMBIOS: 'Requiere correcciones',
  HABILITADO_PARA_ENTREVISTA: 'Listo para entrevista', ENTREVISTA_AGENDADA: 'Entrevista agendada',
  PENDIENTE_DECISION: 'Pendiente de aprobación', VERIFICADO: 'Verificado', RECHAZADO: 'Rechazado', SUSPENDIDO: 'Suspendido'
};

export function ManagerDashboard() {
  const { application, applications } = useVerification();
  const { marketplaceRequests, serviceContracts, setActiveTab } = useApp();
  const accountants = useMemo(() => {
    const rows = new Map<string, { id: string; name: string; email: string; status: string }>();
    const currentStatus = application.status === 'VERIFICADO' ? 'Verificado' : statusLabels[application.status] || 'Postulación';
    rows.set(application.accountantId, { id: application.accountantId, name: application.fullName, email: application.email, status: currentStatus });
    for (const request of marketplaceRequests) for (const offer of request.offers) {
      const existing = rows.get(offer.accountantId);
      rows.set(offer.accountantId, { id: offer.accountantId, name: offer.accountantName, email: existing?.email || 'Correo no disponible', status: 'Verificado' });
    }
    for (const contract of serviceContracts) {
      const existing = rows.get(contract.accountantId);
      rows.set(contract.accountantId, { id: contract.accountantId, name: contract.accountantName, email: existing?.email || 'Correo no disponible', status: existing?.status === 'Verificado' ? 'Verificado' : existing?.status || 'En actividad' });
    }
    for (const record of applications) {
      const id = record.id === application.id ? record.accountantId : `record-${record.id}`;
      rows.set(id, { id, name: record.fullName, email: record.email, status: statusLabels[record.status] });
    }
    return [...rows.values()].map((row) => {
      const work = serviceContracts.filter((contract) => contract.accountantId === row.id);
      const activeWork = work.filter((contract) => contract.status !== 'COMPLETADO').length;
      const finishedWork = work.filter((contract) => contract.status === 'COMPLETADO').length;
      return { ...row, activeWork, finishedWork };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [application, applications, marketplaceRequests, serviceContracts]);

  const pendingApplications = applications.filter((record) => !['BORRADOR', 'VERIFICADO', 'RECHAZADO', 'SUSPENDIDO'].includes(record.status)).length;
  const interviews = applications.filter((record) => ['HABILITADO_PARA_ENTREVISTA', 'ENTREVISTA_AGENDADA'].includes(record.status)).length;
  const verified = accountants.filter((accountant) => accountant.status === 'Verificado').length;
  const activeJobs = serviceContracts.filter((contract) => contract.status !== 'COMPLETADO').length;
  const metrics = [
    { label: 'Expedientes abiertos', value: pendingApplications, tone: 'text-amber-700', tab: 'manager_applications' },
    { label: 'Entrevistas por atender', value: interviews, tone: 'text-violet-700', tab: 'manager_interviews' },
    { label: 'Contadores verificados', value: verified, tone: 'text-emerald-700', tab: 'manager_applications' },
    { label: 'Trabajos en curso', value: activeJobs, tone: 'text-blue-700', tab: 'manager_applications' },
  ];

  return <div className="mx-auto max-w-6xl space-y-5">
    <header className="rounded-2xl border bg-white p-6"><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Gestor de contadores · Panel general</p><h1 className="mt-2 text-2xl font-bold">Estado de la red profesional</h1><p className="mt-2 text-sm text-slate-600">Consulta las postulaciones, entrevistas, contadores habilitados y los trabajos activos del marketplace.</p></header>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <button type="button" key={metric.label} onClick={() => setActiveTab(metric.tab)} className="rounded-2xl border bg-white p-5 text-left transition hover:border-blue-300 hover:shadow-sm"><span className="text-sm text-slate-600">{metric.label}</span><strong className={`mt-2 block text-3xl ${metric.tone}`}>{metric.value}</strong></button>)}</section>
    <section className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">Contadores y postulantes</h2><p className="mt-1 text-sm text-slate-600">El estado del trabajo se calcula desde los contratos activos del marketplace.</p></div><button type="button" onClick={() => setActiveTab('manager_applications')} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Abrir expedientes</button></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-left text-sm"><thead><tr className="border-b text-xs uppercase tracking-wide text-slate-500"><th className="px-3 py-3 font-semibold">Profesional</th><th className="px-3 py-3 font-semibold">Estado</th><th className="px-3 py-3 text-center font-semibold">Trabajos activos</th><th className="px-3 py-3 text-center font-semibold">Completados</th></tr></thead><tbody>{accountants.map((accountant) => <tr key={accountant.id} className="border-b last:border-0"><td className="px-3 py-3"><strong className="block">{accountant.name || 'Postulante sin nombre'}</strong><span className="text-xs text-slate-500">{accountant.email}</span></td><td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${accountant.status === 'Verificado' ? 'bg-emerald-50 text-emerald-800' : accountant.status.includes('entrevista') || accountant.status.includes('Entrevista') ? 'bg-violet-50 text-violet-800' : 'bg-amber-50 text-amber-800'}`}>{accountant.status}{accountant.activeWork > 0 && ' · Trabajando'}</span></td><td className="px-3 py-3 text-center font-semibold">{accountant.activeWork}</td><td className="px-3 py-3 text-center text-slate-600">{accountant.finishedWork}</td></tr>)}</tbody></table></div>
      {!accountants.length && <p className="py-8 text-center text-sm text-slate-500">No hay contadores registrados todavía.</p>}
    </section>
  </div>;
}
