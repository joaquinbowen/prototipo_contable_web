import { createDraft, postedEntries } from './journal';
import { newId, type AccountingBook, type BankMovement } from './types';

function parseRows(csv: string): string[][] {
  const rows: string[][] = [];
  const separator = (csv.split(/\r?\n/, 1)[0].match(/;/g)?.length ?? 0) > (csv.split(/\r?\n/, 1)[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < csv.length; index++) {
    const char = csv[index];
    if (char === '"') { if (quoted && csv[index + 1] === '"') { field += '"'; index++; } else quoted = !quoted; }
    else if (char === separator && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && csv[index + 1] === '\n') index++; row.push(field); if (row.some((value) => value.trim())) rows.push(row); row = []; field = ''; }
    else field += char;
  }
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

export function importBankCsv(book: AccountingBook, bankAccountId: string, csvText: string): { book: AccountingBook; imported: number; duplicates: number } {
  if (!book.bankAccounts.some((item) => item.id === bankAccountId)) throw new Error('Selecciona una cuenta bancaria de esta empresa.');
  const rows = parseRows(csvText.replace(/^\uFEFF/, ''));
  if (rows.length < 2) throw new Error('El CSV necesita cabecera y movimientos.');
  const headers = rows[0].map((value) => value.trim().toLowerCase());
  const column = (names: string[]) => headers.findIndex((header) => names.includes(header));
  const dateIndex = column(['fecha', 'date']);
  const descriptionIndex = column(['descripcion', 'descripción', 'concepto', 'description']);
  const amountIndex = column(['importe', 'monto', 'amount']);
  const referenceIndex = column(['referencia', 'reference', 'id']);
  if (dateIndex < 0 || descriptionIndex < 0 || amountIndex < 0) throw new Error('El CSV debe tener columnas fecha, descripción e importe.');
  const existing = new Set(book.movements.map((movement) => movement.fingerprint));
  const movements: BankMovement[] = [];
  let duplicates = 0;
  for (const row of rows.slice(1)) {
    const date = row[dateIndex]?.trim();
    const description = row[descriptionIndex]?.trim();
    const normalized = row[amountIndex]?.trim().replaceAll('$', '').replaceAll(' ', '').replace(',', '.');
    const amountCents = Math.round(Number(normalized) * 100);
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !description || !Number.isSafeInteger(amountCents) || amountCents === 0) throw new Error('Hay un movimiento con fecha, descripción o importe inválido.');
    const fingerprint = `${bankAccountId}|${date}|${description.toLowerCase()}|${amountCents}|${referenceIndex >= 0 ? row[referenceIndex] ?? '' : ''}`;
    if (existing.has(fingerprint)) { duplicates++; continue; }
    existing.add(fingerprint);
    movements.push({ id: newId('MOV'), entityId: book.entityId, bankAccountId, date, description, amountCents, fingerprint });
  }
  return { book: { ...book, movements: [...movements, ...book.movements] }, imported: movements.length, duplicates };
}

export function suggestMatches(book: AccountingBook, movementId: string) {
  const movement = book.movements.find((item) => item.id === movementId);
  if (!movement) return [];
  const bankAccount = book.bankAccounts.find((item) => item.id === movement.bankAccountId);
  const used = new Set(book.movements.filter((item) => item.matchedEntryId).map((item) => item.matchedEntryId));
  return postedEntries(book).filter((entry) => !used.has(entry.id) && entry.lines.some((line) => line.accountId === bankAccount?.ledgerAccountId && line.debitCents - line.creditCents === movement.amountCents)).sort((a, b) => Math.abs(Date.parse(a.date) - Date.parse(movement.date)) - Math.abs(Date.parse(b.date) - Date.parse(movement.date))).slice(0, 5);
}

export function reconcileMovement(book: AccountingBook, movementId: string, entryId: string): AccountingBook {
  const movement = book.movements.find((item) => item.id === movementId);
  const bankAccount = book.bankAccounts.find((item) => item.id === movement?.bankAccountId);
  const entry = postedEntries(book).find((item) => item.id === entryId);
  if (!movement || !bankAccount || !entry || entry.entityId !== book.entityId) throw new Error('El movimiento o asiento no pertenece a esta empresa.');
  if (movement.matchedEntryId || book.movements.some((item) => item.id !== movementId && item.matchedEntryId === entryId)) throw new Error('El movimiento o asiento ya está conciliado.');
  if (!entry.lines.some((line) => line.accountId === bankAccount.ledgerAccountId && line.debitCents - line.creditCents === movement.amountCents)) throw new Error('El asiento no tiene el mismo importe en la cuenta bancaria.');
  return { ...book, movements: book.movements.map((item) => item.id === movementId ? { ...item, matchedEntryId: entryId } : item), audit: [{ id: newId('AUD'), entityId: book.entityId, at: new Date().toISOString(), action: 'CONCILIACION', detail: `${movementId} ↔ ${entry.number}` }, ...book.audit] };
}

export function undoReconciliation(book: AccountingBook, movementId: string): AccountingBook {
  const movement = book.movements.find(item => item.id === movementId);
  if (!movement?.matchedEntryId) throw new Error('El movimiento no está conciliado.');
  return { ...book, movements: book.movements.map((item) => item.id === movementId ? { ...item, matchedEntryId: undefined } : item), audit: [{ id: newId('AUD'), entityId: book.entityId, at: new Date().toISOString(), action: 'DESHACER_CONCILIACION', detail: `${movementId} ↔ ${movement.matchedEntryId}` }, ...book.audit] };
}

export function draftFromBankMovement(book: AccountingBook, movementId: string, otherAccountId: string): AccountingBook {
  const movement = book.movements.find((item) => item.id === movementId);
  const bankAccount = book.bankAccounts.find((item) => item.id === movement?.bankAccountId);
  if (!movement || !bankAccount || movement.matchedEntryId) throw new Error('Selecciona un movimiento pendiente.');
  if (otherAccountId === bankAccount.ledgerAccountId || !book.accounts.some((item) => item.id === otherAccountId && item.postable && item.active)) throw new Error('Selecciona otra cuenta imputable.');
  const amount = Math.abs(movement.amountCents);
  return createDraft(book, { date: movement.date, description: `Banco · ${movement.description}`, sourceKind: 'BANK', sourceId: movement.id, lines: movement.amountCents > 0 ? [{ id: newId('LIN'), accountId: bankAccount.ledgerAccountId, debitCents: amount, creditCents: 0 }, { id: newId('LIN'), accountId: otherAccountId, debitCents: 0, creditCents: amount }] : [{ id: newId('LIN'), accountId: otherAccountId, debitCents: amount, creditCents: 0 }, { id: newId('LIN'), accountId: bankAccount.ledgerAccountId, debitCents: 0, creditCents: amount }] });
}
