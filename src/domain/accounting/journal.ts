import { isoToday, newId, type AccountingBook, type JournalEntry, type JournalLine, type LedgerAccount, type SourceKind } from './types';

export const postedEntries = (book: AccountingBook) => book.entries.filter((entry) => entry.status === 'POSTED' || entry.status === 'REVERSED');
export const hasSourceEntry = (book: AccountingBook, sourceKind: SourceKind, sourceId: string) => book.entries.some((entry) => entry.sourceKind === sourceKind && entry.sourceId === sourceId);

export function validateEntry(entry: JournalEntry, book: AccountingBook): string[] {
  const errors: string[] = [];
  if (entry.entityId !== book.entityId) errors.push('El asiento pertenece a otra empresa.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) errors.push('Indica una fecha válida.');
  if (!entry.description.trim()) errors.push('Describe el asiento.');
  if (entry.lines.length < 2) errors.push('Necesitas al menos dos líneas.');
  let debit = 0;
  let credit = 0;
  for (const line of entry.lines) {
    const account = book.accounts.find((item) => item.id === line.accountId);
    if (!account || account.entityId !== book.entityId || !account.postable || !account.active) errors.push('Selecciona una cuenta imputable activa en cada línea.');
    if (!Number.isSafeInteger(line.debitCents) || !Number.isSafeInteger(line.creditCents) || line.debitCents < 0 || line.creditCents < 0 || (line.debitCents > 0 && line.creditCents > 0) || line.debitCents + line.creditCents === 0) errors.push('Cada línea debe tener un importe positivo solo en debe o haber.');
    debit += line.debitCents;
    credit += line.creditCents;
  }
  if (debit === 0 || debit !== credit) errors.push('El total del debe debe coincidir con el total del haber.');
  const period = book.periods.find((item) => entry.date >= item.start && entry.date <= item.end);
  if (!period) errors.push('La fecha no corresponde a un período configurado.');
  else if (period.status === 'CLOSED') errors.push('El período está cerrado.');
  if (entry.sourceId && book.entries.some((item) => item.id !== entry.id && item.sourceKind === entry.sourceKind && item.sourceId === entry.sourceId)) errors.push('El documento de origen ya tiene un asiento.');
  return [...new Set(errors)];
}

export function createDraft(book: AccountingBook, input: Pick<JournalEntry, 'date' | 'description' | 'lines' | 'sourceKind'> & { sourceId?: string }): AccountingBook {
  if (input.sourceId && hasSourceEntry(book, input.sourceKind, input.sourceId)) throw new Error('El documento ya tiene un asiento en esta empresa.');
  const entry: JournalEntry = { id: newId('ASI'), entityId: book.entityId, date: input.date, number: '', description: input.description, status: 'DRAFT', lines: input.lines.map((line) => ({ ...line, id: line.id || newId('LIN') })), sourceKind: input.sourceKind, sourceId: input.sourceId, createdAt: new Date().toISOString() };
  return { ...book, entries: [entry, ...book.entries] };
}

export function updateDraft(book: AccountingBook, entryId: string, changes: Partial<Pick<JournalEntry, 'date' | 'description' | 'lines'>>): AccountingBook {
  const entry = book.entries.find((item) => item.id === entryId);
  if (!entry || entry.status !== 'DRAFT') throw new Error('Solo se pueden editar borradores.');
  return { ...book, entries: book.entries.map((item) => item.id === entryId ? { ...item, ...changes } : item) };
}

export function postEntry(book: AccountingBook, entryId: string): AccountingBook {
  const entry = book.entries.find((item) => item.id === entryId);
  if (!entry || entry.status !== 'DRAFT') throw new Error('Selecciona un asiento en borrador.');
  const errors = validateEntry(entry, book);
  if (errors.length) throw new Error(errors.join(' '));
  const number = `ASI-${String(postedEntries(book).length + 1).padStart(4, '0')}`;
  return { ...book, entries: book.entries.map((item) => item.id === entryId ? { ...item, status: 'POSTED', number, postedAt: new Date().toISOString() } : item) };
}

export function reverseEntry(book: AccountingBook, entryId: string, reason: string, date = isoToday()): AccountingBook {
  const original = book.entries.find((item) => item.id === entryId);
  if (!original || original.status !== 'POSTED') throw new Error('Solo se puede reversar un asiento confirmado.');
  if (!reason.trim()) throw new Error('Indica el motivo del reverso.');
  const reversalLines: JournalLine[] = original.lines.map((line) => ({ ...line, id: newId('LIN'), debitCents: line.creditCents, creditCents: line.debitCents }));
  const draft: JournalEntry = { id: newId('REV'), entityId: book.entityId, date, number: '', description: `Reverso de ${original.number}: ${reason.trim()}`, status: 'DRAFT', lines: reversalLines, sourceKind: 'MANUAL', reversedEntryId: original.id, reversalReason: reason.trim(), createdAt: new Date().toISOString() };
  const errors = validateEntry(draft, book);
  if (errors.length) throw new Error(errors.join(' '));
  const number = `ASI-${String(postedEntries(book).length + 1).padStart(4, '0')}`;
  const reversal: JournalEntry = { ...draft, status: 'POSTED', number, postedAt: new Date().toISOString() };
  return { ...book, entries: [reversal, ...book.entries.map((item) => item.id === entryId ? { ...item, status: 'REVERSED' as const, reversedEntryId: reversal.id, reversalReason: reason.trim() } : item)] };
}

export function createAccount(book: AccountingBook, input: Pick<LedgerAccount, 'code' | 'name' | 'kind' | 'parentId' | 'postable'>): AccountingBook {
  const code = input.code.trim();
  if (!code || !input.name.trim()) throw new Error('Indica código y nombre.');
  if (book.accounts.some((item) => item.code === code)) throw new Error('El código ya existe en esta empresa.');
  const parent = input.parentId ? book.accounts.find((item) => item.id === input.parentId) : undefined;
  if (input.parentId && (!parent || parent.kind !== input.kind || parent.postable)) throw new Error('Selecciona una cuenta de agrupación del mismo tipo.');
  if (parent && !code.startsWith(`${parent.code}.`)) throw new Error(`El código debe empezar con ${parent.code}.`);
  if (!parent && input.postable) throw new Error('Una cuenta imputable necesita una cuenta de agrupación.');
  const account: LedgerAccount = { id: newId('CTA'), entityId: book.entityId, code, name: input.name.trim(), kind: input.kind, parentId: input.parentId, postable: input.postable, active: true };
  return { ...book, accounts: [...book.accounts, account].sort((a, b) => a.code.localeCompare(b.code, 'es', { numeric: true })) };
}

export function updateAccount(book: AccountingBook, accountId: string, changes: { name?: string; active?: boolean }): AccountingBook {
  const account = book.accounts.find((item) => item.id === accountId);
  if (!account) throw new Error('La cuenta no existe en esta empresa.');
  if (changes.name !== undefined && !changes.name.trim()) throw new Error('El nombre no puede quedar vacío.');
  if (changes.active === false && (book.entries.some((entry) => entry.status !== 'DRAFT' && entry.lines.some((line) => line.accountId === accountId)) || book.accounts.some((item) => item.parentId === accountId && item.active))) throw new Error('No se puede desactivar una cuenta utilizada o con subcuentas activas.');
  return { ...book, accounts: book.accounts.map((item) => item.id === accountId ? { ...item, ...(changes.name !== undefined ? { name: changes.name.trim() } : {}), ...(changes.active !== undefined ? { active: changes.active } : {}) } : item) };
}
