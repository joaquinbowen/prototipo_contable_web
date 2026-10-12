import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { newVerificationApplication, transitionApplication, type InterviewAppointment, type InterviewSlot, type VerificationAction, type VerificationApplication, type WeeklyInterviewAvailability } from './verificationRules';
import { createAvailableInterviewSlots } from './interviewScheduling';

type VerificationContextValue = {
  application: VerificationApplication;
  applications: VerificationApplication[];
  actOnApplication: (id: string, action: VerificationAction, note?: string) => void;
  updateApplication: (patch: Partial<VerificationApplication>) => void;
  act: (action: VerificationAction, note?: string) => void;
  interviewSlots: InterviewSlot[];
  weeklyAvailability: WeeklyInterviewAvailability[];
  appointments: InterviewAppointment[];
  addWeeklyAvailability: (rule: Omit<WeeklyInterviewAvailability, 'id'>) => void;
  removeWeeklyAvailability: (id: string) => void;
  scheduleInterview: (slotId: string) => void;
};
const Context = createContext<VerificationContextValue | null>(null);
const storageKey = 'cont-marjo-verification-v1';
const archiveKey = 'cont-marjo-verification-records-v1';
const availabilityStorageKey = 'cont-marjo-interview-availability-v1';
const appointmentsStorageKey = 'cont-marjo-interview-appointments-v1';

export function VerificationProvider({ children }: { children: React.ReactNode }) {
  const { activeRole, accountantProfile } = useApp();
  const [application, setApplication] = useState<VerificationApplication>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored) as VerificationApplication;
    } catch { /* A private browser may disable storage. */ }
    return newVerificationApplication('accountant-current', accountantProfile.displayName, accountantProfile.email);
  });
  const [archivedApplications, setArchivedApplications] = useState<VerificationApplication[]>(() => {
    try { return JSON.parse(localStorage.getItem(archiveKey) || '[]'); } catch { return []; }
  });
  const archiveRef = useRef(archivedApplications);
  archiveRef.current = archivedApplications;
  const saveArchive = (records: VerificationApplication[]) => {
    archiveRef.current = records;
    setArchivedApplications(records);
    try { localStorage.setItem(archiveKey, JSON.stringify(records)); } catch { /* Records remain available for the current session. */ }
  };
  const applications = [application, ...archivedApplications.filter((record) => record.id !== application.id)];
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyInterviewAvailability[]>(() => {
    try { return JSON.parse(localStorage.getItem(availabilityStorageKey) || '[]') as WeeklyInterviewAvailability[]; } catch { return []; }
  });
  const [appointments, setAppointments] = useState<InterviewAppointment[]>(() => {
    try { return JSON.parse(localStorage.getItem(appointmentsStorageKey) || '[]') as InterviewAppointment[]; } catch { return []; }
  });
  const interviewSlots = createAvailableInterviewSlots(weeklyAvailability, appointments, new Date());
  const currentApplication = useRef(application);
  currentApplication.current = application;
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(application)); } catch { /* Session remains usable without persistence. */ }
  }, [application]);
  useEffect(() => {
    try { localStorage.setItem(availabilityStorageKey, JSON.stringify(weeklyAvailability)); } catch { /* Demo remains usable without persistence. */ }
  }, [weeklyAvailability]);
  useEffect(() => {
    try { localStorage.setItem(appointmentsStorageKey, JSON.stringify(appointments)); } catch { /* Demo remains usable without persistence. */ }
  }, [appointments]);
  useEffect(() => {
    const registered = (event: Event) => {
      const { name, email } = (event as CustomEvent<{ name: string; email: string }>).detail;
      const next = newVerificationApplication('accountant-current', name, email);
      const previous = currentApplication.current;
      saveArchive([previous, ...archiveRef.current.filter((record) => record.id !== previous.id)]);
      currentApplication.current = next;
      setApplication(next);
    };
    window.addEventListener('cont-marjo-accountant-registered', registered);
    return () => window.removeEventListener('cont-marjo-accountant-registered', registered);
  }, []);
  const updateApplication = (patch: Partial<VerificationApplication>) => {
    const current = currentApplication.current;
    if (!['BORRADOR', 'REQUIERE_CAMBIOS'].includes(current.status)) return;
    const next = { ...current, ...patch, id: current.id, accountantId: current.accountantId, status: current.status, history: current.history };
    currentApplication.current = next;
    setApplication(next);
  };
  const act = (action: VerificationAction, note = '', slot?: InterviewSlot) => {
    const actorId = activeRole === 'GESTOR_CONTADORES' ? 'manager-demo' : 'accountant-current';
    const next = transitionApplication(currentApplication.current, action, actorId, note, slot);
    currentApplication.current = next;
    setApplication(next);
    if (action === 'COMPLETE_INTERVIEW' && next.interview) {
      setAppointments((current) => current.map((appointment) => appointment.startsAt === next.interview!.startsAt ? { ...appointment, completed: true } : appointment));
    }
  };
  const addWeeklyAvailability = (rule: Omit<WeeklyInterviewAvailability, 'id'>) => {
    if (activeRole !== 'GESTOR_CONTADORES') throw new Error('Solo el gestor puede definir horarios.');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(rule.startsAt) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(rule.endsAt) || rule.startsAt >= rule.endsAt) throw new Error('Define una franja válida, con hora final posterior a la inicial.');
    if (!rule.place.trim()) throw new Error(rule.modality === 'VIRTUAL' ? 'Agrega el enlace de la entrevista virtual.' : 'Indica el lugar de la entrevista.');
    const proposedStart = rule.startsAt.split(':').map(Number).reduce((hour, minute) => hour * 60 + minute);
    const proposedEnd = rule.endsAt.split(':').map(Number).reduce((hour, minute) => hour * 60 + minute);
    if (weeklyAvailability.some((item) => {
      if (item.weekday !== rule.weekday) return false;
      const start = item.startsAt.split(':').map(Number).reduce((hour, minute) => hour * 60 + minute);
      const end = item.endsAt.split(':').map(Number).reduce((hour, minute) => hour * 60 + minute);
      return proposedStart < end && start < proposedEnd;
    })) throw new Error('La franja se cruza con otra disponibilidad de ese día.');
    setWeeklyAvailability((current) => [...current, { ...rule, id: crypto.randomUUID() }]);
  };
  const actOnApplication = (id: string, action: VerificationAction, note = '') => {
    if (activeRole !== 'GESTOR_CONTADORES') throw new Error('Solo el gestor puede revisar expedientes.');
    if (id === currentApplication.current.id) { act(action, note); return; }
    const record = archiveRef.current.find((item) => item.id === id);
    if (!record) throw new Error('No se encontró el expediente.');
    const next = transitionApplication(record, action, 'manager-demo', note);
    saveArchive(archiveRef.current.map((item) => item.id === id ? next : item));
    if (action === 'COMPLETE_INTERVIEW' && next.interview) setAppointments((current) => current.map((item) => item.startsAt === next.interview!.startsAt && item.accountantEmail === next.email ? { ...item, completed: true } : item));
  };
  const removeWeeklyAvailability = (id: string) => setWeeklyAvailability((current) => current.filter((rule) => rule.id !== id));
  const scheduleInterview = (slotId: string) => {
    const slot = interviewSlots.find((item) => item.id === slotId);
    if (!slot) throw new Error('Ese horario ya no está disponible.');
    act('SCHEDULE', '', slot);
    const interviewDate = new Date(slot.startsAt).toLocaleString('es-EC', { dateStyle: 'full', timeStyle: 'short' });
    const modality = slot.modality === 'VIRTUAL' ? 'Virtual' : 'Presencial';
    const emailConfirmation = {
      to: currentApplication.current.email,
      subject: 'Confirmación de entrevista para verificar tu perfil profesional',
      body: `Hola ${currentApplication.current.fullName}, tu entrevista quedó confirmada para el ${interviewDate}. Modalidad: ${modality}. ${slot.modality === 'VIRTUAL' ? 'Enlace' : 'Lugar'}: ${slot.place}.`,
      createdAt: new Date().toISOString(),
    };
    const updated = { ...currentApplication.current, interview: { ...currentApplication.current.interview!, emailConfirmation } };
    currentApplication.current = updated;
    setApplication(updated);
    setAppointments((current) => [...current, { ...slot, accountantName: updated.fullName, accountantEmail: updated.email, completed: false, emailConfirmation }]);
  };
  return <Context.Provider value={{ application, applications, actOnApplication, updateApplication, act, interviewSlots, weeklyAvailability, appointments, addWeeklyAvailability, removeWeeklyAvailability, scheduleInterview }}>{children}</Context.Provider>;
}

export function useVerification() {
  const value = useContext(Context);
  if (!value) throw new Error('VerificationProvider is missing');
  return value;
}
