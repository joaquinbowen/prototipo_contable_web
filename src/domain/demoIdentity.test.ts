import { describe, expect, it } from 'vitest';
import { resolveDemoIdentity } from './demoIdentity';

const accounts = [
  { role: 'CONTRIBUYENTE' as const, email: 'negocio@demo.ec', ruc: '1792847592001' },
  { role: 'CONTADOR_PROFESIONAL' as const, email: 'contador@demo.ec' },
];

describe('demo login identity', () => {
  it('resolves the account role from registered email or taxpayer RUC', () => {
    expect(resolveDemoIdentity(' NEGOCIO@DEMO.EC ', accounts)).toBe('CONTRIBUYENTE');
    expect(resolveDemoIdentity('1792847592001', accounts)).toBe('CONTRIBUYENTE');
    expect(resolveDemoIdentity('contador@demo.ec', accounts)).toBe('CONTADOR_PROFESIONAL');
  });

  it('does not guess a role for an unknown or shared identifier', () => {
    expect(resolveDemoIdentity('otro@demo.ec', accounts)).toBeNull();
    expect(resolveDemoIdentity('igual@demo.ec', [
      { role: 'CONTRIBUYENTE', email: 'igual@demo.ec' },
      { role: 'CONTADOR_PROFESIONAL', email: 'IGUAL@demo.ec' },
    ])).toBeNull();
  });
});
