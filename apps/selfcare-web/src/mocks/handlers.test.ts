/**
 * Tests « contrat ↔ mocks » : on interroge les handlers comme le ferait l'application.
 * Lancement : npm run test:mocks
 */
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SCENARIO_HEADER } from '../app/core/scenario.model';
import { db } from './db';
import { buildHandlers } from './handlers';

const server = setupServer(...buildHandlers({ business: true, cms: true }));
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => db.reset());
afterAll(() => server.close());

const call = (path: string, scenario = 'nominal', init: RequestInit = {}) =>
  fetch(`http://localhost${path}`, { ...init, headers: { [SCENARIO_HEADER]: scenario, ...init.headers } });

describe('billing', () => {
  it('nominal : factures disponibles', async () => {
    const res = await call('/api/invoices');
    expect(res.status).toBe(200);
    expect((await res.json()).length).toBeGreaterThan(0);
  });

  it.each(['empty-state', 'no-invoice', 'empty'])('%s : aucune facture', async (s) => {
    expect(await (await call('/api/invoices', s)).json()).toEqual([]);
  });

  it('server-error : 500 au format Problem', async () => {
    const res = await call('/api/invoices', 'server-error');
    expect(res.status).toBe(500);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    expect((await res.json()).code).toBe('TECHNICAL_ERROR');
  });

  it('usage : le filtre période est respecté', async () => {
    const body = await (await call('/api/usage?period=3m')).json();
    expect(body.points).toHaveLength(3);
  });

  it('late-payment : dernière facture en retard', async () => {
    const [latest] = await (await call('/api/invoices', 'late-payment')).json();
    expect(latest.status).toBe('overdue');
  });
});

describe('options', () => {
  it('nominal : activation puis 409 si déjà active', async () => {
    const first = await call('/api/options/e-invoice/subscribe', 'nominal', { method: 'POST' });
    expect(first.status).toBe(200);
    expect((await first.json()).active).toBe(true);
    const second = await call('/api/options/e-invoice/subscribe', 'nominal', { method: 'POST' });
    expect(second.status).toBe(409);
  });

  it('functional-error : 422 OPTION_NOT_ELIGIBLE', async () => {
    const res = await call('/api/options/premium-support/subscribe', 'functional-error', { method: 'POST' });
    expect(res.status).toBe(422);
    expect((await res.json()).code).toBe('OPTION_NOT_ELIGIBLE');
  });

  it('forbidden : 403', async () => {
    const res = await call('/api/options/e-invoice/subscribe', 'forbidden', { method: 'POST' });
    expect(res.status).toBe(403);
  });
});

describe('cms (format Strapi 5)', () => {
  it('home-page : enveloppe { data, meta } avec documentId', async () => {
    const body = await (await call('/api/home-page')).json();
    expect(body.data.documentId).toBeTypeOf('string');
    expect(body.data.greeting).toContain('{firstName}');
  });
});
