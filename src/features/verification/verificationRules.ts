export type VerificationStatus = 'BORRADOR' | 'EN_REVISION' | 'REQUIERE_CAMBIOS' | 'HABILITADO_PARA_ENTREVISTA' | 'ENTREVISTA_AGENDADA' | 'PENDIENTE_DECISION' | 'VERIFICADO' | 'RECHAZADO' | 'SUSPENDIDO';
export type VerificationAction = 'SUBMIT' | 'REQUEST_CHANGES' | 'READY_INTERVIEW' | 'SCHEDULE' | 'COMPLETE_INTERVIEW' | 'APPROVE' | 'REJECT' | 'SUSPEND';
export type InterviewModality = 'VIRTUAL' | 'PRESENCIAL';
export type InterviewSlot = { id: string; startsAt: string; modality: InterviewModality; place: string };
export type WeeklyInterviewAvailability = { id: string; weekday: number; startsAt: string; endsAt: string; modality: InterviewModality; place: string };
export type InterviewEmailConfirmation = { to: string; subject: string; body: string; createdAt: string };
export type InterviewAppointment = InterviewSlot & { accountantName: string; accountantEmail: string; completed: boolean; emailConfirmation?: InterviewEmailConfirmation };
export type EvidenceFile = { name: string; type: string; size: number; storageKey?: string };
export function validateEvidenceFile(file: EvidenceFile): string | null {
  if (file.size > 10 * 1024 * 1024) return 'El archivo no puede superar 10 MB.';
  if (!/\.(pdf|jpe?g|png)$/i.test(file.name) || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) return 'Usa un archivo PDF, JPG o PNG.';
  return null;
}
export type VerificationApplication = {
  id: string;
  accountantId: string;
  version: number;
  status: VerificationStatus;
  fullName: string;
  email: string;
  city: string;
  phone: string;
  title: string;
  institution: string;
  graduationYear: string;
  experience: string;
  specialities: string;
  services: string;
  certifications: string;
  documents: { cv: EvidenceFile | null; title: EvidenceFile | null; police: EvidenceFile | null; certifications?: EvidenceFile[] };
  interview: { startsAt: string; completed: boolean; note?: string; modality?: InterviewModality; place?: string; emailConfirmation?: InterviewEmailConfirmation } | null;
  history: { action: VerificationAction; actorId: string; at: string; note: string }[];
};

export const newVerificationApplication = (accountantId: string, name: string, email: string): VerificationApplication => ({
  id: crypto.randomUUID(), accountantId, version: 1, status: 'BORRADOR', fullName: name, email, city: '', phone: '',
  title: '', institution: '', graduationYear: '', experience: '', specialities: '', services: '', certifications: '',
  documents: { cv: null, title: null, police: null, certifications: [] }, interview: null, history: []
});

export function canSubmitApplication(application: VerificationApplication): string[] {
  const missing: string[] = [];
  for (const [key, label] of [
    ['fullName', 'Nombre completo'], ['email', 'Correo'], ['city', 'Ciudad'], ['phone', 'Teléfono'],
    ['title', 'Título profesional'], ['institution', 'Institución'], ['graduationYear', 'Año de graduación'],
    ['experience', 'Experiencia'], ['specialities', 'Especialidades'], ['services', 'Servicios']
  ] as const) if (!application[key].trim()) missing.push(label);
  for (const [key, label] of [['cv', 'CV'], ['title', 'Título profesional'], ['police', 'Récord policial']] as const) {
    if (!application.documents[key]) missing.push(label);
  }
  return missing;
}

export function transitionApplication(application: VerificationApplication, action: VerificationAction, actorId: string, note = '', slot?: InterviewSlot): VerificationApplication {
  const allowed: Record<VerificationAction, VerificationStatus[]> = {
    SUBMIT: ['BORRADOR', 'REQUIERE_CAMBIOS'], REQUEST_CHANGES: ['EN_REVISION'], READY_INTERVIEW: ['EN_REVISION'],
    SCHEDULE: ['HABILITADO_PARA_ENTREVISTA'], COMPLETE_INTERVIEW: ['ENTREVISTA_AGENDADA'],
    APPROVE: ['PENDIENTE_DECISION'], REJECT: ['PENDIENTE_DECISION'], SUSPEND: ['VERIFICADO']
  };
  if (!allowed[action].includes(application.status)) throw new Error('La acción no corresponde al estado actual del expediente o falta la entrevista.');
  if (action === 'SUBMIT' && actorId !== application.accountantId) throw new Error('Solo el titular puede enviar el expediente.');
  if (action === 'SCHEDULE' && actorId !== application.accountantId && !actorId.startsWith('manager')) throw new Error('Solo el candidato o gestor puede agendar.');
  if (['REQUEST_CHANGES', 'READY_INTERVIEW', 'COMPLETE_INTERVIEW', 'APPROVE', 'REJECT', 'SUSPEND'].includes(action) && !actorId.startsWith('manager')) throw new Error('Esta decisión corresponde al gestor.');
  if (action === 'SUBMIT' && canSubmitApplication(application).length) throw new Error(`Completa: ${canSubmitApplication(application).join(', ')}.`);
  if (['REQUEST_CHANGES', 'REJECT', 'SUSPEND'].includes(action) && !note.trim()) throw new Error('Escribe el motivo de la decisión.');
  if (action === 'SCHEDULE' && (!slot || !Number.isFinite(Date.parse(slot.startsAt)) || new Date(slot.startsAt).getTime() <= Date.now())) throw new Error('Elige un horario disponible y futuro.');
  if (action === 'COMPLETE_INTERVIEW' && !note.trim()) throw new Error('Registra el resultado de la entrevista.');
  const next: Record<VerificationAction, VerificationStatus> = {
    SUBMIT: 'EN_REVISION', REQUEST_CHANGES: 'REQUIERE_CAMBIOS', READY_INTERVIEW: 'HABILITADO_PARA_ENTREVISTA',
    SCHEDULE: 'ENTREVISTA_AGENDADA', COMPLETE_INTERVIEW: 'PENDIENTE_DECISION', APPROVE: 'VERIFICADO',
    REJECT: 'RECHAZADO', SUSPEND: 'SUSPENDIDO'
  };
  return {
    ...application, status: next[action], version: application.version + 1,
    interview: action === 'SCHEDULE' ? { startsAt: slot!.startsAt, completed: false, modality: slot!.modality, place: slot!.place } : action === 'COMPLETE_INTERVIEW' ? { ...application.interview!, completed: true, note } : application.interview,
    history: [...application.history, { action, actorId, at: new Date().toISOString(), note }]
  };
}
