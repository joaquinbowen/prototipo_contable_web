import type { UserRole } from '../types';

export type AccessMode = 'login' | 'register';

export function getAccessIdentifierField(mode: AccessMode, role: UserRole) {
  if (mode === 'register') {
    return { name: 'email', label: 'Correo electrónico', type: 'email' as const, inputMode: 'email' as const, autoComplete: 'email', placeholder: 'nombre@correo.com' };
  }
  if (role === 'SUPER_ADMIN') {
    return { name: 'admin-user', label: 'Usuario administrador', type: 'text' as const, inputMode: 'text' as const, autoComplete: 'username', placeholder: 'Usuario de demostración' };
  }
  return {
    name: 'ruc',
    label: role === 'CONTADOR_PROFESIONAL' ? 'RUC del estudio contable' : 'RUC',
    type: 'text' as const,
    inputMode: 'numeric' as const,
    autoComplete: 'username',
    placeholder: 'Ingresa los 13 dígitos del RUC',
  };
}

export function isValidAccessRuc(value: string): boolean {
  return /^\d{13}$/.test(value.trim());
}
