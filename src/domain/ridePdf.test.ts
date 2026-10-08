import { describe, expect, it } from 'vitest';
import { buildRidePdf } from './ridePdf';
import type { ElectronicInvoice, TaxpayerProfile } from '../types';

describe('RIDE PDF', () => {
  it('includes every invoice line and paginates a long document', () => {
    const invoice = { id: '001-001-000000001', type: 'FACTURA', date: '2026-10-08', clientRucName: 'Cliente Demo', clientRuc: '1710028224001', total: 123, subtotal15: 100, subtotal0: 8, iva15: 15, status: 'APROBADO_ENVIADO', items: Array.from({ length: 90 }, (_, i) => ({ description: `Producto ${i + 1}`, quantity: 1, unitPrice: 1, total: 1 })) } as ElectronicInvoice;
    const profile = { razonSocial: 'Empresa Demo', ruc: '1790012345001' } as TaxpayerProfile;
    const pdf = buildRidePdf(invoice, profile);
    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf).toContain('Producto 90');
    expect(pdf.match(/\/Type \/Page\b/g)?.length).toBeGreaterThan(1);
    expect(pdf).toContain('SUBTOTAL');
    expect(pdf).toContain('0.91 0.95 0.99 rg');
  });
});
