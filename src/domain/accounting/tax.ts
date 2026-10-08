import type { ElectronicInvoice, PurchaseInvoiceParsed } from '../../types';
import { cents, type AccountingBook } from './types';
import { getTrialBalance } from './reports';

export function buildTaxPreview(book: AccountingBook, from: string, to: string, sales: ElectronicInvoice[], purchases: PurchaseInvoiceParsed[]) {
  const periodSales = sales.filter(item => item.date >= from && item.date <= to && ['FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO'].includes(item.type));
  const periodPurchases = purchases.filter(item => item.fecha >= from && item.fecha <= to);
  const saleBaseCents = periodSales.reduce((sum, item) => sum + cents(item.subtotal15 + item.subtotal0) * (item.type === 'NOTA_CREDITO' ? -1 : 1), 0);
  const saleVatCents = periodSales.reduce((sum, item) => sum + cents(item.iva15) * (item.type === 'NOTA_CREDITO' ? -1 : 1), 0);
  const purchaseBaseCents = periodPurchases.reduce((sum, item) => sum + cents(item.subtotal), 0);
  const purchaseVatCents = periodPurchases.reduce((sum, item) => sum + cents(item.iva), 0);
  const balance = getTrialBalance(book, from, to);
  const vatPayableCents = balance.filter(row => row.account.code === '2.02').reduce((sum, row) => sum + row.creditCents - row.debitCents, 0);
  const vatCreditCents = balance.filter(row => row.account.code === '1.03').reduce((sum, row) => sum + row.debitCents - row.creditCents, 0);
  const issues = [...periodSales.filter(item => !item.clientRuc || !item.secuencial).map(item => `Venta ${item.id}: falta identificación o secuencial.`), ...periodPurchases.filter(item => !item.rucProveedor || !item.numero).map(item => `Compra ${item.id}: falta RUC o número.`)];
  if (saleVatCents !== vatPayableCents) issues.push('El IVA de ventas no coincide con el libro; revisa documentos pendientes de contabilizar.');
  if (purchaseVatCents !== vatCreditCents) issues.push('El IVA de compras no coincide con el libro; revisa documentos pendientes de contabilizar.');
  return { entityId: book.entityId, from, to, sales: periodSales, purchases: periodPurchases, saleBaseCents, saleVatCents, purchaseBaseCents, purchaseVatCents, vatPayableCents, vatCreditCents, estimatedVatCents: saleVatCents - purchaseVatCents, issues };
}

export function exportAtsDemoXml(preview: ReturnType<typeof buildTaxPreview>) {
  const esc = (value: string) => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char] || char);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!-- SIMULACION: NO ES UN ATS OFICIAL NI VALIDADO CONTRA XSD DEL SRI -->\n<anexoDemo version="0.1" entidad="${esc(preview.entityId)}" desde="${preview.from}" hasta="${preview.to}">\n${preview.sales.map(item => `  <venta numero="${esc(item.secuencial)}" ruc="${esc(item.clientRuc)}" total="${item.total.toFixed(2)}" />`).join('\n')}\n${preview.purchases.map(item => `  <compra numero="${esc(item.numero)}" ruc="${esc(item.rucProveedor)}" total="${item.total.toFixed(2)}" />`).join('\n')}\n</anexoDemo>`;
}
