import { describe, expect, it } from 'vitest';
import { normalizeScenario } from './scenario.model';

describe('normalizeScenario', () => {
  it('accepte les identifiants canoniques', () => {
    expect(normalizeScenario('late-payment')).toBe('late-payment');
  });
  it('accepte les alias du cahier de démo', () => {
    expect(normalizeScenario('slow')).toBe('slow-network');
    expect(normalizeScenario('no-invoice')).toBe('empty-state');
    expect(normalizeScenario('technical-error')).toBe('server-error');
  });
  it('rejette les valeurs inconnues', () => {
    expect(normalizeScenario('n-importe-quoi')).toBeUndefined();
    expect(normalizeScenario(null)).toBeUndefined();
  });
});
