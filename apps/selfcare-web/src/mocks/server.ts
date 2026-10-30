import { setupServer } from 'msw/node';
import type { RuntimeConfig } from '../app/core/runtime-config';
import { buildHandlers } from './handlers';

type MswServer = ReturnType<typeof setupServer>;
const KEY = Symbol.for('nova.msw.server');
const g = globalThis as typeof globalThis & { [KEY]?: MswServer };

/**
 * MSW côté Node : intercepte le `fetch` global utilisé par HttpClient (withFetch) pendant
 * le rendu SSR ET le prerender au build. Singleton process (survit au HMR de `ng serve`).
 */
export function startMswServer(config: RuntimeConfig): MswServer {
  if (g[KEY]) return g[KEY];
  const server = setupServer(
    ...buildHandlers({ business: config.apiMode === 'mock', cms: config.cmsMode === 'mock' }),
  );
  server.listen({ onUnhandledRequest: 'bypass' });
  console.info(`[MSW] serveur Node actif – API métier: ${config.apiMode}, CMS: ${config.cmsMode}`);
  g[KEY] = server;
  return server;
}
