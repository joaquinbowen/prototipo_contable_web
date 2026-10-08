import type { ElectronicInvoice, PurchaseInvoiceParsed } from '../../types';
import { cents, newId, type AccountingBook, type JournalLine } from './types';
import { createDraft, hasSourceEntry } from './journal';

const line = (accountId: string, debitCents = 0, creditCents = 0): JournalLine => ({ id: newId('LIN'), accountId, debitCents, creditCents });
const account = (book: AccountingBook, code: string) => {
  const found = book.accounts.find((item) => item.code === code && item.active && item.postable);
  if (!found) throw new Error(`Falta la cuenta imputable ${code} en el plan de cuentas.`);
  return found.id;
};

export function draftFromSale(book: AccountingBook, invoice: ElectronicInvoice): AccountingBook {
  if (hasSourceEntry(book, 'SALE', invoice.id)) throw new Error('La factura ya tiene un asiento.');
  const total = cents(invoice.total);
  const tax = cents(invoice.iva15);
  const revenue = total - tax;
  if (total <= 0 || revenue < 0) throw new Error('La factura no tiene importes válidos para registrar.');
  const creditNote = invoice.type === 'NOTA_CREDITO';
  return createDraft(book, { date: invoice.date, description: `${creditNote ? 'Nota de crédito' : 'Venta'} ${invoice.secuencial} · ${invoice.clientRucName}`, sourceKind: 'SALE', sourceId: invoice.id, lines: creditNote ? [line(account(book, '4.01'), revenue), ...(tax ? [line(account(book, '2.02'), tax)] : []), line(account(book, '1.02'), 0, total)] : [line(account(book, '1.02'), total), line(account(book, '4.01'), 0, revenue), ...(tax ? [line(account(book, '2.02'), 0, tax)] : [])] });
}

export function draftFromPurchase(book: AccountingBook, purchase: PurchaseInvoiceParsed, destination: 'expense' | 'inventory' = 'expense'): AccountingBook {
  if (hasSourceEntry(book, 'PURCHASE', purchase.id)) throw new Error('La compra ya tiene un asiento.');
  const total = cents(purchase.total);
  const tax = cents(purchase.iva);
  const base = total - tax;
  if (total <= 0 || base < 0) throw new Error('La compra no tiene importes válidos para registrar.');
  const expenseAccount = destination === 'inventory' ? book.accounts.find((item) => item.code === '1.04' && item.active)?.id : account(book, '5.01');
  if (!expenseAccount) throw new Error('Configura una cuenta de inventario imputable antes de clasificar esta compra.');
  return createDraft(book, { date: purchase.fecha, description: `Compra ${purchase.numero} · ${purchase.proveedor}`, sourceKind: 'PURCHASE', sourceId: purchase.id, lines: [line(expenseAccount, base), ...(tax ? [line(account(book, '1.03'), tax)] : []), line(account(book, '2.01'), 0, total)] });
}
