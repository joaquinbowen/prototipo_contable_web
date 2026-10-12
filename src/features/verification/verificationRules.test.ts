import { describe, expect, it } from 'vitest';
import { canSubmitApplication, transitionApplication, validateEvidenceFile, type VerificationApplication } from './verificationRules';

const complete: VerificationApplication = {
  id: 'app-1', accountantId: 'accountant-1', version: 1, status: 'BORRADOR',
  fullName: 'Ana Pérez', email: 'ana@ejemplo.ec', city: 'Quito', phone: '0990000000',
  title: 'Contadora', institution: 'Universidad', graduationYear: '2020',
  experience: 'Declaraciones y asesoría para pymes', specialities: 'IVA',
  services: 'Declaraciones mensuales', certifications: 'Tributación',
  documents: { cv: { name: 'cv.pdf', type: 'application/pdf', size: 100 }, title: { name: 'titulo.pdf', type: 'application/pdf', size: 100 }, police: { name: 'record.pdf', type: 'application/pdf', size: 100 } },
  interview: null, history: []
};

describe('verificación profesional', () => {
  it('rechaza respaldos demasiado grandes o de formato inesperado', () => {
    expect(validateEvidenceFile({ name: 'titulo.exe', type: 'application/octet-stream', size: 10 })).toContain('PDF');
    expect(validateEvidenceFile({ name: 'cv.pdf', type: 'application/pdf', size: 11 * 1024 * 1024 })).toContain('10 MB');
    expect(validateEvidenceFile({ name: 'cv.pdf', type: 'application/pdf', size: 100 })).toBeNull();
  });
  it('requiere expediente y tres respaldos para enviar', () => {
    expect(canSubmitApplication(complete)).toEqual([]);
    expect(canSubmitApplication({ ...complete, documents: { ...complete.documents, title: null } })).toContain('Título profesional');
  });

  it('no permite aprobar antes de la entrevista completada', () => {
    expect(() => transitionApplication(complete, 'APPROVE', 'manager-1')).toThrow('entrevista');
  });

  it('recorre envío, revisión, agenda, entrevista y aprobación con historial', () => {
    const submitted = transitionApplication(complete, 'SUBMIT', 'accountant-1');
    const reviewed = transitionApplication(submitted, 'READY_INTERVIEW', 'manager-1');
    const scheduled = transitionApplication(reviewed, 'SCHEDULE', 'accountant-1', '2026-10-15T15:00:00.000Z');
    const interviewed = transitionApplication(scheduled, 'COMPLETE_INTERVIEW', 'manager-1', 'Entrevista satisfactoria');
    const approved = transitionApplication(interviewed, 'APPROVE', 'manager-1', 'Perfil verificado');
    expect(approved.status).toBe('VERIFICADO');
    expect(approved.history).toHaveLength(5);
    expect(approved.interview?.completed).toBe(true);
  });

  it('registra correcciones y bloquea oferta si no está verificado', () => {
    const submitted = transitionApplication(complete, 'SUBMIT', 'accountant-1');
    const returned = transitionApplication(submitted, 'REQUEST_CHANGES', 'manager-1', 'Actualizar el título');
    expect(returned.status).toBe('REQUIERE_CAMBIOS');
    expect(() => transitionApplication(returned, 'APPROVE', 'manager-1')).toThrow();
  });
});
