import { useState } from 'react';
import { UserRound, GraduationCap, BriefcaseBusiness, FileText, Download, CheckCircle2 } from 'lucide-react';
import type { VerificationApplication, EvidenceFile, VerificationAction } from './verificationRules';
import { loadEvidenceFile } from './evidenceFiles';

const historyLabels: Record<VerificationAction, string> = { SUBMIT: 'Expediente enviado', REQUEST_CHANGES: 'Correcciones solicitadas', READY_INTERVIEW: 'Entrevista habilitada', SCHEDULE: 'Entrevista agendada', COMPLETE_INTERVIEW: 'Entrevista realizada', APPROVE: 'Contador aprobado', REJECT: 'Postulación rechazada', SUSPEND: 'Cuenta suspendida' };

export function ApplicationHistory({ application }: { application: VerificationApplication }) {
  return <details className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><summary className="cursor-pointer font-bold text-slate-800">Historial del expediente <span className="ml-2 text-xs font-normal text-slate-500">{application.history.length} registros</span></summary>{application.history.length ? <ol className="ml-2 mt-5 border-l border-slate-200">{[...application.history].reverse().map((event, index) => <li key={`${event.at}-${index}`} className="relative pb-6 pl-5 last:pb-0"><span className="absolute -left-1 top-1.5 h-2 w-2 rounded-full bg-blue-700"/><p className="text-sm font-semibold">{historyLabels[event.action]}</p><p className="mt-1 text-xs text-slate-500">{new Date(event.at).toLocaleString('es-EC')} · {event.actorId.startsWith('manager') ? 'Gestor de contadores' : 'Postulante'}</p>{event.note && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">{event.note}</p>}</li>)}</ol> : <p className="mt-4 text-sm text-slate-500">El historial comenzará cuando envíes el expediente a revisión.</p>}</details>;
}

const sections = [
  { id: 'contact', title: 'Datos personales y contacto', description: 'La información que usaremos para comunicarnos contigo.', icon: UserRound, fields: [
    ['fullName', 'Nombre completo', 'Como aparece en tu documento de identidad'], ['email', 'Correo electrónico', 'nombre@correo.com'], ['city', 'Ciudad', 'Ej. Quito'], ['phone', 'Teléfono', 'Número de contacto'],
  ] },
  { id: 'education', title: 'Formación académica', description: 'Tu título principal y la institución que lo emitió.', icon: GraduationCap, fields: [
    ['title', 'Título profesional', 'Ej. Licenciatura en Contabilidad y Auditoría'], ['institution', 'Institución', 'Nombre de la universidad o instituto'], ['graduationYear', 'Año de graduación', 'Ej. 2020'],
  ] },
  { id: 'experience', title: 'Experiencia y servicios', description: 'Cuéntanos qué has hecho y cómo puedes ayudar a los clientes.', icon: BriefcaseBusiness, fields: [
    ['experience', 'Experiencia profesional', 'Describe tus cargos, años de experiencia y tipos de negocios atendidos.'], ['specialities', 'Especialidades', 'Ej. RIMPE, declaraciones de IVA, nómina…'], ['services', 'Servicios que ofrecerás', 'Describe los servicios que deseas brindar.'], ['certifications', 'Certificaciones adicionales (opcional)', 'Cursos o certificaciones relevantes para tu trabajo.'],
  ] },
] as const;

export function ApplicationFields({ application, onChange }: { application: VerificationApplication; onChange?: (key: keyof VerificationApplication, value: string) => void }) {
  return <div className="space-y-5">{sections.map((section) => {
    const Icon = section.icon;
    return <section id={`record-${section.id}`} key={section.id} className="scroll-mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-800"><Icon size={20}/></span><div><h2 className="font-bold text-slate-900">{section.title}</h2>{onChange && <p className="mt-1 text-sm text-slate-500">{section.description}</p>}</div></div>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{section.fields.map(([key, label, placeholder]) => {
        const long = ['experience', 'specialities', 'services', 'certifications'].includes(key);
        return onChange ? <label key={key} className={`block text-sm font-medium text-slate-700 ${key === 'experience' ? 'sm:col-span-2' : ''}`}>{label}{long ? <textarea rows={key === 'experience' ? 4 : 3} value={application[key]} onChange={(event) => onChange(key, event.target.value)} placeholder={placeholder} className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-3 text-sm font-normal focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"/> : <input type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} inputMode={key === 'graduationYear' ? 'numeric' : undefined} value={application[key]} onChange={(event) => onChange(key, event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-3 text-sm font-normal focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"/>}</label> : <dl key={key} className={key === 'experience' ? 'sm:col-span-2' : ''}><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">{application[key] || <span className="italic text-slate-400">{key === 'certifications' ? 'Sin certificaciones adicionales' : 'Sin completar'}</span>}</dd></dl>;
      })}</div>
    </section>;
  })}</div>;
}

export function ApplicationRecord({ application }: { application: VerificationApplication }) {
  const [error, setError] = useState('');
  const documents: { label: string; file: EvidenceFile | null }[] = [
    { label: 'Currículum (CV)', file: application.documents.cv }, { label: 'Título profesional', file: application.documents.title }, { label: 'Récord policial', file: application.documents.police },
    ...(application.documents.certifications || []).map((file, index) => ({ label: `Certificación ${index + 1}`, file })),
  ];
  const download = async (file: EvidenceFile) => {
    try {
      const blob = file.storageKey ? await loadEvidenceFile(file.storageKey) : null;
      if (!blob) throw new Error('Este respaldo no está disponible en este navegador.');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = file.name; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30_000); setError('');
    } catch (cause) { setError((cause as Error).message); }
  };
  return <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><ApplicationFields application={application}/><aside className="rounded-2xl border border-slate-200 bg-white p-5 xl:sticky xl:top-5"><div className="flex items-center gap-2"><FileText size={19} className="text-blue-800"/><h2 className="font-bold">Documentos del expediente</h2></div><p className="mt-2 text-xs leading-5 text-slate-500">Respaldos presentados por el profesional.</p><ul className="mt-4 divide-y divide-slate-100">{documents.map(({ label, file }, index) => <li key={`${label}-${index}`} className="py-4 first:pt-0"><div className="flex items-center gap-2 text-sm font-semibold">{file && <CheckCircle2 size={15} className="shrink-0 text-emerald-600"/>}{label}</div><p className="mt-1 break-all text-xs leading-5 text-slate-500">{file?.name || 'Pendiente de adjuntar'}</p>{file?.storageKey && <button type="button" onClick={() => download(file)} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-50"><Download size={13}/>Descargar documento</button>}</li>)}</ul>{error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}</aside></div>;
}
