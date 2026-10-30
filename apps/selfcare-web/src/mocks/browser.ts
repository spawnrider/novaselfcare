import { setupWorker } from 'msw/browser';
import type { RuntimeConfig } from '../app/core/runtime-config';
import { buildHandlers } from './handlers';

/**
 * MSW côté navigateur (Service Worker) : intercepte les appels CSR.
 * Chargé en import dynamique depuis main.ts → absent du bundle si MSW_BROWSER=false.
 */
export async function startMswWorker(config: RuntimeConfig) {
  const worker = setupWorker(
    ...buildHandlers({ business: config.apiMode === 'mock', cms: config.cmsMode === 'mock' }),
  );
  await worker.start({
    serviceWorker: { url: '/mockServiceWorker.js' },
    onUnhandledRequest: 'bypass',
  });
  return worker;
}
