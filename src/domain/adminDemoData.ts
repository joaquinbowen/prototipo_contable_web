export type AdminRole = 'contribuyente' | 'contador';
export type AdminUser = { id: string; name: string; role: AdminRole; regimen?: string; plan?: number; createdAt: string; lastActiveAt: string; cancelledAt?: string };
export type AdminSession = { userId: string; at: string };
export type AdminRequest = { id: string; taxpayerId: string; category: string; at: string; firstOfferAt?: string; acceptedAt?: string; accountantId?: string; quoted: number; paid: number; commission: number; rating?: number; disputed: boolean; offers: { accountantId: string; amount: number; at: string; accepted: boolean }[] };
export type AdminDocument = { id: string; taxpayerId: string; type: string; at: string; failed: boolean };
export type AdminSecurityEvent = { id: string; at: string; kind: string; detail: string; severity: 'alta' | 'media' };
export type AdminStorage = { id: string; at: string; type: string; bytes: number };
export type AdminRefund = { at: string; amount: number };
export type AdminMoneyEvent = { at: string; amount: number };

export type AdminDemoData = { users: AdminUser[]; sessions: AdminSession[]; requests: AdminRequest[]; documents: AdminDocument[]; security: AdminSecurityEvent[]; storage: AdminStorage[]; refunds: AdminRefund[]; billing: AdminMoneyEvent[]; costs: AdminMoneyEvent[] };

const DAY = 86_400_000;
const dateAgo = (today: Date, days: number, hour = 12) => {
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export function createAdminDemoData(today = new Date()): AdminDemoData {
  const taxpayerNames = ['Empresa Demo Ecuador', 'Importadora Andina', 'Sierra Salud', 'Taller Norte', 'Textiles Quito', 'Café Central', 'Ferretería El Sol', 'Servicios Atlas', 'Distribuidora Pacífico', 'Estudio Creativo', 'Comercial Los Andes', 'AgroRío', 'Hotel Plaza', 'Logística Sur', 'Tecnología Prisma', 'Panadería Aurora', 'Grupo Vértice', 'Consultora Lumen'];
  const accountantNames = ['Estudio Contable Demo', 'Carlos Mendoza', 'Marcela Benalcázar', 'Gómez & Asociados', 'Paola Andrade', 'Luis Paredes', 'Nadia Torres'];
  const regimes = ['RIMPE Emprendedor', 'Régimen General', 'RIMPE Negocio Popular', 'Persona natural'];
  const users: AdminUser[] = [
    ...taxpayerNames.map((name, index) => ({ id: `C-${index + 1}`, name, role: 'contribuyente' as const, regimen: regimes[index % regimes.length], plan: [19, 29, 39][index % 3], createdAt: dateAgo(today, 210 - index * 4), lastActiveAt: dateAgo(today, index % 8 === 0 ? 49 + index : index % 4), ...(index === 16 ? { cancelledAt: dateAgo(today, 38) } : {}) })),
    ...accountantNames.map((name, index) => ({ id: `A-${index + 1}`, name, role: 'contador' as const, createdAt: dateAgo(today, 175 - index * 8), lastActiveAt: dateAgo(today, index % 3), plan: 0 })),
  ];
  const sessions: AdminSession[] = users.flatMap((user, index) => [0, 1, 3, 7, 16, 31, 52, 75].filter((days) => !(index % 8 === 0 && days < 31)).map((days) => ({ userId: user.id, at: dateAgo(today, days + index % 3, 9 + index % 8) })));
  const categories = ['Declaración IVA', 'Impuesto a la Renta', 'Asesoría puntual', 'Contabilidad mensual', 'Auditoría'];
  const requests: AdminRequest[] = Array.from({ length: 48 }, (_, index) => {
    const at = dateAgo(today, index * 2 + index % 3, 8 + index % 8);
    const hasOffer = index % 9 !== 0;
    const accepted = hasOffer && index % 4 !== 0 && index > 1;
    const accountantId = `A-${index % accountantNames.length + 1}`;
    const quoted = [45, 75, 120, 180, 260][index % 5];
    const firstOfferAt = hasOffer ? new Date(new Date(at).getTime() + [2, 5, 11, 29][index % 4] * 3_600_000).toISOString() : undefined;
    const acceptedAt = accepted && firstOfferAt ? new Date(new Date(firstOfferAt).getTime() + [4, 12, 26][index % 3] * 3_600_000).toISOString() : undefined;
    const offers = hasOffer && firstOfferAt ? [{ accountantId, amount: quoted, at: firstOfferAt, accepted }, ...(index % 3 === 0 ? [{ accountantId: `A-${(index + 2) % accountantNames.length + 1}`, amount: quoted + 15, at: new Date(new Date(firstOfferAt).getTime() + 3 * 3_600_000).toISOString(), accepted: false }] : [])] : [];
    const paid = accepted && index % 7 !== 0 ? quoted : 0;
    return { id: `REQ-${String(index + 1).padStart(3, '0')}`, taxpayerId: `C-${index % taxpayerNames.length + 1}`, category: categories[index % categories.length], at, firstOfferAt, acceptedAt, accountantId: accepted ? accountantId : undefined, quoted, paid, commission: paid ? Math.round(paid * 0.12 * 100) / 100 : 0, rating: paid && index % 5 !== 0 ? [4, 4.5, 5][index % 3] : undefined, disputed: paid > 0 && index % 17 === 0, offers };
  });
  const docTypes = ['Factura', 'Nota de crédito', 'Retención', 'Nota de débito', 'Guía de remisión'];
  const documents: AdminDocument[] = Array.from({ length: 145 }, (_, index) => ({ id: `DOC-${String(index + 1).padStart(4, '0')}`, taxpayerId: `C-${index % taxpayerNames.length + 1}`, type: docTypes[index % 11 === 0 ? 1 + index % 4 : 0], at: dateAgo(today, index % 96, 8 + index % 10), failed: index % 37 === 0 }));
  const security: AdminSecurityEvent[] = [
    { id: 'SEC-1', at: dateAgo(today, 0, 9), kind: 'Inicio de sesión sospechoso', detail: 'Cinco intentos seguidos en una cuenta demo', severity: 'alta' },
    { id: 'SEC-2', at: dateAgo(today, 2, 14), kind: 'Error 500 recurrente', detail: 'Tres respuestas fallidas en la carga de adjuntos', severity: 'media' },
    { id: 'SEC-3', at: dateAgo(today, 11, 16), kind: 'Descargas inusuales', detail: 'Veinticuatro archivos descargados en diez minutos', severity: 'media' },
  ];
  const storage: AdminStorage[] = Array.from({ length: 72 }, (_, index) => ({ id: `FILE-${index + 1}`, at: dateAgo(today, index % 85), type: ['Comprobante', 'Adjunto', 'Firma'][index % 3], bytes: (index % 3 + 1) * 18_000_000 + index * 58_000 }));
  const refunds: AdminRefund[] = [{ at: dateAgo(today, 4), amount: 45 }, { at: dateAgo(today, 43), amount: 75 }];
  const billing: AdminMoneyEvent[] = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date(today.getFullYear(), today.getMonth() - offset, 5, 12);
    return { at: date.toISOString(), amount: users.filter((user) => user.role === 'contribuyente' && user.plan && user.createdAt <= date.toISOString() && (!user.cancelledAt || user.cancelledAt > date.toISOString())).reduce((sum, user) => sum + (user.plan ?? 0), 0) };
  });
  const costs: AdminMoneyEvent[] = Array.from({ length: 6 }, (_, offset) => ({ at: new Date(today.getFullYear(), today.getMonth() - offset, 6, 12).toISOString(), amount: 95 + offset * 4 }));
  return { users, sessions, requests, documents, security, storage, refunds, billing, costs };
}

export const adminHoursBetween = (start: string, end: string) => (new Date(end).getTime() - new Date(start).getTime()) / 3_600_000;
export const adminDaysBetween = (start: string, end: string) => (new Date(end).getTime() - new Date(start).getTime()) / DAY;
