import { describe, expect, it } from 'vitest';
import { acceptDelivery, addDelivery, createContract, getRating, rateContract, requestChanges } from './contractRules';

const makeContract = () => createContract({ id: 'REQ-1', clientId: 'CLIENT-1', title: 'IVA de octubre' }, { id: 'OFF-1', accountantId: 'ACC-1', accountantName: 'Ana', tarifaUsd: 45, tiempoEstimado: '48 horas', mensaje: 'Declaración y comprobante' });

describe('trabajos y calificaciones', () => {
  it('preserva versiones de entrega al solicitar correcciones', () => {
    const first = addDelivery(makeContract(), 'ACC-1', { name: 'iva-v1.pdf', storageKey: 'file-1' }, 'Primera entrega');
    const correction = requestChanges(first, 'CLIENT-1', 'Falta el comprobante');
    const second = addDelivery(correction, 'ACC-1', { name: 'iva-v2.pdf', storageKey: 'file-2' }, 'Comprobante agregado');
    expect(second.deliveries.map((item) => item.version)).toEqual([1, 2]);
    expect(second.status).toBe('ENTREGADO');
    expect(second.events.map((item) => item.kind)).toEqual(['CONTRATADO', 'ENTREGADO', 'CAMBIOS_SOLICITADOS', 'ENTREGADO']);
  });

  it('solo permite valorar una entrega aceptada por su cliente', () => {
    const delivered = addDelivery(makeContract(), 'ACC-1', { name: 'iva.pdf', storageKey: 'file-1' }, 'Listo');
    expect(() => rateContract(delivered, 'CLIENT-1', 5)).toThrow();
    const completed = acceptDelivery(delivered, 'CLIENT-1');
    expect(() => rateContract(completed, 'OTHER', 5)).toThrow();
    const rated = rateContract(completed, 'CLIENT-1', 4);
    expect(rated.review?.stars).toBe(4);
    expect(() => rateContract(rated, 'CLIENT-1', 5)).toThrow();
    expect(getRating([rated])).toEqual({ average: 4, count: 1 });
  });
});
